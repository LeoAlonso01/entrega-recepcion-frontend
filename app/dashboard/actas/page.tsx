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
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"

interface Acta {
  id: number
  unidad_responsable?: string
  folio?: string
  fecha: string
  hora?: string
  entregante: string
  recibiente: string
  comisionado?: string
  nombramiento?: string
  descripcion: string
  observaciones?: string
  estado: "Pendiente" | "Completada" | "Revisión"
}

// Helper functions to generate random data
const createUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  }
  )
}

// Generates a random UUID
const createUUIDint = () => {
  return Math.floor(Math.random() * 1000000000) // Generates a random integer
}

// Generates a folio in the format FOLIO-YYYY-XXXX
const createFolio = () => {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `FOLIO-${year}-${randomNumber}`
}

const folioFinal = createFolio()
const horaFinal = new Date().toLocaleTimeString("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

// Generates a date in the format YYYY-MM-DD
const createDate = () => {
  const date = new Date()
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}

// Export functions
// Exports the actas data to a PDF file
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
    acta.folio,
    acta.fecha,
    acta.hora,
    acta.unidad_responsable || "Unidad de Entrega y Recepción",
    acta.entregante,
    acta.recibiente,
    acta.estado,
    acta.descripcion.substring(0, 50) + (acta.descripcion.length > 50 ? "..." : ""),
  ])
    ; (doc as any).autoTable({
      head: [["Fólio", "Fecha", "Entrega", "Recibe", "Unidad Responsable", "Estado", "Descripción"]],
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
      Folio: acta.folio,
      Fecha: acta.fecha,
      Unidad: acta.unidad_responsable || "Unidad de Entrega y Recepción",
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

export default function ActasPage(user: { role: string } | null) {
  const [actas, setActas] = useState<Acta[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActa, setEditingActa] = useState<Acta | null>(null)
  const [formData, setFormData] = useState<{
    folio?: string
    fecha: string
    hora?: string
    unidad_responsable?: string
    entregante: string
    recibiente: string
    comisionado?: string
    nombramiento?: string
    descripcion: string
    estado: "Pendiente" | "Completada" | "Revisión"
  }>({
    folio: "",
    fecha: "",
    hora: "",
    unidad_responsable: "Unidad de Entrega y Recepción",
    entregante: "",
    recibiente: "",
    comisionado: "",
    nombramiento: "",
    descripcion: "",
    estado: "Pendiente",
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
      folio: "",
      unidad_responsable: "Unidad de Entrega y Recepción",
      fecha: "",
      hora: "",
      comisionado: "",
      entregante: "",
      recibiente: "",
      nombramiento: "",
      descripcion: "",
      estado: "Pendiente",
    })
    setEditingActa(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (acta: Acta) => {
    setEditingActa(acta)
    setFormData({
      folio: acta.folio || folioFinal,
      fecha: acta.fecha || createDate(),
      hora: acta.hora || horaFinal,
      unidad_responsable: acta.unidad_responsable || "Unidad de Entrega y Recepción",
      entregante: acta.entregante,
      recibiente: acta.recibiente,
      comisionado: acta.comisionado || "",
      nombramiento: acta.nombramiento || "",
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

  console.log(formData)
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Breadcrumbs */}
      <NavbarWithBreadcrumb role="ADMIN" />

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
            <DialogContent className="sm:max-w-[1000px]">
              <DialogHeader>
                <DialogTitle>{editingActa ? "Editar Acta" : "Nueva Acta de Entrega Recepción"}</DialogTitle>
                <DialogDescription>
                  {editingActa ? "Modifica los datos del acta" : "Completa la información para crear una nueva acta"}
                </DialogDescription>
              </DialogHeader>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Información del acta</h3>
              <form onSubmit={handleSubmit}>
                <div>
                  <Label className="block mb-2">Unidad Responsable</Label>
                  <Input
                    value={formData.unidad_responsable || "Unidad de entrega y recepción a la que pertenece el acta"}
                    readOnly
                    className="bg-gray-100 text-gray-700"
                  />
                </div>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Folio de acta</Label>
                      <Input
                        id="folio"
                        value={formData.folio || folioFinal}
                        onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                        placeholder="ACT-001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha_hora">Fecha</Label>
                      <Input
                        id="fecha_hora"
                        type="date"
                        value={formData.fecha || createDate()}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2" >
                      <Label htmlFor="folio">Hora</Label>
                      <Input
                        id="folio"
                        value={formData.hora || horaFinal}
                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                        placeholder="FOLIO-2023-0001"
                        required
                      />
                    </div>

                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="comisionado">Comisionado</Label>
                      <Input
                        id="comisionado"
                        value={formData.comisionado || ""}
                        onChange={(e) => setFormData({ ...formData, comisionado: e.target.value })}
                        placeholder="Nombre del comisionado"
                      />
                    </div>

                  </div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-4" >Funcionario que entrega</h3>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

                    <div className="space-y-2">
                      <Label htmlFor="entregante">Funcionario que entrega</Label>
                      <Input
                        id="entregante"
                        value={formData.entregante}
                        onChange={(e) => setFormData({ ...formData, entregante: e.target.value })}
                        placeholder="Nombre del entregante"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Id">Número de Identificación</Label>
                      <Input
                        id="recibiente"
                        value={formData.recibiente}
                        onChange={(e) => setFormData({ ...formData, recibiente: e.target.value })}
                        placeholder="Número de identificación"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombramiento" >Nombramiento</Label>
                      <Input
                        id="nombramiento"
                        value={formData.nombramiento || ""}
                        onChange={(e) => setFormData({ ...formData, nombramiento: e.target.value })}
                        placeholder="Nombramiento del entregante"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaNombramiento">Fecha de Nombramiento</Label>
                      <Input
                        id="fechaNombramiento"
                        type="date"
                        value={formData.fecha || createDate()}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observaciones">Asignación</Label>
                      <Select
                        value={formData.unidad_responsable}
                        onValueChange={(value: any) => setFormData({ ...formData, unidad_responsable: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de Asignación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nombramiento">Nombramiento</SelectItem>
                          <SelectItem value="Jerarquia">Jerarquía</SelectItem>
                          <SelectItem value="Designacion">Designación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asignadoPor">Asignado por</Label>
                      <Select
                        value={formData.unidad_responsable}
                        onValueChange={(value: any) => setFormData({ ...formData, unidad_responsable: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="¿Quién asigno?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rector">Rector(a)</SelectItem>
                          <SelectItem value="hConsejo">H. Consejo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Domicilio">Domicilio del Servidor Entrante</Label>
                      <Input
                        id="Domicilio"
                        type="dom"
                        value={formData.unidad_responsable || "Domicilio del servidor entrante"}
                        onChange={(e) => setFormData({ ...formData, unidad_responsable: e.target.value })}
                        placeholder="Domicilio del servidor entrante"
                      />

                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-blue-700 mb-4" >Testigos</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">

                      <Label htmlFor="nombreTestigoEntrante"> Testigo Entrante </Label>
                      <Input
                        id="nombreTestigoEntrante"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Nombre del testigo entrante"
                        required
                      />
                    </div>
                   
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                   >
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
                  <TableHead>Fólio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Unidad Responsable</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Recibe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actas.map((acta) => (
                  <TableRow key={acta.id}>
                    <TableCell className="font-medium">{acta.folio}</TableCell>
                    <TableCell>{acta.fecha}</TableCell>
                    <TableCell>{acta.unidad_responsable || "Unidad de Entrega y Recepción"}</TableCell>
                    <TableCell>{acta.entregante}</TableCell>
                    <TableCell>{acta.recibiente}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(acta.estado)}`}>
                        {acta.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => alert(`Ver detalles de ${acta.folio}`)}>
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
