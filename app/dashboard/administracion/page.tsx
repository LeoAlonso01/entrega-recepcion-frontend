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
import { Plus, Edit, Trash2, ArrowLeft, Shield, User, Lock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import ResetPasswordModal from "@/components/ResetPasswordModal"
import { Eye } from "lucide-react"
import { set } from "date-fns";

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
  // Prevent server-side execution of client-only code by short-circuiting during SSR/build
  if (typeof window === 'undefined') {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  // Estados para el manejo del diálogo y formulario
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null)
  const [unidadesOriginales, setUnidadesOriginales] = useState<Unidad[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [loadingAsignacion, setLoadingAsignacion] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<{
    unidadId: number;
    unidadNombre: string;
    usuarioId: number;
    usuarioNombre: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  // Paging / caching for unidades to improve performance
  const [unidadesPage, setUnidadesPage] = useState(1);
  const unidadesLimit = 20; // items per page / chunk
  const [unidadesHasMore, setUnidadesHasMore] = useState(true);
  const [unidadesCache, setUnidadesCache] = useState<Unidad[]>([]); // full cache when server returns everything
  const [showedUnidadesCount, setShowedUnidadesCount] = useState(0); // how many items are currently rendered

  // Reset password modal state (admin flows)
  const [openResetModal, setOpenResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: number; username: string } | null>(null);

  // Self-change modal state (for the logged-in user)
  const [openSelfChange, setOpenSelfChange] = useState(false);
  const [selfTarget, setSelfTarget] = useState<{ id: number; username: string } | null>(null);

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

  const handleGetUsers = async (search = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token no encontrado. Por favor inicia sesión.");
        router.push("/");
        return;
      }

      const url = new URL(`${API_URL}/users`);
      if (search) url.searchParams.set("search", search);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión de nuevo.");
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Datos de usuarios no válidos");
      }

      console.log("Usuarios obtenidos:", data);
      setUsuarios(data as Usuario[]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      toast.error("Error al obtener los usuarios: " + (error as Error).message);
      setIsLoading(false);
    }
  }


  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return;
    }

    // Obtener los usuarios desde la API
    handleGetUsers();

    // Cargar el usuario actual desde localStorage para decisiones de UI (mostrar botón de "cambiar contraseña" solo en la fila propia)
    const storedCurrent = localStorage.getItem('currentUser');
    if (storedCurrent) {
      try { setCurrentUser(JSON.parse(storedCurrent)); } catch (e) { console.warn('No se pudo parsear currentUser', e); }
    }

    // Obtener unidades: NOTE: we no longer fetch all unidades automatically on mount to avoid loading delays.
    // Loading of unidades is performed lazily when opening the "Asignar" modal to improve performance.
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

  // Load a page/chunk of unidades. Tries server-side pagination first (page & limit),
  // and falls back to client-side chunking if the server returns the full list.
  const loadUnidadesPage = async (page = 1) => {
    setIsModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token no encontrado. Por favor inicia sesión.");
        router.push("/");
        setIsModalLoading(false);
        return;
      }

      const url = new URL(`${API_URL}/unidades_responsables`);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", unidadesLimit.toString());

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión de nuevo.");
        router.push("/");
        setIsModalLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Error al obtener las unidades");

      const data: Unidad[] = await res.json();

      // Case A: server-side pagination
      if (data.length <= unidadesLimit) {
        // append or set
        if (page === 1) {
          setUnidades(data);
          setUnidadesCache(data);
          setShowedUnidadesCount(data.length);
        } else {
          setUnidades((prev) => [...prev, ...data]);
          setUnidadesCache((prev) => [...prev, ...data]);
          setShowedUnidadesCount((prev) => prev + data.length);
        }

        setUnidadesHasMore(data.length === unidadesLimit);
        setUnidadesPage(page);
      } else {
        // Case B: server returned many items (maybe whole list). Cache and only render first chunk to reduce rendering cost.
        setUnidadesCache(data);
        const firstChunk = data.slice(0, unidadesLimit);
        setUnidades(firstChunk);
        setShowedUnidadesCount(firstChunk.length);
        setUnidadesHasMore(data.length > firstChunk.length);
        setUnidadesPage(1);
      }
    } catch (e) {
      console.error("Error al cargar unidades por página", e);
      toast.error("No se pudieron cargar las unidades");
    } finally {
      setIsModalLoading(false);
    }
  };

  // Handler for modal open/close to clear heavy state on close for faster UX
  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Clear big arrays quickly so closing animation is snappy
      setUnidades([]);
      setUnidadesCache([]);
      setUnidadesPage(1);
      setUnidadesHasMore(true);
      setShowedUnidadesCount(0);
      setIsModalLoading(false);
      setLoadingAsignacion(false);
    }
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
        role="ADMIN"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
        {loadingAsignacion && !isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="flex items-center gap-3 bg-white bg-opacity-95 px-5 py-4 rounded-md shadow-md">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-sm font-medium">Cargando...</span>
            </div>
          </div>
        )}

        {/* estadisticas Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Usuarios</CardTitle>
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{usuarios.length}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{usuarios.filter((u) => u.role === "ADMIN").length}</div>
              <p className="text-xs text-muted-foreground">Usuarios administradores</p>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Usuarios Titulares</CardTitle>
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{usuarios.filter((u) => u.role === "USER").length}</div>
              <p className="text-xs text-muted-foreground">Usuarios con acceso básico</p>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Usuarios Auditores</CardTitle>
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">{usuarios.filter((u) => u.role === "AUDITOR").length}</div>
              <p className="text-xs text-muted-foreground">Usuarios con auditoría</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-sm sm:text-base text-gray-600">Administra los usuarios del sistema</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: "#751518", color: "white" }}
                  className="w-full sm:w-auto flex items-center justify-center"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Nuevo Usuario</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    {editingUsuario
                      ? "Modifica los datos del usuario"
                      : "Completa la información para crear un nuevo usuario"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
                  <div className="grid gap-4 py-2 sm:py-4">
                    {/* Nombre de usuario */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm sm:text-base">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        {...register("username")}
                        placeholder="usuario123"
                        className="text-sm sm:text-base"
                      />
                      {errors.username && (
                        <p className="text-xs sm:text-sm text-red-600">{errors.username.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="usuario@ejemplo.com"
                        className="text-sm sm:text-base"
                      />
                      {errors.email && (
                        <p className="text-xs sm:text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Contraseña (solo en creación) */}
                    {!editingUsuario && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm sm:text-base">Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          {...register("password")}
                          placeholder="••••••••"
                          className="text-sm sm:text-base"
                        />
                        {errors.password && (
                          <p className="text-xs sm:text-sm text-red-600">{errors.password.message}</p>
                        )}
                      </div>
                    )}

                    {/* Rol */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm sm:text-base">Rol</Label>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue placeholder="Selecciona el rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER" className="text-sm sm:text-base">Usuario</SelectItem>
                              <SelectItem value="ADMIN" className="text-sm sm:text-base">Administrador</SelectItem>
                              <SelectItem value="AUDITOR" className="text-sm sm:text-base">Auditor</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.role && (
                        <p className="text-xs sm:text-sm text-red-600">{errors.role.message}</p>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      style={{ backgroundColor: "#751518", color: "white" }}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      {editingUsuario ? "Actualizar" : "Crear"} Usuario
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => exportUsersToPDF(usuarios)}
                className="flex-1 xs:flex-none border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white text-sm"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Exportar PDF</span>
                <span className="xs:hidden">PDF</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => exportUsersToExcel(usuarios)}
                className="flex-1 xs:flex-none border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white text-sm"
              >
                <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Exportar Excel</span>
                <span className="xs:hidden">Excel</span>
              </Button>

              <Button
                style={{ backgroundColor: "#24356B", color: "white" }}
                onClick={async () => {
                  if (!localStorage.getItem("token")) return;
                  setLoadingAsignacion(true);
                  // Load the first page/chunk of unidades and show overlay while fetching
                  await loadUnidadesPage(1);
                  setIsModalOpen(true);
                  setLoadingAsignacion(false);
                }}
                disabled={!localStorage.getItem("token") || loadingAsignacion}
                className="flex-1 xs:flex-none text-sm flex items-center justify-center"
              >
                {loadingAsignacion ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Cargando...</span>
                  </span>
                ) : (
                  <>
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Asignar Responsable</span>
                    <span className="xs:hidden">Asignar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
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
        ) : (
          <Card className="w-full">

            <CardContent className="p-0 sm:p-4">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table className="min-w-full text-sm divide-y divide-gray-200">
                  {/* Encabezado: visible solo en pantallas md+ */}
                  <TableHeader className="bg-gray-50 hidden md:table-header-group">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-left uppercase tracking-wider text-xs font-medium">
                        Usuario
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left uppercase tracking-wider text-xs font-medium">
                        Email
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left uppercase tracking-wider text-xs font-medium">
                        Rol
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left uppercase tracking-wider text-xs font-medium">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {/* Cuerpo de tabla / tarjetas responsivas */}
                  <TableBody className="divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <TableRow
                        key={usuario.id}
                        className="md:table-row flex flex-col md:flex-row md:table-row border md:border-0 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none"
                      >
                        {/* Usuario */}
                        <TableCell className="px-4 py-4 md:table-cell">
                          <div className="md:hidden font-semibold text-gray-500 text-xs">Usuario</div>
                          <div className="font-medium text-gray-900 text-sm">{usuario.username}</div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="px-4 py-4 md:table-cell">
                          <div className="md:hidden font-semibold text-gray-500 text-xs">Email</div>
                          <div className="text-gray-800 text-sm">{usuario.email}</div>
                        </TableCell>

                        {/* Rol */}
                        <TableCell className="px-4 py-4 md:table-cell">
                          <div className="md:hidden font-semibold text-gray-500 text-xs">Rol</div>
                          <Badge
                            variant={
                              usuario.role === "ADMIN"
                                ? "default"
                                : usuario.role === "AUDITOR"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="capitalize text-xs"
                          >
                            {usuario.role === "ADMIN" ? "Administrador" : ""}
                            {usuario.role === "AUDITOR" ? "Auditor" : ""}
                            {usuario.role === "USER" ? "Usuario" : ""}
                          </Badge>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="px-4 py-4 md:table-cell">
                          <div className="md:hidden font-semibold text-gray-500 text-xs mb-2">
                            Acciones
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(usuario)}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>

                            <Link href={`/dashboard/administracion/usuarios/${usuario.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only">Ver detalles</span>
                              </Button>
                            </Link>

                            {/* Cambiar contraseña (propio usuario) */}
                            {usuario?.username === usuario.username && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelfTarget({ id: usuario.id, username: usuario.username }); setOpenSelfChange(true); }}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-amber-600 hover:text-amber-800"
                              >
                                <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only">Cambiar contraseña</span>
                              </Button>
                            )}

                            {/* Reset password (admin) */}
                        
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setResetTarget({ id: usuario.id, username: usuario.username }); setOpenResetModal(true); }}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-indigo-600 hover:text-indigo-800"
                              >
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only">Resetear contraseña</span>
                              </Button>
                            

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUsuario(usuario);
                                setIsDeleting(true);
                              }}
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset password modal (admin) */}
        <ResetPasswordModal open={openResetModal} onOpenChange={(v) => { setOpenResetModal(v); if (!v) setResetTarget(null); }} userId={resetTarget?.id ?? null} username={resetTarget?.username ?? null} mode="admin" onSuccess={() => { handleGetUsers(); setOpenResetModal(false); }} />

        {/* Self-change modal (open for the logged-in user via the row button) */}
        <ResetPasswordModal open={openSelfChange} onOpenChange={(v) => { setOpenSelfChange(v); if (!v) setSelfTarget(null); }} userId={selfTarget?.id ?? null} username={selfTarget?.username ?? null} mode="self" onSuccess={() => { /* handled inside modal (logout) */ }} />

        {/* Asignación de usuario */}
        <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Asignar Responsable a Unidad</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Asigna un usuario como responsable de una unidad responsable.
              </DialogDescription>
            </DialogHeader>

            {isModalLoading ? (
              <div className="py-4 space-y-4 flex-1 overflow-y-auto">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 items-start sm:items-center">
                    <div className="w-full sm:w-1/3">
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="w-full sm:w-1/4">
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="w-full sm:w-1/4">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <Label className="text-xs">Buscar usuario</Label>
                  <Input
                    placeholder="Buscar por username o email"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Unidad</TableHead>
                        <TableHead className="text-xs sm:text-sm">Responsable Actual</TableHead>
                        <TableHead className="text-xs sm:text-sm">Asignar Nuevo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unidades.map((unidad) => (
                        <TableRow key={unidad.id_unidad}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {unidad.nombre}
                          </TableCell>
                          <TableCell>
                            {unidad.responsable ? (
                              <Badge variant="default" className="text-xs">
                                {unidad.responsable.username}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Sin asignar</Badge>
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
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Seleccionar usuario" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {usuarios
                                      .filter((u) =>
                                        searchUser === "" ||
                                        u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                                        u.email.toLowerCase().includes(searchUser.toLowerCase())
                                      )
                                      .map((usuario) => (
                                        <SelectItem key={usuario.id} value={usuario.id.toString()} className="text-xs sm:text-sm">
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
                  {/* Load more control */}
                  {(unidadesHasMore || (unidadesCache.length > unidades.length)) && (
                    <div className="p-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          // If we have cached full list, reveal next slice, otherwise request next page
                          if (unidadesCache.length > unidades.length) {
                            const nextCount = Math.min(unidadesCache.length, unidades.length + unidadesLimit);
                            setUnidades(unidadesCache.slice(0, nextCount));
                            setShowedUnidadesCount(nextCount);
                            setUnidadesHasMore(nextCount < unidadesCache.length);
                          } else if (unidadesHasMore) {
                            const nextPage = unidadesPage + 1;
                            await loadUnidadesPage(nextPage);
                          }
                        }}
                        className="text-sm"
                        disabled={isModalLoading}
                      >
                        {isModalLoading ? "Cargando..." : "Cargar más"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (isModalLoading) return;
                  setIsModalOpen(false);
                }}
                disabled={isModalLoading}
                className="w-full sm:w-auto"
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
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Confirmar Asignación</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                ¿Estás seguro de que deseas asignar a <strong>{pendingAssignment?.usuarioNombre}</strong> como responsable de{" "}
                <strong>{pendingAssignment?.unidadNombre}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                style={{ backgroundColor: "#24356B", color: "white" }}
                onClick={async () => {
                  if (!pendingAssignment) return;
                  if (isSubmitting) return; // prevenir doble envío

                  const token = localStorage.getItem("token");
                  if (!token) {
                    toast.error("Token no encontrado. Por favor inicia sesión.");
                    router.push("/");
                    return;
                  }

                  const { unidadId, usuarioId } = pendingAssignment;

                  // Verificar que el usuario exista en la lista actual
                  const usuarioExistente = usuarios.find((u) => u.id === usuarioId);
                  if (!usuarioExistente) {
                    toast.error("El usuario seleccionado no existe en el listado.");
                    setIsConfirmOpen(false);
                    return;
                  }

                  try {
                    setIsSubmitting(true);

                    const res = await fetch(`${API_URL}/unidades_responsables/${unidadId}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ responsable_id: usuarioId }),
                    });

                    if (res.status === 401) {
                      toast.error("Sesión expirada. Por favor inicia sesión de nuevo.");
                      router.push("/");
                      return;
                    }

                    if (res.status === 404) {
                      toast.error("Unidad o usuario no encontrado (404).");
                      return;
                    }

                    if (res.status === 422) {
                      const err = await res.json().catch(() => ({}));
                      toast.error("Datos mal formados: " + (err.detail || JSON.stringify(err)));
                      return;
                    }

                    if (!res.ok) {
                      throw new Error("Error al asignar responsable");
                    }

                    // El backend debería devolver la unidad con el responsable embebido
                    const data = await res.json();

                    // Refrescar la unidad desde el backend para asegurar consistencia
                    try {
                      const refreshed = await fetch(`${API_URL}/unidades_responsables/${unidadId}`, {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      if (refreshed.ok) {
                        const unidadActualizada = await refreshed.json();
                        setUnidades((prev) =>
                          prev.map((u) => (u.id_unidad === unidadId ? unidadActualizada : u))
                        );
                      }
                    } catch (e) {
                      // no crítico: ya tenemos la respuesta del PUT
                    }

                    toast.success("Responsable asignado correctamente");
                    setIsConfirmOpen(false);
                  } catch (error) {
                    console.error(error);
                    toast.error("No se pudo asignar el responsable");
                    setIsConfirmOpen(false);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={!localStorage.getItem("token") || isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? "Procesando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Eliminación */}
        <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Eliminar Usuario</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleting(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(editingUsuario?.id || 0)
                  setIsDeleting(false)
                  toast.success("Usuario eliminado correctamente")
                }}
                className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700"
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




