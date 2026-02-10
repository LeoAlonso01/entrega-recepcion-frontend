"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function validatePasswordStrength(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres')
  if (!/(?=.*[a-z])/.test(password)) errors.push('Debe contener al menos una letra minúscula')
  if (!/(?=.*[A-Z])/.test(password)) errors.push('Debe contener al menos una letra mayúscula')
  if (!/(?=.*\d)/.test(password)) errors.push('Debe contener al menos un número')
  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) errors.push('Debe contener al menos un carácter especial')
  return errors
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const uid = searchParams.get('uid')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token || !uid) {
      toast.error('Enlace inválido o incompleto. Solicita un nuevo enlace.')
    }
  }, [token, uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !uid) {
      toast.error('Enlace inválido. Solicita un nuevo correo de recuperación')
      return
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Por favor completa los campos de contraseña')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    const errors = validatePasswordStrength(newPassword)
    if (errors.length > 0) {
      toast.error(errors.join('. '))
      return
    }

    setIsSubmitting(true)
    try {
      const bodyPayload = { user_id: Number(uid), token, new_password: newPassword, newPassword };
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })
      console.debug('ResetPasswordForm: sent payload', bodyPayload);

      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Contraseña restablecida. Inicia sesión con tu nueva contraseña.')
        router.push('/auth/login')
      } else {
        toast.error(data.detail || 'Token inválido o expirado. Solicita un nuevo enlace.')
      }
    } catch (err) {
      toast.error('Error de red. Intenta de nuevo más tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#24356B' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center" style={{ backgroundColor: '#B59E60', color: 'white' }}>
          <CardTitle className="text-2xl font-bold">Restablecer Contraseña</CardTitle>
          <CardDescription className="text-white/90">Introduce una nueva contraseña segura</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nueva contraseña</Label>
              <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar nueva contraseña</Label>
              <Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full py-3 text-base font-medium" style={{ backgroundColor: '#751518', color: 'white' }} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Restablecer contraseña'
              )}
            </Button>

            <div className="mt-4 text-center">
              <a href="/recuperacionContrasena" className="text-sm text-blue-500 hover:underline">Solicitar nuevo enlace</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
