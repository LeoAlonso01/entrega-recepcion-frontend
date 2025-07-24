"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import FormActa from "@/components/forms/FormActa"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"

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
  ine_entrante?: string
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
  ine_testigo_entrante?: string
  testigo_saliente?: string
  ine_testigo_saliente?: string
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

const createFolio = () => {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `FOLIO-${year}-${randomNumber}`
}

const createDate = () => {
  return new Date().toISOString().split("T")[0]
}

const folioFinal = createFolio()

const horaFinal = new Date().toLocaleTimeString("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export default function ActasPage() {
  const [actas, setActas] = useState<Acta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [editingActa, setEditingActa] = useState<Acta | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
    getUnidadesResponsables()
  }, [router])

  const getUnidadesResponsables = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token no encontrado")
      return
    }

    try {
      const response = await fetch('http://localhost:8000/unidades_responsables', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al obtener unidades')
      
      const data = await response.json()
      setUnidades(data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleEdit = (acta: Acta) => {
    setEditingActa(acta)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Eliminar esta acta?")) {
      setActas(actas.filter(acta => acta.id !== id))
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada": return "bg-green-100 text-green-800"
      case "Pendiente": return "bg-yellow-100 text-yellow-800"
      case "Revisión": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                setEditingActa(null)
                setShowForm(!showForm)
              }}
              className="bg-[#751518] hover:bg-[#8a1a1d]"
            >
              {showForm ? 'Ver lista' : 'Nueva acta'}
            </Button>
          </div>
        </div>

        {showForm ? (
          <FormActa
            acta={editingActa
              ? {
                  ...editingActa,
                  ine_entrante: editingActa.ine_entrante !== undefined ? Number(editingActa.ine_entrante) : undefined,
                  ine_testigo_entrante: editingActa.ine_testigo_entrante !== undefined ? Number(editingActa.ine_testigo_entrante) : undefined,
                  ine_testigo_saliente: editingActa.ine_testigo_saliente !== undefined ? Number(editingActa.ine_testigo_saliente) : undefined,
                }
              : null
            }
            unidades={unidades}
            onCancel={() => setShowForm(false)}
            onSave={(formData) => {
              const normalizeActa = (data: any): Acta => ({
                ...data,
                ine_entrante: data.ine_entrante !== undefined ? Number(data.ine_entrante) : undefined,
                ine_testigo_entrante: data.ine_testigo_entrante !== undefined ? Number(data.ine_testigo_entrante) : undefined,
                ine_testigo_saliente: data.ine_testigo_saliente !== undefined ? Number(data.ine_testigo_saliente) : undefined,
              })
              if (editingActa) {
                setActas(actas.map(a => a.id === editingActa.id ? {...a, ...normalizeActa(formData)} : a))
              } else {
                setActas([...actas, { ...normalizeActa({ ...formData, id: Date.now() }) }])
              }
              setShowForm(false)
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Actas</CardTitle>
              <CardDescription>Total: {actas.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fólio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Unidad</TableHead>
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
        )}
      </main>
    </div>
  )
}


