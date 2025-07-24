"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import FormActa from "@/components/forms/FormActa"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, ArrowLeft, FileSpreadsheet, FileText } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import { Value } from "@radix-ui/react-select"

interface Acta {
  id: number
  unidad_responsable?: string
  folio?: string
  fecha: string
  hora?: string
  comisionado?: string
  oficio_comision?: string
  fecha_oficio_comision?: string
  entrante: string
  ine_entrante?: number
  fecha_inicio_labores?: string
  nombramiento?: string
  fecha_nombramiento?: string
  asignacion?: string
  asiganado_por?: string
  domicilio_entrante?: string
  telefono_entrante?: string
  saliente: string
  fecha_fin_labores?: string
  testigo_entrante?: string
  ine_testigo_entrante?: number
  testigo_saliente?: string
  ine_testigo_saliente?: number
  fecha_cierre_acta?: string
  hora_cierre_acta?: string
  observaciones?: string
  estado: "Pendiente" | "Completada" | "Revisión"
}

interface Unidad {
  id_unidad: number
  nombre: string
  descripcion?: string
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
// Generates a date in the format YYYY-MM-DD
const createDate = () => {
  const date = new Date()
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}
const folioFinal = createFolio()

const horaFinal = new Date().toLocaleTimeString("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

// Export functions
// Exports the actas data to a PDF file
/* const exportToPDF = (actas: Acta[], title = "Reporte de Actas") => {
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
} */

export default function ActasPage(user: { role: string } | null) {
  const [actas, setActas] = useState<Acta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [nombreUnidad, setNombreUnidad] = useState<string>("")
  const [acta , setActa] = useState<Acta | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [editingActa, setEditingActa] = useState<Acta | null>(null)
  const [formData, setFormData] = useState<{
    folio?: string
    fecha: string
    hora?: string
    unidad_responsable?: string
    comisionado?: string
    oficio_comision?: string
    fecha_oficio_comision?: string
    entrante: string
    ine_entrante?: number
    fecha_inicio_labores?: string
    nombramiento?: string
    fecha_nombramiento?: string
    asignacion?: string
    asiganado_por?: string
    domicilio_entrante?: string
    telefono_entrante?: string
    saliente: string
    fecha_fin_labores?: string
    testigo_entrante?: string
    ine_testigo_entrante?: number
    testigo_saliente?: string
    ine_testigo_saliente?: number
    fecha_cierre_acta?: string
    hora_cierre_acta?: string
    observaciones?: string
    estado: "Pendiente" | "Completada" | "Revisión"
  }>({
    folio: "",
    fecha: "",
    hora: "",
    unidad_responsable: "",
    comisionado: "",
    oficio_comision: "",
    fecha_oficio_comision: "",
    entrante: "",
    ine_entrante: 0,
    fecha_inicio_labores: "",
    nombramiento: "",
    fecha_nombramiento: "",
    asignacion: "",
    asiganado_por: "",
    domicilio_entrante: "",
    telefono_entrante: "",
    saliente: "",
    fecha_fin_labores: "",
    testigo_entrante: "",
    ine_testigo_entrante: 0,
    testigo_saliente: "",
    ine_testigo_saliente: 0,
    fecha_cierre_acta: "",
    hora_cierre_acta: "",
    observaciones: "",
    estado: "Pendiente",

  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
    // Aquí puedes cargar las actas desde una API o base de datos
    getUnidadesResponsables()
    // getActas() // Descomentar si tienes una función para obtener las actas
  }, [router])

  const getUnidadesResponsables = async () => {
    // Lógica para obtener las unidades responsables
    // Aquí puedes obtener el token de acceso desde localStorage
    const token = localStorage.getItem("token");

    // Verifica si el token es válido
    if (!token) {
      console.error("Token de acceso no encontrado. Redirigiendo a la página de inicio");
      // Redirige al usuario a la página de inicio o de inicio de sesión
      setError(new Error("Token de acceso no encontrado. Redirigiendo a la página de inicio"));
      const router = useRouter();
      router.push("/");
      return;
    } else {
      console.log("Token de acceso encontrado y valido!! :", token);
    }
    try {
      // Aquí puedes hacer una llamada a la API para obtener las unidades responsables
      const response = await fetch('http://localhost:8000/unidades_responsables', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // enviar token de acceso en el header
          'Authorization': `Bearer ${token}`
        }

      });

      if (!response.ok) {
        throw new Error('Error al obtener las unidades responsables');
      }

      const data = await response.json();
      console.log("Unidades responsables obtenidas:", data);
      // obtener los nombres de la unidad responsable
      const unidades = data.map((unidad: { nombre: string }) => unidad.nombre);
      console.log("Unidades responsables:", unidades);
      setUnidades(data); // Actualizar el estado con las unidades obtenidas

    } catch (error) {

      console.error("Error al obtener las unidades responsables:", error);


    }
  }

  const getActas = () => {

  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingActa) {
      toast.success("Acta actualizada correctamente")
      /* setActas(actas.map((acta) => (acta.id === editingActa.id ? { ...acta, ...formData } : acta))) */
    } else {
      toast.success("Acta creada correctamente")
      /* const newActa: Acta = {
        id: Date.now(),
        ...formData,
      }
      setActas([...actas, newActa]) */
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      folio: "",
      unidad_responsable: "",
      fecha: "",
      hora: "",
      comisionado: "",
      oficio_comision: "",
      fecha_oficio_comision: "",
      entrante: "",
      saliente: "",
      nombramiento: "",
      fecha_nombramiento: "",
      asignacion: "",
      asiganado_por: "",
      domicilio_entrante: "",
      telefono_entrante: "",
      testigo_entrante: "",
      ine_testigo_entrante: undefined,
      testigo_saliente: "",
      ine_testigo_saliente: undefined,
      fecha_cierre_acta: "",
      hora_cierre_acta: undefined,
      observaciones: "",
      estado: "Pendiente",
    })
    setEditingActa(null)
    setShowForm(false)
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
      {/* Breadcrumbs */}
      <NavbarWithBreadcrumb role="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Actas</h2>
            <p className="text-gray-600">Administra las actas de entrega y recepción</p>
          </div>

          <div className="flex space-x-2">
            {!showForm && (
              <>
                <Button
                  variant="outline"
                  onClick={() => toast("Funcionalidad en desarrollo")}
                  className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast("Funcionalidad en desarrollo")}
                  className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                setEditingActa(null);
                setShowForm(true);
              }}
              className="bg-[#751518] hover:bg-[#8a1a1d]"
            >
              {showForm ? 'Ver lista de actas' : 'Agregar nueva acta'}
            </Button>
          </div>
        </div>

        {showForm ? (
         <></>
        ) : (
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
                      <TableCell>{acta.entrante}</TableCell>
                      <TableCell>{acta.saliente}</TableCell>
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
                          <Button variant="outline" size="sm" onClick={() => toast.info("Funcionalidad en desarrollo")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.error("Funcionalidad en desarrollo")}
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
        )}
      </main>
    </div>
  );
}