
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Trash2, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import { get } from "http"



interface Usuario {
  id: number
  username: string
  email: string
  role: "USER" | "ADMIN"
  is_active: boolean
  created_at: string
}

interface Anexo {
  id: number
  clave: string // Clave del anexo, por ejemplo: RF01, RF02, etc.
  titulo: string
  descripcion: string
  categoria: string // Tipo de anexo, por ejemplo: Recursos Presupuestales y Financieros, Contratos, etc.
  estado: string // Estado del anexo, por ejemplo: Borrador, Completado, Revisión
  archivo: string // Nombre del archivo asociado
  // creador por: el anexo debe tener un creador asociado, por ejemplo, un usuario o empleado
  creador: string // Nombre del creador del anexo
  fecha_creacion: string // Fecha de creación del anexo
}

const getAnexos = async () =>{
  const response = await fetch("http://localhost:8000/anexos/", 
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  })
  const data = await response.json()
  console.log("Anexos obtenidos:", data)
  return data
}

const exportAnexosToPDF = (anexos: Anexo[], title = "Reporte de Anexos") => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(36, 53, 107) // #24356B
  doc.text(title, 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 20, 30)
  doc.text(`Total de anexos: ${anexos.length}`, 20, 40)
  doc.text(`Completados: ${anexos.filter((a) => a.estado === "Completado").length}`, 20, 50)
  doc.text(`En borrador: ${anexos.filter((a) => a.estado === "Borrador").length}`, 20, 60)

  // Table
  const tableData = anexos.map((anexo) => [
    anexo.clave,
    anexo.titulo.substring(0, 30) + (anexo.titulo.length > 30 ? "..." : ""),
    anexo.categoria,
    anexo.estado,
    anexo.fecha_creacion,
    anexo.descripcion.substring(0, 40) + (anexo.descripcion.length > 40 ? "..." : ""),
  ])
    ; (doc as any).autoTable({
      head: [["Código", "Título", "Tipo", "Estado", "Fecha", "Descripción"]],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [36, 53, 107], // #24356B
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        1: { cellWidth: 40 },
        5: { cellWidth: 35 },
      },
    })

  doc.save(`anexos_reporte_${new Date().toISOString().split("T")[0]}.pdf`)
}

const exportAnexosToExcel = (anexos: Anexo[], title = "Reporte de Anexos") => {
  const worksheet = XLSX.utils.json_to_sheet(
    anexos.map((anexo) => ({
      Clave: anexo.clave,
      Título: anexo.titulo,
      Categoria: anexo.categoria,
      Estado: anexo.estado,
      "Fecha Creación": anexo.fecha_creacion,
      Descripción: anexo.descripcion,
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Anexos")

  // Add statistics by type
  const tipoStats = anexos.reduce(
    (acc, anexo) => {
      acc[anexo.categoria] = (acc[anexo.categoria] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const estadoStats = anexos.reduce(
    (acc, anexo) => {
      acc[anexo.estado] = (acc[anexo.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statsData = [
    ["Estadísticas de Anexos"],
    [""],
    ["Total de anexos:", anexos.length],
    [""],
    ["Por tipo:"],
    ...Object.entries(tipoStats).map(([tipo, count]) => [tipo + ":", count]),
    [""],
    ["Por estado:"],
    ...Object.entries(estadoStats).map(([estado, count]) => [estado + ":", count]),
    [""],
    ["Fecha de generación:", new Date().toLocaleDateString("es-ES")],
  ]

  const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas")

  XLSX.writeFile(workbook, `anexos_reporte_${new Date().toISOString().split("T")[0]}.xlsx`)
}

const categoria_anexos = [
 {
  "id": "1",
  "nombre_categoria": "RECURSOS PRESUPUESTALES Y FINANCIEROS"
 },
 {
  "id": "2",
  "nombre_categoria": "Contratos, Convenios y Licitaciones"
 },
 {
  "id": "3",
  "nombre_categoria": "Estructura y Normativa Interna"
 },
 {
  "id": "4",
  "nombre_categoria": "Recursos Humanos"
 },
 {
  "id": "5",
  "nombre_categoria": "Inventario de Bienes Muebles e Inmuebles"
 },
 {
  "id": "6",
  "nombre_categoria": "Seguridad y Control de Accesos"
 },
 {
  "id": "7",
  "nombre_categoria": "Documentación y Archivo"
 },
 {
  "id": "8",
  "nombre_categoria": "Asuntos Legales y de Auditoría"
 },
 {
  "id": "9",
  "nombre_categoria": "Programas y Proyectos:"
 },
 {
  "id": "10",
  "nombre_categoria": "Transparencia"
 },
 {
  "id": "11",
  "nombre_categoria": "Otros"
 },
 {
  "id": "12",
  "nombre_categoria": "SIN CATEGORÍA"
 }
]

const claves_anexos = [
 {
  "id": "1",
  "clave": "RF01",
  "descripcion": "PRESUPUESTO AUTORIZADO Y EJERCIDO",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "2",
  "clave": "RF02",
  "descripcion": "PRESUPUESTO DE OTROS INGRESOS Y EGRESOS PROPIOS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "3",
  "clave": "RF03",
  "descripcion": "RECURSOS FEDERALES RECIBIDOS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "4",
  "clave": "RF04",
  "descripcion": "PRESUPUESTO PARA PROGRAMAS ESPECIALES",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "5",
  "clave": "RF05",
  "descripcion": "RELACION DE CUENTAS BANCARIAS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "6",
  "clave": "RF06",
  "descripcion": "CONFORMACION DEL FONDO REVOLVENTE",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "7",
  "clave": "RF07",
  "descripcion": "RELACION DE CONTRARECIBOS PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "8",
  "clave": "RF08",
  "descripcion": "RELACION DE CHEQUES PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "9",
  "clave": "RF09",
  "descripcion": "INGRESOS POR DEPOSITAR",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "10",
  "clave": "RF10",
  "descripcion": "SOLICITUDES DE CANCELACIONES DE FIRMAS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "11",
  "clave": "RF11",
  "descripcion": "RELACION DE CUENTAS POR COBRAR",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "12",
  "clave": "RF12",
  "descripcion": "RELACION DE CUENTAS POR PAGAR (PASIVOS)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "13",
  "clave": "RF13",
  "descripcion": "RELACIONES DE IMPUESTOS Y CONTRIBUCIONES PENDIENTES DE PAGO",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "14",
  "clave": "RF14",
  "descripcion": "POLIZAS DE SEGUROS VIGENTES",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "15",
  "clave": "RF15",
  "descripcion": "FIANZAS Y GARANTIAS VIGENTES",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "16",
  "clave": "RF16",
  "descripcion": "RELACION DE CONVENIOS Y CONTRATOS DE BIENES Y SERVICIOS VIGENTES",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "17",
  "clave": "RF17",
  "descripcion": "RELACION DE LIBROS Y REGISTROS DE CONTABILIDAD",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "18",
  "clave": "RF18",
  "descripcion": "ESTADOS FINANCIEROS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "1"
 },
 {
  "id": "19",
  "clave": "CCL01",
  "descripcion": "CONTRATOS Y CONVENIOS VIGENTES (Generales, Coordinaci\u00f3n, Fideicomisos, Bienes y Servicios)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "2"
 },
 {
  "id": "20",
  "clave": "CCL02",
  "descripcion": "LICITACIONES EN TR\u00c1MITE (Bienes y Servicios, Obra)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "2"
 },
 {
  "id": "21",
  "clave": "CCL03",
  "descripcion": "PROGRAMAS DE OBRA Y ADQUISICIONES (Programa Anual de Obra P\u00fablica, Listado de Expedientes de Obra, Programa Anual de Adquisiciones)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "2"
 },
 {
  "id": "22",
  "clave": "ENI01",
  "descripcion": "ORGANIGRAMA GENERAL",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "3"
 },
 {
  "id": "23",
  "clave": "ENI02",
  "descripcion": "REGLAMENTOS Y MANUALES (Reglamento Interior y Manuales Generales)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "3"
 },
 {
  "id": "24",
  "clave": "ENI03",
  "descripcion": "ACTAS DE \u00d3RGANOS DE GOBIERNO (Actas de Consejo, Acuerdo de \u00d3rganos de Gobierno)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "3"
 },
 {
  "id": "25",
  "clave": "ENI04",
  "descripcion": "REPRESENTACIONES Y CARGOS HONOR\u00cdFICOS VIGENTES",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "3"
 },
 {
  "id": "26",
  "clave": "ENI05",
  "descripcion": "PODERES OTORGADOS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "3"
 },
 {
  "id": "27",
  "clave": "RRH01",
  "descripcion": "PLANTILLAS DE PERSONAL (Base, Apoyo, Comisionado)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "4"
 },
 {
  "id": "28",
  "clave": "RRH02",
  "descripcion": "PERSONAL HONORARIOS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "4"
 },
 {
  "id": "29",
  "clave": "IBM01",
  "descripcion": "INVENTARIO DE MOBILIARIO Y EQUIPO (Oficina, Veh\u00edculos, Maquinaria y Equipo)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "30",
  "clave": "IBM02",
  "descripcion": "EXISTENCIAS (Almacenes, Plantas de Vivero)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "31",
  "clave": "IBM03",
  "descripcion": "BIENES EN COMODATO",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "32",
  "clave": "IBM04",
  "descripcion": "BIENES INMUEBLES EN POSESI\u00d3N",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "33",
  "clave": "IBM05",
  "descripcion": "RESERVA TERRITORIAL",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "34",
  "clave": "IBM06",
  "descripcion": "BIENES CULTURALES Y DECORATIVOS (Obras de Arte y Art\u00edculos de Decoraci\u00f3n)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "35",
  "clave": "IBM07",
  "descripcion": "INVENTARIO FAUN\u00cdSTICO (Espec\u00edmenes, Animales Taxidermizados)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "36",
  "clave": "IBM08",
  "descripcion": "INVENTARIO DE SEGURIDAD (Equipo de Armamento, Accesorios, Municiones)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "37",
  "clave": "IBM09",
  "descripcion": "INVENTARIO DE TECNOLOG\u00cdA (Paquetes Computacionales, Sistemas y Programas, Equipos de Comunicaci\u00f3n)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "5"
 },
 {
  "id": "38",
  "clave": "SCA01",
  "descripcion": "CLAVES Y FIRMAS DE ACCESO (Sistemas, Seguridad, Cancelaci\u00f3n, Solicitudes de Cancelaci\u00f3n)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "6"
 },
 {
  "id": "39",
  "clave": "SCA02",
  "descripcion": "RELACI\u00d3N DE LLAVES DE LA DEPENDENCIA",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "6"
 },
 {
  "id": "40",
  "clave": "DA01",
  "descripcion": "RESPALDOS DE INFORMACI\u00d3N",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "7"
 },
 {
  "id": "41",
  "clave": "DA02",
  "descripcion": "INVENTARIO DE ACERVO BIBLIOGR\u00c1FICO Y HEMEROGR\u00c1FICO",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "7"
 },
 {
  "id": "42",
  "clave": "DA03",
  "descripcion": "REGISTRO DE DOCUMENTOS (Corte de Formas y Foliadas, Sellos Oficiales)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "7"
 },
 {
  "id": "43",
  "clave": "DA04",
  "descripcion": "ARCHIVOS (Tr\u00e1mite y Concentraci\u00f3n)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "7"
 },
 {
  "id": "44",
  "clave": "DA05",
  "descripcion": "LIBROS Y REGISTROS DE CONTABILIDAD",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "7"
 },
 {
  "id": "45",
  "clave": "DA06",
  "descripcion": "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA (Por Contrato y Administraci\u00f3n Directa - ya incluido en \"Programas de Obra y Adquisiciones\", podr\u00eda omitirse aqu\u00ed o considerarse una subcategor\u00eda)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "7"
 },
 {
  "id": "46",
  "clave": "ALA01",
  "descripcion": "ASUNTOS EN TR\u00c1MITE (Relevantes, Naturaleza Jur\u00eddica)",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "8"
 },
 {
  "id": "47",
  "clave": "ALA02",
  "descripcion": "OBSERVACIONES DE AUDITOR\u00cdA PENDIENTES",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "8"
 },
 {
  "id": "48",
  "clave": "ALA03",
  "descripcion": "P\u00f3lizas de Seguros Vigentes",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "8"
 },
 {
  "id": "49",
  "clave": "ALA04",
  "descripcion": "Fianzas Vigente",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "8"
 },
 {
  "id": "50",
  "clave": "ALA05",
  "descripcion": "Garantias Vigentes",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "8"
 },
 {
  "id": "51",
  "clave": "PP01",
  "descripcion": "PROGRAMA OPERATIVO ANUAL",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "9"
 },
 {
  "id": "52",
  "clave": "PP02",
  "descripcion": "OTROS PROGRAMAS",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "9"
 },
 {
  "id": "53",
  "clave": "TA01",
  "descripcion": "TRANSPARENCIA Y ACCESO A LA INFORMACI\u00d3N",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "10"
 },
 {
  "id": "54",
  "clave": "OT01",
  "descripcion": "ADMINISTRATIVO DE ACTUACI\u00d3N",
  "creado_en": "2025-07-08 19:28:09.954822+00",
  "editado_en": "2025-07-08 19:28:09.954822+00",
  "is_deleted": "False",
  "id_categoria": "11"
 }
]
export default function AnexosPage(user: { username: string }, userrole: { role: string }, unidadresponable: { unidad: string }) {
 
  const [anexos , setAnexos] = useState<Anexo[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnexo, setEditingAnexo] = useState<Anexo | null>(null)
  const [formData, setFormData] = useState<{
    clave: string
    titulo: string
    descripcion: string
    categoria: Anexo["categoria"]
    estado: Anexo["estado"]
    archivo: string
    creador?: string // Optional, can be set later
    archivoObj?: File | null // Add this property to allow file object
    partida?: string
    denominacion?: string
    presupuestoAutorizado?: string
    ampliacionesDeducciones?: string
    presupuestoModificado?: string
    presupuestoEjercido?: string
    porEjercer?: string
  }>({
    clave: "",
    titulo: "",
    descripcion: "",
    categoria: "Inventario de Bienes Muebles e Inmuebles",
    estado: "Borrador",
    archivo: "",
    creador: user.username, // Set the creator from the user prop
    archivoObj: null, // Initialize archivoObj
    partida: "",
    denominacion: "",
    presupuestoAutorizado: "",
    ampliacionesDeducciones: "",
    presupuestoModificado: "",
    presupuestoEjercido: "",
    porEjercer: "",
  })
  const router = useRouter()
  const [isInvalidFileType, setIsInvalidFileType] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Función para calcular el presupuesto modificado
  function calcularPresupuestoModificado(presupuestoAutorizado?: string, ampliacionesDeducciones?: string) {
    const autorizado = parseFloat(presupuestoAutorizado || "0");
    const ampliaciones = parseFloat(ampliacionesDeducciones || "0");
    return (autorizado + ampliaciones).toString();
  }

  // Función para calcular el monto por ejercer
  function calcularPorEjercer(presupuestoModificado?: string, presupuestoEjercido?: string) {
    const modificado = parseFloat(presupuestoModificado || "0");
    const ejercido = parseFloat(presupuestoEjercido || "0");
    return (modificado - ejercido).toString();
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
    getAnexos().then((data) => {
      setAnexos(data)
    })
  }, [router])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true);

    if (editingAnexo) {
      setAnexos(
        anexos.map((anexo) =>
          anexo.id === editingAnexo.id
            ? {
              ...anexo,
              ...formData,
              clave: formData.clave as Anexo["clave"], // Ensure correct type
              fecha_creacion: new Date().toISOString().split("T")[0],
            }
            : anexo
        )
      )
    } else {
      const newAnexo: Anexo = {
        id: Date.now(),
        ...formData,
        clave: formData.clave as Anexo["clave"],
        fecha_creacion: new Date().toISOString().split("T")[0],
        archivo: (formData as any).archivo || "", // Ensure archivo is set
        creador: user.username, // Set the creator from the user prop
      }
      setAnexos([...anexos, newAnexo])
    }

    resetForm()
    setIsSubmitted(false);
  }

  // Función para manejar la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setIsInvalidFileType(false);
        setSelectedFile(file);

        // Crear URL de previsualización
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Actualizar el estado del formulario
        setFormData({
          ...formData,
          archivo: file.name,
          archivoObj: file // Asegúrate de tener este campo en tu formData
        });
      } else {
        setIsInvalidFileType(true);
        setPreviewUrl(null);
        setSelectedFile(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clave: "",
      titulo: "",
      descripcion: "",
      categoria: "",
      estado: "",
      archivo: "",
      creador: user.username, // Reset creator to the current user
    })
    setEditingAnexo(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (anexo: Anexo) => {
    setEditingAnexo(anexo)
    setFormData({
      clave: anexo.clave,
      titulo: anexo.titulo,
      descripcion: anexo.descripcion,
      categoria: anexo.categoria,
      estado: anexo.estado,
      archivo: anexo.archivo || "",
      creador: anexo.creador, // Set the creator from the anexo
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este anexo?")) {
      setAnexos(anexos.filter((anexo) => anexo.id !== id))
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 text-green-800"
      case "Borrador":
        return "bg-yellow-100 text-yellow-800"
      case "Revisión":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Recursos Presupuestales y Financieros":
        return "bg-purple-100 text-purple-800"
      case "Contratos Convenios y Licitaciones":
        return "bg-blue-100 text-blue-800"
      case "Estrucura y Normativa Interna":
        return "bg-orange-100 text-orange-800"
      case "Recursos Humanos":
        return "bg-gray-100 text-gray-800"
      case "Inventario de Binenes Muebles e Inmuebles":
        return "bg-green-100 text-green-800"
      case "Segurirdad y Control de Acceso":
        return "bg-red-100 text-red-800"
      case "Documentación y Archivos":
        return "bg-yellow-100 text-yellow-800"
      case "Asuntos Legales y de Auditoría":
        return "bg-teal-100 text-teal-800"
      case "Porgramas y Proyectos":
        return "bg-cyan-100 text-cyan-800"
      case "Transparencia":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para eliminar archivo
  const removeFile = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setFormData((prevFormData) => ({
      ...prevFormData,
      archivo: '',
      archivoObj: null
    }));
    setIsInvalidFileType(false);
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
       

        {/* Breadcrumbs */}
        <NavbarWithBreadcrumb
          user={user.username} // Pass the username property of the user object
          disableAuthCheck={true} // Deshabilitar la verificación de autenticación para esta página 
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Anexos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Completado").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Borrador</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Borrador").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anexos.filter((a) => a.estado === "Revisión").length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Anexos</h2>
              <p className="text-gray-600">Administra los anexos y documentos del sistema</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: "#24356B", color: "white" }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Anexo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                      
                        {categoria_anexos.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nombre_categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clave">Clave del Anexo</Label>
                    <Select
                      value={formData.clave}
                      onValueChange={(value: any) => setFormData({ ...formData, clave: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la clave" />
                      </SelectTrigger>
                      <SelectContent>
                        {claves_anexos.map((claves_anexos) => (
                          <SelectItem key={claves_anexos.id} value={claves_anexos.clave}>
                            {claves_anexos.clave} - {claves_anexos.descripcion}
                          </SelectItem>
                        ))}
                        
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 py-4">

                    {formData.clave === "RF01" && (

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <>
                          {/* Partida */}
                          <div className="flex flex-col">
                            <Label htmlFor="partida" className="flex items-center">
                              Partida <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              id="partida"
                              type="number"
                              value={formData.partida || ''}
                              onChange={(e) => setFormData({ ...formData, partida: e.target.value })}
                              className={`mt-1 ${!formData.partida && isSubmitted ? 'border-red-500' : ''}`}
                            />
                            {!formData.partida && isSubmitted && (
                              <p className="mt-1 text-sm text-red-500">Este campo es requerido</p>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <Label htmlFor="denominacion" className="flex items-center">
                              Denominación <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              id="denominacion"
                              type="text"
                              value={formData.denominacion || ''}
                              onChange={(e) => setFormData({ ...formData, denominacion: e.target.value })}
                              className={`mt-1 ${!formData.denominacion && isSubmitted ? 'border-red-500' : ''}`}
                            />
                            {!formData.denominacion && isSubmitted && (
                              <p className="mt-1 text-sm text-red-500">Este campo es requerido</p>
                            )}
                          </div>

                          {/* Presupuesto Autorizado */}
                          <div className="flex flex-col">
                            <Label htmlFor="presupuestoAutorizado" className="flex items-center">
                              Presupuesto Autorizado <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                              <Input
                                id="presupuestoAutorizado"
                                type="number"
                                step="0.01"
                                value={formData.presupuestoAutorizado || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData({
                                    ...formData,
                                    presupuestoAutorizado: value,
                                    presupuestoModificado: calcularPresupuestoModificado(value, formData.ampliacionesDeducciones)
                                  });
                                }}
                                className={`pl-8 ${!formData.presupuestoAutorizado && isSubmitted ? 'border-red-500' : ''}`}
                              />
                            </div>
                            {!formData.presupuestoAutorizado && isSubmitted && (
                              <p className="mt-1 text-sm text-red-500">Este campo es requerido</p>
                            )}
                          </div>

                          {/* Ampliaciones y/o Deducciones */}
                          <div className="flex flex-col">
                            <Label htmlFor="ampliacionesDeducciones">Ampliaciones y/o Deducciones</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                              <Input
                                id="ampliacionesDeducciones"
                                type="number"
                                step="0.01"
                                value={formData.ampliacionesDeducciones || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData({
                                    ...formData,
                                    ampliacionesDeducciones: value,
                                    presupuestoModificado: calcularPresupuestoModificado(formData.presupuestoAutorizado, value)
                                  });
                                }}
                                className="pl-8"
                              />
                            </div>
                          </div>

                          {/* Presupuesto Modificado (calculado) */}
                          <div className="flex flex-col">
                            <Label htmlFor="presupuestoModificado">Presupuesto Modificado</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                              <Input
                                id="presupuestoModificado"
                                type="number"
                                step="0.01"
                                value={formData.presupuestoModificado || ''}
                                readOnly
                                className="pl-8 bg-gray-100"
                              />
                            </div>
                          </div>

                          {/* Presupuesto Ejercido */}
                          <div className="flex flex-col">
                            <Label htmlFor="presupuestoEjercido">Presupuesto Ejercido</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                              <Input
                                id="presupuestoEjercido"
                                type="number"
                                step="0.01"
                                value={formData.presupuestoEjercido || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData({
                                    ...formData,
                                    presupuestoEjercido: value,
                                    porEjercer: calcularPorEjercer(formData.presupuestoModificado, value)
                                  });
                                }}
                                className="pl-8"
                              />
                            </div>
                          </div>

                          {/* Por Ejercer (calculado) */}
                          <div className="flex flex-col">
                            <Label htmlFor="porEjercer">Por Ejercer</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                              <Input
                                id="porEjercer"
                                type="number"
                                step="0.01"
                                value={formData.porEjercer || ''}
                                readOnly
                                className="pl-8 bg-gray-100"
                              />
                            </div>
                          </div>
                        </>
                        {/* Archivo */}
                        <div className="mt-6">
                          <Label className="flex items-center mb-2">
                            Archivos del Presupuesto del SIIA
                          </Label>
                          <div className="relative flex items-center">
                            <Input
                              id="archivo"
                              type="file"
                              accept=".pdf,.xlsx"
                              onChange={handleFileChange}
                              className={`hidden`}
                            />
                            <label
                              htmlFor="archivo"
                              className={`cursor-pointer px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2 ${isInvalidFileType ? 'border-red-500' : ''}`}
                            >
                              <svg className="h-5 w-5 text-[#24356B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h4l2 2h4a2 2 0 012 2v4" />
                              </svg>
                              {selectedFile ? "Archivo seleccionado" : "Seleccionar archivo"}
                            </label>
                            {selectedFile && (
                              <span className="ml-3 text-sm text-gray-600 truncate">{selectedFile.name}</span>
                            )}
                          </div>
                          {isInvalidFileType && (
                            <p className="mt-1 text-sm text-red-500">Formato no permitido. Solo se aceptan PDF y XLSX.</p>
                          )}

                          {/* Vista previa */}
                          {previewUrl && (
                            <div className="mt-4 border rounded-md overflow-hidden">
                              <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
                                <h3 className="font-medium">Previsualización</h3>
                                <button
                                  type="button"
                                  onClick={removeFile}
                                  className="text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 rounded transition"
                                  title="Eliminar archivo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="text-xs"></span>
                                </button>
                              </div>
                              <div className="p-4">
                                {selectedFile?.type === "application/pdf" ? (
                                  <iframe
                                    src={previewUrl}
                                    title="Previsualización del PDF"
                                    className="w-full h-64 border rounded"
                                  />
                                ) : selectedFile?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded">
                                    <FileSpreadsheet className="h-10 w-10 text-[#24356B] mb-2" />
                                    <p className="text-sm text-gray-600">Archivo Excel cargado</p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded">
                                    <span className="text-gray-500">No se puede previsualizar este tipo de archivo.</span>
                                  </div>
                                )}
                              </div>
                              <div className="px-4 py-2 bg-gray-50 flex items-center">
                                <span className="text-sm text-gray-600 truncate">{selectedFile?.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Borrador">Borrador</SelectItem>
                          <SelectItem value="Revisión">En Revisión</SelectItem>
                          <SelectItem value="Completado">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" style={{ backgroundColor: "#24356B", color: "white" }}>
                      {editingAnexo ? "Actualizar" : "Crear"} Anexo
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => exportAnexosToPDF(anexos)}
                className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => exportAnexosToExcel(anexos)}
                className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Anexos</CardTitle>
              <CardDescription>Gestiona los anexos registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clave</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anexos.map((anexo) => (
                    <TableRow key={anexo.id}>
                      <TableCell className="font-medium">{anexo.clave}</TableCell>
                      <TableCell>{anexo.titulo}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(anexo.categoria)}`}>
                          {anexo.categoria}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(anexo.estado)}`}>
                          {anexo.estado}
                        </span>
                      </TableCell>
                      <TableCell>{anexo.fecha_creacion}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => alert(`Descargar ${anexo.clave}`)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(anexo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(anexo.id)}
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
    </>
  )
}