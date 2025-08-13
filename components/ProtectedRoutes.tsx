'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ProtectedRoute({
  children,
  allowedRoles = ['USER', 'ADMIN', 'AUDITOR'] // Roles permitidos por defecto
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const tokenExpiration = localStorage.getItem('tokenExpiration')

    // Si no hay token o usuario, redirigir al login
    if (!token || !userData) {
      toast.error('Debes iniciar sesión para acceder a esta página.')
      router.push('/')
      return
    }

    // Si el token ha expirado
    if (tokenExpiration && new Date(tokenExpiration) < new Date()) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('tokenExpiration')
      router.push('/')
      return
    }

    // Verificar rol del usuario
    const user = JSON.parse(userData)
    if (!allowedRoles.includes(user.role)) {
      toast.error('No tienes permiso para acceder a esta página.')
      router.push('/dashboard') // O a la página principal según tu rol
    }
  }, [router, allowedRoles])

  return <>{children}</>
}