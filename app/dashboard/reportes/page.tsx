"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportDialog, type ExportFilters } from "@/components/export-dialog"
import { ReportGenerator, formatFilters } from "@/utils/export-utils"
import { ArrowLeft, BarChart3, FileText, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function ReportesPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  // Mock data - replace with real data from your API
  const mockActas = [
    {
      numero: "ACT-001",
      fecha: "2024-01-15",
      entregante: "Juan Pérez",
      recibiente: "María García",
      estado: "Completada",
    },
    {
      numero: "ACT-002",
      fecha: "2024-01-16",
      entregante: "Carlos López",
      recibiente: "Ana Martínez",
      estado: "Pendiente",
    },
  ]

  const mockUsuarios = [
    { username: "admin", email: "admin@sistema.com", role: "ADMIN", is_active: true, created_at: "2024-01-01" },
    { username: "usuario1", email: "usuario1@sistema.com", role: "USER", is_active: true, created_at: "2024-01-15" },
  ]

  const mockAnexos = [
    {
      codigo: "ANX-001",
      titulo: "Inventario Equipos",
      tipo: "Inventario",
      estado: "Completado",
      fecha_creacion: "2024-01-15",
    },
    {
      codigo: "ANX-002",
      titulo: "Documentos Admin",
      tipo: "Documentos",
      estado: "Borrador",
      fecha_creacion: "2024-01-16",
    },
  ]

  const handleExportActas = (format: "pdf" | "excel", filters: ExportFilters) => {
    let filteredData = [...mockActas]

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filteredData = filteredData.filter((acta) => filters.status!.includes(acta.estado))
    }

    if (filters.dateFrom) {
      filteredData = filteredData.filter((acta) => acta.fecha >= filters.dateFrom!)
    }

    if (filters.dateTo) {
      filteredData = filteredData.filter((acta) => acta.fecha <= filters.dateTo!)
    }

    const config = {
      title: "Reporte de Actas de Entrega Recepción",
      filename: "actas_reporte",
      headers: ["Número", "Fecha", "Entregante", "Recibiente", "Estado"],
      data: filteredData.map((acta) => [acta.numero, acta.fecha, acta.entregante, acta.recibiente, acta.estado]),
      metadata: {
        totalRecords: filteredData.length,
        filters: formatFilters(filters),
        additionalInfo: [
          `Completadas: ${filteredData.filter((a) => a.estado === "Completada").length}`,
          `Pendientes: ${filteredData.filter((a) => a.estado === "Pendiente").length}`,
        ],
      },
    }

    if (format === "pdf") {
      ReportGenerator.generatePDF(config)
    } else {
      ReportGenerator.generateExcel(config)
    }
  }

  const handleExportUsuarios = (format: "pdf" | "excel", filters: ExportFilters) => {
    let filteredData = [...mockUsuarios]

    if (!filters.includeInactive) {
      filteredData = filteredData.filter((user) => user.is_active)
    }

    const config = {
      title: "Reporte de Usuarios del Sistema",
      filename: "usuarios_reporte",
      headers: ["Usuario", "Email", "Rol", "Estado", "Fecha Registro"],
      data: filteredData.map((user) => [
        user.username,
        user.email,
        user.role === "ADMIN" ? "Administrador" : "Usuario",
        user.is_active ? "Activo" : "Inactivo",
        user.created_at,
      ]),
      metadata: {
        totalRecords: filteredData.length,
        filters: formatFilters(filters),
        additionalInfo: [
          `Administradores: ${filteredData.filter((u) => u.role === "ADMIN").length}`,
          `Usuarios regulares: ${filteredData.filter((u) => u.role === "USER").length}`,
          `Activos: ${filteredData.filter((u) => u.is_active).length}`,
        ],
      },
    }

    if (format === "pdf") {
      ReportGenerator.generatePDF(config)
    } else {
      ReportGenerator.generateExcel(config)
    }
  }

  const handleExportAnexos = (format: "pdf" | "excel", filters: ExportFilters) => {
    let filteredData = [...mockAnexos]

    if (filters.status && filters.status.length > 0) {
      filteredData = filteredData.filter((anexo) => filters.status!.includes(anexo.estado))
    }

    if (filters.type && filters.type.length > 0) {
      filteredData = filteredData.filter((anexo) => filters.type!.includes(anexo.tipo))
    }

    const config = {
      title: "Reporte de Anexos",
      filename: "anexos_reporte",
      headers: ["Código", "Título", "Tipo", "Estado", "Fecha Creación"],
      data: filteredData.map((anexo) => [anexo.codigo, anexo.titulo, anexo.tipo, anexo.estado, anexo.fecha_creacion]),
      metadata: {
        totalRecords: filteredData.length,
        filters: formatFilters(filters),
        additionalInfo: [
          `Por tipo: Inventario (${filteredData.filter((a) => a.tipo === "Inventario").length}), Documentos (${filteredData.filter((a) => a.tipo === "Documentos").length})`,
          `Completados: ${filteredData.filter((a) => a.estado === "Completado").length}`,
        ],
      },
    }

    if (format === "pdf") {
      ReportGenerator.generatePDF(config)
    } else {
      ReportGenerator.generateExcel(config)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: "#24356B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-white">Centro de Reportes</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generación de Reportes</h2>
          <p className="text-gray-600">Exporta reportes detallados en formato PDF o Excel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Actas Report */}
          <Card className="border-l-4" style={{ borderLeftColor: "#B59E60" }}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6" style={{ color: "#B59E60" }} />
                <CardTitle>Reporte de Actas</CardTitle>
              </div>
              <CardDescription>Exporta información de actas de entrega recepción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>• Filtros por fecha y estado</p>
                <p>• Estadísticas incluidas</p>
                <p>• Formato PDF y Excel</p>
              </div>
              <ExportDialog
                title="Actas"
                onExportPDF={(filters) => handleExportActas("pdf", filters)}
                onExportExcel={(filters) => handleExportActas("excel", filters)}
                availableFilters={{
                  dateRange: true,
                  status: ["Pendiente", "Completada", "Revisión"],
                }}
              />
            </CardContent>
          </Card>

          {/* Users Report */}
          <Card className="border-l-4" style={{ borderLeftColor: "#751518" }}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6" style={{ color: "#751518" }} />
                <CardTitle>Reporte de Usuarios</CardTitle>
              </div>
              <CardDescription>Exporta información de usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>• Incluye roles y estados</p>
                <p>• Estadísticas por tipo</p>
                <p>• Filtros personalizables</p>
              </div>
              <ExportDialog
                title="Usuarios"
                onExportPDF={(filters) => handleExportUsuarios("pdf", filters)}
                onExportExcel={(filters) => handleExportUsuarios("excel", filters)}
              />
            </CardContent>
          </Card>

          {/* Anexos Report */}
          <Card className="border-l-4" style={{ borderLeftColor: "#24356B" }}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" style={{ color: "#24356B" }} />
                <CardTitle>Reporte de Anexos</CardTitle>
              </div>
              <CardDescription>Exporta información de anexos y documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>• Filtros por tipo y estado</p>
                <p>• Análisis por categorías</p>
                <p>• Resúmenes estadísticos</p>
              </div>
              <ExportDialog
                title="Anexos"
                onExportPDF={(filters) => handleExportAnexos("pdf", filters)}
                onExportExcel={(filters) => handleExportAnexos("excel", filters)}
                availableFilters={{
                  status: ["Borrador", "Completado", "Revisión"],
                  type: ["Inventario", "Documentos", "Equipos", "Otros"],
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => ReportGenerator.generateSummaryReport(mockActas, "estado", "Actas")}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Resumen Actas</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => ReportGenerator.generateSummaryReport(mockUsuarios, "role", "Usuarios")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Resumen Usuarios</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => ReportGenerator.generateSummaryReport(mockAnexos, "tipo", "Anexos")}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Resumen Anexos</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {
                const allData = [
                  ...mockActas.map((a) => ({ ...a, modulo: "Actas" })),
                  ...mockUsuarios.map((u) => ({ ...u, modulo: "Usuarios" })),
                  ...mockAnexos.map((a) => ({ ...a, modulo: "Anexos" })),
                ]
                ReportGenerator.generateSummaryReport(allData, "modulo", "Sistema Completo")
              }}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Reporte General</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
