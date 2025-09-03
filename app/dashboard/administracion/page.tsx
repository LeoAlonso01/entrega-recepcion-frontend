"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Building2, Mail } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Shield, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { Eye } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Default to local if not set

type AsignationForm = {
  asignation: Record<string, string>; // {"unidadId": "userId"}
}

type CreateUserForm = {
  username: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN" | "AUDITOR";
  asignaciones?: Record<string, string>;
}

// Esquema de validación
const userSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().optional().or(z.literal("")),
  role: z.enum(["USER", "ADMIN", "AUDITOR"], { message: "Rol inválido" }),
});

interface Usuario {
  id: number
  username: string
  email: string
  role: "USER" | "ADMIN" | "AUDITOR"
  is_deleted?: boolean // Optional property for soft delete
  created_at: string
}

interface Unidad {
  id_unidad: number;
  nombre: string;
  telefono: string;
  domicilio: string;
  municipio: string;
  localidad: string;
  codigo_postal: string;
  rfc: string;
  correo_electronico: string;
  tipo_unidad: string;
  responsable: { id: number; username: string } | null;
  fecha_creacion: string;
}

interface AsignarResponsableModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onConfirm: (responsableId: number) => void;
}

const exportUsersToPDF = (usuarios: Usuario[], title = "Reporte de Usuarios") => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(36, 53, 107) // #24356B
  doc.text(title, 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 20, 30)
  doc.text(`Total de usuarios: ${usuarios.length}`, 20, 40)
  doc.text(`Administradores: ${usuarios.filter((u) => u.role === "ADMIN").length}`, 20, 60)

  // Table
  const tableData = usuarios.map((usuario) => [
    usuario.username,
    usuario.email,
    usuario.role === "ADMIN" ? "Administrador" : "Usuario",
    usuario.created_at,
  ])
    ; (doc as any).autoTable({
      head: [["Usuario", "Email", "Rol", "Estado", "Fecha Registro"]],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [117, 21, 24], // #751518
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
    })

  doc.save(`usuarios_reporte_${new Date().toISOString().split("T")[0]}.pdf`)
}

const exportUsersToExcel = (usuarios: Usuario[], title = "Reporte de Usuarios") => {
  const worksheet = XLSX.utils.json_to_sheet(
    usuarios.map((usuario) => ({
      Usuario: usuario.username,
      Email: usuario.email,
      Rol: usuario.role === "ADMIN" ? "Administrador" : "Usuario",
      "Fecha Registro": usuario.created_at,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios")

  // Add statistics sheet
  const statsData = [
    ["Estadísticas de Usuarios"],
    [""],
    ["Total de usuarios:", usuarios.length],
    ["Administradores:", usuarios.filter((u) => u.role === "ADMIN").length],
    ["Usuarios regulares:", usuarios.filter((u) => u.role === "USER").length],
    [""],
    ["Fecha de generación:", new Date().toLocaleDateString("es-ES")],
  ]

  const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas")

  XLSX.writeFile(workbook, `usuarios_reporte_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export default function AdministracionPage(user: { role: string } | null) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  // Estados para el manejo del diálogo y formulario
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null)
  const [unidadesOriginales, setUnidadesOriginales] = useState<Unidad[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<{
    unidadId: number;
    unidadNombre: string;
    usuarioId: number;
    usuarioNombre: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchUser, setSearchUser] = useState<string>("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string }>({ username: "", role: "" })
  const [formData, setFormData] = useState<{
    username: string
    email: string
    password: string
    role: "USER" | "ADMIN" | "AUDITOR" | string
  }>({
    username: "",
    email: "",
    password: "",
    role: "",
  })
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const handleGetUsers = async () => {
    // llamada a la api
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // manejar la respuesta negativa
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }

      const data = await response.json();
      // llenar el state para tener los usuarios 
      // Asegurarse de que los datos sean del tipo Usuario[]
      if (!Array.isArray(data)) {
        throw new Error("Datos de usuarios no válidos");
      }
      // Actualizar el estado con los usuarios obtenidos
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      //setUsuarios(data as Usuario[]); // Ensure data is cast to Usuario[]
      console.log("Usuarios obtenidos:", data);
      // Aquí puedes actualizar el estado de usuarios en tu componente
      setIsLoading(false);
      setUsuarios(data as Usuario[]); // Asegúrate de que data sea del tipo Usuario[]    
    } catch (error) {
      // manejar los errores 
      console.error("Error al obtener los usuarios:", error);
      toast.error("Error al obtener los usuarios: " + (error as Error).message);
      setIsLoading(false);

    }

  }


  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }

    // Obtener los usuarios desde la API
    handleGetUsers();

    // Obtener unidades
    const handleGetUnidades = async () => {
      try {
        const response = await fetch(`${API_URL}/unidades_responsables`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Error al obtener las unidades");

        const data: Unidad[] = await response.json();
        setUnidades(data);
        console.log("Unidades obtenidas:", data);
        setLoadingUnidades(false);
      } catch (error) {
        console.error("Error al obtener unidades:", error);
        toast.error("No se pudieron cargar las unidades");
        setLoadingUnidades(false);
      }
    };

    handleGetUnidades();
  }, [router])

  const handleCreateUser: SubmitHandler<CreateUserForm> = (data) => {
    if (editingUsuario) {
      // Edición
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === editingUsuario.id
            ? {
              ...usuario,
              username: data.username,
              email: data.email,
              role: data.role,
            }
            : usuario
        )
      );
      toast.success("Usuario actualizado correctamente");
    } else {
      // Creación
      const newUsuario: Usuario = {
        id: usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
        username: data.username,
        email: data.email,
        role: data.role,
        is_deleted: false,
        created_at: new Date().toISOString().split("T")[0],
      };
      setUsuarios([...usuarios, newUsuario]);
      toast.success("Usuario creado correctamente");
    }

    resetForm();
  };

  const resetForm = () => {
    reset(); // ← Limpia el estado de react-hook-form
    setEditingUsuario(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    reset({
      username: usuario.username,
      email: usuario.email,
      role: usuario.role,
      password: "", // No se puede editar la contraseña aquí
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {/* 
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id))
    } */
    setIsDeleting(false)
    setUsuarios(usuarios.filter((usuario) => usuario.id !== id))
    toast.success("Usuario eliminado correctamente.")

  }



  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>

      {/* Breadcrumbs */}
      <NavbarWithBreadcrumb
        user={currentUser?.username || null}
        role={user?.role || ""}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* estadisticas Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.length}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.role === "ADMIN").length}</div>
              <p className="text-xs text-muted-foreground">Usuarios con permisos de administrador</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Titulares</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.role === "USER").length}</div>
              <p className="text-xs text-muted-foreground">Usuarios con acceso básico al sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Auditores</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.role === "AUDITOR").length}</div>
              <p className="text-xs text-muted-foreground">Usuarios con permisos de auditoría</p>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>

          {/** Botón para agregar un nuevo usuario */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#751518", color: "white" }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUsuario
                    ? "Modifica los datos del usuario"
                    : "Completa la información para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
                <div className="grid gap-4 py-4">
                  {/* Nombre de usuario */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      {...register("username")}
                      placeholder="usuario123"
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Contraseña (solo en creación) */}
                  {!editingUsuario && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register("password")}
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  )}

                  {/* Rol */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">Usuario</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="AUDITOR">Auditor</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.role && (
                      <p className="text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" style={{ backgroundColor: "#751518", color: "white" }}>
                    {editingUsuario ? "Actualizar" : "Crear"} Usuario
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex space-x-2">
            {/** Botón para agregar un nuevo usuario */}
            <Button
              variant="outline"
              onClick={() => exportUsersToPDF(usuarios)}
              className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            {/** Botón para agregar un nuevo usuario */}
            <Button
              variant="outline"
              onClick={() => exportUsersToExcel(usuarios)}
              className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            {/** Botón para asignar usuario a unidad responsable */}
            <Button
              style={{ backgroundColor: "#24356B", color: "white" }}
              onClick={async () => {
                setIsModalLoading(true);
                setIsModalOpen(true);

                // Simula una pequeña carga (opcional, si hay mucho contenido)
                await new Promise((resolve) => setTimeout(resolve, 200));
                setIsModalLoading(false);
              }}
            >
              {isModalLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span className="ml-2">Cargando...</span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Asignar Responsables
                </>
              )}
            </Button>
          </div>
        </div>
        {/** Aquí va el contenido adicional */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        )
          : (
            // Card donde estan los usuarios
            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>Gestiona los usuarios registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      {/* <TableHead>Estado</TableHead> */}
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.username}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              usuario.role === "ADMIN"
                                ? "default"
                                : usuario.role === "AUDITOR"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="capitalize">
                            {usuario.role === "ADMIN" ? "Administrador" : ""}
                            {usuario.role === "AUDITOR" ? "Auditor" : ""}
                            {usuario.role === "USER" ? "Usuario" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(usuario)}>
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Botón para ver detalles de los  usuarios */}
                            <Link href={`/dashboard/administracion/usuarios/${usuario.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver detalles</span>
                              </Button>
                            </Link>
                            {/* Botón para activar/desactivar usuarios */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDeleting(true)}
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
          )
        }

        {/** Asignacion de usuario cambiar a useForm */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-96 overflow-hidden">
            <DialogHeader>
              <DialogTitle>Asignar Responsable a Unidad</DialogTitle>
              <DialogDescription>
                Asigna un usuario como responsable de una unidad responsable.
              </DialogDescription>
            </DialogHeader>

            {/* Spinner o Skeleton */}
            {isModalLoading ? (
              <div className="py-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 items-center">
                    <div className="w-1/3">
                      <Skeleton className="h-4" />
                    </div>
                    <div className="w-1/4">
                      <Skeleton className="h-4" />
                    </div>
                    <div className="w-1/4">
                      <Skeleton className="h-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Responsable Actual</TableHead>
                      <TableHead>Asignar Nuevo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unidades.map((unidad) => (
                      <TableRow key={unidad.id_unidad}>
                        <TableCell className="font-medium">{unidad.nombre}</TableCell>
                        <TableCell>
                          {unidad.responsable ? (
                            <Badge variant="default">
                              {unidad.responsable.username}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Sin asignar</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`asignaciones.${unidad.id_unidad}`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const usuarioId = parseInt(value);
                                  const usuario = usuarios.find((u) => u.id === usuarioId);
                                  setPendingAssignment({
                                    unidadId: unidad.id_unidad,
                                    unidadNombre: unidad.nombre,
                                    usuarioId,
                                    usuarioNombre: usuario?.username || "",
                                  });
                                  setIsConfirmOpen(true);
                                }}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar usuario" />
                                </SelectTrigger>
                                <SelectContent>
                                  {usuarios.map((usuario) => (
                                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                                      {usuario.username} ({usuario.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  // Si está cargando, no se puede cerrar hasta que termine
                  if (isModalLoading) return;
                  setIsModalOpen(false);
                }}
                disabled={isModalLoading}
              >
                {isModalLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Procesando...
                  </span>
                ) : (
                  "Cancelar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmación */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Asignación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas asignar a <strong>{pendingAssignment?.usuarioNombre}</strong> como responsable de{" "}
                <strong>{pendingAssignment?.unidadNombre}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                style={{ backgroundColor: "#24356B", color: "white" }}
                onClick={async () => {
                  if (!pendingAssignment) return;

                  const { unidadId, usuarioId } = pendingAssignment;

                  try {
                    const res = await fetch(
                      `${API_URL}/unidades_responsables/${unidadId}/asignar-responsable`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ usuario_id: usuarioId }),
                      }
                    );

                    if (!res.ok) throw new Error("Error al asignar");

                    const data = await res.json();
                    toast.success(
                      `✅ ${data.unidad.responsable_nombre} asignado a ${data.unidad.nombre}`
                    );

                    // Actualizar estado local
                    setUnidades((prev) =>
                      prev.map((u) =>
                        u.id_unidad === unidadId
                          ? {
                            ...u,
                            responsable: {
                              id: usuarioId,
                              username: usuarios.find((u) => u.id === usuarioId)!.username,
                            },
                          }
                          : u
                      )
                    );

                    // Cerrar modales
                    setIsConfirmOpen(false);
                    // Opcional: cerrar el modal principal después de asignar
                    // setIsModalOpen(false);
                  } catch (error) {
                    toast.error("No se pudo asignar el responsable");
                    setIsConfirmOpen(false);
                  }
                }}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* componente para eliminar usuarios (soft delete) */}
        {/* Aquí podrías agregar un componente para manejar la eliminación suave de usuarios si es necesario */}
        <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Eliminar Usuario</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // Aquí podrías implementar la lógica para eliminar el usuario
                  handleDelete(editingUsuario?.id || 0)
                  setIsDeleting(false)
                  toast.success("Usuario eliminado correctamente")
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar Usuario
              </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  )
}




