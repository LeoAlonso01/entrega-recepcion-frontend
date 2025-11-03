"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Correo enviado", {
          description: "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
        })
        router.push("/login")
      } else {
        toast.error("Error", { description: data.detail || "No se pudo enviar el correo" })
      }
    } catch (err) {
      toast.error("Error de red", { description: "Verifica tu conexión" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#24356B" }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center" style={{ backgroundColor: "#B59E60", color: "white" }}>
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-white/90">
            Ingresa tu correo institucional
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@umich.mx"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-3 text-base font-medium"
              style={{ backgroundColor: "#751518", color: "white" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-blue-500 hover:underline">
              ← Volver a iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}