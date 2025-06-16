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

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
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
    e.preventDefault()
    console.log("Form Data:", formData);
    const { username, email, password, confirmPassword } = formData
    // Validar las contraseñas antes de enviar el formulario
    if (!validatePasswords(password, confirmPassword)) {
      return
    }
    // Preparar los datos para el registro

    const credentials: LoginCredentials = {
      username,
      password,
    }
    console.log("Credenciales de registro:", credentials);


    // Enviar la solicitud de registro al servidor
    console.log("Enviando solicitud de registro...");
    console.log("URL de registro:", "localhost:8000/register");
    console.log("Datos del formulario:", formData);
    console.log("Credenciales:", credentials);
    console.log("Validando contraseñas:", validatePasswords(password, confirmPassword));
    console.log("Errores:", errores);
    console.log("Estado de isLogin:", isLogin);
    console.log("Form Data antes del envío:", formData);
    console.log("Intentando registrar usuario...");
    console.log("Intentando registrar usuario con datos:", {
      username,
      email,
      password,
      confirmPassword,
    })
    console.log("Intentando registrar usuario con credenciales:", credentials)


    try {
      const response = await axios.post<LoginResponse>("localhost:8000/register")
      if (response.status === 201) {
        toast.success("Usuario registrado exitosamente")
        // Redirigir al usuario a la página de inicio de sesión
        setIsLogin(true)

        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        })

        setIsLogin(true)
      } else {
        toast.error("Error al registrar el usuario")
      }
    }
    catch (error) {
      error instanceof Error && error.message
      console.error("Error al registrar el usuario:", error)
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango de 2xx
          console.error("Error de respuesta del servidor:", error.response.data)
          setErrores(error.response.data)
          toast.error(`Error: ${error.response.data}`)
        } else if (error.request) {
          // La solicitud fue realizada pero no se recibió respuesta
          console.error("Error de solicitud:", error.request)
          toast.error("No se recibió respuesta del servidor")
        } else {
          // Algo sucedió al configurar la solicitud que provocó un error
          console.error("Error al configurar la solicitud:", error.message)
          toast.error(`Error: ${error.message}`)
        }
      }
      else {
        // Manejo de errores no relacionados con Axios
        console.error("Error desconocido:", error)
        toast.error("Ocurrió un error desconocido")
      }
      setErrores("Error al registrar el usuario")
      console.error("Error al registrar el usuario:", error)
      toast.error("Error al registrar el usuario")
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      console.log("Form Data después del error:", formData);
      return;
    }
  }

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

