"use client"

import type React from "react"
import RectDOM from "react-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import PdfUploader from "@/components/PdfUploader"
import ExcelUploader from "@/components/ExcelUploader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Download, ArrowLeft, Eye } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import { UnidadesPorUsuario } from "../../services/get_unidades";

import FMJList from "@/components/forms/MarcoJuridico/FMJList"
import { validarEstructuraExcel } from "@/lib/valildaciones"
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import { Viewer } from '@react-pdf-viewer/core';

// Simple ExcelPreview component definition
interface ExcelPreviewProps {
  data: Array<Record<string, any>>;
  onClose: () => void;
  onConfirm: () => void;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ data, onClose, onConfirm }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Previsualización del Excel</h3>
          <p className="text-sm text-gray-600">Se cargarán {data.length} filas</p>
        </div>
        <div className="p-4 max-h-60 overflow-y-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border px-2 py-1 font-semibold text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((fila, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {Object.values(fila).map((val: any, j) => (
                    <td key={j} className="border px-2 py-1 truncate max-w-xs">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-end space-x-3 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            style={{ backgroundColor: "#24356B", color: "white" }}
            onClick={onConfirm}
          >
            Confirmar y Cargar
          </Button>
        </div>
      </div>
    </div>
  );
};

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Default to local if not set

interface Usuario {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface AnexosPageProps {
  user?: {
    username: string;
  };
  userrole?: {
    role: string;
  };
  unidadresponsable?: {
    unidad: string;
  };
}

interface EditableTableProps {
  data: any[],
  onChange: (data: any[]) => void;


}

interface IFormInput {
  clave: string;
  categoria: string;
  fecha_creacion: string;
  creador_id: number; // ← debe ser creador_id
  datos: Record<string, any>;
  estado: string;
  unidad_responsable_id: number;
}

export interface Anexo {
  id: number
  clave: string
  categoria: string
  creador_id: number
  fecha_creacion: string       // formato ISO, ej: "2025-08-07"
  datos: Record<string, any>   // o simplemente `any` si prefieres
  estado: string
  unidad_responsable_id: number
}

// funcion para validar clave
// Debe estar dentro del componente o recibir anexos y userid como argumentos
function yaTieneAnexoConClave(clave: string, anexos: Anexo[], userid: number): boolean {
  if (!clave || !anexos || !userid) return false;

  return anexos.some(anexo => anexo.clave === clave && anexo.creador_id === userid);
}

const getAnexos = async () => {
  try {
    const response = await fetch(`${API_URL}/anexos/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en la respuesta");
    }

    const data = await response.json();
    console.log("Anexos obtenidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener anexos:", error);
    toast.error("No se pudieron cargar los anexos");
    return [];
  }
};

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
    "nombre_categoria": "Marco Jurídico"
  },
  {
    "id": "12",
    "nombre_categoria": "Sin Categoría"
  },
  {
    "id": "13",
    "nombre_categoria": "Asuntos Relevantes"
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
    "descripcion": "CONTRATOS Y CONVENIOS VIGENTES (Generales, Coordinación, Fideicomisos, Bienes y Servicios)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "2"
  },
  {
    "id": "20",
    "clave": "CCL02",
    "descripcion": "LICITACIONES EN TRÁMITE (Bienes y Servicios, Obra)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "2"
  },
  {
    "id": "21",
    "clave": "CCL03",
    "descripcion": "PROGRAMAS DE OBRA Y ADQUISICIONES (Programa Anual de Obra Pública, Listado de Expedientes de Obra, Programa Anual de Adquisiciones)",
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
    "descripcion": "ACTAS DE ÓRGANOS DE GOBIERNO (Actas de Consejo, Acuerdo de Órganos de Gobierno)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "3"
  },
  {
    "id": "25",
    "clave": "ENI04",
    "descripcion": "REPRESENTACIONES Y CARGOS HONORÍFICOS VIGENTES",
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
    "descripcion": "INVENTARIO DE MOBILIARIO Y EQUIPO (Oficina, Vehículos, Maquinaria y Equipo)",
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
    "descripcion": "BIENES INMUEBLES EN POSESIÓN",
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
    "descripcion": "BIENES CULTURALES Y DECORATIVOS (Obras de Arte y Artículos de Decoración)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "5"
  },
  {
    "id": "35",
    "clave": "IBM07",
    "descripcion": "INVENTARIO FAUNÍSTICO (Especímenes, Animales Taxidermizados)",
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
    "descripcion": "INVENTARIO DE TECNOLOGÍA (Paquetes Computacionales, Sistemas y Programas, Equipos de Comunicación)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "5"
  },
  {
    "id": "38",
    "clave": "SCA01",
    "descripcion": "CLAVES Y FIRMAS DE ACCESO (Sistemas, Seguridad, Cancelación, Solicitudes de Cancelación)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "6"
  },
  {
    "id": "39",
    "clave": "SCA02",
    "descripcion": "RELACIÓN DE LLAVES DE LA DEPENDENCIA",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "6"
  },
  {
    "id": "40",
    "clave": "DA01",
    "descripcion": "RESPALDOS DE INFORMACIÓN",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "41",
    "clave": "DA02",
    "descripcion": "INVENTARIO DE ACERVO BIBLIOGRÁFICO Y HEMEROGRÁFICO",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "42",
    "clave": "DA03",
    "descripcion": "CORTE FORMAS YU FOLIADAS",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "43",
    "clave": "DA04",
    "descripcion": "SELLOS OFICIALES",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "44",
    "clave": "DA05",
    "descripcion": "ARCHIVOS (Trámite y Concentración)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "45",
    "clave": "DA06",
    "descripcion": "LIBROS Y REGISTROS DE CONTABILIDAD",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "46",
    "clave": "DA07",
    "descripcion": "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA (Por Contrato y Administración Directa - ya incluido en \"Programas de Obra y Adquisiciones\", podría omitirse aquí o considerarse una subcategoría)",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "7"
  },
  {
    "id": "47",
    "clave": "ALA01",
    "descripcion": "ASUNTOS EN TRAMITE DE NATURALEZA JURÍDICA",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "8"
  },
  {
    "id": "48",
    "clave": "ALA02",
    "descripcion": "OBSERVACIONES DE AUDITORÍA PENDIENTES",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "8"
  },
  {
    "id": "49",
    "clave": "ALA03",
    "descripcion": "PÓLIZAS Y SEGUROS VIGENTES",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "8"
  },
  {
    "id": "50",
    "clave": "ALA04",
    "descripcion": "FIANZAS VIGENTES",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "8"
  },
  {
    "id": "51",
    "clave": "ALA05",
    "descripcion": "GARANTÍAS VIGENTES",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "8"
  },
  {
    "id": "52",
    "clave": "PP01",
    "descripcion": "PROGRAMA OPERATIVO ANUAL",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "9"
  },
  {
    "id": "53",
    "clave": "PP02",
    "descripcion": "OTROS PROGRAMAS",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "9"
  },
  {
    "id": "54",
    "clave": "TA01",
    "descripcion": "TRANSPARENCIA Y ACCESO A LA INFORMACIÓN",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "10"
  },
  {
    "id": "55",
    "clave": "MJ01",
    "descripcion": "ADMINISTRATIVO DE ACTUACIÓN",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "11"
  },
  {
    "id": "56",
    "clave": "AR01",
    "descripcion": "ASUNTOS RELEVANTES EN TRÁMMITE Y ATENCIÓN",
    "creado_en": "2025-07-08 19:28:09.954822+00",
    "editado_en": "2025-07-08 19:28:09.954822+00",
    "is_deleted": "False",
    "id_categoria": "11"
  },
  {
    "id": "59",
    "clave": "",
    "descripcion": "",
    "creado_en": "",
    "editado_en": "",
    "is_deleted": "",
    "id_categoria": ""
  }
]

// lib/estructuras.ts por ahora en el mismo archivo
export const EstructuraDatosPorClave: Record<string, string[]> = {
  // Marco Jurídico
  MJ01: ["ordenamiento", "Titulo", "Fecha de emision"],
  AR01: ["asunto", "descripcion", "fecha_inicio", "responsable", "estatus"],

  // Recursos Presupuestales
  RF01: ["partida", "descripcion", "monto_autorizado", "monto_ejercido", "saldo"],
  RF02: ["ingreso", "monto", "fuente"],
  RF03: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF04: ["programa", "monto", "objetivo"],
  RF05: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF06: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF07: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF08: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF09: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF10: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF11: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF12: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF13: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF14: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF15: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF16: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF17: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF18: ["recurso", "monto", "entidad", "fecha_asignacion"],

  // Contratos y Convenios
  CCL01: ["contrato", "tipo", "monto", "proveedor", "fecha_inicio", "fecha_fin"],
  CCL02: ["licitacion", "estado", "monto", "fecha_apertura"],

  // Estructura Interna
  ENI01: ["url", "blob"], // organigrama pdf libre
  ENI02: ["Tipo",
    "Nombre",
    "Fecha de publicación",
    "Versión",
    "Observaciones"
  ], // reglamento interno y manuales generales
  ENI03: ["Número de sesión",
    "Fecha de la sesión",
    "Ordinaria o Extraordinaria",
    "Datos del acuerdo: Numero",
    "Datos del acuerdo: Descripcion breve",
    "Datos del acuerdo: Responsable",
    "Datos del acuerdo: Áreas Involucradas",
    "Estatus del acuerdo: Porcentaje del avance",
    "Estatus del acuerdo: Observaciones"
  ], // Acuerdo de organos de gobierno y Actas de consejo
  ENI04: ["cargo",
    "Con derecho a",
    "Fecha inicio del cargo",
    "Periodicidad de reuniones",
    "Observaciones"
  ], // representaciones y cargos honoríficos
  ENI05: ["Nombre y puesto del servidor que otorga el poder",
    "Tipo de poder otorgado",
    "Fecha de otorgamiento",
    "Notario No.",
    "Inscrito al registro público de la propiedad y el comercio",
    "Observaciones"], // poderes otorgados

  // Recursos Humanos
  RRH01: ["Numero de empleado",
    "nombre",
    "RFC",
    "Plaza (categoria)",
    "Tipo de encargo",
    "Fecha de ingreso",
    "Sueldo",
    "Otras percepciones",
    "Total",
    "Unidad de Adscripcion",
    "Área laboral",
    "Estatus: Base, Apoyo, Comisionado",
  ], // plantilla de personal
  RRH02: ["nombre",
    "RFC",
    "Fecha de inicio de contrato",
    "Fecha de fin de contrato",
    "Fuente de recurso",
    "Actividades a desarrollar",
    "Salario",
    "Otras Percepciones",
    "Total",
    "Unidad de Adscripcion",
    "Area laboral"
  ], // personal de honorarios

  // Inventario de Bienes
  IBM01: [
    "Articulo",
    "Marca",
    "Modelo",
    "Numero de serie",
    "Numero de patrimonio",
    "Cantidad",
    "Valor",
    "Ubicacion",
    "Responsable",

  ], // MObiliario de oficina, vehiculos, maquinaria y equipo
  IBM02: ["Clave patrimonial",
    "Descripcion",
    "Marca",
    "Modelo",
    "No. de serie",
    "Cantidad",
    "Valor",
    "Ubicacion",
    "Responsable"], // Almacenes de papeleria y plantas de vivero
  IBM03: ["Tipo de bien",
    "Descripcion",
    "Marca",
    "Modelo",
    "No. de serie",
    "Estado físico",
    "Ubicacion",
    "Responsable",
    "Nombre de otorgante",
    "Fecha de firma de comodato"
  ], // Inventario de bienes en comodato
  IBM04: [
    "Descripcion",
    "Tipo de predio",
    "Calle y número",
    "Localidad",
    "Observaciones",
  ], // Bienes inmuebes de la dependencia
  IBM05: [
    "No. de registro o inventario",
    "Titulo de la obra",
    "Descripcion",
    "Ubicacion",
    "Certificado de autenticidad",
    "Estado fisico",
    "Observaciones"
  ], // Inventario de arte
  IBM06: [
    "Nombre comun",
    "nombre cientifico",
    "Clave",
    "Origen",
    "Sexo",
    "Marcaje",
    "Fecha de Alta",
    "Observaciones"
  ], //Inventario Faunistico (especimen y taxidemnizados)
  // Inventario de Armamento, accesorios de seguridad y municiones
  IBM07: [
    "Tipo de armamento",
    "Descripción",
    "Marca",
    "Modelo",
    "Número de serie",
    "Cantidad",
    "Ubicación",
    "Responsable",
    "Observaciones"
  ],
  // Inventario de Software (sistemas desarrolados y paquetes computacionales)
  IBM08: [
    "Nombre del software",
    "Versión",
    "Proveedor",
    "No. de serie",
    "Manual",
    "Licencia",
    "Equipo en el que opera",
    "Documentación"
  ],
  // Inventario de tecnologia (equipos de computo y telecomunicaciones)
  IBM09: [
    "Nombre del equipo",
    "Marca",
    "Modelo",
    "Número de serie",
    "Cantidad",
    "Ubicación",
    "Responsable",
    "Observaciones"
  ],

  // Documentación y Archivo
  DA01: ["sistema", "frecuencia", "ultimo_respaldo", "responsable"],
  DA02: ["titulo", "autor", "tipo", "ubicacion"],
  DA03: ["tipo", "descripcion", "fecha_inicio", "fecha_fin", "responsable"],
  DA04: ["tipo", "descripcion", "fecha_inicio", "fecha_fin", "responsable"],
  DA05: ["tipo", "descripcion", "fecha_inicio", "fecha_fin", "responsable"],
  DA07: ["expediente", "proyecto", "ubicacion", "responsable"],

  // Asuntos Legales
  ALA01: ["asunto", "tipo", "estado", "abogado", "fecha_inicio"],
  ALA02: ["Tipo de auditoria",
    "Periodo de la Auditoria",
    "Datos de la Auditoria: Realizada por",
    "Datos de la Auditoria: Observaciones", // Observaciones de Auditorias pendientes
    "Datos de la Auditoria: Observaciones atendidas",
    "Datos de la Auditoria: Observaciones pendientes",
    "Estatus de la Auditoria: Situación actual"
  ],

  // Programas y Proyectos FORMATO LIBRE PDF 
  PP01: ["url", "blob"],
  PP02: ["Tipo de Documento", "Nombre", "Fecha", "Observaciones"],

  // Transparencia
  TA01: ["solicitud", "solicitante", "fecha", "estatus", "respuesta"],

  // Por defecto
  default: ["campo1", "campo2", "campo3"]
};

export const CALVES_CON_PDF: Record<string, string[]> = {
  PP01: ["url", "blob"],
  ENI01: ["url", "blob"]
}

enum CategoriaEnum {
  RECURSOS_PRESUPUESTALES = "1",
  CONTRATOS_CONVENIOS = "2",
  ESTRUCTURA_NORMATIVA = "3",
  RECURSOS_HUMANOS = "4",
  INVENTARIO_BIENES = "5",
  SEGURIDAD_CONTROL = "6",
  DOCUMENTACION_ARCHIVO = "7",
  ASUNTOS_LEGALES = "8",
  PROGRAMAS_PROYECTOS = "9",
  TRANSPARENCIA = "10",
  MARCO_JURIDICO = "11",
  SIN_CATEGORIA = "12",
  ASUNTOS_RELEVANTES = "13"
}

const CategoriaLabels = {
  [CategoriaEnum.RECURSOS_PRESUPUESTALES]: "Recursos Presupuestales y Financieros",
  [CategoriaEnum.CONTRATOS_CONVENIOS]: "Contratos, Convenios y Licitaciones",
  [CategoriaEnum.ESTRUCTURA_NORMATIVA]: "Estructura y Normativa Interna",
  [CategoriaEnum.RECURSOS_HUMANOS]: "Recursos Humanos",
  [CategoriaEnum.INVENTARIO_BIENES]: "Inventario de Bienes Muebles e Inmuebles",
  [CategoriaEnum.SEGURIDAD_CONTROL]: "Seguridad y Control de Accesos",
  [CategoriaEnum.DOCUMENTACION_ARCHIVO]: "Documentación y Archivo",
  [CategoriaEnum.ASUNTOS_LEGALES]: "Asuntos Legales y de Auditoría",
  [CategoriaEnum.PROGRAMAS_PROYECTOS]: "Programas y Proyectos:",
  [CategoriaEnum.TRANSPARENCIA]: "Transparencia",
  [CategoriaEnum.MARCO_JURIDICO]: "Marco Jurídico",
  [CategoriaEnum.SIN_CATEGORIA]: "Sin Categoría",
  [CategoriaEnum.ASUNTOS_RELEVANTES]: "Asuntos Relevantes"
};

enum CategoriasAnexos {
  DA = "Documentación Administrativa",
  ALA = "Asuntos Legales",
  PP = "Programas y Proyectos",
  TA = "Transparencia y Acceso a la Información",
  MJ = "Matriz de Justificación",
  AR = "Asuntos Relevantes"
}

interface IFormInput {
  clave: string;
  categoria: string;
  fecha_creacion: string;
  creado_id: number;
  datos: Record<string, any>;
  estado: string;
  unidad_responsable_id: number;
}


const EditableTable: React.FC<EditableTableProps> = ({ data, onChange }) => {
  const handleEdit = (rowIndex: number, field: string, value: string) => {
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

export default function AnexosPage() {
  const [userName, setUserName] = useState<string>("");
  const [user, setUser] = useState<{ username: string; role?: string } | null>({ username: "", role: "" });
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [showForm, setShowForm] = useState(false) // Nuevo estado para controlar la visibilidad
  const [editingAnexo, setEditingAnexo] = useState<Anexo | null>(null)
  const [formData, setFormData] = useState<{
    id: number | Anexo["id"]
    clave: string | Anexo["clave"]
    categoria: string | Anexo["categoria"]
    creador_id: number | Anexo["creador_id"]
    fecha_creacion: string | Anexo["fecha_creacion"]
    datos: Record<string, any> | Anexo["datos"]
    estado: string | Anexo["estado"]
    unidad_responsable_id: number | Anexo["unidad_responsable_id"]
  }>({
    id: 0,
    clave: "",
    categoria: "",
    creador_id: 0,
    fecha_creacion: new Date().toISOString().split("T")[0],
    datos: {},
    estado: "Borrador",
    unidad_responsable_id: 0,
  })
  const [rows, setRows] = useState<any[]>([])
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////// datos para el form con react hook form ///////////////////////////////////////////
  const [userid, setUserid] = useState<number>(0);
  const [userrole, setUserrole] = useState<string>("USER"); // valor por defecto
  const [unidadResponsable, setUnidadResponsable] = useState<number>(0)
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<IFormInput>({
    defaultValues: {
      creador_id: userid,
      unidad_responsable_id: unidadResponsable,
      fecha_creacion: new Date().toISOString().split("T")[0],
      estado: "Borrador",
      datos: [], // inicializa como array vacío
    }
  });

  const [activeTab, setActiveTab] = useState<string>("anexos")
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isInvalidFileType, setIsInvalidFileType] = useState(false)
  const [datos, setDatos] = useState<Array<Record<string, any>>>([]);
  const isExcelFile = selectedFile?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const [previewData, setPreviewData] = useState<Array<Record<string, any>>>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; data: any[] } | null>(null);
  const [anexosFiltrados, setAnexosFiltrados] = useState<Anexo[]>(anexos);

  // Primer UseEffect


  const guardarBorrador = () => {
    const draft = {
      clave: watch("clave"),
      categoria: watch("categoria"),
      fecha_creacion: watch("fecha_creacion"),
      estado: watch("estado"),
      datos,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(`draft_anexo_${userid}`, JSON.stringify(draft));
    toast.success("✅ Borrador guardado");
  };

  // useEffect para manejar el guardado del borrador y la restauración
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const roleString = localStorage.getItem("role");

    if (!token) {
      router.push("/");
      return;
    }

    let currentUserId: number;
    let currentUserRole = "USER";

    // 1. Parsear usuario y rol
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUserName(userData.username);
        currentUserId = userData.id;
        setUserid(userData.id);
        currentUserRole = userData.role || roleString || "USER";
        setUserrole(currentUserRole); // Asegúrate de tener este estado
      } catch (error) {
        console.error("Error al parsear los datos del usuario:", error);
        setUserName("");
        setUserid(0);
        setUserrole("USER");
        return;
      }
    } else {
      setUserid(0);
      setUserrole("USER");
      return;
    }

    // 2. Recuperar borrador (ahora que tenemos userid)
    const guardado = localStorage.getItem(`draft_anexo_${currentUserId}`);
    if (guardado) {
      try {
        const draft = JSON.parse(guardado);
        setValue("clave", draft.clave);
        setValue("categoria", draft.categoria);
        setValue("fecha_creacion", draft.fecha_creacion);
        setValue("estado", draft.estado);
        setValue("unidad_responsable_id", draft.unidad_responsable_id);
        setValue("creador_id", currentUserId);
        setDatos(draft.datos);
        toast.info("📋 Borrador recuperado", { duration: 3000 });
      } catch (error) {
        console.error("Error al recuperar el borrador:", error);
      }
    }

    // 3. Obtener unidad responsable
    const obtenerUnidad = async () => {
      try {
        const unidad = await UnidadesPorUsuario(currentUserId!);
        console.log("Unidad responsable:", unidad.id_unidad);
        setUnidadResponsable(unidad.id_unidad);
        setValue("unidad_responsable_id", unidad.id_unidad);
        setValue("creador_id", currentUserId!);
      } catch (error) {
        console.error("Error al obtener la unidad responsable:", error);
      }
    };

    if (currentUserId) {
      obtenerUnidad();
    }

    // 4. Obtener anexos
    // Obtener y filtrar anexos
    getAnexos()
      .then((data) => {
        const filtrados = data.filter((anexo: Anexo) => anexo.creador_id === currentUserId);
        setAnexos(filtrados);
      })
      .catch((error) => {
        console.error("Error al obtener anexos:", error);
        toast.error("No se pudieron cargar los anexos");
      });

    // 5. (Opcional) Elimina esta llamada de prueba en producción
    // async function mostrarUnidad() {
    //   try {
    //     const unidad = await UnidadesPorUsuario(1);
    //     console.log("Unidad responsable (prueba):", unidad.id_unidad);
    //   } catch (error) {
    //     console.error("Error al obtener la unidad responsable (prueba):", error);
    //   }
    // }
    // mostrarUnidad();

  }, []); // Dependencia vacía: se ejecuta una vez
  // Manejador de items
  const handleFMJChange = (jsonDataArray: Array<Record<string, any>>) => {
    setDatos(jsonDataArray); // Aquí guardas el array de marcos
  };

  // validar el nombre del archivo excel
  const validarNombreArchivo = (file: File, clave: string) => {
    const nombre = file.name.toLocaleLowerCase();
    const regex = new RegExp(`^${clave.toLocaleLowerCase()}_.*\\.xlsx$`);

    if (!regex.test(nombre)) {
      toast.error(`Nombre incorrecto. Usa: ${clave}_dd_mm_aaaa.xlsx`);
      return false;
    }
    return true;
  };

  // handleSubmit
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log("🚀 Datos del formulario (RHF):", data);

    // Aseguramos que `datos` sea un array o objeto válido
    const payload = {
      clave: data.clave,
      categoria: data.categoria,
      creador_id: userid,
      unidad_responsable_id: unidadResponsable,
      fecha_creacion: new Date(data.fecha_creacion).toISOString(), // formato ISO
      estado: data.estado,
      datos: Array.isArray(data.datos) ? data.datos : [data.datos],
    };

    console.log("✅ Payload final a enviar:", payload);

    // Aquí haces el fetch
    fetch(`${API_URL}/anexos`, {
      method: "POST",
      headers: {
        // encoders
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(result => {
        toast.success("Anexo creado", { description: `Clave: ${result.clave}` });
        reset();
        setDatos([]);
        setActiveTab("anexos");
      })
      .catch(err => {
        toast.error("Error", { description: err.message });
        console.error(err);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const resetForm = () => {
    setFormData({
      id: 0,
      clave: "",
      categoria: "",
      creador_id: userid,
      fecha_creacion: new Date().toISOString().split("T")[0],
      datos: {},
      estado: "Borrador",
      unidad_responsable_id: 0,
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

  const handleDownload = (id: number) => {
    toast(
      "Función de descarga aún no implementada",
      {
        description: "Próximamente podrás descargar anexos.",
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

  const requierePDF = (clave: string): boolean => {
    return ["ENI01", "PP01"].includes(clave.toUpperCase().trim());
  };

  function claveRequierePDF(clave?: string): boolean {
    if (!clave) return false;
    return requierePDF(clave);
  }

  function claveRequiereExcel(clave?: string): boolean {
    return !claveRequierePDF(clave); // Todos los demás son Excel
  }

  // manejar el cambio de pestaña Tab
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // manejo de edicion de anexos por usuario y por unidad responsable
  const canEdit = (anexo: Anexo): boolean => {
    // Si el estado es "Cerrado", nadie puede editar
    if (anexo.estado === "Cerrado") return false;

    // Si el usuario es ADMIN, puede editar (excepto si está cerrado)
    if (userrole === "ADMIN") return true;

    // Si es el creador y el estado es "Borrador", puede editar
    if (anexo.creador_id === userid && anexo.estado === "Borrador") return true;

    // Si es el creador y está en "Revisión" o "Pendiente", puede editar (opcional)
    if (
      anexo.creador_id === userid &&
      ["Revisión", "Pendiente"].includes(anexo.estado)
    ) {
      return true;
    }

    // En cualquier otro caso, no puede editar
    return false;
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
          user={user ? user.username : ''} // Pass the username property of the user object if user is not null
          disableAuthCheck={true} // Deshabilitar la verificación de autenticación para esta página 
        />

        <div className="container whitespace-nowrap overflow-x-auto px-4 py-8">

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full sm:grid-cols-3 grid-cols-3 gap-2 sm:gap-0 gap-3 text-sm" >
              <TabsTrigger value="anexos">Anexos</TabsTrigger>
              <TabsTrigger value="documentos">Crear Anexos</TabsTrigger>
              <TabsTrigger value="formulario">Anexos por usuario</TabsTrigger>
            </TabsList>

            <TabsContent value="anexos" className="mt-4 sm:mt-6 md:mt-8">

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
                    {/** Botón para crear un nuevo anexo */}
                    <Button
                      style={{ backgroundColor: "#24356B", color: "white" }}
                      onClick={() => setActiveTab("documentos")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Anexo
                    </Button>


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
                      <form onSubmit={() => { console.log("Datos del formulario:", formData); }}>
                        <div className="space-y-4">

                          <div className="grid w-full sm:grid-cols-3 grid-cols-2 gap-2 sm:gap-3 gap-3 text-sm" >

                            {/* Selector de Categoría */}
                            <div className="space-y-2">
                              <Label htmlFor="categoria">Categoría</Label>
                              <Select
                                value={selectedCategory}
                                onValueChange={(value: string) => {
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
                                  onValueChange={(value: string) => setFormData({ ...formData, clave: value })}
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

                          <div className="grid w-full sm:grid-cols-3 grid-cols-2 gap-2 sm:gap-3 gap-3 text-sm" >
                            <div className="mt-2">
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
                            <div className="mt-2">
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
                            </div>
                            <div className="mt-2">
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
                                <option value="Cerrado">Cerrado</option>
                              </select>
                            </div>
                          </div>

                          {/* Sección de archivo (se mantiene igual) */}

                          <label htmlFor="info-loader" className="block text-sm font-medium text-gray-700 mb-2">
                            Información
                          </label>
                          <div className="grid w-full sm:grid-cols-2 gap-2 gap-3 ">
                            {/*   */}
                            {selectedCategory === "Marco Jurídico" && (
                              <div>

                              </div>
                            )}
                          </div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subir Archivo (PDF o Excel)
                          </label>

                          {selectedCategory && requierePDF(formData.clave) ? (
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
                                onUploadSuccess={(excelData) => {
                                  const clave = watch("clave")
                                  const estructura = EstructuraDatosPorClave[clave] || EstructuraDatosPorClave.default

                                  if (estructura.length > 0 && excelData.length > 0) {
                                    const columnasExcel = Object.keys(excelData[0])
                                    const faltantes = estructura.filter(campo => !columnasExcel.includes(campo))
                                    const extras = columnasExcel.filter(campo => !estructura.includes(campo))

                                    if (faltantes.length > 0) {
                                      toast.warning(
                                        `Faltan columnas: ${faltantes.join(", ")}. Se llenarán como vacías.`,
                                        { duration: 5000 }
                                      )
                                    };
                                    if (extras.length > 0) {
                                      toast.warning(
                                        `Columnas extras: ${extras.join(", ")}. Se ignorarán.`,
                                        { duration: 5000 }
                                      )
                                    }

                                    setRows(excelData)
                                    setValue("datos", excelData) // sincroniza con RHF
                                    setFormData((prev) => ({
                                      ...prev,
                                      datos: excelData, // esto sincroniza directamente con formData
                                    }))
                                  }
                                }} onUploadError={function (error: string): void {
                                  throw new Error("Function not implemented.")
                                }} />
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
                                onChange={(newData) =>
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
                              <textarea
                                id="datos"
                                value={JSON.stringify(formData.datos, null, 2)}
                                onChange={(e) => setFormData({ ...formData, datos: JSON.parse(e.target.value) })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
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
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {anexos.map((anexo) => (
                            <TableRow key={anexo.id}>
                              <TableCell className="font-medium">{anexo.clave}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(anexo.estado)}`}>
                                  {anexo.estado}
                                </span>
                              </TableCell>
                              <TableCell>{anexo.fecha_creacion}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleDownload(anexo.id)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {canEdit(anexo) && (
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(anexo)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/anexos/${anexo.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
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

            </TabsContent>

            <TabsContent value="documentos" className="mt-4 sm:mt-6 md:mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>{editingAnexo ? "Editar Anexo" : "Nuevo Anexo"}</CardTitle>
                  <CardDescription>
                    {editingAnexo
                      ? "Modifica los datos del anexo seleccionado"
                      : "Completa los datos para crear un nuevo anexo"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Clave del Anexo */}
                    <div className="space-y-2 col-span-6 grid-cols-3">
                      <Label>Clave del Anexo</Label>
                      <div className="text-sm text-gray-500 border border-gray-300 mb-1 ">
                        <select
                          {...register("clave", { required: "Clave es obligatoria" })}
                          className="w-full text-sm p-2 sm:p-2 md:p-2 border border-gray-300 "
                          onChange={(e) => {
                            const clave = e.target.value;
                            setValue("clave", clave);
                            const claveData = claves_anexos.find((k) => k.clave === clave);
                            if (claveData) {
                              const categoria = categoria_anexos.find(
                                (c) => c.id === claveData.id_categoria
                              )?.nombre_categoria || "";
                              setValue("categoria", categoria);
                            }
                          }}
                        >
                          <option value="">Selecciona una clave</option>
                          {claves_anexos.map((k) => (
                            <option key={k.id} value={k.clave}>
                              {k.clave} - {k.descripcion}
                            </option>
                          ))}
                        </select>
                      </div>

                      {errors.clave && (
                        <p className="text-sm text-red-600">{errors.clave.message}</p>
                      )}
                    </div>

                    {/* Categoría (autocompletada) */}
                    <div className="space-y-2 col-span-6 grid-cols-3">
                      <Label>Categoría</Label>
                      <div className="text-sm text-gray-500 mb-1">
                        <input
                          {...register("categoria")}
                          type="text"
                          disabled
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>

                    </div>

                    {/* Fecha de Creación */}
                    <div className="space-y-2 col-span-6 grid-cols-3">
                      <Label>Fecha de Creación</Label>
                      <div className="text-sm text-gray-500 mb-1">
                        <input
                          {...register("fecha_creacion", { required: "Fecha es obligatoria" })}
                          type="date"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      {errors.fecha_creacion && (
                        <p className="text-sm text-red-600">{errors.fecha_creacion.message}</p>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="space-y-2 col-span-6 grid-cols-3">
                      <Label>Estado</Label>
                      <div className="text-sm text-gray-500 mb-1"></div>
                      <select
                        {...register("estado", { required: "Estado es obligatorio" })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Borrador">Borrador</option>
                        <option value="Completado">Completado</option>
                        <option value="Revisión">Revisión</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                      {errors.estado && (
                        <p className="text-sm text-red-600">{errors.estado.message}</p>
                      )}
                    </div>
                    <div className="space-y-2 col-span-6 grid-cols-3">

                      <Label>ID del Creador</Label>
                      <div className="space-y-2 text-sm text-gray-500 mb-1">
                        <input className="w-full p-2 border border-gray-300 rounded-md" type="readOnly" {...register("creador_id")} value={userid} />
                      </div>
                      <Label>ID de la Unidad Responsable</Label>
                      <div className="space-y-2 text-sm text-gray-500 mb-1">
                        <input className="w-full p-2 border border-gray-300 rounded-md" type="readOnly" {...register("unidad_responsable_id")} value={unidadResponsable} />
                      </div>
                    </div>
                    {/* Campos ocultos */}

                    {/* Tabla dinámica o Excel */}

                    <div className="text-sm text-gray-500 mb-1">
                      {watch("clave") && (
                        <div className="space-y-4">
                          <Label>
                            Datos del anexo: <strong>{watch("clave")}</strong>
                          </Label>

                          {/** Condición para mostrar mensaje de archivo PDF requerido */}
                          {requierePDF(watch("clave")) ? (
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                Este anexo requiere un archivo PDF.
                              </p>
                              <PdfUploader
                                onUploadSuccess={(fileUrl) => {
                                  const datosPDF = { pdf_url: fileUrl };
                                  setDatos([datosPDF]);
                                  setValue("datos", datosPDF);
                                  toast.success("✅ PDF subido correctamente");
                                }}
                              />
                              {datos.length > 0 && datos[0]?.pdf_url && (
                                <div className="mt-4">

                                  <p className="text-sm text-gray-600">PDF cargado:</p>
                                  <a
                                    href={datos[0].pdf_url}
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Ver documento
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-gray-500">
                                Este anexo requiere un archivo excel o carga manual.
                              </p>
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span>Tabla de datos</span>
                                  {/** Botón para agregar fila manualmente */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const estructura = EstructuraDatosPorClave[watch("clave")] || [];
                                      const nuevaFila: Record<string, any> = {};
                                      estructura.forEach(campo => nuevaFila[campo] = "");
                                      const nuevas = [...datos, nuevaFila];
                                      setDatos(nuevas);
                                      setValue("datos", nuevas);
                                    }}
                                    disabled={watch("clave") === ""} // Deshabilitar si no hay clave seleccionada
                                    className={yaTieneAnexoConClave(watch("clave"), anexos, userid) ? "opacity-50 cursor-not-allowed" : ""}
                                  >
                                    + Agregar fila
                                  </Button>
                                </div>

                                {datos.length === 0 ? (
                                  <p className="text-sm text-gray-500">
                                    No hay datos. Usa Excel o agrega manualmente.
                                  </p>
                                ) : (
                                  <table className="min-w-full border border-gray-300 rounded-md text-sm">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        {Object.keys(datos[0]).map((key) => (
                                          <th
                                            key={key}
                                            className="border px-2 py-1 font-semibold"
                                          >
                                            {key}
                                          </th>
                                        ))}
                                        <th className="border px-2 py-1 font-semibold">
                                          Acciones
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {datos.map((fila, i) => (
                                        <tr key={i}>
                                          {Object.keys(fila).map((campo) => (
                                            <td key={campo} className="border px-2 py-1">
                                              <input
                                                type="text"
                                                value={fila[campo]}
                                                onChange={(e) => {
                                                  const nuevas = [...datos];
                                                  nuevas[i][campo] = e.target.value;
                                                  setDatos(nuevas);
                                                  setValue("datos", nuevas);
                                                }}
                                                className="w-full p-1 border rounded"
                                              />
                                            </td>
                                          ))}
                                          <td className="border px-2 py-1">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="text-red-500"
                                              onClick={() => {
                                                const nuevas = datos.filter(
                                                  (_, index) => index !== i
                                                );
                                                setDatos(nuevas);
                                                setValue("datos", nuevas);
                                              }}
                                            >
                                              Eliminar
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                              <div>
                                <ExcelUploader
                                  onUploadSuccess={async (excelData) => {
                                    const clave = watch("clave");
                                    if (!clave) {
                                      toast.error("Por favor, proporciona una clave válida.");
                                      return;
                                    }

                                    if (yaTieneAnexoConClave(clave, anexos, userid)) {
                                      toast.warning(`Ya tienes un anexo con la clave ${clave}. No es necesario subir uno más.
                                        `);
                                      return;
                                    }

                                    // 2. Validar estructura del Excel
                                    const estructura = EstructuraDatosPorClave[clave];
                                    if (!estructura) {
                                      toast.error("Estructura no definida para esta clave");
                                      return;
                                    }

                                    const { valido, errores } = validarEstructuraExcel(excelData, estructura);
                                    if (!valido) {
                                      toast.error(
                                        <div>
                                          <p>Errores en el archivo:</p>
                                          <ul className="list-disc list-inside text-sm">
                                            {errores.map((err, i) => (
                                              <li key={i}>{err}</li>
                                            ))}
                                          </ul>
                                        </div>,
                                        { duration: 8000 }
                                      );
                                      return;
                                    }

                                    // 3. Todo valido -> procesar datos
                                    setDatos(excelData);
                                    setValue("datos", excelData);
                                    toast.success(`✅ Excel cargado: ${excelData.length} filas`);
                                  }}
                                  onUploadError={(error: string) => {
                                    toast.error(`Error al subir el archivo: ${error}`);
                                  }}
                                />
                              </div>
                            </>
                          )}



                          {/* Subida de Excel */}

                        </div>
                      )}
                    </div>


                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          reset();
                          setDatos([]);
                          setShowForm(false);
                        }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        type="submit"
                        style={{ backgroundColor: "#24356B", color: "white" }}
                      >
                        {editingAnexo ? "Actualizar" : "Guardar Anexo"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const draft = {
                            clave: watch("clave"),
                            categoria: watch("categoria"),
                            fecha_creacion: watch("fecha_creacion"),
                            estado: watch("estado"),
                            datos,
                            timestamp: new Date().toISOString(),
                          };
                          localStorage.setItem(
                            `draft_anexo_${userid}`,
                            JSON.stringify(draft)
                          );
                          toast.success("✅ Borrador guardado");
                        }}
                      >
                        Guardar como Borrador
                      </Button>
                    </div>

                  </form>
                </CardContent>
              </Card>

            </TabsContent>



            <TabsContent value="formulario" className="mt-4 sm:mt-6 md:mt-8">


            </TabsContent>


          </Tabs>

        </div>

      </div>
    </>
  )
}