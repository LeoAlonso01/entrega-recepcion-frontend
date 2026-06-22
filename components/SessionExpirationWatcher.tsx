"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const WARNING_BEFORE_EXPIRATION_MS = 5 * 60 * 1000
const CHECK_INTERVAL_MS = 15 * 1000

function getExpirationTime(token: string): number | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(atob(base64)) as { exp?: unknown }

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("role")
  localStorage.removeItem("tokenExpiration")
}

export default function SessionExpirationWatcher() {
  const router = useRouter()
  const warnedExpiration = useRef<number | null>(null)
  const isRedirecting = useRef(false)

  useEffect(() => {
    let warningToastId: string | number | undefined

    const endExpiredSession = (message: string) => {
      if (isRedirecting.current) return

      isRedirecting.current = true
      clearSession()
      if (warningToastId) toast.dismiss(warningToastId)
      toast.error(message, { duration: 6000 })
      router.replace("/")
    }

    const checkSessionExpiration = () => {
      const token = localStorage.getItem("token")
      if (!token) return

      const expirationTime = getExpirationTime(token)
      // Si el backend no incluyera exp, su respuesta 401 sigue siendo la fuente de verdad.
      if (!expirationTime) return

      const remainingTime = expirationTime - Date.now()

      if (remainingTime <= 0) {
        endExpiredSession("Tu sesión expiró. Disculpa la interrupción; inicia sesión nuevamente para continuar.")
        return
      }

      if (
        remainingTime <= WARNING_BEFORE_EXPIRATION_MS &&
        warnedExpiration.current !== expirationTime
      ) {
        warnedExpiration.current = expirationTime
        warningToastId = toast.warning("Tu sesión vencerá en menos de 5 minutos.", {
          duration: Infinity,
          action: {
            label: "Iniciar sesión ahora",
            onClick: () =>
              endExpiredSession("Para renovar tu sesión, inicia sesión nuevamente."),
          },
        })
      }
    }

    const handleStorageChange = () => {
      warnedExpiration.current = null
      isRedirecting.current = false
      checkSessionExpiration()
    }

    checkSessionExpiration()
    const interval = window.setInterval(checkSessionExpiration, CHECK_INTERVAL_MS)
    window.addEventListener("focus", checkSessionExpiration)
    window.addEventListener("storage", handleStorageChange)
    document.addEventListener("visibilitychange", checkSessionExpiration)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", checkSessionExpiration)
      window.removeEventListener("storage", handleStorageChange)
      document.removeEventListener("visibilitychange", checkSessionExpiration)
      if (warningToastId) toast.dismiss(warningToastId)
    }
  }, [router])

  return null
}
