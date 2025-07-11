"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Shield, User } from "lucide-react"
import Link from "next/link"

import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"

interface Usuario {
  id: number
  username: string
  email: string
  role: "USER" | "ADMIN"
  is_active: boolean
  created_at: string
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
  doc.text(`Usuarios activos: ${usuarios.filter((u) => u.is_active).length}`, 20, 50)
  doc.text(`Administradores: ${usuarios.filter((u) => u.role === "ADMIN").length}`, 20, 60)

  // Table
  const tableData = usuarios.map((usuario) => [
    usuario.username,
    usuario.email,
    usuario.role === "ADMIN" ? "Administrador" : "Usuario",
    usuario.is_active ? "Activo" : "Inactivo",
    usuario.created_at,
  ])
  ;(doc as any).autoTable({
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
      Estado: usuario.is_active ? "Activo" : "Inactivo",
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
    ["Usuarios activos:", usuarios.filter((u) => u.is_active).length],
    ["Usuarios inactivos:", usuarios.filter((u) => !u.is_active).length],
    ["Administradores:", usuarios.filter((u) => u.role === "ADMIN").length],
    ["Usuarios regulares:", usuarios.filter((u) => u.role === "USER").length],
    [""],
    ["Fecha de generación:", new Date().toLocaleDateString("es-ES")],
  ]

  const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas")

  XLSX.writeFile(workbook, `usuarios_reporte_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export default function AdministracionPage( user: { role: string } | null ) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      username: "admin",
      email: "admin@sistema.com",
      role: "ADMIN",
      is_active: true,
      created_at: "2024-01-01",
    },
    {
      id: 2,
      username: "usuario1",
      email: "usuario1@sistema.com",
      role: "USER",
      is_active: true,
      created_at: "2024-01-15",
    },
    {
      id: 3,
      username: "usuario2",
      email: "usuario2@sistema.com",
      role: "USER",
      is_active: false,
      created_at: "2024-01-20",
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<{
    username: string
    email: string
    password: string
    role: "USER" | "ADMIN"
  }>({
    username: "",
    email: "",
    password: "",
    role: "USER",
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

    if (editingUsuario) {
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === editingUsuario.id
            ? { ...usuario, username: formData.username, email: formData.email, role: formData.role }
            : usuario,
        ),
      )
    } else {
      const newUsuario: Usuario = {
        id: Date.now(),
        username: formData.username,
        email: formData.email,
        role: formData.role,
        is_active: true,
        created_at: new Date().toISOString().split("T")[0],
      }
      setUsuarios([...usuarios, newUsuario])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "USER",
    })
    setEditingUsuario(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      username: usuario.username,
      email: usuario.email,
      password: "",
      role: usuario.role,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id))
    }
  }

  const toggleUserStatus = (id: number) => {
    setUsuarios(
      usuarios.map((usuario) => (usuario.id === id ? { ...usuario, is_active: !usuario.is_active } : usuario)),
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      {/* <header className="shadow-sm" style={{ backgroundColor: "#24356B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-white">Administración</h1>
            </div>
          </div>
        </div>
      </header> */}

      {/* Breadcrumbs */}
      <NavbarWithBreadcrumb role={user?.role ?? "USER"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Usuarios activos en el sistema</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>

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
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="usuario123"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>

                  {!editingUsuario && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Usuario</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
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
            <Button
              variant="outline"
              onClick={() => exportUsersToPDF(usuarios)}
              className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportUsersToExcel(usuarios)}
              className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

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
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.username}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.role === "ADMIN" ? "default" : "secondary"}>
                        {usuario.role === "ADMIN" ? "Administrador" : "Usuario"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.is_active ? "default" : "destructive"}>
                        {usuario.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{usuario.created_at}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(usuario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(usuario.id)}
                          className={usuario.is_active ? "text-red-600" : "text-green-600"}
                        >
                          {usuario.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
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
