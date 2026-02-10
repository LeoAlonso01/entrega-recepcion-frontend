"use client";

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react'
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ResetPasswordForm from '@/components/ResetPasswordForm'
import { useSearchParams, useRouter } from 'next/navigation';


const API_URL = process.env.NEXT_PUBLIC_API_URL

function validatePasswordStrength(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres")
  if (!/(?=.*[a-z])/.test(password)) errors.push("Debe contener al menos una letra minúscula")
  if (!/(?=.*[A-Z])/.test(password)) errors.push("Debe contener al menos una letra mayúscula")
  if (!/(?=.*\d)/.test(password)) errors.push("Debe contener al menos un número")
  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) errors.push("Debe contener al menos un carácter especial")
  return errors
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const uid = searchParams.get("uid")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token || !uid) {
      toast.error("Enlace inválido o incompleto. Solicita un nuevo enlace.")
    }
  }, [token, uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !uid) {
      toast.error("Enlace inválido. Solicita un nuevo correo de recuperación")
      return
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa los campos de contraseña")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    const errors = validatePasswordStrength(newPassword)
    if (errors.length > 0) {
      toast.error(errors.join(". "))
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(uid), token, new_password: newPassword })
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success("Contraseña restablecida. Inicia sesión con tu nueva contraseña.")
        router.push("/reset-password")
      } else {
        toast.error(data.detail || "Token inválido o expirado. Solicita un nuevo enlace.")
      }
    } catch (err) {
      toast.error("Error de red. Intenta de nuevo más tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#24356B" }}>Cargando...</div>}>
      <ResetPasswordForm/>
    </Suspense>
  )
}