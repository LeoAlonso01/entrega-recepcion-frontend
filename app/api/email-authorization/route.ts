import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const UMSNH_EMAIL = /^[a-zA-Z0-9._%+-]+@umich\.mx$/i

function authorizedEmails() {
  return new Set(
    (process.env.AUTHORIZED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export async function POST(request: Request) {
  let email: unknown

  try {
    ;({ email } = await request.json())
  } catch {
    return NextResponse.json(
      { authorized: false, reason: "invalid_request", message: "La solicitud no es válida." },
      { status: 400 },
    )
  }

  if (typeof email !== "string") {
    return NextResponse.json(
      { authorized: false, reason: "invalid_email", message: "Ingresa un correo válido." },
      { status: 400 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!UMSNH_EMAIL.test(normalizedEmail)) {
    return NextResponse.json({
      authorized: false,
      reason: "university_domain_required",
      message: "Solo se permiten correos institucionales @umich.mx.",
    })
  }

  const allowlist = authorizedEmails()

  // Bloquea el registro si el entorno aún no cuenta con una lista explícita.
  // Así no se autorizan por error todos los correos institucionales.
  if (allowlist.size === 0) {
    return NextResponse.json(
      {
        authorized: false,
        reason: "allowlist_not_configured",
        message: "La lista de correos autorizados no está configurada.",
      },
      { status: 503 },
    )
  }

  if (!allowlist.has(normalizedEmail)) {
    return NextResponse.json({
      authorized: false,
      reason: "email_not_authorized",
      message: "Este correo institucional no está autorizado para registrarse.",
    })
  }

  return NextResponse.json({ authorized: true })
}
