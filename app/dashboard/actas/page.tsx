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
import { Plus, Edit, Trash2, Eye, ArrowLeft, FileSpreadsheet, FileText } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

interface Acta {
  id: number
  numero: string
  fecha: string
  entregante: string
  recibiente: string
  descripcion: string
  estado: "Pendiente" | "Completada" | "Revisión"
}

const exportToPDF = (actas: Acta[], title = "Reporte de Actas") => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(36, 53, 107) // #24356B
  doc.text(title, 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 20, 30)
  doc.text(`Total de registros: ${actas.length}`, 20, 40)

  // Table
  const tableData = actas.map((acta) => [
    acta.numero,
    acta.fecha,
    acta.entregante,
    acta.recibiente,
    acta.estado,
    acta.descripcion.substring(0, 50) + (acta.descripcion.length > 50 ? "..." : ""),
  ])
  ;(doc as any).autoTable({
    head: [["Número", "Fecha", "Entregante", "Recibiente", "Estado", "Descripción"]],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 8,
      cellPadding: 3,
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
  })

  doc.save(`actas_reporte_${new Date().toISOString().split("T")[0]}.pdf`)
}

const exportToExcel = (actas: Acta[], title = "Reporte de Actas") => {
  const worksheet = XLSX.utils.json_to_sheet(
    actas.map((acta) => ({
      Número: acta.numero,
      Fecha: acta.fecha,
      Entregante: acta.entregante,
      Recibiente: acta.recibiente,
      Estado: acta.estado,
      Descripción: acta.descripcion,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Actas")

  // Add metadata
  const metaSheet = XLSX.utils.aoa_to_sheet([
    ["Reporte de Actas de Entrega Recepción"],
    ["Fecha de generación:", new Date().toLocaleDateString("es-ES")],
    ["Total de registros:", actas.length.toString()],
    [""],
    ["Filtros aplicados:", "Ninguno"],
  ])
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Información")

  XLSX.writeFile(workbook, `actas_reporte_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export default function ActasPage() {
  const [actas, setActas] = useState<Acta[]>([
    {
      id: 1,
      numero: "ACT-001",
      fecha: "2024-01-15",
      entregante: "Juan Pérez",
      recibiente: "María García",
      descripcion: "Entrega de equipos de oficina",
      estado: "Completada",
    },
    {
      id: 2,
      numero: "ACT-002",
      fecha: "2024-01-16",
      entregante: "Carlos López",
      recibiente: "Ana Martínez",
      descripcion: "Entrega de documentos administrativos",
      estado: "Pendiente",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActa, setEditingActa] = useState<Acta | null>(null)
  const [formData, setFormData] = useState({
    numero: "",
    fecha: "",
    entregante: "",
    recibiente: "",
    descripcion: "",
    estado: "Pendiente" as const,
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

    if (editingActa) {
      setActas(actas.map((acta) => (acta.id === editingActa.id ? { ...acta, ...formData } : acta)))
    } else {
      const newActa: Acta = {
        id: Date.now(),
        ...formData,
      }
      setActas([...actas, newActa])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      numero: "",
      fecha: "",
      entregante: "",
      recibiente: "",
      descripcion: "",
      estado: "Pendiente",
    })
    setEditingActa(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (acta: Acta) => {
    setEditingActa(acta)
    setFormData({
      numero: acta.numero,
      fecha: acta.fecha,
      entregante: acta.entregante,
      recibiente: acta.recibiente,
      descripcion: acta.descripcion,
      estado: acta.estado,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta acta?")) {
      setActas(actas.filter((acta) => acta.id !== id))
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada":
        return "bg-green-100 text-green-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "Revisión":
        return "bg-blue-100 text-blue-800"
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
              <h1 className="text-xl font-bold text-white">Actas de Entrega Recepción</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Actas</h2>
            <p className="text-gray-600">Administra las actas de entrega y recepción</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#B59E60", color: "white" }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Acta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingActa ? "Editar Acta" : "Nueva Acta de Entrega Recepción"}</DialogTitle>
                <DialogDescription>
                  {editingActa ? "Modifica los datos del acta" : "Completa la información para crear una nueva acta"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número de Acta</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        placeholder="ACT-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entregante">Entregante</Label>
                      <Input
                        id="entregante"
                        value={formData.entregante}
                        onChange={(e) => setFormData({ ...formData, entregante: e.target.value })}
                        placeholder="Nombre del entregante"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recibiente">Recibiente</Label>
                      <Input
                        id="recibiente"
                        value={formData.recibiente}
                        onChange={(e) => setFormData({ ...formData, recibiente: e.target.value })}
                        placeholder="Nombre del recibiente"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Describe los elementos entregados..."
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
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Revisión">En Revisión</SelectItem>
                        <SelectItem value="Completada">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" style={{ backgroundColor: "#751518", color: "white" }}>
                    {editingActa ? "Actualizar" : "Crear"} Acta
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => exportToPDF(actas)}
              className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToExcel(actas)}
              className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Actas</CardTitle>
            <CardDescription>Total de actas registradas: {actas.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Entregante</TableHead>
                  <TableHead>Recibiente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actas.map((acta) => (
                  <TableRow key={acta.id}>
                    <TableCell className="font-medium">{acta.numero}</TableCell>
                    <TableCell>{acta.fecha}</TableCell>
                    <TableCell>{acta.entregante}</TableCell>
                    <TableCell>{acta.recibiente}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(acta.estado)}`}>
                        {acta.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => alert(`Ver detalles de ${acta.numero}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(acta)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(acta.id)}
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
