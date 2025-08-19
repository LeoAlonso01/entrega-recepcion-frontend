"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import PdfUploader from "@/components/PdfUploader"
import ExcelUploader from "@/components/ExcelUploader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Download, ArrowLeft } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import { UnidadesPorUsuario } from "../../services/get_unidades";
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import { Viewer } from '@react-pdf-viewer/core';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Default to local if not set

interface Usuario {
  id: number
  username: string
  email: string
  role: "USER" | "ADMIN"
  is_active: boolean
  created_at: string
}

interface EditableTableProps {
  data:any[],
  onChange: (data:any[]) => void;
}

export interface Anexo {
  id: number
  clave: string
  categoria: string
  creador: number
  fecha_creacion: string       // formato ISO, ej: "2025-08-07"
  datos: Record<string, any>   // o simplemente `any` si prefieres
  estado: string
  unidad_responsable_id: number
}

const getAnexos = async () => {
  const response = await fetch(`${API_URL}/anexos/`,
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
    anexo.categoria,
    anexo.estado,
    anexo.fecha_creacion,
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
      Categoria: anexo.categoria,
      Estado: anexo.estado,
      "Fecha Creación": anexo.fecha_creacion,
      "Datos": JSON.stringify(anexo.datos, null, 2), // Convertir datos a string para Excel
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
    "nombre_categoria": "Recursos Presupuestales y Financieros"
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

const EditableTable: React.FC<EditableTableProps> = ({data, onChange}) =>{
  const handleEdit = (rowIndex: number, field: string, value: string) =>{
    const updated = [...data];
    updated[rowIndex] = { ...updated[rowIndex], [field]: value };
    onChange(updated);
  };

  const handleDelete = (rowIndex: number) => {
    const updated = data.filter((_, index) => index !== rowIndex);
    onChange(updated);
  };

    if (!data || data.length === 0) {
    return <p className="text-gray-500">No hay datos para mostrar</p>;
  }

  const columns = Object.keys(data[0]);

   return (
    <table className="min-w-full border border-gray-300 rounded-md">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="border px-2 py-1 bg-gray-100">
              {col}
            </th>
          ))}
          <th className="border px-2 py-1 bg-gray-100">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col) => (
              <td key={col} className="border px-2 py-1">
                <input
                  type="text"
                  value={row[col] ?? ""}
                  onChange={(e) => handleEdit(rowIndex, col, e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
            ))}
            <td className="border px-2 py-1 text-center">
              <button
                onClick={() => handleDelete(rowIndex)}
                className="text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

}

export default function AnexosPage(user: { username: string }, userrole: { role: string }, unidadresponable: { unidad: string }) {
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [showForm, setShowForm] = useState(false) // Nuevo estado para controlar la visibilidad
  const [editingAnexo, setEditingAnexo] = useState<Anexo | null>(null)
  const [formData, setFormData] = useState<{
    clave: string | Anexo["clave"]
    categoria: string | Anexo["categoria"]
    fecha_creacion: string | Anexo["fecha_creacion"]
    datos: Record<string, any> | Anexo["datos"]
    estado: string | Anexo["estado"]
    unidad_responsable_id: string | Anexo["unidad_responsable_id"]
  }>({
    clave: "",
    categoria: "",
    fecha_creacion: new Date().toISOString().split("T")[0],
    datos: {},
    estado: "Borrador",
    unidad_responsable_id: "",
  })
  const [rows, setRows] = useState<any[]>([])
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [userid, setUserid] = useState<number>(0)
  const [unidadResponsable, setUnidadResponsable] = useState<number>(0)
  const [file, setFile] = useState<File | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isInvalidFileType, setIsInvalidFileType] = useState(false)
  const [datos, setDatos] = useState<Record<string, any>>({})
  const isExcelFile = selectedFile?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token) {
      router.push("/");
      return; // Salir temprano si no hay token
    }

    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUserName(userData.username);
        setUserid(userData.id);

        console.log("Datos del usuario:", {
          username: userData.username,
          id: userData.id
        });
      } catch (error) {
        console.error("Error al parsear los datos del usuario:", error);
        setUserName("");
        setUserid(0);
      }
    }

    if (userid) {
      const obtenerUnidad = async () => {
        try {
          const unidad = await UnidadesPorUsuario(Number(userid));
          console.log("Unidad responsable:", unidad.id_unidad);
          console.log("Responsable:", unidad.responsable);

          // respuesta correcta
          setUnidadResponsable(Number(unidad.id_unidad));

          // guardarlo en formData
          setFormData(prev => ({
            ...prev,
            unidad_responsable_id: unidad.id_unidad
          }));


        } catch (error) {
          console.error("Error al obtener la unidad responsable:", error);
        }
      }

      obtenerUnidad();
    }



    async function mostrarUnidad() {
      try {
        const unidad = await UnidadesPorUsuario(1);
        console.log("Unidad responsable:", unidad.id_unidad);
        console.log("Responsable:", unidad.responsable);
      } catch (error) {
        console.error("Error al obtener la unidad responsable:", error);
      }
    }

    mostrarUnidad();

    // Obtener los anexos
    getAnexos().then((data) => {
      setAnexos(data);
    });

  }, [router, userid]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast(
      "Función de creación/edición aún no implementada",
      {
        description: "Próximamente podrás crear o editar anexos.",
        duration: 2000,
      }
    )

    console.log("Datos del formulario enviados:", formData, file, datos)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const resetForm = () => {
    setFormData({
      clave: "",
      categoria: "",
      fecha_creacion: new Date().toISOString().split("T")[0],
      datos: {},
      estado: "Borrador",
      unidad_responsable_id: "",
    })
    setEditingAnexo(null)
    setShowForm(false) // Ocultar el formulario al resetear
  }

  const handleEdit = (anexo: Anexo) => {
    toast("Función de edición aún no implementada", {
      description: "Próximamente podrás editar anexos.",
      duration: 1000,
    })
  }

  const handleDelete = (id: number) => {
    toast(
      "Función de eliminación aún no implementada",
      {
        description: "Próximamente podrás eliminar anexos.",
        duration: 1000,
      }
    )
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

  const removeFile = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setFormData((prevFormData) => ({
      ...prevFormData,
      archivo: '',
      archivoObj: null
    }))
    setIsInvalidFileType(false)
  }

  const clavesConPDF = ["ENI01", "PP01"];

  function claveRequierePDF(clave?: string): boolean {
    if (!clave) return false;
    return clavesConPDF.includes(clave.toUpperCase().trim());
  }

  function claveRequiereExcel(clave?: string): boolean {
    return !claveRequierePDF(clave); // Todos los demás son Excel
  }


  const handleExcelUpload = (parsedData: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      datos: parsedData,
    }));
    setDatos(parsedData);
  };



  // Filtrar las claves basadas en la categoría seleccionada
  const selectedCategoryId = categoria_anexos.find(cat => cat.nombre_categoria === selectedCategory)?.id;

  const filteredKeys = selectedCategoryId
    ? claves_anexos.filter(key => key.id_categoria === selectedCategoryId)
    : [];


  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
        <NavbarWithBreadcrumb
          user={user.username}
          disableAuthCheck={true}
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

            <div className="flex space-x-2">
              {!showForm ? (
                <Button
                  style={{ backgroundColor: "#24356B", color: "white" }}
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Anexo
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a la lista
                </Button>
              )}

              {/* Botones de exportación */}
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

          {showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>{editingAnexo ? "Editar Anexo" : "Nuevo Anexo"}</CardTitle>
                <CardDescription>
                  {editingAnexo ? "Modifica los datos del anexo seleccionado" : "Completa los datos para crear un nuevo anexo"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">

                    {/* <CategoryKeySelector
                    /> */}

                    <div className="space-y-4">
                      {/* Selector de Categoría */}
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={(value) => {
                            setSelectedCategory(value)
                            setFormData(prev => ({ ...prev, categoria: value, clave: "" }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoria_anexos.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.nombre_categoria}>
                                {categoria.nombre_categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Selector de Clave (solo visible si hay una categoría seleccionada) */}
                      {selectedCategory && (
                        <div className="space-y-2">
                          <Label htmlFor="clave">Clave del Anexo</Label>
                          <Select
                            value={formData.clave}
                            onValueChange={(value) => setFormData({ ...formData, clave: value })}
                            disabled={!selectedCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={filteredKeys.length ? "Selecciona una clave" : "No hay claves disponibles"} />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredKeys.map((key) => (
                                <SelectItem key={key.id} value={key.clave}>
                                  {key.clave} - {key.descripcion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Sección de archivo (se mantiene igual) */}
                    <div className="mt-6">
                      {/* id de quien lo crea, que viene del usuario en su id */}
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Creado por:
                      </label>
                      <input
                        type="text"
                        value={userName}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                      <input type="hidden" value={userid} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subir Archivo (PDF o Excel)
                    </label>

                    {selectedCategory && claveRequierePDF(formData.clave) ? (
                      <div>
                        <label htmlFor="pdf-uploader">Subir PDF</label>
                        <PdfUploader
                          onUploadSuccess={(url) =>
                            setFormData((prev) => ({
                              ...prev,
                              datos: { pdf_url: url }, // o como quieras estructurarlo
                            }))
                          }
                        />

                      </div>
                    ) : (
                      <div>
                        <label htmlFor="excel-uploader">Subir Excel</label>
                        <ExcelUploader
                        onUploadSuccess={(data) =>{
                          setRows(data);
                          setFormData((prev) =>({
                            ...prev,
                            datos:data, // esto sincroniza directamente con formData
                          }));
                        }}
                        />
                      </div>
                    )}
                    {/* llenar el campo datos con el json desde excel */}
                    {formData.clave === "Excel" && (
                      <div>
                        <label htmlFor="datos">Datos</label>
                        <textarea
                          id="datos"
                          value={JSON.stringify(formData.datos, null, 2)}
                          onChange={(e) => setFormData({ ...formData, datos: JSON.parse(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <EditableTable
                        data={Array.isArray(formData.datos) ? formData.datos : []}
                        onChange={(newData)=>
                          setFormData({
                            ...formData,
                            datos: newData
                          })
                        }
                        />
                      </div>
                    )}
                    {/* en el campo datos subir la url del archivo pdf */}
                    {formData.clave === "PDF" && (
                      <div>
                        <label htmlFor="datos">Datos</label>
                        {/* <textarea
                          id="datos"
                          value={JSON.stringify(formData.datos, null, 2)}
                          onChange={(e) => setFormData({ ...formData, datos: JSON.parse(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        /> */}
                        <div className="border border-gray-300 rounded-md p-2 overflow-hidden mt-4"
                          style={
                            {
                              width: "60%", // Ancho del contenedor
                              height: "400px", // Altura del contenedor
                            }
                          }
                        >
                          {/* Directly use the Viewer component from @react-pdf-viewer/core */}
                          {/* <Viewer fileUrl={formData.datos.pdf_url} /> */}
                        </div>
                      </div>
                    )}

                    {/* Previsualización del archivo seleccionado */}
                    {/* <label htmlFor="pdf-uploader">Subir PDF</label>
                    <PdfUploader /> */}

                    {/* Subir excel */}
                    {/*   <label htmlFor="excel-uploader">Subir Excel</label>
                    <ExcelUploader /> */}

                    {/* Previsualización del archivo (si es PDF) */}
                    {previewUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Archivo seleccionado: {selectedFile?.name}</p>
                        <Button variant="outline" size="sm" onClick={removeFile} className="mt-2">
                          Eliminar Archivo
                        </Button>
                      </div>
                    )}

                    {/* unidad responsable del anexo */}
                    <label htmlFor="unidad_responsable" className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad Responsable
                    </label>
                    <input
                      type="text"
                      id="unidad_responsable"
                      value={(unidadResponsable ? unidadResponsable : "NO ASIGNADA")}
                      /* onChange={(e) => setUnidadResponsable(Number(e.target.value))} */
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                    {/* estado del anexo */}
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Anexo
                    </label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="Borrador">Borrador</option>
                      <option value="Completado">Completado</option>
                      <option value="Revisión">Revisión</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button type="submit" style={{ backgroundColor: "#24356B", color: "white" }}>
                        {editingAnexo ? "Actualizar" : "Crear"} Anexo
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
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
                        <TableCell>{anexo.categoria}</TableCell>
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
          )}
        </main>
      </div>
    </>
  )
}