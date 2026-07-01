import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import Stripe from "stripe";
import { serverEnv, publicEnv } from "@/lib/env";
import { safeSendEmail } from "@/lib/email/send";
import { logEvent } from "@/lib/log/structured";
import { PaymentConfirmation } from "@/emails/PaymentConfirmation";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { IntakeRequiredEmail } from "@/emails/intake-required";
import { PaymentFailedEmail } from "@/emails/payment-failed";
import { prisma } from "@/lib/prisma/client";
import { notifyOpsError } from "@/lib/alerts/notify-ops";
import { fulfillOrderFromSession } from "@/lib/orders/fulfillment";
import React from "react";

// Vercel Function: Node.js runtime requerido para crypto nativo (verificación HMAC-SHA256 Stripe)
export const runtime = "nodejs";
// force-dynamic: Stripe necesita el raw body sin cachear para verificar la firma
export const dynamic = "force-dynamic";

// Lazy getter — Stripe lanza si la key está vacía en carga del módulo (build time).
// En runtime (request time) serverEnv.stripeSecretKey estará disponible.
function getStripe() {
  const key = serverEnv.stripeSecretKey;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
}

async function sendConfirmationEmail(
  session: Stripe.Checkout.Session,
  customerEmail: string,
  amount: string,
): Promise<void> {
  await safeSendEmail(
    {
      to: customerEmail,
      subject: "Confirmación de pago — afiladocs",
      react: React.createElement(PaymentConfirmation, {
        customerEmail,
        amount,
        sessionId: session.id,
      }),
    },
    "email.confirmation.failed",
    { sessionId: session.id },
  );
}

async function createAndPersistInvoice(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const { EasyVerifactuAdapter } =
    await import("@/lib/verifactu/easyverifactu");
  const adapter = new EasyVerifactuAdapter();
  const metadata = session.metadata!;

  const profile = await prisma.profiles.findFirst({
    where: { id: metadata.userId },
    select: { nif: true },
  });

  const invoiceResult = await adapter.createInvoice({
    orderId: metadata.orderId ?? session.id,
    userId: metadata.userId!,
    productId: metadata.productId ?? "unknown",
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "eur",
    issuedAt: new Date(),
    customerNif: profile?.nif ?? "",
  });

  if (metadata.orderId) {
    await prisma.orders.update({
      where: { stripe_session_id: session.id },
      data: { invoice_id: invoiceResult.invoiceId, invoiced_at: new Date() },
    });
  }

  logEvent.info("verifactu.invoice.created", {
    invoiceId: invoiceResult.invoiceId,
    sessionId: session.id,
  });
}

async function generateVerifactuInvoice(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (
    !serverEnv.easyVerifactuApiUrl ||
    !serverEnv.easyVerifactuApiKey ||
    !session.metadata?.userId
  )
    return;

  try {
    await createAndPersistInvoice(session);
  } catch (verifactuErr) {
    logEvent.error("verifactu.invoice.failed", {
      message: verifactuErr instanceof Error ? verifactuErr.message : "Unknown",
      sessionId: session.id,
    });
  }
}

type OrderWithUser = Awaited<
  ReturnType<typeof prisma.orders.findFirst<{ include: { user: true } }>>
>;

async function sendOrderConfirmationEmail(
  order: NonNullable<OrderWithUser>,
  customerEmail: string,
  amount: string,
): Promise<void> {
  await safeSendEmail(
    {
      to: customerEmail,
      subject: "Comprobante de tu pedido — Afiladocs",
      react: React.createElement(OrderConfirmationEmail, {
        userName: order.user.full_name ?? "Cliente",
        orderId: order.id,
        productName: order.product_id,
        amount,
        portalUrl: `${publicEnv.siteUrl}/portal/pedido/${order.id}`,
      }),
    },
    "email.order_confirmation.failed",
    { orderId: order.id },
  );
}

async function sendIntakeRequiredEmail(
  order: NonNullable<OrderWithUser>,
  customerEmail: string,
): Promise<void> {
  await safeSendEmail(
    {
      to: customerEmail,
      subject: "Acción requerida: completa los datos de tu pedido — Afiladocs",
      react: React.createElement(IntakeRequiredEmail, {
        userName: order.user.full_name ?? "Cliente",
        productName: order.product_id,
        intakeUrl: `${publicEnv.siteUrl}/portal/pedido/${order.id}`,
      }),
    },
    "email.intake_required.failed",
    { orderId: order.id },
  );
}

async function sendPaymentFailedEmail(
  customerEmail: string,
  intent: Stripe.PaymentIntent,
): Promise<void> {
  await safeSendEmail(
    {
      to: customerEmail,
      subject: "Problema con tu pago — Afiladocs",
      react: React.createElement(PaymentFailedEmail, {
        customerEmail,
        errorMessage:
          intent.last_payment_error?.message ??
          "Error desconocido en el procesamiento del pago",
        retryUrl: `${publicEnv.siteUrl}/tienda`,
      }),
    },
    "email.payment_failed.failed",
    { intentId: intent.id },
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const amount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: session.currency?.toUpperCase() ?? "EUR",
  }).format((session.amount_total ?? 0) / 100);

  logEvent.info("checkout.completed", {
    sessionId: session.id,
    customerEmail,
    amount,
  });

  if (customerEmail) {
    await sendConfirmationEmail(session, customerEmail, amount);
  }

  // Order confirmation + intake required emails
  const order = await prisma.orders.findFirst({
    where: { stripe_session_id: session.id },
    include: { user: true },
  });

  if (order && customerEmail) {
    await processOrderPostPayment(order, customerEmail, amount);
    // Invalida la cache del portal para que el cliente vea el pedido actualizado
    revalidateTag("orders", "default");
    if (order.user_id) revalidateTag(`orders-${order.user_id}`, "default");
    revalidateTag(`order-${order.id}`, "default");
  }

  await generateVerifactuInvoice(session);
}

// Estados que aún requieren fulfillment. Si el pedido ya está más allá (awaiting_signature,
// delivered, completed…), un reintento de Stripe no debe volver a disparar DocuSeal, signed URLs
// ni emails — causaría submissions duplicadas y cobros de soporte.
const DISPATCHABLE_STATUSES = new Set([
  "payment_completed",
  "pending_payment",
  "intake_pending",
]);

async function processOrderPostPayment(
  order: NonNullable<OrderWithUser>,
  customerEmail: string,
  amount: string,
): Promise<void> {
  if (!DISPATCHABLE_STATUSES.has(order.status)) {
    logEvent.info("dispatch.skipped_idempotent", {
      orderId: order.id,
      status: order.status,
    });
    return;
  }
  await sendOrderConfirmationEmail(order, customerEmail, amount);
  if (order.status === "intake_pending") {
    await sendIntakeRequiredEmail(order, customerEmail);
  }
  await fulfillOrderFromSession(order, customerEmail);
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const customerEmail =
    typeof intent.receipt_email === "string"
      ? intent.receipt_email
      : ((
          intent.last_payment_error?.payment_method as
            Stripe.PaymentMethod | undefined
        )?.billing_details?.email ?? null);

  logEvent.error("payment.failed", {
    intentId: intent.id,
    lastError: intent.last_payment_error?.message,
  });

  if (customerEmail) {
    await sendPaymentFailedEmail(customerEmail, intent);
  }
}

/** Returns true if this Stripe event ID was already processed (idempotency guard). */
async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.audit_log
    .findFirst({
      where: { event: `stripe_event.${eventId}` },
    })
    .catch(() => null);
  return existing !== null;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !serverEnv.stripeWebhookSecret) {
    logEvent.error("stripe.webhook.misconfigured", {
      message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET",
    });
    return new NextResponse("Webhook not configured", { status: 503 });
  }

  // Lee el raw body como texto ANTES de cualquier parsing.
  // Stripe verifica la firma sobre el payload exacto — cualquier transformación invalida la firma.
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // constructEventAsync: versión async recomendada para entornos serverless
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      serverEnv.stripeWebhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logEvent.error("stripe.webhook.signature_failed", { message });
    void notifyOpsError({
      event: "stripe.webhook.signature_failed",
      message,
      severity: "critical",
    });
    return new NextResponse(`Webhook signature invalid: ${message}`, {
      status: 400,
    });
  }

  // Idempotency check — Stripe retries events on non-2xx responses.
  // Avoid duplicate emails and audit entries by tracking processed event IDs.
  if (await isAlreadyProcessed(event.id)) {
    console.log(
      JSON.stringify({
        event: "stripe.webhook.duplicate",
        stripeEventId: event.id,
        ts: new Date().toISOString(),
      }),
    );
    return NextResponse.json({ received: true });
  }

  await dispatchEvent(event);

  return NextResponse.json({ received: true });
}

async function dispatchEvent(event: Stripe.Event): Promise<void> {
  try {
    await routeEvent(event);
    await recordProcessedEvent(event);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    logEvent.error("stripe.handler.error", {
      type: event.type,
      message: errMsg,
    });
    void notifyOpsError({
      event: "stripe.handler.error",
      message: errMsg,
      severity: "critical",
      metadata: { type: event.type },
    });
  }
}

async function routeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      return;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      return;
    default:
      logEvent.info("stripe.unhandled", { type: event.type });
  }
}

async function recordProcessedEvent(event: Stripe.Event): Promise<void> {
  await prisma.audit_log
    .create({
      data: {
        event: `stripe_event.${event.id}`,
        metadata: { type: event.type },
      },
    })
    .catch((err: unknown) => {
      logEvent.error("stripe.webhook.idempotency_log_failed", {
        stripeEventId: event.id,
        message: err instanceof Error ? err.message : "Unknown",
      });
    });
}
