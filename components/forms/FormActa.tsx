"use client"

import React, { useMemo, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { createActa } from "@/app/services/api"

// Tipos
interface Unidad {
  id_unidad: number
  nombre: string
}

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

interface Props {
  acta: ActaForm
  unidades: Unidad[]
  onCancel: () => void
  onSave: (data: ActaForm) => void
}

// Esquema de validación con Zod
const actaSchema = z.object({
  unidad_responsable: z.number().int().positive("Unidad responsable es requerida"),
  entrante: z.string().min(1, "Nombre del entrante es requerido").trim(),
  saliente: z.string().min(1, "Nombre del saliente es requerido").trim(),
  folio: z.string().optional().nullable().transform((val) => val ?? undefined),
  fecha: z.string().nonempty("Fecha es requerida"),
  hora: z.string().nonempty("Hora es requerida"),
  comisionado: z.string().optional().nullable().transform((val) => val ?? undefined),
  oficio_comision: z.string().optional().nullable().transform((val) => val ?? undefined),
  fecha_oficio_comision: z.string().optional().nullable().transform((val) => val ?? undefined),
  ine_entrante: z.string().optional().nullable().transform((val) => val ?? undefined),
  fecha_inicio_labores: z.string().optional().nullable().transform((val) => val ?? undefined),
  nombramiento: z.string().optional().nullable().transform((val) => val ?? undefined),
  fecha_nombramiento: z.string().optional().nullable().transform((val) => val ?? undefined),
  asignacion: z.enum(["nombramiento", "designacion", "jerarquia"]).optional().nullable().transform((val) => val ?? undefined),
  asignado_por: z.enum(["rectoria", "h_consejo"]).optional().nullable().transform((val) => val ?? undefined),
  domicilio_entrante: z.string().optional().nullable().transform((val) => val ?? undefined),
  telefono_entrante: z.string().optional().nullable().transform((val) => val ?? undefined),
  fecha_fin_labores: z.string().optional().nullable().transform((val) => val ?? undefined),
  testigo_entrante: z.string().optional().nullable().transform((val) => val ?? undefined),
  ine_testigo_entrante: z.string().optional().nullable().transform((val) => val ?? undefined),
  testigo_saliente: z.string().optional().nullable().transform((val) => val ?? undefined),
  ine_testigo_saliente: z.string().optional().nullable().transform((val) => val ?? undefined),
  fecha_cierre_acta: z.string().optional().nullable().transform((val) => val ?? undefined),
  hora_cierre_acta: z.string().optional().nullable().transform((val) => val ?? undefined),
  observaciones: z.string().optional().nullable().transform((val) => val ?? undefined),
  estado: z.enum(["Pendiente", "Completada", "Revisión"]),
})

type FormData = z.infer<typeof actaSchema>

// Helpers: Generación de folio, fecha, hora
const createFolio = () => {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `FOLIO-${year}-${randomNumber}`
}

const createDate = () => new Date().toISOString().split("T")[0]

const createHoraFinal = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

// Normaliza hora (AM/PM → HH:mm)
const normalizeTime = (timeStr?: string): string | undefined => {
  if (!timeStr) return undefined
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) return timeStr

  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)$/i)
  if (match) {
    let hours = parseInt(match[1])
    const minutes = match[2]
    const period = match[3].toLowerCase()

    if (period.startsWith("p") && hours < 12) hours += 12
    if (period.startsWith("a") && hours === 12) hours = 0

    return `${String(hours).padStart(2, "0")}:${minutes}`
  }
  return undefined
}

// Componente principal
const FormActa: React.FC<Props> = ({ acta, unidades, onCancel, onSave }) => {
  const defaultFolio = useMemo(() => acta.folio || createFolio(), [acta.folio])
  const defaultFecha = useMemo(() => acta.fecha || createDate(), [acta.fecha])
  const defaultHora = useMemo(() => normalizeTime(acta.hora) || createHoraFinal(), [acta.hora])

  const defaultValues = useMemo<FormData>(
    () => ({
      unidad_responsable: acta.unidad_responsable || unidades[0]?.id_unidad || 0,
      folio: acta.folio || defaultFolio,
      fecha: acta.fecha || defaultFecha,
      hora: normalizeTime(acta.hora) || defaultHora,
      comisionado: acta.comisionado || "",
      oficio_comision: acta.oficio_comision || "",
      fecha_oficio_comision: acta.fecha_oficio_comision || "",
      entrante: acta.entrante || "",
      ine_entrante: acta.ine_entrante || "",
      fecha_inicio_labores: acta.fecha_inicio_labores || "",
      nombramiento: acta.nombramiento || "",
      fecha_nombramiento: acta.fecha_nombramiento || "",
      asignacion: ["nombramiento", "designacion", "jerarquia"].includes(acta.asignacion as string)
        ? (acta.asignacion as "nombramiento" | "designacion" | "jerarquia")
        : undefined,
      asignado_por: ["rectoria", "h_consejo"].includes(acta.asignado_por as string)
        ? (acta.asignado_por as "rectoria" | "h_consejo")
        : undefined,
      domicilio_entrante: acta.domicilio_entrante || "",
      telefono_entrante: acta.telefono_entrante || "",
      saliente: acta.saliente || "",
      fecha_fin_labores: acta.fecha_fin_labores || "",
      testigo_entrante: acta.testigo_entrante || "",
      ine_testigo_entrante: acta.ine_testigo_entrante || "",
      testigo_saliente: acta.testigo_saliente || "",
      ine_testigo_saliente: acta.ine_testigo_saliente || "",
      fecha_cierre_acta: acta.fecha_cierre_acta || "",
      hora_cierre_acta: acta.hora_cierre_acta || "",
      observaciones: acta.observaciones || "",
      estado: acta.estado || "Pendiente",
    }),
    [acta, unidades, defaultFolio, defaultFecha, defaultHora]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(actaSchema),
    defaultValues,
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!window.confirm("¿Estás seguro de que deseas guardar los cambios?")) return

      try {
        const actaToSend = {
          ...data,
          id: acta.id,
          folio: data.folio || defaultFolio,
          fecha: data.fecha || defaultFecha,
          hora: normalizeTime(data.hora) || defaultHora,
        } as ActaForm

        console.log("Datos del acta a enviar:", actaToSend)

        const response = await createActa(actaToSend)
        if (response.success) {
          toast.success("Acta guardada exitosamente.")
          onSave(actaToSend)
        } else {
          throw new Error(response.error || "Error al guardar acta")
        }
      } catch (error: any) {
        console.error("Error al guardar acta:", error)
        const message =
          error.response?.data?.detail || error.message || "Error desconocido al guardar acta"
        toast.error(`Error: ${message}`)
      }
    },
    [acta.id, onSave, defaultFolio, defaultFecha, defaultHora]
  )

  const handleReset = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">
        {acta.id ? "Editar Acta" : "Nueva Acta"}
      </h2>

      {/* Sección 1: Datos generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Folio</Label>
          <Controller
            name="folio"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Folio" />}
          />
          {errors.folio && <p className="text-sm text-red-500">{errors.folio.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Fecha *</Label>
          <Controller
            name="fecha"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
          {errors.fecha && <p className="text-sm text-red-500">{errors.fecha.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Hora *</Label>
          <Controller
            name="hora"
            control={control}
            render={({ field }) => <Input type="time" {...field} />}
          />
          {errors.hora && <p className="text-sm text-red-500">{errors.hora.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Unidad Responsable *</Label>
          <Controller
            name="unidad_responsable"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u.id_unidad} value={u.id_unidad.toString()}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.unidad_responsable && (
            <p className="text-sm text-red-500">{errors.unidad_responsable.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Comisionado</Label>
          <Controller
            name="comisionado"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Comisionado" />}
          />
        </div>

        <div className="space-y-1">
          <Label>Oficio de Comisión</Label>
          <Controller
            name="oficio_comision"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Oficio" />}
          />
        </div>

        <div className="space-y-1">
          <Label>Fecha Oficio Comisión</Label>
          <Controller
            name="fecha_oficio_comision"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>
      </div>

      {/* Funcionario Entrante */}
      <h3 className="text-lg font-semibold text-gray-600 mt-6">Funcionario Entrante</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Controller
            name="entrante"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nombre" />}
          />
          {errors.entrante && <p className="text-sm text-red-500">{errors.entrante.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>INE</Label>
          <Controller
            name="ine_entrante"
            control={control}
            render={({ field }) => <Input {...field} placeholder="INE" />}
          />
        </div>

        <div className="space-y-1">
          <Label>Fecha Inicio Labores</Label>
          <Controller
            name="fecha_inicio_labores"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>

        <div className="space-y-1">
          <Label>Nombramiento</Label>
          <Controller
            name="nombramiento"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nombramiento" />}
          />
        </div>

        <div className="space-y-1">
          <Label>Fecha Nombramiento</Label>
          <Controller
            name="fecha_nombramiento"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>

        <div className="space-y-1">
          <Label>Asignación</Label>
          <Controller
            name="asignacion"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asignación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombramiento">Nombramiento</SelectItem>
                  <SelectItem value="designacion">Designación</SelectItem>
                  <SelectItem value="jerarquia">Jerarquía</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>Asignado por</Label>
          <Controller
            name="asignado_por"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asignado por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectoria">Rectoría</SelectItem>
                  <SelectItem value="h_consejo">H. Consejo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>Domicilio</Label>
          <Controller
            name="domicilio_entrante"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Domicilio" />}
          />
        </div>

        <div className="space-y-1">
          <Label>Teléfono</Label>
          <Controller
            name="telefono_entrante"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Teléfono" />}
          />
        </div>
      </div>

      {/* Funcionario Saliente */}
      <h3 className="text-lg font-semibold text-gray-600 mt-6">Funcionario Saliente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Controller
            name="saliente"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nombre" />}
          />
          {errors.saliente && <p className="text-sm text-red-500">{errors.saliente.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Fecha Fin Labores</Label>
          <Controller
            name="fecha_fin_labores"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>
      </div>

      {/* Testigos */}
      <h3 className="text-lg font-semibold text-gray-600 mt-6">Testigos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <Label>Testigo Entrante</Label>
          <Controller
            name="testigo_entrante"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Testigo Entrante" />}
          />
        </div>

        <div className="space-y-1">
          <Label>INE Testigo Entrante</Label>
          <Controller
            name="ine_testigo_entrante"
            control={control}
            render={({ field }) => <Input {...field} placeholder="INE" />}
          />
        </div>

        <div className="space-y-1">
          <Label>Testigo Saliente</Label>
          <Controller
            name="testigo_saliente"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Testigo Saliente" />}
          />
        </div>

        <div className="space-y-1">
          <Label>INE Testigo Saliente</Label>
          <Controller
            name="ine_testigo_saliente"
            control={control}
            render={({ field }) => <Input {...field} placeholder="INE" />}
          />
        </div>
      </div>

      {/* Cierre del Acta */}
      <h3 className="text-lg font-semibold text-gray-600 mt-6">Cierre del Acta</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="space-y-1">
          <Label>Fecha Cierre</Label>
          <Controller
            name="fecha_cierre_acta"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
        </div>

        <div className="space-y-1">
          <Label>Hora Cierre</Label>
          <Controller
            name="hora_cierre_acta"
            control={control}
            render={({ field }) => <Input type="time" {...field} />}
          />
        </div>

        <div className="space-y-1">
          <Label>Estado</Label>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Revisión">Revisión</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.estado && <p className="text-sm text-red-500">{errors.estado.message}</p>}
        </div>

        <div className="md:col-span-3 space-y-1">
          <Label>Observaciones</Label>
          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Observaciones" className="resize-none h-24" />
            )}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} disabled={isSubmitting}>
          Restablecer
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Acta"}
        </Button>
      </div>
    </form>
  )
}

export default FormActa