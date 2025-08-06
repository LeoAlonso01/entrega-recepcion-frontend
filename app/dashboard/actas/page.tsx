"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import FormActa from "@/components/forms/FormActa"
import { Skeleton} from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"

interface ActaForm {
  id: number
  unidad_responsable: number
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
  asignado_por?: string
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

const createDate = () => {
  return new Date().toISOString().split("T")[0]
}

export default function ActasPage() {
  const [actas, setActas] = useState<ActaForm[]>([])
  const [showForm, setShowForm] = useState(false)
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [editingActa, setEditingActa] = useState<ActaForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
    getUnidadesResponsables()
    getActas()
  }, [router])

  const getUnidadesResponsables = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token no encontrado")
      return
    }

    try {
      const response = await fetch(/* 'http://148.216.25.183:8000/unidades_responsables' */'http://localhost:8000/unidades_responsables', {
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

  const getActas = async () => {
    try {
      const response = await fetch(/* 'http://148.216.25.183:8000/actas/' */'http://localhost:8000/actas/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) throw new Error('Error al obtener actas')
      
      const data = await response.json()
      setActas(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (acta: ActaForm) => {
    setEditingActa(acta)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta acta?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`http://148.216.25.183:8000/actas/${id}`/*`http://localhost:8000/actas/${id}`*/, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al eliminar acta')

      setActas(actas.filter(acta => acta.id !== id))
      toast.success("Acta eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar acta:", error)
      toast.error("Error al eliminar acta")
    }
  }

  const updateActa = async (id: number, actaData: Partial<ActaForm>) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`http://148.216.25.183:8000/actas/${id}`/*` http://localhost:8000/actas/${id}` */, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actaData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar acta')
      }

      const updatedActa = await response.json()
      return updatedActa
    } catch (error) {
      console.error("Error al actualizar acta:", error)
      throw error
    }
  }

  const createActa = async (actaData: Omit<ActaForm, 'id'>) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch('http://148.216.25.183:8000/actas/'/*`http://localhost:8000/actas/` */, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(actaData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear acta')
      }

      const newActa = await response.json()
      return newActa
    } catch (error) {
      console.error("Error al crear acta:", error)
      throw error
    }
  }

  const handleSaveActa = async (formData: ActaForm) => {
  try {
    if (editingActa && formData.id) {
      const updatedActa = await updateActa(formData.id, formData);
      setActas(actas.map(a => a.id === formData.id ? updatedActa : a));
      toast.success("Acta actualizada");
    } else {
      const newActa = await createActa(formData);
      setActas([...actas, newActa]);
      toast.success("Acta creada");
    }
    setShowForm(false);
    setEditingActa(null);
  } catch (error) {
    toast.error("Error al guardar");
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

  const TableSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
          
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4 pt-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <div className="flex items-center">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

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
            acta={editingActa || {
              id: 0,
              unidad_responsable: unidades[0]?.id_unidad || 0,
              fecha: createDate(),
              hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              entrante: "",
              saliente: "",
              estado: "Pendiente"
            }}
            unidades={unidades}
            onCancel={() => {
              setShowForm(false)
              setEditingActa(null)
            }}
            onSave={handleSaveActa}
          />
        ) : isLoading ? (
          <TableSkeleton />
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
                      <TableCell>
                        {unidades.find(u => u.id_unidad === acta.unidad_responsable)?.nombre || 
                         `Unidad ${acta.unidad_responsable}`}
                      </TableCell>
                      <TableCell>{acta.entrante}</TableCell>
                      <TableCell>{acta.saliente}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(acta.estado)}`}>
                          {acta.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(acta)}>
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