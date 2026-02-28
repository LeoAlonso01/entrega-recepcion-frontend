"use client"

import type React from "react"
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
import { Plus, Edit, Trash2, Download, ArrowLeft, Eye, Trash, Check } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { FileSpreadsheet, FileText } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import { UnidadesPorUsuario } from "../../services/get_unidades";
import { z } from "zod";
import { EstructuraDatosPorClave, CALVES_CON_PDF } from "@/lib/estructuraPorClave"
import { validarEstructuraExcel, validarTiposExcel } from "@/lib/valildaciones"
import { generarPlantillaPorClave } from "@/lib/generarPlantillas"
import { SubcategoriaEnum } from "../../../components/json/categorias";
import { SubcategoriaClaves } from "@/components/json/categorias";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


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
  creador_id: number;
  datos: Array<Record<string, any>>;
  estado: string;
  unidad_responsable_id: number;
}

export interface Anexo {
  id: number
  clave: string
  categoria: string
  creador_id: number
  fecha_creacion: string       // formato ISO, ej: "2025-08-07"
  datos: Array<Record<string, any>>   // o simplemente `any` si prefieres
  estado: string
  unidad_responsable_id: number
}

// funcion para validar clave
// Debe estar dentro del componente o recibir anexos y userid como argumentos
function yaTieneAnexoConClave(clave: string, anexos: Anexo[], userid: number, editingId?: number): boolean {
  if (!clave || !anexos || !userid) return false;

  return anexos.some(anexo => anexo.clave === clave && anexo.creador_id === userid && anexo.id !== editingId);
}

const getAnexos = async () => {
  try {
    const response = await fetch(`${API_URL}/anexos`, {
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

// obtener anexo por id 
const fetchAnexoById = async (id: number): Promise<Anexo | null> => {
  try {

    // llamada a la API
    const response = await fetch(`${API_URL}/anexos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // validar respuesta
    if (!response.ok) throw new Error("Error en la respuesta de la API") && toast.error("Error al obtener el anexo para edicion");

    // recuperar los datos
    const anexo: Anexo = await response.json();
    return anexo;

  } catch (error) {
    toast.error("Error al obtener el anexo para edicion");
    return null;
  }
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
      head: [["Clave", "Categoria", "Estado", "Fecha Creación"]],
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

// validacion con zod
const anexosSchema = z.object({
  clave: z.string().min(1, "La clave es obligatoria"),
  categoria: z.string(),
  datos: z.array(z.record(z.any())).min(1, "Debe haber al menos una fila de datos"),
  estado: z.string(),
  fecha_creacion: z.string().datetime(),
})

type IFormInputz = z.infer<typeof anexosSchema>;

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

/* const categoria_anexos = [
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
    "nombre_categoria": "Sisteama de Gestión de Calidad"
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
    "id": "60",
    "clave": "SGC01",
    "descripcion": "SISTEMA DE GESTIÓN DE CALIDAD",
    "creado_en": " 2026-01-01 12:00:00+00",
    "editado_en": " 2026-01-01 12:00:00+00",
    "is_deleted": "False",
    "id_categoria": "12"
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
} */

// ======================================================
// NUEVA ESTRUCTURA (desde Excel)
// Archivo: "Anexos nuevo sistema de er.xlsx"
// Hoja: "anexosfinal"
// ======================================================

export const categoria_anexos = [
  { id: "1", nombre_categoria: "ARCHIVOS DOCUMENTALES E INFORMATICOS" },
  { id: "2", nombre_categoria: "ASUNTOS GENERALES" },
  { id: "3", nombre_categoria: "ASUNTOS RELEVANTES EN TRAMITE DE ATENCION" },
  { id: "4", nombre_categoria: "CONVENIOS Y CONTRATOS" },
  { id: "5", nombre_categoria: "CONTROL Y FISCALIZACION" },
  { id: "6", nombre_categoria: "DERECHOS Y OBLIGACIONES" },
  { id: "7", nombre_categoria: "ORGANIZACION" },
  { id: "8", nombre_categoria: "MARCO JURIDICO" },
  { id: "9", nombre_categoria: "OBRAS PUBLICAS" },
  { id: "10", nombre_categoria: "RECURSOS MATERIALES" },
  { id: "11", nombre_categoria: "PLANEACION" },
  { id: "12", nombre_categoria: "RECURSOS PRESUPUESTALES Y FINANCIEROS" },
  { id: "13", nombre_categoria: "RECURSOS HUMANOS" },
  { id: "14", nombre_categoria: "TRANSPARENCIA Y ACCESO A LA INFORMACION" },
  { id: "15", nombre_categoria: "SISTEMA DE GESTION DE CALIDAD" }
] as const;


export const claves_anexos = [
  // 1) ARCHIVOS DOCUMENTALES E INFORMATICOS
  { id: "1", clave: "ADI01", descripcion: "RESPALDOS DE INFORMACION EN MEDIOS MAGNETICOS", id_categoria: "1" },
  { id: "2", clave: "ADI02", descripcion: "INVENTARIO DE ACERVO BIBLIOGRAFICOS Y HEMEROGRAFICOS", id_categoria: "1" },

  // 2) ASUNTOS GENERALES
  { id: "3", clave: "AG01", descripcion: "CORTE DE FORMAS Y FOLIADAS", id_categoria: "2" },
  { id: "4", clave: "AG02", descripcion: "SELLOS OFICIALES", id_categoria: "2" },
  { id: "5", clave: "AG03", descripcion: "CLAVES O FIRMAS DE ACCESO A SISTEMAS DE PROCESOS Y DE SEGURIDAD PARA SU OPERACION", id_categoria: "2" },
  { id: "6", clave: "AG04", descripcion: "CANCELACION DE FIRMAS O CLAVES ELECTRONICAS", id_categoria: "2" },

  // 3) ASUNTOS RELEVANTES EN TRAMITE DE ATENCION
  { id: "7", clave: "AR01", descripcion: "ASUNTOS RELEVANTES EN TRAMITE DE ATENCION", id_categoria: "3" },

  // 4) CONVENIOS Y CONTRATOS
  { id: "8", clave: "CC01", descripcion: "CONTRATOS Y CONVENIOS VIGENTES", id_categoria: "4" },
  { id: "9", clave: "CC02", descripcion: "CONVENIOS DE COORDINACION CON INSTANCIAS FEDERALES, ESTATALES, MUNICIPALES E INICIATIVA PRIVADA", id_categoria: "4" },
  { id: "10", clave: "CC03", descripcion: "RELACION DE CONTRATOS DE FIDEICOMISOS", id_categoria: "4" },

  // 5) CONTROL Y FISCALIZACION
  { id: "11", clave: "CF01", descripcion: "LICITACIONES EN TRAMITES DE BIENES Y SERVICIOS", id_categoria: "5" },
  { id: "12", clave: "CF02", descripcion: "ASUNTOS EN TRAMITE DE NATURALEZA JURIDICA", id_categoria: "5" },

  // 6) DERECHOS Y OBLIGACIONES
  { id: "13", clave: "DO01", descripcion: "PODERES OTORGADOS", id_categoria: "6" },
  { id: "14", clave: "DO02", descripcion: "ACUERDO DE ORGANOS DE GOBIERNO", id_categoria: "6" },
  { id: "15", clave: "DO03", descripcion: "OBSERVACIONES DE AUDITORIA PENDIENTES DE SOLVENTAR", id_categoria: "6" },
  { id: "16", clave: "DO04", descripcion: "REPRESENTACIONES Y CARGOS HONORIFICOS VIGENTES", id_categoria: "6" },

  // 7) ORGANIZACION
  { id: "17", clave: "EO01", descripcion: "ORGANIGRAMA GENERAL", id_categoria: "7" },
  { id: "18", clave: "EO02", descripcion: "REGLAMENTO INTERIOR Y MANUALES GENERALES", id_categoria: "7" },
  { id: "19", clave: "IG01", descripcion: "RELACION DE ARCHIVOS DE TRAMITE Y CONCENTRACION", id_categoria: "7" },
  { id: "20", clave: "IG02", descripcion: "ACTAS DE CONSEJO", id_categoria: "7" },

  // 8) MARCO JURIDICO
  { id: "21", clave: "MJ01", descripcion: "ADMINISTRATIVO DE ACTUACION", id_categoria: "8" },

  // 9) OBRAS PUBLICAS
  { id: "22", clave: "PO01", descripcion: "PROGRAMA ANUAL DE OBRA PUBLICA", id_categoria: "9" },
  { id: "23", clave: "OP02", descripcion: "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA POR CONTRATO Y SU CONTENIDO", id_categoria: "9" },
  { id: "24", clave: "OP03", descripcion: "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA POR ADMINISTRACION DIRECTA Y SU CONTENIDO", id_categoria: "9" },
  { id: "25", clave: "OP04", descripcion: "LICITACIONES DE OBRA EN TRAMITE", id_categoria: "9" },

  // 10) RECURSOS MATERIALES
  { id: "26", clave: "PPA01", descripcion: "PROGRAMA ANUAL DE ADQUISICIONES", id_categoria: "10" },

  // 11) PLANEACION
  { id: "27", clave: "PP01", descripcion: "PROGRAMA OPERATIVO ANUAL", id_categoria: "11" },
  { id: "28", clave: "PP02", descripcion: "OTROS PROGRAMAS", id_categoria: "11" }, // <-- corregido (antes venía PP01 duplicado)

  // 12) RECURSOS PRESUPUESTALES Y FINANCIEROS
  { id: "29", clave: "RF01", descripcion: "PRESUPUESTO AUTORIZADO Y EJERCIDO", id_categoria: "12" },
  { id: "30", clave: "RF02", descripcion: "PRESUPUESTO DE OTROS INGRESOS Y EGRESOS PROPIOS", id_categoria: "12" },
  { id: "31", clave: "RF03", descripcion: "RECURSOS FEDERALES RECIBIDOS", id_categoria: "12" },
  { id: "32", clave: "RF04", descripcion: "PRESUPUESTO PARA PROGRAMAS ESPECIALES", id_categoria: "12" },
  { id: "33", clave: "RF05", descripcion: "RELACION DE CUENTAS BANCARIAS", id_categoria: "12" },
  { id: "34", clave: "RF06", descripcion: "CONFORMACION DEL FONDO REVOLVENTE", id_categoria: "12" },
  { id: "35", clave: "RF07", descripcion: "RELACION DE CONTRARECIBOS PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS", id_categoria: "12" },
  { id: "36", clave: "RF08", descripcion: "RELACION DE CHEQUES PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS", id_categoria: "12" },
  { id: "37", clave: "RF09", descripcion: "INGRESOS POR DEPOSITAR", id_categoria: "12" },
  { id: "38", clave: "RF10", descripcion: "SOLICITUDES DE CANCELACIONES DE FIRMAS", id_categoria: "12" },
  { id: "39", clave: "RF11", descripcion: "RELACION DE CUENTAS POR COBRAR", id_categoria: "12" },
  { id: "40", clave: "RF12", descripcion: "RELACION DE CUENTAS POR PAGAR (PASIVOS)", id_categoria: "12" },
  { id: "41", clave: "RF13", descripcion: "RELACIONES DE IMPUESTOS Y CONTRIBUCIONES PENDIENTES DE PAGO", id_categoria: "12" },
  { id: "42", clave: "RF14", descripcion: "POLIZAS DE SEGUROS VIGENTES", id_categoria: "12" },
  { id: "43", clave: "RF15", descripcion: "FIANZAS Y GARANTIAS VIGENTES", id_categoria: "12" },
  { id: "44", clave: "RF16", descripcion: "RELACION DE CONVENIOS Y CONTRATOS DE BIENES Y SERVICIOS VIGENTES", id_categoria: "12" },
  { id: "45", clave: "RF17", descripcion: "RELACION DE LIBROS Y REGISTROS DE CONTABILIDAD", id_categoria: "12" },
  { id: "46", clave: "RF18", descripcion: "ESTADOS FINANCIEROS", id_categoria: "12" },

  // 13) RECURSOS HUMANOS
  { id: "47", clave: "RH01", descripcion: "PLANTILLA DE PERSONAL DE BASE", id_categoria: "13" },
  { id: "48", clave: "RH02", descripcion: "PLANTILLA DE PERSONAL DE APOYO", id_categoria: "13" },
  { id: "49", clave: "RH03", descripcion: "PLANTILLA DE PERSONAL COMISIONADO", id_categoria: "13" },
  { id: "50", clave: "RH04", descripcion: "PERSONAL HONORARIOS", id_categoria: "13" },

  // 10) RECURSOS MATERIALES (continúa)
  { id: "51", clave: "RM01", descripcion: "INVENTARIO DE MOBILIARIO Y EQUIPO DE OFICINA", id_categoria: "10" },
  { id: "52", clave: "RM02", descripcion: "INVENTARIO DE VEHICULOS", id_categoria: "10" },
  { id: "53", clave: "RM03", descripcion: "INVENTARIO DE MAQUINARIA Y EQUIPO", id_categoria: "10" },
  { id: "54", clave: "RM04", descripcion: "EXISTENCIA EN ALMACENES", id_categoria: "10" },
  { id: "55", clave: "RM05", descripcion: "INVENTARIO DE BIENES EN COMODATO", id_categoria: "10" },
  { id: "56", clave: "RM06", descripcion: "INVENTARIO DE BIENES INMUEBLES EN POSESION DE LA DEPENDENCIA Y/O ENTIDAD", id_categoria: "10" },
  { id: "57", clave: "RM07", descripcion: "RESERVA TERRITORIAL", id_categoria: "10" },
  { id: "58", clave: "RM08", descripcion: "INVENTARIO DE OBRAS DE ARTE Y ARTICULOS DE DECORACION", id_categoria: "10" },
  { id: "59", clave: "RM09", descripcion: "EXISTENCIA DE PLANTAS DE VIVERO", id_categoria: "10" },
  { id: "60", clave: "RM10", descripcion: "INVENTARIO FAUNISTICO POR ESPECIMEN", id_categoria: "10" },
  { id: "61", clave: "RM11", descripcion: "INVENTARIO DE ANIMALES TAXIDERMIZADOS", id_categoria: "10" },
  { id: "62", clave: "RM12", descripcion: "INVENTARIO DE EQUIPO DE ARMAMENTO, ACCESORIOS DE SEGURIDAD Y MUNICIONES", id_categoria: "10" },
  { id: "63", clave: "RM13", descripcion: "INVENTARIO DE PAQUETES COMPUTACIONALES ADQUIRIDOS", id_categoria: "10" },
  { id: "64", clave: "RM14", descripcion: "INVENTARIO DE SISTEMAS Y PROGRAMAS DESARROLLADOS Y/O EN DESARRROLLO", id_categoria: "10" },
  { id: "65", clave: "RM15", descripcion: "INVENTARIO DE EQUIPOS DE COMUNICACIONES Y TELECOMUNICACIONES", id_categoria: "10" },
  { id: "66", clave: "RM16", descripcion: "RELACION DE LLAVES DE LA DEPENDENCIA", id_categoria: "10" },

  // 14) TRANSPARENCIA Y ACCESO A LA INFORMACION
  { id: "67", clave: "TAI01", descripcion: "TRANSPARENCIA Y ACCESO A LA INFORMACION", id_categoria: "14" },

  // 15) SISTEMA DE GESTION DE CALIDAD
  { id: "68", clave: "SGC01", descripcion: "SISTEMA DE GESTION DE CALIDAD", id_categoria: "15" },
  { id: "69", clave: "SGC02", descripcion: "", id_categoria: "15" } // <-- corregido (antes venía SCG02)
] as const;

// ======================================================
// ENUM + LABELS (opcional pero recomendado en tu app)
// ======================================================

export enum CategoriaEnum {
  ARCHIVOS_DOCUMENTALES_E_INFORMATICOS = "1",
  ASUNTOS_GENERALES = "2",
  ASUNTOS_RELEVANTES_EN_TRAMITE_DE_ATENCION = "3",
  CONVENIOS_Y_CONTRATOS = "4",
  CONTROL_Y_FISCALIZACION = "5",
  DERECHOS_Y_OBLIGACIONES = "6",
  ORGANIZACION = "7",
  MARCO_JURIDICO = "8",
  OBRAS_PUBLICAS = "9",
  RECURSOS_MATERIALES = "10",
  PLANEACION = "11",
  RECURSOS_PRESUPUESTALES_Y_FINANCIEROS = "12",
  RECURSOS_HUMANOS = "13",
  TRANSPARENCIA_Y_ACCESO_A_LA_INFORMACION = "14",
  SISTEMA_DE_GESTION_DE_CALIDAD = "15"
}

export const CategoriaLabels: Record<string, string> = {
  "1": "ARCHIVOS DOCUMENTALES E INFORMATICOS",
  "2": "ASUNTOS GENERALES",
  "3": "ASUNTOS RELEVANTES EN TRAMITE DE ATENCION",
  "4": "CONVENIOS Y CONTRATOS",
  "5": "CONTROL Y FISCALIZACION",
  "6": "DERECHOS Y OBLIGACIONES",
  "7": "ORGANIZACION",
  "8": "MARCO JURIDICO",
  "9": "OBRAS PUBLICAS",
  "10": "RECURSOS MATERIALES",
  "11": "PLANEACION",
  "12": "RECURSOS PRESUPUESTALES Y FINANCIEROS",
  "13": "RECURSOS HUMANOS",
  "14": "TRANSPARENCIA Y ACCESO A LA INFORMACION",
  "15": "SISTEMA DE GESTION DE CALIDAD"
};

// campos de la tabla editable
const ESTRUCTURA_DATOS_POR_CLAVE: Record<string, Array<{ campo: string; tipo: string; obligatorio?: boolean; Descripcion?: string }>> = {
  // Marco Jurídico (MJ01)
  MJ01: [
    { campo : "Ordenamiento", tipo: "string", obligatorio: true, Descripcion: "Ordenamiento Jurídico Aplicable" },
    {campo:"Titulo", tipo: "string", obligatorio: true, Descripcion: "Título del Asunto Relevante"},
    {campo:"Fecha de emision", tipo: "string", obligatorio: true, Descripcion: "Fecha de emisión del documento que sustenta el asunto relevante"},
  ]
  ,
  // Planeacion (PP01)
  PP01: [
    { campo: "Tipo de Documento", tipo: "string", obligatorio: true, Descripcion: "Nombre del programa" },
    {campo:"Nombre ", tipo: "string", obligatorio: true, Descripcion: "Descripción del programa"},
    {campo:"Fecha", tipo: "string", obligatorio: true, Descripcion: "Fecha de emisión del programa"},
    {campo:"Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el programa"},
  ],

  //Derechos y Obligaciones (DO01-DO04)
  DO01: [
    {campo:"Nombre y puesto del servidor que otirga el poder", tipo: "string", obligatorio: true, Descripcion: "Nombre y puesto del servidor que otorga el poder"},
    {campo:"Tipo de poder otorgado", tipo: "string", obligatorio: true, Descripcion: "Tipo de poder otorgado"},
    {campo:"Especificar", tipo: "string", obligatorio: true, Descripcion: "Fecha de otorgamiento del poder"},
    {campo:"Fecha de Expediciónn", tipo: "string", obligatorio: true, Descripcion: "Fecha de expedición del poder"},
    {campo:"Notario Público que autoriza el poder", tipo: "string", obligatorio: true, Descripcion: "Notario Público que autoriza el poder"},
    {campo:"Inscrito en el Registro Público de la Propiedad y del Comercio", tipo: "string", obligatorio: true, Descripcion: "Número de inscripción en el Registro Público de la Propiedad y del Comercio"},
    {campo:"Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el poder otorgado"},
  ],

  DO02: [
    {campo:"Numero de sesion", tipo: "string", obligatorio: true, Descripcion: "Número de sesión"},
    {campo:"Fecha de sesion", tipo: "string", obligatorio: true, Descripcion: "Fecha de la sesión"},
    {campo:"Ordinaria o Extraordinaria", tipo: "string", obligatorio: true, Descripcion: "Tipo de sesión (Ordinaria o Extraordinaria)"},
    {campo:"Acuerdos tomados", tipo: "string", obligatorio: true, Descripcion: "Descripción de los acuerdos tomados en la sesión"},
    {campo:"Descripcion de los acuerdos", tipo: "string", obligatorio: true, Descripcion: "Descripción detallada de los acuerdos tomados en la sesión"},
    {campo:"Responsable de los acuerdos", tipo: "string", obligatorio: true, Descripcion: "Nombre del responsable de dar seguimiento a los acuerdos"},
    {campo:"Áreas involucradas", tipo: "string", obligatorio: true, Descripcion: "Áreas involucradas en el seguimiento de los acuerdos"},
    {campo:"Porcentaje de avance", tipo: "number", obligatorio: true, Descripcion: "Porcentaje de avance en el seguimiento de los acuerdos"},
    {campo:"Comentarios", tipo: "string", obligatorio: false, Descripcion: "Comentarios adicionales sobre el seguimiento de los acuerdos"},
  ],
  DO03: [],
  DO04: [],
  
  RF01: [
    { campo: "partida", tipo: "string", obligatorio: true, Descripcion: "Partida Presupuestal" },
    { campo: "Denominacion", tipo: "string", obligatorio: true, Descripcion: "Denominación de la partida" },
    { campo: "Presupuesto_Autorizado", tipo: "number", obligatorio: true, Descripcion: "Monto Aprobado" },
    { campo: "Presupuesto_Modificado", tipo: "number", obligatorio: false, Descripcion: "Monto Modificado" },
    { campo: "Presupuesto_Ejercido", tipo: "number", obligatorio: false, Descripcion: "Monto Ejercido" },
    { campo: "Presupuesto_Por_Ejercer", tipo: "number", obligatorio: false, Descripcion: "Monto por Ejercer" },
  ],
}

/**
 * 
 * @param clave - Clave del Anexo (ej. AR01, DA01, etc.)
 * @param datos - Arrray de objetos con los datos del anexo ingresados por el usuario
 * @param estructura - Objeto ESTRUCTURA_DATOS_POR_CLAVE que define los campos esperados para cada clave
 * @returns - { valido: boolean, errores: string[] } 
 */

export function validarDatosAnexo(
  clave: string,
  datos: Record<string, any>[],
  estructura: Record<string, Array<{
    campo: string;
    tipo: 'string' | 'number';
    obligatorio: boolean;
    Descripcion: string;
  }>>
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  // Verificar que exista la estructura para esa clave
  const camposEsperados = estructura[clave];
  if (!camposEsperados || !Array.isArray(camposEsperados)) {
    return {
      valido: false,
      errores: [`No se encontró la estructura para la clave: ${clave}`]
    };
  }

  // Mapear nombres de campos esperados para comparación rápida
  const nombresCamposEsperados = new Set(camposEsperados.map(c => c.campo));

  // Recorrer cada fila de datos
  for (let i = 0; i < datos.length; i++) {
    const fila = datos[i];

    // Validar que todos los campos esperados estén presentes (aunque sean vacíos)
    for (const def of camposEsperados) {
      const { campo, tipo, obligatorio, Descripcion } = def;
      const valor = fila[campo];

      // Caso 1: campo faltante
      if (!(campo in fila)) {
        errores.push(`Fila ${i + 1}: Falta el campo "${campo}" (${Descripcion})`);
        continue;
      }

      // Caso 2: campo obligatorio y vacío
      if (obligatorio && (valor === "" || valor == null)) {
        errores.push(`Fila ${i + 1}: El campo "${campo}" (${Descripcion}) es obligatorio`);
        continue;
      }

      // Caso 3: campo no obligatorio y vacío → aceptable, saltar validación de tipo
      if (valor === "" || valor == null) {
        continue;
      }

      // Caso 4: validación de tipo
      if (tipo === 'number') {
        const num = Number(valor);
        if (isNaN(num) || String(valor).trim() === "") {
          errores.push(`Fila ${i + 1}: El campo "${campo}" (${Descripcion}) debe ser un número válido. Valor recibido: "${valor}"`);
        }
      } else if (tipo === 'string') {
        // Cualquier cosa que no sea number se trata como string (incluyendo fechas)
        // No hay validación adicional, ya que incluso "123" es string válido si se espera string
        // Pero podrías agregar validación de formato de fecha si lo deseas más adelante
      }
    }

    // Validar que no haya campos extra (opcional, pero útil para detectar errores de mapeo)
    const camposExtras = Object.keys(fila).filter(k => !nombresCamposEsperados.has(k));
    if (camposExtras.length > 0) {
      errores.push(`Fila ${i + 1}: Campos no esperados: ${camposExtras.join(', ')}`);
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
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
  const [unidadResponsable, setUnidadResponsable] = useState<number>()
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
  const [selectedCategory, setSelectedCategory] = useState<string>("__all__")
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
  const [currentPage, setCurrentPage] = useState(1);
  const [unidadToShow, setUnidadToShow] = useState<string>("");
  const [creatorToShow, setCreatorToShow] = useState<string>("");
  const rowsPerPage = 5;
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [anexoParaActualizar, setAnexoParaActualizar] = useState<Anexo | null>(null);
  const [todosLosAnexos, setTodosLosAnexos] = useState<Anexo[]>([]); // Estado para todos los anexos
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Función para filtrar anexos por categoría
  const [filterCategory, setFilterCategory] = useState<string>("__all__");
  const [formCategory, setFormCategory] = useState<string>("");

  // Calcular filas actuales
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = datos.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(datos.length / rowsPerPage);

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  // Primer UseEffect
  useEffect(() => {
    setCurrentPage(1); // Reiniciar a la primera página al cambiar los datos
  }, [datos]);


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
        console.log("Unidad responsable:", unidad.id_unidad, "Nombre:", unidad.nombre);
        setUnidadResponsable(unidad.id_unidad);
        setUnidadToShow(unidad.nombre);
        setCreatorToShow(unidad.responsable.nombre);
        setValue("unidad_responsable_id", unidad.id_unidad);
        setValue("creador_id", currentUserId!);
      } catch (error) {
        console.error("Error al obtener la unidad responsable:", error);
      }
    };

    if (currentUserId) {
      obtenerUnidad();
    }

    // 3.1 validacion tipos de excel 


    // 4. Obtener anexos
    // Obtener y filtrar anexos
    getAnexos()
      .then((data) => {
        setTodosLosAnexos(data); // Guardar todos los anexos
        const filtrados = data.filter((anexo: Anexo) => anexo.creador_id === currentUserId);
        setAnexos(filtrados);
      })
      .catch((error) => {
        console.error("Error al obtener anexos:", error);
        toast.error("No se pudieron cargar los anexos");
      });



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



  // handleSubmit primero
  /* const onSubmit: SubmitHandler<IFormInput> = (data) => {
  
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
  
      // validacion si el campo datos no existe
      const datosValidos = Array.isArray(data.datos)
        ? data.datos.length > 0
        : Object.keys(data.datos || {}).length > 0;
  
      if (!datosValidos) {
        toast.error("El campo 'datos' no puede estar vacío.");
        return;
      }
  
      // Validación: ¿Ya existe un anexco con esa clave?
      if (yaTieneAnexoConClave(data.clave, anexos, userid)) {
        toast.error(`Ya existe un anexo con la clave ${data.clave}`);
        return;
      }
  
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
    }; */

  // handlesubmit modificado 
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    // Aseguramos que `datos` sea un array válido
    const datosArray = Array.isArray(data.datos) ? data.datos : [data.datos];
    const datosValidos = datosArray.length > 0 && (
      datosArray.some(item => item && Object.keys(item).length > 0)
    );

    if (!datosValidos) {
      toast.error("El campo 'datos' no puede estar vacío.");
      return;
    }

    const payload = {
      clave: data.clave,
      categoria: data.categoria,
      creador_id: userid,
      unidad_responsable_id: unidadResponsable,
      fecha_creacion: new Date(data.fecha_creacion).toISOString(),
      estado: data.estado,
      datos: datosArray,
    };

    console.log("✅ Payload final a enviar:", payload);

    // Si NO estamos editando → validamos duplicados
    if (!editingAnexo && yaTieneAnexoConClave(data.clave, anexos, userid)) {
      toast.error(`Ya existe un anexo con la clave ${data.clave}`);
      return;
    }

    const url = editingAnexo
      ? `${API_URL}/anexos/${editingAnexo.id}` // PUT
      : `${API_URL}/anexos`;                   // POST

    const method = editingAnexo ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Error en la operación");
        }
        return res.json();
      })
      .then((result) => {
        const message = editingAnexo ? "Anexo actualizado" : "Anexo creado";
        toast.success(message, { description: `Clave: ${result.clave}` });

        // Actualizar lista local
        if (editingAnexo) {
          setAnexos((prev) =>
            prev.map((a) => (a.id === result.id ? result : a))
          );
        } else {
          setAnexos((prev) => [...prev, result]);
        }

        // Resetear formulario
        reset();
        setDatos([]);
        setEditingAnexo(null);
        setActiveTab("anexos");
      })
      .catch((err) => {
        toast.error("Error", { description: err.message || "Operación fallida" });
        console.error(err);
      });
  };


  // cambiar el estado del anexo
  /*  const toggleAnexoEstado = async (anexo: Anexo) => {
     let nuevoEstado: string;
 
     if (anexo.estado === "Borrador") {
       nuevoEstado = "Revisión";
     } else if (anexo.estado === "Revisión") {
       nuevoEstado = "Completado";
     } else if (anexo.estado === "Completado") {
       toast.warning("🔒 Anexo cerrado", {
         description: "Para reabrirlo se requiere justificación ante el administrador.",
       });
       return;
     } else {
       toast.error("Estado no válido");
       return;
     }
 
     if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;
 
     try {
       const response = await fetch(`${API_URL}/anexos/${anexo.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...anexo, estado: nuevoEstado }),
       });
 
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.detail || "Error al actualizar el estado");
       }
 
       const updatedAnexo = await response.json();
       setAnexos((prev) =>
         prev.map((a) => (a.id === updatedAnexo.id ? updatedAnexo : a))
       );
 
       toast.success("✅ Estado actualizado", {
         description: `El anexo ahora está en "${nuevoEstado}".`,
       });
     } catch (err: any) {
       console.error("Error al actualizar estado:", err);
       toast.error("❌ No se pudo actualizar el estado", {
         description: err.message || "Inténtalo de nuevo.",
       });
     }
   };
  */

  // manejar el cambio de archivo
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

  // manejar la edicion de anexos ----------------------------------------------------------------------------------------------------------------------
  const handleEdit = async (anexo: Anexo) => {

    // verificar si el usuario puede editar
    const fetchd = await fetchAnexoById(anexo.id);

    // validar si se obtuvo el anexo
    if (!fetchd) {
      toast.error("No se pudo cargar el anexo para edición");
      return;
    }

    // llenar el formulario
    setValue("clave", fetchd.clave);
    setValue("categoria", fetchd.categoria);
    setValue("fecha_creacion", fetchd.fecha_creacion.split("T")[0]);
    setValue("estado", fetchd.estado);
    setValue("unidad_responsable_id", fetchd.unidad_responsable_id);
    setValue("creador_id", fetchd.creador_id);

    // actualizar los datos
    const datosArray = Array.isArray(fetchd.datos) ? fetchd.datos : [fetchd.datos];
    setDatos(datosArray);

    // guardar el id del anexo en edicion
    setEditingAnexo(fetchd);

    // cambiar a la pestaña de formulario
    setActiveTab("nuevoAnexo");
    //setShowForm(true);

  }

  const checkedOutAnexo = () => {
    toast("Función de check-out aún no implementada", {
      description: "Próximamente podrás hacer check-out de anexos.",
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
    return ["PP01", "SGC01", "EO01", "PPA01"].includes(clave.toUpperCase().trim());
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

  const handleAbrirDialogo = (anexo: Anexo) => {
    if (anexo.estado === "Completado") {
      toast.warning("🔒 Anexo cerrado", {
        description: "Para reabrirlo se requiere justificación ante el administrador."
      });
      return;
    }
    setAnexoParaActualizar(anexo);
    setDialogOpen(true);
  };

  const handleConfirmCambioEstado = async () => {
    if (!anexoParaActualizar) return;

    let nuevoEstado: string;
    if (anexoParaActualizar.estado === "Borrador") {
      nuevoEstado = "Revisión";
    }
    else if (anexoParaActualizar.estado === "Revisión") {
      nuevoEstado = "Completado";
    }
    else {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/anexos/${anexoParaActualizar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...anexoParaActualizar, estado: nuevoEstado }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al actualizar el estado");
      }

      const updatedAnexo = await response.json();
      setAnexos((prev) =>
        prev.map((a) => (a.id === updatedAnexo.id ? updatedAnexo : a))
      );

      toast.success("✅ Estado actualizado", {
        description: `El anexo ahora está en "${nuevoEstado}".`,
      });
    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      toast.error("❌ No se pudo actualizar el estado", {
        description: err.message || "Inténtalo de nuevo.",
      });
    } finally {
      setDialogOpen(false);
      setAnexoParaActualizar(null);
    }

  }



  // manejo de edicion de anexos por usuario y por unidad responsable
  const canEdit = (anexo: Anexo): boolean => {
    // Si el estado es "Cerrado", nadie puede editar
    if (anexo.estado === "Completado") return false;
    // convertir el boton en desabilidato


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
              <TabsTrigger value="nuevoAnexo">Nuevo Anexo</TabsTrigger>
              {userrole === "ADMIN" &&(
                <TabsTrigger value="anexosPorUsuario">Anexos por usuario</TabsTrigger>
              )}
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
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full">
                  <div className="flex flex-wrap gap-2">
                    {/* Botón Nuevo Anexo */}
                    <Button
                      style={{ backgroundColor: "#24356B", color: "white" }}
                      className="min-w-[48px] flex items-center justify-center text-xs sm:text-sm"
                      onClick={() => setActiveTab("nuevoAnexo")}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Nuevo Anexo</span>
                    </Button>

                    {/* Botón Exportar PDF */}
                    <Button
                      variant="outline"
                      onClick={() => exportAnexosToPDF(anexos)}
                      className="min-w-[48px] flex items-center justify-center text-xs sm:text-sm border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Exportar PDF</span>
                    </Button>

                    {/* Botón Exportar Excel */}
                    <Button
                      variant="outline"
                      onClick={() => exportAnexosToExcel(anexos)}
                      className="min-w-[48px] flex items-center justify-center text-xs sm:text-sm border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Exportar Excel</span>
                    </Button>
                  </div>

                  {/* Selector de Categoría colocado junto a botones de export */}
                  <div className="ml-auto w-64">
                    <Label className="sr-only">Filtrar por categoría</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value: string) => {
                        setSelectedCategory(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas las categorías</SelectItem>
                        {categoria_anexos.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.nombre_categoria}>
                            {categoria.nombre_categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <br />
                
                  <Card className="w-full">
                    <CardHeader className="p-3 sm:p-6 flex justify-between items-center">
                      <div>
                        <CardTitle>Lista de Anexos</CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 sm:p-4">
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <Table className="min-w-full text-sm divide-y divide-gray-200">
                          {/* Encabezado: visible solo en pantallas md+ */}
                          <TableHeader className="bg-gray-50 hidden md:table-header-group">
                            <TableRow>
                              <TableHead className="px-4 py-3 text-left uppercase tracking-wider">
                                Clave
                              </TableHead>
                              <TableHead className="px-4 py-3 text-left uppercase tracking-wider">
                                Estado
                              </TableHead>
                              <TableHead className="px-4 py-3 text-left uppercase tracking-wider">
                                Fecha
                              </TableHead>
                              <TableHead className="px-4 py-3 text-left uppercase tracking-wider">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          {/* Cuerpo de tabla / tarjetas responsivas */}
                          <TableBody className="divide-y divide-gray-200">
                            {(selectedCategory && selectedCategory !== "__all__" ? anexos.filter(a => a.categoria === selectedCategory) : anexos).map((anexo) => (
                              <TableRow
                                key={anexo.id}
                                className="md:table-row flex flex-col md:flex-row md:table-row border md:border-0 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none"
                              >
                                {/* Clave */}
                                <TableCell className="px-4 py-4 md:table-cell">
                                  <div className="md:hidden font-semibold text-gray-500">Clave</div>
                                  <div className="font-medium text-gray-900">{anexo.clave}</div>
                                </TableCell>

                                {/* Estado */}
                                <TableCell className="px-4 py-4 md:table-cell">
                                  <div className="md:hidden font-semibold text-gray-500">Estado</div>
                                  <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                                      anexo.estado
                                    )}`}
                                  >
                                    {anexo.estado}
                                  </span>
                                </TableCell>

                                {/* Fecha */}
                                <TableCell className="px-4 py-4 md:table-cell">
                                  <div className="md:hidden font-semibold text-gray-500">Fecha</div>
                                  <div className="text-gray-800">
                                    {new Date(anexo.fecha_creacion).toLocaleDateString('es-MX', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                </TableCell>

                                {/* Acciones */}
                                <TableCell className="px-4 py-4 flex gap-3 md:table-cell">
                                  <div className="md:hidden font-semibold text-gray-500 mb-1">
                                    Acciones
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(anexo.id)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {canEdit(anexo) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(anexo)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/anexos/${anexo.id}`)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >

                                    <Eye className="h-4 w-4" />
                                  </Button>


                                  {/* <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAnexoEstado(anexo)}
                                    className={
                                      anexo.estado === "Completado"
                                        ? "text-green-600 hover:text-green-800"
                                        : "text-gray-600 hover:text-gray-800"
                                    }
                                    title={
                                      anexo.estado === "Borrador"
                                        ? "Enviar a revisión"
                                        : anexo.estado === "Revisión"
                                          ? "Marcar como completado"
                                          : "Anexo cerrado"
                                    }
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button> */}

                                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAbrirDialogo(anexo)}
                                        className={
                                          anexo.estado === "Completado"
                                            ? "text-green-600 hover:text-green-800"
                                            : "text-gray-600 hover:text-gray-800"
                                        }
                                        title={
                                          anexo.estado === "Borrador"
                                            ? "Enviar a revisión"
                                            : anexo.estado === "Revisión"
                                              ? "Marcar como completado"
                                              : "Anexo cerrado"
                                        }
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    {anexoParaActualizar && (
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            {anexoParaActualizar.estado === "Borrador"
                                              ? "¿Enviar a revisión?"
                                              : "¿Marcar como completado?"}
                                          </DialogTitle>
                                          <DialogDescription>
                                            {anexoParaActualizar.estado === "Borrador"
                                              ? "El anexo será enviado a revisión y ya no podrás editarlo libremente."
                                              : "Esta acción es irreversible. El anexo quedará cerrado y no podrá modificarse sin justificación."}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => setDialogOpen(false)}
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            style={{ backgroundColor: "#24356B", color: "white" }}
                                            onClick={handleConfirmCambioEstado}
                                          >
                                            Confirmar
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    )}
                                  </Dialog>


                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
              
              </main>

            </TabsContent>

            <TabsContent value="nuevoAnexo" className="mt-4 sm:mt-6 md:mt-8">
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
                    {/* Categoría (selector) */}
                    <div className="space-y-2 col-span-6 grid-cols-3">
                      <Label>Categoría</Label>
                      <div className="text-sm text-gray-500 border border-gray-300 mb-1 ">
                        <select
                          {...register("categoria", { required: "Categoría es obligatoria" })}
                          className="w-full text-sm p-2 sm:p-2 md:p-2 border border-gray-300 "
                          onChange={(e) => {
                            const categoriaSeleccionada = e.target.value;
                            setValue("categoria", categoriaSeleccionada);
                            setSelectedCategory?.(categoriaSeleccionada);
                            // limpiar clave y datos al cambiar de categoría
                            setValue("clave", "");
                            setDatos([]);
                          }}
                        >
                          <option value="">Selecciona una categoría</option>
                          {categoria_anexos.map((c) => (
                            <option key={c.id} value={c.nombre_categoria}>
                              {c.nombre_categoria}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.categoria && (
                        <p className="text-sm text-red-600">{errors.categoria.message}</p>
                      )}
                    </div>

                    {/* Clave del Anexo (filtrada por categoría) */}
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
                              setSelectedCategory?.(categoria);
                            }
                          }}
                          disabled={!watch("categoria")}
                        >
                          <option value="">Selecciona una clave</option>
                          {claves_anexos
                            .filter(k => k.id_categoria === categoria_anexos.find(c => c.nombre_categoria === watch("categoria"))?.id)
                            .map((k) => (
                              <option key={k.id} value={k.clave}>
                                {k.clave} - {k.descripcion}
                              </option>
                            ))}
                        </select>
                      </div>

                      {watch("clave") && (

                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                          size="sm"
                          onClick={() => {
                            try {
                              generarPlantillaPorClave(watch("clave"));
                              toast.success("✅ Plantilla generada correctamente");
                            } catch (error) {
                              toast.error("❌ Error al generar la plantilla");
                            }
                          }}>
                          Descargar Plantilla
                        </Button>
                      )}

                      {errors.clave && (
                        <p className="text-sm text-red-600">{errors.clave.message}</p>
                      )}
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
                        <option value="Completado">Cerrado</option>
                        <option value="Revisión">Revisión</option>
                      </select>
                      {errors.estado && (
                        <p className="text-sm text-red-600">{errors.estado.message}</p>
                      )}
                    </div>
                    <div className="space-y-2 col-span-6 grid-cols-3">


                      {/* Campos ocultos */}
                      <Label>Creador</Label>
                      <div className="space-y-2 text-sm text-gray-500 mb-1">
                        <label htmlFor="Id Creador"> {creatorToShow} </label>
                        <input className="w-full p-2 border border-gray-300 rounded-md" type="hidden" {...register("creador_id")} value={userid} />
                      </div>
                      <br />
                      <Label>Unidad Responsable</Label>
                      <div className="space-y-2 text-sm text-gray-500 mb-1">
                        <label htmlFor="Id Unidad responsable"> {unidadToShow} </label>
                        <input className="w-full p-2 border border-gray-300 rounded-md" type="hidden" {...register("unidad_responsable_id")} value={unidadResponsable} />
                      </div>
                    </div>
                    {/* Campos ocultos */}

                    {unidadToShow && unidadToShow != "0" && unidadToShow.trim() !== "" ? (
                      <>
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
                                      const datosPDF = [{ url: fileUrl }];
                                      setDatos(datosPDF);
                                      setValue("datos", datosPDF);
                                      toast.success("✅ PDF subido correctamente");
                                    }}
                                  />
                                  {datos.length > 0 && datos[0]?.url && (

                                    <div className="mt-4">

                                      <p className="text-sm text-gray-600">PDF cargado:</p>
                                      <a
                                        href={datos[0].url}
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

                                    {/* Botón para agregar fila */}
                                    <div className="flex justify-between items-center mb-2">
                                      <span>Tabla de datos</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const estructura = EstructuraDatosPorClave[watch("clave")] || [];
                                          const nuevaFila: Record<string, any> = {};
                                          estructura.forEach((campo) => (nuevaFila[campo] = ""));
                                          const nuevas = [...datos, nuevaFila];
                                          setDatos(nuevas);
                                          setValue("datos", nuevas);
                                        }}
                                        disabled={
                                          !watch("clave") ||
                                          yaTieneAnexoConClave(watch("clave"), anexos, userid, editingAnexo ? editingAnexo.id : undefined)
                                        }
                                        className={yaTieneAnexoConClave(watch("clave"), anexos, userid, editingAnexo ? editingAnexo.id : undefined) ? "opacity-50 cursor-not-allowed" : ""}
                                      >
                                        + Agregar fila
                                      </Button>

                                    </div>

                                    {/* Mensaje si no hay datos */}
                                    {datos.length === 0 ? (
                                      <p className="text-sm text-gray-500">No hay datos. Sube un archivo excel o agrega manualmente.</p>
                                    ) : (
                                      <>
                                        {/* Contenedor con scroll horizontal/vertical */}
                                        <div className="border border-gray-300 rounded-md overflow-hidden">
                                          <div className="max-h-60 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                              <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                  {Object.keys(datos[0]).map((key) => (
                                                    <th
                                                      key={key}
                                                      className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                                    >
                                                      {key.replace(/_/g, " ").toUpperCase()}
                                                    </th>
                                                  ))}
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Acciones
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                                {currentRows.map((fila, i) => {
                                                  const rowIndex = indexOfFirstRow + i;
                                                  return (
                                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                                      {Object.keys(fila).map((campo) => (
                                                        <td key={campo} className="px-3 py-2 whitespace-nowrap">
                                                          <input
                                                            type="text"
                                                            value={fila[campo]}
                                                            onChange={(e) => {
                                                              const nuevas = [...datos];
                                                              nuevas[rowIndex][campo] = e.target.value;
                                                              setDatos(nuevas);
                                                              setValue("datos", nuevas);
                                                            }}
                                                            className="w-full p-1 border rounded hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            disabled={yaTieneAnexoConClave(watch("clave"), anexos, userid, editingAnexo ? editingAnexo.id : undefined)}
                                                          />
                                                        </td>
                                                      ))}
                                                      <td className="px-3 py-2 whitespace-nowrap">
                                                        <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-red-500 hover:bg-red-50"
                                                          onClick={() => {
                                                            const nuevas = datos.filter((_, index) => index !== rowIndex);
                                                            setDatos(nuevas);
                                                            setValue("datos", nuevas);
                                                          }}
                                                          disabled={yaTieneAnexoConClave(watch("clave"), anexos, userid, editingAnexo ? editingAnexo.id : undefined)}
                                                        >
                                                          Eliminar
                                                        </Button>
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>

                                        {/* Paginación */}
                                        {totalPages > 1 && (
                                          <div className="flex justify-center mt-3 space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                              <Button
                                                type="button"
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => paginate(page)}
                                                className={currentPage === page ? "!bg-blue-600" : ""}
                                              >
                                                {page}
                                              </Button>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Subida de Excel */}
                                    <div className="mt-4">
                                      <ExcelUploader
                                        onUploadSuccess={async (excelData) => {
                                          const clave = watch("clave");
                                          if (!clave) {
                                            toast.error("Por favor, proporciona una clave válida.");
                                            return;
                                          }

                                          if (yaTieneAnexoConClave(clave, anexos, userid, editingAnexo ? editingAnexo.id : undefined)) {
                                            toast.warning(`Ya tienes un anexo con la clave ${clave}.`);
                                            return;
                                          }

                                          const estructura = EstructuraDatosPorClave[clave];
                                          if (!estructura) {
                                            toast.error("Estructura no definida para esta clave");
                                            return;
                                          }

                                          const { valido, errores } = validarEstructuraExcel(excelData, clave);
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

                                          const { advertencias } = validarTiposExcel(excelData, clave);
                                          if (advertencias.length > 0) {
                                            toast.warning(
                                              <div>
                                                <p>Advertencias de tipos de datos:</p>
                                                <ul className="list-disc list-inside text-sm">
                                                  {advertencias.slice(0, 5).map((adv, i) => (
                                                    <li key={i}>{adv}</li>
                                                  ))}
                                                </ul>
                                                {advertencias.length > 5 && (
                                                  <p>... y {advertencias.length - 5} más</p>
                                                )}
                                              </div>,
                                              { duration: 10000 }
                                            );
                                          }

                                          setDatos(excelData);
                                          setValue("datos", excelData);
                                          toast.success(`✅ Excel cargado: ${excelData.length} filas`);
                                        }}
                                        onUploadError={(error: string) => {
                                          toast.error(`Error al subir el archivo: ${error}`);
                                        }}
                                      />
                                    </div>
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
                              setEditingAnexo(null); // Asegúrate de limpiar el modo edición
                              setShowForm(false);
                              setActiveTab("anexos"); // Opcional: volver a la lista
                            }}
                          >
                            {editingAnexo ? "Cancelar" : "Limpiar"}
                          </Button>
                          <Button
                            type="submit"
                            style={{ backgroundColor: "#24356B", color: "white" }}
                            disabled={
                              !watch("clave")
                              || !watch("fecha_creacion")
                              || !watch("estado")
                              || !datos.length
                              || yaTieneAnexoConClave(watch("clave"), anexos, userid, editingAnexo ? editingAnexo.id : undefined)}
                          >
                            {yaTieneAnexoConClave(watch("clave"), anexos, userid, editingAnexo ? editingAnexo.id : undefined)
                              ? "Ya tienes este anexo"
                              : !datos.length
                                ? "Agrega datos primero"
                                : "Guardar Anexo"}
                          </Button>
                          {!editingAnexo && (
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
                              Guardar Borrador
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="bg-gray-100 border border-gray-300 rounded-md p-4 text-center">
                          <p className="text-gray-600 flex items-center justify-center gap-2">
                            <span>⚠️</span>
                            No cuentas con permisos para registrar anexos aún. Te notificaremos cuando tengas acceso.
                          </p>
                        </div>
                      </div>
                    )}

                    {/*botones para la edicion de anexos */}





                    {/* si el usuario no tiene unidad responsable asignada */}

                  </form>
                </CardContent>
              </Card>

            </TabsContent>

            {userrole === "ADMIN" && (
              <TabsContent value="anexosPorUsuario" className="mt-4 sm:mt-6 md:mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Anexos por Usuario</CardTitle>
                    <CardDescription>
                      Visualiza los anexos creados por cada usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      // Skeleton mientras carga
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-16 animate-pulse bg-gray-100 rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Creador</TableHead>
                              <TableHead>Clave</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Fecha de Creación</TableHead>
                              <TableHead>Unidad Responsable</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-gray-200">
                            {todosLosAnexos.length > 0 ? (
                              todosLosAnexos.map((anexo) => (
                                <TableRow
                                  key={anexo.id}
                                  className="md:table-row flex flex-col md:flex-row md:table-row border md:border-0 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none"
                                >
                                  {/* Creador */}
                                  <TableCell className="px-4 py-4 md:table-cell">
                                    <div className="md:hidden font-semibold text-gray-500">Creador</div>
                                    <div className="font-medium text-gray-900">{anexo.creador_id}</div>
                                  </TableCell>

                                  {/* Clave */}
                                  <TableCell className="px-4 py-4 md:table-cell">
                                    <div className="md:hidden font-semibold text-gray-500">Clave</div>
                                    <div className="text-gray-800">{anexo.clave}</div>
                                  </TableCell>

                                  {/* Estado */}
                                  <TableCell className="px-4 py-4 md:table-cell">
                                    <div className="md:hidden font-semibold text-gray-500">Estado</div>
                                    <span
                                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                                        anexo.estado
                                      )}`}
                                    >
                                      {anexo.estado}
                                    </span>
                                  </TableCell>

                                  {/* Fecha */}
                                  <TableCell className="px-4 py-4 md:table-cell">
                                    <div className="md:hidden font-semibold text-gray-500">Fecha</div>
                                    <div className="text-gray-800">
                                      {new Date(anexo.fecha_creacion).toLocaleDateString('es-MX', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </div>
                                  </TableCell>

                                  {/* Unidad Responsable */}
                                  <TableCell className="px-4 py-4 md:table-cell">
                                    <div className="md:hidden font-semibold text-gray-500">Unidad Responsable</div>
                                    <div className="text-gray-800">{anexo.unidad_responsable_id}</div>
                                  </TableCell>

                                  {/* Acciones */}
                                  <TableCell className="px-4 py-4 flex gap-3 md:table-cell">
                                    <div className="md:hidden font-semibold text-gray-500 mb-1">
                                      Acciones
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(anexo.id)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push(`/dashboard/anexos/${anexo.id}`)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>

                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                  No se encontraron anexos.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

        </div>

      </div>
    </>
  )
}