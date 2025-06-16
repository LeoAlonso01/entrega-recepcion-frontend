"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"

interface Anexo {
  id: number
  codigo: string
  titulo: string
  descripcion: string
  tipo: "Inventario" | "Documentos" | "Equipos" | "Otros"
  fecha_creacion: string
  estado: "Borrador" | "Completado" | "Revisión"
  archivo?: string
}

const exportAnexosToPDF = (anexos: Anexo[], title = "Reporte de Anexos") => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(36, 53, 107) // #24356B
  doc.text(title, 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 20, 30)
  doc.text(`Total de anexos: ${anexos.length}`, 20, 40)
  doc.text(`Completados: ${anexos.filter((a) => a.estado === "Completado").length}`, 20, 50)
  doc.text(`En borrador: ${anexos.filter((a) => a.estado === "Borrador").length}`, 20, 60)

  // Table
  const tableData = anexos.map((anexo) => [
    anexo.codigo,
    anexo.titulo.substring(0, 30) + (anexo.titulo.length > 30 ? "..." : ""),
    anexo.tipo,
    anexo.estado,
    anexo.fecha_creacion,
    anexo.descripcion.substring(0, 40) + (anexo.descripcion.length > 40 ? "..." : ""),
  ])
  ;(doc as any).autoTable({
    head: [["Código", "Título", "Tipo", "Estado", "Fecha", "Descripción"]],
    body: tableData,
    startY: 70,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [36, 53, 107], // #24356B
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      1: { cellWidth: 40 },
      5: { cellWidth: 35 },
    },
  })

  doc.save(`anexos_reporte_${new Date().toISOString().split("T")[0]}.pdf`)
}

const exportAnexosToExcel = (anexos: Anexo[], title = "Reporte de Anexos") => {
  const worksheet = XLSX.utils.json_to_sheet(
    anexos.map((anexo) => ({
      Código: anexo.codigo,
      Título: anexo.titulo,
      Tipo: anexo.tipo,
      Estado: anexo.estado,
      "Fecha Creación": anexo.fecha_creacion,
      Descripción: anexo.descripcion,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Anexos")

  // Add statistics by type
  const tipoStats = anexos.reduce(
    (acc, anexo) => {
      acc[anexo.tipo] = (acc[anexo.tipo] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const estadoStats = anexos.reduce(
    (acc, anexo) => {
      acc[anexo.estado] = (acc[anexo.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statsData = [
    ["Estadísticas de Anexos"],
    [""],
    ["Total de anexos:", anexos.length],
    [""],
    ["Por tipo:"],
    ...Object.entries(tipoStats).map(([tipo, count]) => [tipo + ":", count]),
    [""],
    ["Por estado:"],
    ...Object.entries(estadoStats).map(([estado, count]) => [estado + ":", count]),
    [""],
    ["Fecha de generación:", new Date().toLocaleDateString("es-ES")],
  ]

  const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas")

  XLSX.writeFile(workbook, `anexos_reporte_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export default function AnexosPage() {
  const [anexos, setAnexos] = useState<Anexo[]>([
    {
      id: 1,
      codigo: "ANX-001",
      titulo: "Inventario de Equipos de Cómputo",
      descripcion: "Listado completo de equipos de cómputo asignados",
      tipo: "Inventario",
      fecha_creacion: "2024-01-15",
      estado: "Completado",
    },
    {
      id: 2,
      codigo: "ANX-002",
      titulo: "Documentos Administrativos",
      descripcion: "Anexo de documentos administrativos importantes",
      tipo: "Documentos",
      fecha_creacion: "2024-01-16",
      estado: "Borrador",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnexo, setEditingAnexo] = useState<Anexo | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    titulo: "",
    descripcion: "",
    tipo: "Inventario" as const,
    estado: "Borrador" as const,
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAnexo) {
      setAnexos(anexos.map((anexo) => (anexo.id === editingAnexo.id ? { ...anexo, ...formData } : anexo)))
    } else {
      const newAnexo: Anexo = {
        id: Date.now(),
        ...formData,
        fecha_creacion: new Date().toISOString().split("T")[0],
      }
      setAnexos([...anexos, newAnexo])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      codigo: "",
      titulo: "",
      descripcion: "",
      tipo: "Inventario",
      estado: "Borrador",
    })
    setEditingAnexo(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (anexo: Anexo) => {
    setEditingAnexo(anexo)
    setFormData({
      codigo: anexo.codigo,
      titulo: anexo.titulo,
      descripcion: anexo.descripcion,
      tipo: anexo.tipo,
      estado: anexo.estado,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este anexo?")) {
      setAnexos(anexos.filter((anexo) => anexo.id !== id))
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800"
      case "Borrador":
        return "bg-yellow-100 text-yellow-800"
      case "Revisión":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Inventario":
        return "bg-purple-100 text-purple-800"
      case "Documentos":
        return "bg-blue-100 text-blue-800"
      case "Equipos":
        return "bg-orange-100 text-orange-800"
      case "Otros":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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
              <h1 className="text-xl font-bold text-white">Llenado en Anexos</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anexos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anexos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Completado").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Borrador</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Borrador").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Revisión").length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Anexos</h2>
            <p className="text-gray-600">Administra los anexos y documentos del sistema</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#24356B", color: "white" }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Anexo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingAnexo ? "Editar Anexo" : "Nuevo Anexo"}</DialogTitle>
                <DialogDescription>
                  {editingAnexo ? "Modifica los datos del anexo" : "Completa la información para crear un nuevo anexo"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="ANX-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inventario">Inventario</SelectItem>
                          <SelectItem value="Documentos">Documentos</SelectItem>
                          <SelectItem value="Equipos">Equipos</SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Título del anexo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Describe el contenido del anexo..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Borrador">Borrador</SelectItem>
                        <SelectItem value="Revisión">En Revisión</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" style={{ backgroundColor: "#24356B", color: "white" }}>
                    {editingAnexo ? "Actualizar" : "Crear"} Anexo
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => exportAnexosToPDF(anexos)}
              className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportAnexosToExcel(anexos)}
              className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Anexos</CardTitle>
            <CardDescription>Gestiona los anexos registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anexos.map((anexo) => (
                  <TableRow key={anexo.id}>
                    <TableCell className="font-medium">{anexo.codigo}</TableCell>
                    <TableCell>{anexo.titulo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(anexo.tipo)}`}>
                        {anexo.tipo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(anexo.estado)}`}>
                        {anexo.estado}
                      </span>
                    </TableCell>
                    <TableCell>{anexo.fecha_creacion}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => alert(`Descargar ${anexo.codigo}`)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(anexo)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(anexo.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
