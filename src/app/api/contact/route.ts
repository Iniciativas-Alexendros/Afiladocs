import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, case_type, message, rgpd_accepted } = body;

    if (!name || !email || !message || !rgpd_accepted) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Opción: enviar a un webhook de n8n
    const N8N_WEBHOOK_URL = process.env.N8N_CONTACT_WEBHOOK_URL;

    if (N8N_WEBHOOK_URL) {
      await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          case_type,
          message,
          rgpd_accepted,
          submitted_at: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
