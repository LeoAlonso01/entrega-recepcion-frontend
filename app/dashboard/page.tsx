"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, ClipboardList, LogOut } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    toast.success("Sesión cerrada exitosamente")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: "#24356B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">SERUMICH</h1>

              <nav className="hidden md:flex space-x-6">

               
                <div className="group">
                  <Link href="/dashboard/administracion" className="px-4 py-2 text-white hover:text-[#B59E60] hover:bg-gray-800 hover:rounded-md transition-all duration-300">
                    Administración
                  </Link>
                </div>

                <div className="group">
                  <Link href="/dashboard/actas" className="px-4 py-2 text-white hover:text-[#B59E60] hover:bg-gray-800 hover:rounded-md transition-all duration-300">
                    Entrega recepción
                  </Link>
                </div>

                <div className="group">
                  <Link href="/dashboard/anexos" className="px-4 py-2 text-white hover:text-[#B59E60] hover:bg-gray-800 hover:rounded-md transition-all duration-300">
                    Anexos
                  </Link>
                </div>

              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <p className="text-white">Bienvenido, {user.username}</p>
              <p className="text-white">Usuario: {user.role}</p>
              <img
                src={user.avatar || "/default-avatar.png"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-[#24356B]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h2>
          <p className="text-gray-600">Gestiona las actas, anexos y administración del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Actas Card */}
          <Link href="/dashboard/actas">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              style={{ borderLeftColor: "#B59E60" }}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6" style={{ color: "#B59E60" }} />
                  <CardTitle>Actas de Entrega Recepción</CardTitle>
                </div>
                <CardDescription>Gestiona las actas de entrega y recepción</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Crear, editar y consultar actas de entrega recepción</p>
              </CardContent>
            </Card>
          </Link>

          {/* Administración Card */}
          <Link href="/dashboard/administracion">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              style={{ borderLeftColor: "#751518" }}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6" style={{ color: "#751518" }} />
                  <CardTitle>Administración</CardTitle>
                </div>
                <CardDescription>Gestión de usuarios y configuración</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Administrar usuarios, roles y configuración del sistema</p>
              </CardContent>
            </Card>
          </Link>

          {/* Anexos Card */}
          <Link href="/dashboard/anexos">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              style={{ borderLeftColor: "#24356B" }}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ClipboardList className="h-6 w-6" style={{ color: "#24356B" }} />
                  <CardTitle>Llenado en Anexos</CardTitle>
                </div>
                <CardDescription>Gestión de anexos y documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Crear y gestionar anexos de documentación</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#B59E60" }}
                >
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actas</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#751518" }}
                >
                  <Users className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#24356B" }}
                >
                  <ClipboardList className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Anexos</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#B59E60" }}
                >
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
