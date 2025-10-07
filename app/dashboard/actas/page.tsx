"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FormActa from "@/components/forms/FormActa"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, FileSpreadsheet, FileText, Download, RotateCw, Search, Filter } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ActaForm {
  id: number
  unidad_responsable: number
  folio?: string
  fecha: string
  hora: string
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
  const [filteredActas, setFilteredActas] = useState<ActaForm[]>([])
  const [showForm, setShowForm] = useState(false)
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [editingActa, setEditingActa] = useState<ActaForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actaToDelete, setActaToDelete] = useState<number | null>(null)
  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    getUnidadesResponsables()
    getActas()
  }, [router])

  // Filtrar actas cuando cambian los filtros o búsqueda
  useEffect(() => {
    let result = actas

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(acta =>
        acta.folio?.toLowerCase().includes(term) ||
        acta.entrante.toLowerCase().includes(term) ||
        acta.saliente.toLowerCase().includes(term) ||
        unidades.find(u => u.id_unidad === acta.unidad_responsable)?.nombre.toLowerCase().includes(term) ||
        acta.fecha.includes(term)
      )
    }

    // Filtrar por estado
    if (statusFilter.length > 0) {
      result = result.filter(acta => statusFilter.includes(acta.estado))
    }

    setFilteredActas(result)
  }, [actas, searchTerm, statusFilter, unidades])

  const getUnidadesResponsables = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token no encontrado")
      return
    }

    try {
      const response = await fetch(`${API_URL}/unidades_responsables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al obtener unidades')

      const data = await response.json()
      setUnidades(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar las unidades responsables")
    }
  }, [])

  const getActas = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        // headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/actas`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/")
          return
        }
        throw new Error('Error al obtener actas')
      }

      const data = await response.json()
      console.table(data);
      setActas(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar las actas")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router])

  const handleRefresh = () => {
    setIsRefreshing(true)
    getActas()
  }

  const handleEdit = (acta: ActaForm) => {
    setEditingActa(acta)
    setShowForm(true)
  }

  const handleView = (acta: ActaForm) => {
    router.push(`/dashboard/actas/${acta.id}`)
  }

  const confirmDelete = (id: number) => {
    setActaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!actaToDelete) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`${API_URL}/actas/${actaToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al eliminar acta')

      setActas(actas.filter(acta => acta.id !== actaToDelete))
      toast.success("Acta eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar acta:", error)
      toast.error("Error al eliminar acta")
    } finally {
      setDeleteDialogOpen(false)
      setActaToDelete(null)
    }
  }

  const updateActa = async (id: number, actaData: Partial<ActaForm>) => {
    try {

      const response = await fetch(`${API_URL}/actas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...actaData,
          id: undefined, // Evita enviar el id en el cuerpo
        })
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

  const createActa = async (actaData: any) => {
    try {
      // ✅ Convierte campos clave a número
      const cleanedData = {
        ...actaData,
        unidad_responsable: Number(actaData.unidad_responsable),

      };

      console.log("Tipo de unidad_responsable:", typeof cleanedData.unidad_responsable); // Debe ser "number"

      const response = await fetch(`${API_URL}/actas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al crear acta');
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error al crear acta:", error);
      toast.error(error.message || "Error al guardar el acta");
      throw error;
    }
  };

  const handleSaveActa = async (formData: any) => {
    try {
      let savedActa: ActaForm;

      if (editingActa && formData.id) {
        // Edición
        savedActa = await updateActa(formData.id, formData);
        setActas(actas.map(a => a.id === formData.id ? savedActa : a));
        toast.success("Acta actualizada correctamente");
      } else {
        // Creación: elimina `id` si existe
        const { id, ...createData } = formData;
        console.log("datos: ", createData);
        savedActa = await createActa(createData);
        setActas([...actas, savedActa]);
        toast.success("Acta creada correctamente");
      }

      setShowForm(false);
      setEditingActa(null);
    } catch (error: any) {
      console.error("Error al guardar acta:", error);
      toast.error(error.message || "Error al guardar el acta");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada": return "bg-green-100 text-green-800 border-green-200"
      case "Pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Revisión": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const exportToPDF = () => {
    toast.info("Exportando a PDF...")
    // Implementar lógica de exportación a PDF
  }

  const exportToExcel = () => {
    toast.info("Exportando a Excel...")
    // Implementar lógica de exportación a Excel
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
                  onClick={exportToPDF}
                  className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RotateCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualizar
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
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Ver lista' : 'Nueva acta'}
            </Button>
          </div>
        </div>

        {showForm ? (
          <FormActa
            acta={editingActa || undefined}
            unidades={unidades}
            onCancel={() => {
              setShowForm(false);
              setEditingActa(null);
            }}
            onSave={handleSaveActa}
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar actas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["Pendiente", "Completada", "Revisión"].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status])
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== status))
                        }
                      }}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {statusFilter.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStatusFilter([])}>
                        Limpiar filtros
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isLoading ? (
              <TableSkeleton />
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Lista de Actas</CardTitle>
                      <CardDescription>
                        Mostrando {filteredActas.length} de {actas.length} actas
                        {statusFilter.length > 0 && ` (filtradas por estado)`}
                        {searchTerm && ` (filtradas por búsqueda)`}
                      </CardDescription>
                    </div>
                    {filteredActas.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const element = document.createElement("a")
                        const file = new Blob([JSON.stringify(filteredActas, null, 2)], { type: 'text/plain' })
                        element.href = URL.createObjectURL(file)
                        element.download = "actas.json"
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar datos
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredActas.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {actas.length === 0
                          ? "No hay actas registradas. Crea tu primera acta."
                          : "No se encontraron actas que coincidan con los criterios de búsqueda."}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fólio</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead>Entrega</TableHead>
                            <TableHead>Recibe</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredActas.map((acta) => (
                            <TableRow key={acta.id}>
                              <TableCell className="font-medium">{acta.folio || "Sin folio"}</TableCell>
                              <TableCell>{new Date(acta.fecha).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {unidades.find(u => u.id_unidad === acta.unidad_responsable)?.nombre ||
                                  `Unidad ${acta.unidad_responsable}`}
                              </TableCell>
                              <TableCell>{acta.entrante}</TableCell>
                              <TableCell>{acta.saliente}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getEstadoColor(acta.estado)}>
                                  {acta.estado}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(acta)}
                                    title="Ver detalles"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(acta)}
                                    title="Editar acta"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => confirmDelete(acta.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Eliminar acta"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Diálogo de confirmación para eliminar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el acta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}