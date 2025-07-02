"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, MapPin, Download, User, Building, FileText } from "lucide-react"
import jsPDF from "jspdf"


export default function SolicitudPermisosPage() {
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre_completo: "",
    domicilio: "",
    telefono_whatsapp: "",
    puesto_desempenar: "",
    dependencia: "",
    tipo_nombramiento: "",
    descripcion_funciones: "",
    justificacion_acceso: "",
  })
    const [isGenerating, setIsGenerating] = useState(false)
    const [isGenerated, setIsGenerated] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const username = searchParams.get("username")
    const email = searchParams.get("email")

  /* useEffect(() => {
    const newUserData = localStorage.getItem("newUser")
    if (!newUserData) {
      router.push("/")
      return
    }
    setUserData(JSON.parse(newUserData))
  }, [router]) */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const generatePDF = () => {
    setIsGenerating(true)

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = 20

    // Header con colores institucionales
    doc.setFillColor(36, 53, 107) // #24356B
    doc.rect(0, 0, pageWidth, 30, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO", pageWidth / 2, 15, { align: "center" })
    doc.setFontSize(14)
    doc.text("SOLICITUD DE ASIGNACIÓN DE ROL Y PERMISOS - SISTEMA SERUMICH", pageWidth / 2, 25, { align: "center" })

    yPosition = 50
    doc.setTextColor(0, 0, 0)

    // Información del documento
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, margin, yPosition)
    doc.text(`Folio: SERUMICH-${Date.now().toString().slice(-8)}`, pageWidth - margin - 60, yPosition)
    yPosition += 20

    // Datos del usuario del sistema
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(117, 21, 24) // #751518
    doc.text("DATOS DE ACCESO AL SISTEMA", margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text(`Usuario del sistema: ${userData?.username}`, margin, yPosition)
    yPosition += 8
    doc.text(`Correo electrónico: ${userData?.email}`, margin, yPosition)
    yPosition += 15

    // Información Personal
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(117, 21, 24) // #751518
    doc.text("INFORMACIÓN PERSONAL", margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    doc.text(`Nombre completo: ${formData.nombre_completo}`, margin, yPosition)
    yPosition += 8
    doc.text(`Teléfono WhatsApp: ${formData.telefono_whatsapp}`, margin, yPosition)
    yPosition += 8

    // Domicilio con salto de línea si es muy largo
    const domicilioLines = doc.splitTextToSize(`Domicilio: ${formData.domicilio}`, pageWidth - 2 * margin)
    doc.text(domicilioLines, margin, yPosition)
    yPosition += domicilioLines.length * 6 + 10

    // Información Laboral
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(117, 21, 24) // #751518
    doc.text("INFORMACIÓN LABORAL", margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    doc.text(`Puesto a desempeñar: ${formData.puesto_desempenar}`, margin, yPosition)
    yPosition += 8
    doc.text(`Dependencia/Área: ${formData.dependencia}`, margin, yPosition)
    yPosition += 8
    doc.text(`Tipo de nombramiento: ${formData.tipo_nombramiento}`, margin, yPosition)
    yPosition += 15

    // Descripción de funciones
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Descripción de funciones a realizar:", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const funcionesLines = doc.splitTextToSize(formData.descripcion_funciones, pageWidth - 2 * margin)
    doc.text(funcionesLines, margin, yPosition)
    yPosition += funcionesLines.length * 5 + 10

    // Justificación
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Justificación para acceso al sistema:", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const justificacionLines = doc.splitTextToSize(formData.justificacion_acceso, pageWidth - 2 * margin)
    doc.text(justificacionLines, margin, yPosition)
    yPosition += justificacionLines.length * 5 + 20

    // Nueva página si es necesario
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 30
    }

    // Instrucciones
    doc.setFillColor(181, 158, 96) // #B59E60
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("INSTRUCCIONES PARA EL SOLICITANTE", margin, yPosition + 5)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("1. Envíe este documento junto con su nombramiento a: contraloria@umich.mx", margin, yPosition + 15)
    doc.text("2. O acuda en persona al Edificio TR (Antiguo edificio de rectoría)", margin, yPosition + 22)
    doc.text("   Ciudad Universitaria, Av. Fco. J. Múgica s/n", margin, yPosition + 29)

    yPosition += 50

    // Firma
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.text("_________________________________", margin, yPosition)
    doc.text("Firma del solicitante", margin, yPosition + 8)
    doc.text(`${formData.nombre_completo}`, margin, yPosition + 16)

    doc.text("_________________________________", pageWidth - margin - 80, yPosition)
    doc.text("Fecha", pageWidth - margin - 80, yPosition + 8)
    doc.text(`${new Date().toLocaleDateString("es-ES")}`, pageWidth - margin - 80, yPosition + 16)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Este documento fue generado automáticamente por el Sistema SERUMICH", pageWidth / 2, 280, {
      align: "center",
    })

    // Guardar el PDF
    const fileName = `Solicitud_Permisos_${userData?.username}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)

    setIsGenerating(false)
    setIsGenerated(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generatePDF()
  }

  const handleBackToLogin = () => {
    localStorage.removeItem("newUser")
    router.push("/")
  }



  if (isGenerated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#24356B" }}>
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center" style={{ backgroundColor: "#B59E60", color: "white" }}>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl font-bold">¡Documento Generado Exitosamente!</CardTitle>
            <CardDescription className="text-white/90">Tu solicitud ha sido preparada para envío</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                Tu solicitud de asignación de rol y permisos ha sido generada como documento PDF.
              </p>
              <p className="text-gray-600">
                El archivo se ha descargado automáticamente. Si no se descargó, haz clic en el botón de abajo.
              </p>
            </div>

            <div className="space-y-4">
              <Button onClick={generatePDF} className="w-full" style={{ backgroundColor: "#751518", color: "white" }}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Documento Nuevamente
              </Button>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Próximos pasos:</strong>
                <br />
                1. Adjunta tu nombramiento al documento descargado
                <br />
                2. Envía ambos archivos a: <strong>contraloria@umich.mx</strong>
                <br />
                3. O acude en persona al Edificio TR con los documentos impresos
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="border-l-4" style={{ borderLeftColor: "#751518" }}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-5 w-5" style={{ color: "#751518" }} />
                    <h3 className="font-semibold">Por Correo</h3>
                  </div>
                  <p className="text-sm text-gray-600">contraloria@umich.mx</p>
                  <p className="text-xs text-gray-500 mt-1">Adjunta el PDF y tu nombramiento</p>
                </CardContent>
              </Card>

              <Card className="border-l-4" style={{ borderLeftColor: "#24356B" }}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5" style={{ color: "#24356B" }} />
                    <h3 className="font-semibold">En Persona</h3>
                  </div>
                  <p className="text-sm text-gray-600">Edificio TR</p>
                  <p className="text-xs text-gray-500">Av. Fco. J. Múgica s/n</p>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4">
              <Button onClick={handleBackToLogin} variant="outline" className="w-full bg-transparent">
                Volver al Inicio de Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: "#24356B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-white">SERUMICH - Solicitud de Permisos</h1>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleBackToLogin}>
              Volver al Login
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <Card className="mb-8 border-l-4" style={{ borderLeftColor: "#B59E60" }}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-xl">¡Usuario Creado Exitosamente!</CardTitle>
                <CardDescription className="text-lg">
                  Bienvenido <strong>{username}</strong>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Tu cuenta ha sido creada pero aún no tiene un rol asignado.</strong> Para acceder al sistema
                completo, necesitas generar y enviar una solicitud de asignación de rol y permisos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" style={{ color: "#B59E60" }} />
              <span>Instrucciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Completa el formulario a continuación para generar un documento PDF con tu solicitud de permisos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#751518] text-white text-sm flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Llena el formulario</p>
                    <p className="text-sm text-gray-600">Completa todos los campos requeridos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#751518] text-white text-sm flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Genera el PDF</p>
                    <p className="text-sm text-gray-600">Descarga tu solicitud en formato PDF</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#751518] text-white text-sm flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Adjunta nombramiento</p>
                    <p className="text-sm text-gray-600">Incluye tu documento de nombramiento</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#751518] text-white text-sm flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-semibold">Envía o entrega</p>
                    <p className="text-sm text-gray-600">Por correo o en persona</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" style={{ color: "#751518" }} />
                <span>Envío por Correo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Envía tu solicitud y nombramiento a:</p>
              <p className="font-semibold text-lg" style={{ color: "#751518" }}>
                contraloria@umich.mx
              </p>
              <p className="text-sm text-gray-500 mt-2">Adjunta ambos documentos en formato PDF</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" style={{ color: "#24356B" }} />
                <span>Entrega Presencial</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Acude directamente a nuestras oficinas:</p>
              <div className="space-y-1">
                <p className="font-semibold">Edificio TR</p>
                <p className="text-sm text-gray-600">(Antiguo edificio de rectoría)</p>
                <p className="text-sm">Ciudad Universitaria</p>
                <p className="text-sm">Av. Fco. J. Múgica s/n</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Formulario de Solicitud de Permisos</CardTitle>
            <CardDescription>Completa todos los campos para generar tu documento de solicitud</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5" style={{ color: "#B59E60" }} />
                  <span>Información Personal</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                    <Input
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono_whatsapp">Teléfono WhatsApp *</Label>
                    <Input
                      id="telefono_whatsapp"
                      name="telefono_whatsapp"
                      value={formData.telefono_whatsapp}
                      onChange={handleInputChange}
                      placeholder="443 123 4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domicilio">Domicilio Completo *</Label>
                  <Textarea
                    id="domicilio"
                    name="domicilio"
                    value={formData.domicilio}
                    onChange={handleInputChange}
                    placeholder="Calle, número, colonia, ciudad, código postal"
                    required
                  />
                </div>
              </div>

              {/* Información Laboral */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Building className="h-5 w-5" style={{ color: "#751518" }} />
                  <span>Información Laboral</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="puesto_desempenar">Puesto a Desempeñar *</Label>
                    <Input
                      id="puesto_desempenar"
                      name="puesto_desempenar"
                      value={formData.puesto_desempenar}
                      onChange={handleInputChange}
                      placeholder="Ej: Coordinador, Analista, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dependencia">Dependencia/Área *</Label>
                    <Input
                      id="dependencia"
                      name="dependencia"
                      value={formData.dependencia}
                      onChange={handleInputChange}
                      placeholder="Ej: Facultad de Derecho, Rectoría, etc."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_nombramiento">Tipo de Nombramiento *</Label>
                  <Select
                    value={formData.tipo_nombramiento}
                    onValueChange={(value) => setFormData({ ...formData, tipo_nombramiento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de nombramiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal de Base">Personal de Base</SelectItem>
                      <SelectItem value="Personal de Confianza">Personal de Confianza</SelectItem>
                      <SelectItem value="Personal Eventual">Personal Eventual</SelectItem>
                      <SelectItem value="Por Honorarios">Por Honorarios</SelectItem>
                      <SelectItem value="Becario">Becario</SelectItem>
                      <SelectItem value="Servicio Social">Servicio Social</SelectItem>
                      <SelectItem value="Prácticas Profesionales">Prácticas Profesionales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion_funciones">Descripción de Funciones a Realizar *</Label>
                  <Textarea
                    id="descripcion_funciones"
                    name="descripcion_funciones"
                    value={formData.descripcion_funciones}
                    onChange={handleInputChange}
                    placeholder="Describe detalladamente las funciones que realizarás en tu puesto..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justificacion_acceso">Justificación para Acceso al Sistema *</Label>
                  <Textarea
                    id="justificacion_acceso"
                    name="justificacion_acceso"
                    value={formData.justificacion_acceso}
                    onChange={handleInputChange}
                    placeholder="Explica por qué necesitas acceso al sistema y qué módulos requieres..."
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full"
                  style={{ backgroundColor: "#751518", color: "white" }}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando Documento...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generar y Descargar Solicitud PDF
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Al generar este documento, confirmas que la información proporcionada es correcta y será utilizada para
                el proceso de asignación de permisos en el sistema SERUMICH.
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
