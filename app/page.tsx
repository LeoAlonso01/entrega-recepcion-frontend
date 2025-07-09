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
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as Tooltip from "@radix-ui/react-tooltip"


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

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null)

  let username = formData.username;
  let password = formData.password;
  // useRouter para redireccionar después del registro o inicio de sesión
  const router = useRouter()

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
  // funcion que valida el correo electronico
  const validateEmail = (email: string) => {
    // Expresión regular para validar el formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@umich\.mx$/;
    const isValid = emailRegex.test(email);
    setIsEmailValid(isValid);
    return isValid;
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
  // manejar el páso de datos del formulario de registro
  // y pasar los datos a solicitud de permisos
  const handleRegistroExitoso = () => {
    const query = new URLSearchParams({
      username: formData.username,
      email: formData.email,
    });

    router.push(`/solicitud_permisos?${query.toString()}`);
  };
  // Manejar el envío del formulario de registro
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todos los campos estén llenos
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // validar las contraseñas con la funcion validatePasswords
    if (!validatePasswords(formData.password, formData.confirmPassword)) {
      return;
    }

    // Validar correo institucional
    if (!validateEmail(formData.email)) {
      toast.error("El correo debe ser válido y terminar en @umich.mx");
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    // Aquí va tu lógica para crear usuario
    console.log("Datos válidos:", formData);



    // Preparar los datos del usuario para el registro
    console.log("registrando usuario");

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      });

      // Si la respuesta es exitosa, avisar que el usuario se ha creado correctamente y abrir el login
      if (response.status === 201) {
        console.log("Usuario creado exitosamente");
        toast.success("Usuario creado exitosamente");
        // Redireccionar al login
        setIsLogin(true);
        // Limpiar el formulario
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        // el nuevo usuario no tiene rol asignado, redireccionar a la pagina de sin rol
        // y pasarle los datos del usuario creado
        handleRegistroExitoso();




        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al crear el usuario:", errorData);
          toast.error("Error al crear el usuario:" + errorData.detail?.[0]?.msg || "Error desconocido");
        }

      }
    } catch (error) {

      console.error("Error al crear el usuario:", error);
    }

  };
  // Manejar cambios en los campos del formulario
  // Actualizar el estado del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Actualizar el estado del formulario con el nuevo valor
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log("Form Data:", formData);
  }

  // render del 
  return (
    <Tooltip.Provider>
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
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>
                        <Label htmlFor="username" className="cursos-help" >Nombre de usuario <span className="text-red-500" >*</span> </Label>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con el nombre de usuario.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* Campo Contraseña */}
                  <div className="space-y-2 relative">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>

                        <Label htmlFor="reg-password">Contraseña <span className="text-red-500" >*</span> </Label>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con la contraseña.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" style={{ backgroundColor: "#751518", color: "white" }}>
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>
                        <Label htmlFor="username">Nombre de usuario <span className="text-red-500" >*</span> </Label>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con el nombre de usuario para crear tú cuenta.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Root>
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
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>

                        <Label htmlFor="reg-email">Email <span className="text-red-500" >*</span>  </Label>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con el correo electrónico institucional.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <p></p>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange(e);
                        validateEmail(e.target.value);
                      }
                      }
                      className={`border ${isEmailValid === false ? "border-red-500" : ""}`}
                    />
                  </div>
                  {isEmailValid === false && (
                    <p className="text-red-500 text-xs mt-1">
                      El correo electrónico debe ser válido y terminar en @umich.mx
                    </p>
                  )}
                  {/* Campo Contraseña */}
                  <div className="space-y-2 relative">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>

                        <Label htmlFor="reg-password">Contraseña <span className="text-red-500" >*</span> </Label>

                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con una contraseña segura.
                        <br />
                        1- Debe tener al menos 8 caracteres.
                        <br />
                        2- Debe contener al menos una letra mayúscula, una minúscula y un número
                        <br />
                        3- Debe contener al menos un carácter especial
                        <br />
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>

                    </Tooltip.Root>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Campo Confirmar Contraseña */}
                  <div className="space-y-2 relative">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>

                        <Label htmlFor="confirm-password">Confirmar Contraseña  <span className="text-red-500" >*</span></Label>

                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con la confirmación de la contraseña.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    style={{ backgroundColor: "#751518", color: "white" }}
                    disabled={isEmailValid === false}
                  >
                    Registrarse
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Tooltip.Provider >
  )
}

