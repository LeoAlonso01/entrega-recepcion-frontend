"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"

interface CreateUserResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}


export default function LoginPage() {
  // Estado para controlar si estamos en la pestaña de inicio de sesión o registro
  // y para manejar los datos del formulario
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    telefono: "",
    domicilio: "",
    unidad_responsable_id: ""
  })
  // useRouter para redireccionar después del registro o inicio de sesión
  const router = useRouter()
  const [errores, setErrores] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Inicio de sesion")
  }

  // validacion de contraseñas a registrar usuario
  const validatePasswords = (password: string, confirmPassword: string): boolean => {
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return false
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return false
    }
    // Aquí puedes agregar más validaciones si es necesario
    return true
  }

  // Manejar el envío del formulario de registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!validatePasswords(formData.password, formData.confirmPassword)) return;

    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        nombre: formData.nombre.trim(), // Campo obligatorio
        telefono: formData.telefono || null, // Opcional
        domicilio: formData.domicilio || null, // Opcional
        unidad_responsable_id: formData.unidad_responsable_id || null // Opcional
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Manejar la respuesta del servidor que sea exitosa
      console.log("Respuesta del servidor:", response.data);
      toast.success("Usuario registrado exitosamente");

      // Redireccionar al usuario a la página de inicio de sesión
      setIsLogin(true);

      // limpiar el formulario después del registro exitoso
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        nombre: "",
        telefono: "",
        domicilio: "",
        unidad_responsable_id: ""
      });


    } catch (error) {
      console.error("Error al registrar usuario:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Mostrar detalles específicos del error 422
          if (error.response.status === 422) {
            const errorDetails = error.response.data.detail || error.response.data;
            console.error("Detalles del error:", errorDetails);

            if (Array.isArray(errorDetails)) {
              // Si el backend devuelve múltiples errores
              errorDetails.forEach((err: any) => {
                toast.error(`Error: ${err.msg || err.message}`);
              });
            } else if (typeof errorDetails === 'string') {
              toast.error(errorDetails);
            } else {
              toast.error("Error de validación en los datos enviados");
            }
          } else {
            toast.error(`Error del servidor: ${error.response.data.detail || error.message}`);
          }
        } else {
          toast.error(`Error de conexión: ${error.message}`);
        }
      } else {
        toast.error("Error desconocido al intentar registrar");
      }
    }

  };

  // Manejar cambios en los campos del formulario
  // Actualizar el estado del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    console.log("Form Data:", formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#24356B" }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center" style={{ backgroundColor: "#B59E60", color: "white" }}>
          <CardTitle className="text-2xl font-bold">SERUMICH</CardTitle>
          <CardDescription className="text-white/90">Sistema de Entrega Recepción</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={isLogin ? "login" : "register"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="login"
                onClick={() => setIsLogin(true)}
                className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger
                value="register"
                onClick={() => setIsLogin(false)}
                className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" className="w-full" style={{ backgroundColor: "#751518", color: "white" }}>
                  Iniciar Sesión
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Usuario</Label>
                  <Input
                    id="reg-username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo*</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domicilio">Domicilio</Label>
                  <Input
                    id="domicilio"
                    name="domicilio"
                    type="text"
                    value={formData.domicilio}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" className="w-full" style={{ backgroundColor: "#751518", color: "white" }}>
                  Registrarse
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

