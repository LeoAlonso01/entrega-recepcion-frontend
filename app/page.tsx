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
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import * as Tooltip from "@radix-ui/react-tooltip"
import Recursos from "@/components/Recursos"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateUserResponse {
  username: string;
  email: string;
  password: string;
  role: string;
}

// user interface
interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN" | "AUDITOR";
  is_deleted?: boolean; // Optional property for soft delete
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
    role: "USER"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  let username = formData.username;
  let password = formData.password;
  // useRouter para redireccionar después del registro o inicio de sesión
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    console.log("Inicio de sesion");

    try {
      const response = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
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
        } else {
          toast.error(responseData.detail || "Error al iniciar sesión");
        }
        throw new Error(`${responseData.detail || "Error al iniciar sesión"}`);
      }

      // Si la respuesta es exitosa
      localStorage.setItem("token", responseData.access_token);
      localStorage.setItem("user", JSON.stringify({
        id: responseData.user_id,
        username: responseData.username,
        email: responseData.email,
        role: responseData.role,
      }));
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (error instanceof Error) {
        toast.error(`${error.message}`);
      } else {
        toast.error("Error desconocido al intentar iniciar sesión");
      }
    } finally {
      setIsLoginLoading(false);
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

  // Validar fortaleza de la contraseña
  const validatePasswordStrength = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Debe contener al menos una letra minúscula");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Debe contener al menos una letra mayúscula");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Debe contener al menos un número");
    }

    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.push("Debe contener al menos un carácter especial");
    }

    return errors;
  }

  // Manejar cambios en la contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, password: value }));

    // Validar fortaleza de la contraseña
    const errors = validatePasswordStrength(value);
    setPasswordErrors(errors);
  }

  // validacion de contraseñas a registrar usuario
  const validatePasswords = (password: string, confirmPassword: string): boolean => {
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return false
    }

    // Validar que la contraseña cumpla con los requisitos
    const errors = validatePasswordStrength(password);
    if (errors.length > 0) {
      toast.error("La contraseña no cumple con los requisitos de seguridad");
      return false;
    }

    // Validacion para el correo electronico que termine en "umich.mx"
    if (!formData.email.endsWith("@umich.mx")) {
      toast.error("El correo electrónico debe terminar en @umich.mx")
      return false
    }

    return true
  }

  // Manejar el envío del formulario de registro
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar que todos los campos estén llenos
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      setIsLoading(false);
      return;
    }

    // validar las contraseñas con la funcion validatePasswords
    if (!validatePasswords(formData.password, formData.confirmPassword)) {
      setIsLoading(false);
      return;
    }

    // Validar correo institucional
    if (!validateEmail(formData.email)) {
      toast.error("El correo debe ser válido y terminar en @umich.mx");
      setIsLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      setIsLoading(false);
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
      role: formData.role || null
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData),
      });

      console.table(userData);

      // validacion de usuarios
      if (!response.ok) {
        const ErrorData = await response.json();
        console.error("Error en la respuesta del servidor:", ErrorData);
        toast.error(ErrorData.detail || "Error al registrar usuario");
        setIsLoading(false);
        return;
      }

      // respuesta satisfactoria
      const data = await response.json();
      toast.success("Usuario creado exitosamente");
      console.warn("Datos del usuario:", data);

      // redireccion a los permisos
      handleRegistroExitoso();

    } catch (error) {
      // error al hacer la solicitud
      if (error instanceof Error) {
        toast.error("Error al crear usuario: " + error.message);
      } else {
        toast.error("Error al crear usuario");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // manejar el páso de datos del formulario de registro
  // y pasar los datos a solicitud de permisos
  const handleRegistroExitoso = () => {
    const query = new URLSearchParams({
      username: formData.username,
      email: formData.email,
    });

    router.push(`/solicitud_permisos?${query.toString()}`);
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
  }

  // render del 
  return (
    <Tooltip.Provider>
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#24356B" }}>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center" style={{ backgroundColor: "#B59E60", color: "white" }}>
            <CardTitle className="text-2xl font-bold">SERUMICH V2</CardTitle>
            <CardDescription className="text-white/90">Sistema de Entrega Recepción</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={isLogin ? "login" : "register"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="login"
                  onClick={() => setIsLogin(true)}
                  className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white py-3 text-sm md:text-base"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  onClick={() => setIsLogin(false)}
                  className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white py-3 text-sm md:text-base"
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>
                        <Label htmlFor="username" className="cursor-help">Nombre de usuario <span className="text-red-500">*</span> </Label>
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
                        <Label htmlFor="reg-password">Contraseña <span className="text-red-500">*</span> </Label>
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
                  <Button
                    type="submit"
                    className="w-full py-3 text-base font-medium"
                    style={{ backgroundColor: "#751518", color: "white" }}
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
                {/* Recuperacion de la contraseña */}
                <a href="/recuperacionContrasena" className="text-sm text-blue-500 hover:underline block mt-4 text-center">
                  ¿Olvidaste tu contraseña?
                </a>
              </TabsContent>

              <TabsContent value="register" className="pt-4">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>
                        <Label htmlFor="username">Nombre de usuario <span className="text-red-500">*</span> </Label>
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
                        <Label htmlFor="reg-email">Email <span className="text-red-500">*</span> </Label>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                        Llenar este campo con el correo electrónico institucional.
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange(e);
                        validateEmail(e.target.value);
                      }}
                      className={isEmailValid === false ? "border-red-500" : ""}
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
                        <Label htmlFor="reg-password">Contraseña <span className="text-red-500">*</span> </Label>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="right" className="bg-gray-800 text-white text-xs rounded px-2 py-1 z-50 max-w-xs">
                        <p>Llenar este campo con una contraseña segura.</p>
                        <ul className="list-disc pl-4 mt-1">
                          <li>Mínimo 8 caracteres</li>
                          <li>Al menos una letra mayúscula</li>
                          <li>Al menos una letra minúscula</li>
                          <li>Al menos un número</li>
                          <li>Al menos un carácter especial</li>
                        </ul>
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
                        onChange={handlePasswordChange}
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
                    {passwordErrors.length > 0 && (
                      <div className="text-red-500 text-xs mt-1">
                        <ul className="list-disc pl-4">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Campo Confirmar Contraseña */}
                  <div className="space-y-2 relative">
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger asChild>
                        <Label htmlFor="confirm-password">Confirmar Contraseña <span className="text-red-500">*</span></Label>
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
                    className="w-full py-3 text-base font-medium"
                    style={{ backgroundColor: "#751518", color: "white" }}
                    disabled={isEmailValid === false || isLoading || passwordErrors.length > 0}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrarse"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            {/* 🔹 Apartado de Recursos */}
            <Recursos />
          </CardContent>
        </Card>

      </div>
    </Tooltip.Provider>
  )
}