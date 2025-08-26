"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, ClipboardList, LogOut } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Default to local if not set


export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      toast.error("Debes iniciar sesión para acceder al panel de control.")
      router.push("/")
      return
    }
    // Checar la duracuion del token
    const tokenExpiration = localStorage.getItem("tokenExpiration")

    if (tokenExpiration && new Date(tokenExpiration) < new Date()) {
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("tokenExpiration")
      router.push("/")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  if (!user) return null

  return (

    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <header className="w-full shadow-sm bg-[#24356B]">
      </header >

      <NavbarWithBreadcrumb user={user} role={user?.role || ""} />

      {/* Main Content */}
      < main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h2>
          <p className="text-gray-600">Gestiona las actas, anexos y administración del sistema</p>
        </div>
        {user.role === "USER" && (
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Tarjeta Llenado en Anexos */}
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
                  <p className="text-sm text-gray-600">
                    Crear y gestionar anexos de documentación
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                style={{ borderLeftColor: "#24356B" }}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-6 w-6" style={{ color: "#24356B" }} />
                    <CardTitle>Recursos Disponibles</CardTitle>
                  </div>
                  <CardDescription>Recursos para el llenado del anexo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-3 flex flex-col gap-2 text-sm">
                    <a
                      href="https://www.contraloria.umich.mx/archivos/normatividad/lineamientos_entrega_recepcion_umsnh.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
                    >
                      📄 Lineamientos del Proceso de Entrega-Recepción
                    </a>

                    <a
                      href="https://www.contraloria.umich.mx/entregarecepcion/archivos/archivos_contraloria/guia_usuario_serumich.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
                    >
                      📄 Guía del Usuario SERUMICH
                    </a>

                    <a
                      href="https://www.contraloria.umich.mx/entregarecepcion/archivos/archivos_contraloria/instructivo_llenado_serumich.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
                    >
                      📄 Instructivo de Llenado de Anexos
                    </a>

                    <a
                      href="https://www.contraloria.umich.mx/entregarecepcion/archivos/anexos/plantillas_anexos.zip"
                      download="plantillas_anexos.zip"
                      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
                    >
                      ⬇️ Plantillas de Anexos
                    </a>

                    <a
                      href="https://www.contraloria.umich.mx/index.php/portal/entrega_recepcion"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
                    >
                      📨 Circulares emitidas por la Contraloría
                    </a>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 🔹 Video explicativo */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              style={{ borderLeftColor: "#24356B" }}>
              <CardHeader>
                <CardTitle>📹 Cómo llenar los anexos</CardTitle>
                <CardDescription>
                  Mira este video para aprender a completar los anexos correctamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-w-16 aspect-h-9">
                  {/* <iframe
                    className="w-full h-64 rounded-lg"
                    src="https://www.youtube.com/embed/Hl3szd4NaTU"
                    title="Video explicativo sobre llenado de anexos"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe> */}
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">

                    <p className="text-lg font-semibold text-gray-700">¡Próximamente!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {user.role === "ADMIN" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Actas Card */}
            {/* <Link href="/dashboard/actas">
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
            </Link> */}

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

          </div>
        )}
        {user.role === "AUDITOR" && (
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
                  <CardDescription>Consulta las actas de entrega y recepción</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Consultar actas de entrega recepción</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Stats Section */}
        {/*  <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">

          {user.role === "USER" && (
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
          )}

          {user.role === "ADMIN" && (
            <>
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
            </>
          )}

          {user.role === "AUDITOR" && (
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
                  <p className="text-sm font-medium text-gray-600">Actas</p>
                  <p className="text-2xl font-semibold text-gray-900">10</p>
                </div>
              </div>
            </div>
          )}

        </div> */}
      </main >
    </div >
  )
}
