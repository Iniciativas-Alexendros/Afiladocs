import { NextResponse } from "next/server";

// Stripe Checkout placeholder
// Configure STRIPE_SECRET_KEY in .env.local when ready
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, successUrl, cancelUrl } = body;

    if (!items?.length || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET_KEY) {
      // Placeholder: Stripe not configured yet
      return NextResponse.json(
        {
          error:
            "Stripe no está configurado. Añade STRIPE_SECRET_KEY a .env.local",
          url: null,
        },
        { status: 503 }
      );
    }

    // Dynamic import to avoid errors when stripe is not installed
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map(
        (item: { priceId?: string; variantId?: string; quantity: number }) => ({
          price: item.priceId || item.variantId,
          quantity: item.quantity,
        })
      ),
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
