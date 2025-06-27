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

  })
  let username = formData.username;
  let password = formData.password;
  // useRouter para redireccionar después del registro o inicio de sesión
  const router = useRouter()
  const [errores, setErrores] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Inicio de sesion");

    try {
      const response = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Corregí el typo (de encoder a encoded)
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });

      // Primero leemos la respuesta completa
      const responseData = await response.json();

      if (!response.ok) {
        
        if (response.status === 401) {
          toast.error("Usuario o contraseña incorrectos");
        } else if (response.status === 422) {
          toast.error("Error de validación en los datos enviados");
        } 
          throw new Error(`${responseData.detail || "Error al iniciar sesión"}`);
      }

      // Si la respuesta es exitosa
      localStorage.setItem("token", responseData.access_token);
      localStorage.setItem("user", JSON.stringify(responseData));
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (error instanceof Error) {
        toast.error(`${error.message}`);
      } else {
        toast.error("Error desconocido al intentar iniciar sesión");
      }
    }
  }

  // validacion de contraseñas a registrar usuario
  const validatePasswords = (password: string, confirmPassword: string): boolean => {
    // Validar que las contraseñas coincidan y tengan al menos 8 caracteres
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return false
    }
    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return false
    }
    // Validacion para el correo electronico que termine en "umich.mx"
    if (!formData.email.endsWith("@umich.mx")) {
      toast.error("El correo electrónico debe terminar en @umich.mx")
      return false
    }
    
    return true
  }

  // Manejar el envío del formulario de registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan y tengan al menos 8 caracteres
    if (!validatePasswords(formData.password, formData.confirmPassword)) return;

    // Preparar los datos del usuario para el registro
    console.log("registrando usuario");

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

