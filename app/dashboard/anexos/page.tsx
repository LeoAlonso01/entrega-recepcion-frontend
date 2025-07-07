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
  clave: "RF01" | "RF02" | "RF03" | "RF04" | "RF05" | "RF06" | "RF07" | "RF08" | "RF09" | "RF10"
  titulo: string
  descripcion: string
  categoria: "Contratos, Convenios y Licitaciones" | "Recursos Presupuestales y Financieros" | "Inventario de Bienes Muebles e Inmuebles" | "Recursos Humanos" | "Seguridad y Control de Acceso" | "Documentación y Archivos" | "Asuntos Legales y de Auditoría" | "Programas y Proyectos" | "Transparencia" | "Estructura y Normativa Interna"
  fecha_creacion: string
  estado: "Borrador" | "Completado" | "Revisión" | "Cancelado"
  archivo: string // Nombre del archivo asociado
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
    anexo.clave,
    anexo.titulo.substring(0, 30) + (anexo.titulo.length > 30 ? "..." : ""),
    anexo.categoria,
    anexo.estado,
    anexo.fecha_creacion,
    anexo.descripcion.substring(0, 40) + (anexo.descripcion.length > 40 ? "..." : ""),
  ])
    ; (doc as any).autoTable({
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
      Clave: anexo.clave,
      Título: anexo.titulo,
      Categoria: anexo.categoria,
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
      acc[anexo.categoria] = (acc[anexo.categoria] || 0) + 1
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
      clave: "RF01",
      titulo: "Presupuesto Autorizado y Ejercido",
      descripcion: "Revisa los presupuestos autorizados y ejercidos por las diferentes áreas.",
      categoria: "Recursos Presupuestales y Financieros",
      fecha_creacion: "2024-01-15",
      estado: "Borrador",
      archivo: "", // Nombre del archivo asociado
    },
    {
      id: 2,
      clave: "RF02",
      titulo: "Presuúesto de otros ingresos y egresos",
      descripcion: "Anexo que contiene los ingresos y egresos adicionales al presupuesto principal.",
      categoria: "Recursos Presupuestales y Financieros",
      fecha_creacion: "2024-01-16",
      estado: "Borrador",
      archivo: "", // Nombre del archivo asociado
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnexo, setEditingAnexo] = useState<Anexo | null>(null)
  const [formData, setFormData] = useState<{
    clave: string
    titulo: string
    descripcion: string
    categoria: Anexo["categoria"]
    estado: Anexo["estado"]
    archivo: string
  }>({
    clave: "",
    titulo: "",
    descripcion: "",
    categoria: "Inventario de Bienes Muebles e Inmuebles",
    estado: "Borrador",
    archivo: "",
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
      setAnexos(
        anexos.map((anexo) =>
          anexo.id === editingAnexo.id
            ? {
              ...anexo,
              ...formData,
              clave: formData.clave as Anexo["clave"], // Ensure correct type
              fecha_creacion: new Date().toISOString().split("T")[0],
            }
            : anexo
        )
      )
    } else {
      const newAnexo: Anexo = {
        id: Date.now(),
        ...formData,
        clave: formData.clave as Anexo["clave"],
        fecha_creacion: new Date().toISOString().split("T")[0],
        archivo: (formData as any).archivo || "", // Ensure archivo is set
      }
      setAnexos([...anexos, newAnexo])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      clave: "",
      titulo: "",
      descripcion: "",
      categoria: "Inventario de Bienes Muebles e Inmuebles",
      estado: "Borrador",
      archivo: "",
    })
    setEditingAnexo(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (anexo: Anexo) => {
    setEditingAnexo(anexo)
    setFormData({
      clave: anexo.clave,
      titulo: anexo.titulo,
      descripcion: anexo.descripcion,
      categoria: anexo.categoria,
      estado: anexo.estado,
      archivo: anexo.archivo || "",
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
      case "Recursos Presupuestales y Financieros":
        return "bg-purple-100 text-purple-800"
      case "Contratos Convenios y Licitaciones":
        return "bg-blue-100 text-blue-800"
      case "Estrucura y Normativa Interna":
        return "bg-orange-100 text-orange-800"
      case "Recursos Humanos":
        return "bg-gray-100 text-gray-800"
      case "Inventario de Binenes Muebles e Inmuebles":
        return "bg-green-100 text-green-800"
      case "Segurirdad y Control de Acceso":
        return "bg-red-100 text-red-800"
      case "Documentación y Archivos":
        return "bg-yellow-100 text-yellow-800"
      case "Asuntos Legales y de Auditoría":
        return "bg-teal-100 text-teal-800"
      case "Porgramas y Proyectos":
        return "bg-cyan-100 text-cyan-800"
      case "Transparencia":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
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
                <form onSubmit={handleSubmit}>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contratos, Convenios y Licitaciones">
                          Contratos, Convenios y Licitaciones
                        </SelectItem>
                        <SelectItem value="Recursos Presupuestales y Financieros">
                          Recursos Presupuestales y Financieros
                        </SelectItem>
                        <SelectItem value="Inventario de Bienes Muebles e Inmuebles">
                          Inventario de Bienes Muebles e Inmuebles
                        </SelectItem>
                        <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                        <SelectItem value="Seguridad y Control de Acceso">Seguridad y Control de Acceso</SelectItem>
                        <SelectItem value="Documentación y Archivos">Documentación y Archivos</SelectItem>
                        <SelectItem value="Asuntos Legales y de Auditoría">Asuntos Legales y de Auditoría</SelectItem>
                        <SelectItem value="Programas y Proyectos">Programas y Proyectos</SelectItem>
                        <SelectItem value="Transparencia">Transparencia</SelectItem>
                        <SelectItem value="Estructura y Normativa Interna">Estructura y Normativa Interna</SelectItem>

                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clave">Clave del Anexo</Label>
                    <Select
                      value={formData.clave}
                      onValueChange={(value: any) => setFormData({ ...formData, clave: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la clave" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RF01">RF01</SelectItem>
                        <SelectItem value="RF02">RF02</SelectItem>
                        <SelectItem value="RF03">RF03</SelectItem>
                        <SelectItem value="RF04">RF04</SelectItem>
                        <SelectItem value="RF05">RF05</SelectItem>
                        <SelectItem value="RF06">RF06</SelectItem>
                        <SelectItem value="RF07">RF07</SelectItem>
                        <SelectItem value="RF08">RF08</SelectItem>
                        <SelectItem value="RF09">RF09</SelectItem>
                        <SelectItem value="RF10">RF10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 py-4">

                  {formData.clave === "RF01" && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <Label htmlFor="Partida">Partida <span>*</span></Label>
                        <Input
                          id="Partida"
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Denominación <span>*</span></Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                         
                        >
                        </Input>
                      </div>
                      <div className="flex flex-col">
                        <Label>Presupuesto Autorizado <span>*</span></Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Ampliaciones y/o Deducciones</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Presupuesto Modificado</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                         
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Presupuesto Ejercido</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label>Por Ejercer</Label>
                        <Input
                          type="number"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          
                        />
                      </div>

                      {/* Puedes agregar más campos si es necesario */}
                        <Label>Archivos del Presupuesto del SIIA</Label>
                        <Input
                        type="file"
                        accept=".pdf,.xlsx"
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px",
                          borderRadius: "4px",
                          marginTop: "8px",
                          width: "100%",
                          boxSizing: "border-box",
                          backgroundColor: "gray",
                          transition: "background-color 0.2s, border-color 0.2s",
                        }}
                        onMouseOver={e => {
                          (e.currentTarget as HTMLInputElement).style.backgroundColor = "#bdbdbd"
                          ;(e.currentTarget as HTMLInputElement).style.borderColor = "#24356B"
                        }}
                        onMouseOut={e => {
                          (e.currentTarget as HTMLInputElement).style.backgroundColor = "gray"
                          ;(e.currentTarget as HTMLInputElement).style.borderColor = "#ccc"
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFormData({ ...formData, archivo: file.name })
                          }
                        }}
                      />
                      <h3>Previsualización</h3>
                      <div>
                        {formData.archivo && formData.archivo.endsWith(".pdf") ? (
                          <iframe
                            src={URL.createObjectURL(new Blob([formData.archivo], { type: "application/pdf" }))}
                            style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
                            title="Previsualización del PDF"
                          />
                        ) : formData.archivo && formData.archivo.endsWith(".xlsx") ? (
                          <p>Archivo Excel cargado: {formData.archivo}</p>
                        ) : (
                          <p>No hay archivo cargado</p>
                        )}
                      </div>
                    </div>
                  )}
                    

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
                    <TableHead>Clave</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anexos.map((anexo) => (
                    <TableRow key={anexo.id}>
                      <TableCell className="font-medium">{anexo.clave}</TableCell>
                      <TableCell>{anexo.titulo}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(anexo.categoria)}`}>
                          {anexo.categoria}
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
                          <Button variant="outline" size="sm" onClick={() => alert(`Descargar ${anexo.clave}`)}>
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
    </>
  )
}
