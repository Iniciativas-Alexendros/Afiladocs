"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { requireAuth } from "@/lib/auth";
import { serverEnv, publicEnv } from "@/lib/env";

export async function createCheckoutSession(
  productId: string,
  returnUrl: string,
) {
  const user = await requireAuth();

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(serverEnv.stripeSecretKey, {
    apiVersion: "2026-05-27.dahlia",
  });

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${publicEnv.siteUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    payment_method_types: ["card"],
    mode: "payment",
    billing_address_collection: "required",
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [
      {
        price: productId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      productId: productId,
    },
  });

  if (!stripeSession.url) {
    throw new Error("Could not create checkout session");
  }

  redirect(stripeSession.url as Route<string>);
}
