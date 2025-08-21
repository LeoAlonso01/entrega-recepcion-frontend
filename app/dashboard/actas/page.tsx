"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FormActa from "@/components/forms/FormActa"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, FileSpreadsheet, FileText, Download, RotateCw, Search, Filter } from "lucide-react"
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import GenActaButton from "@/components/GenActaButton"
import Logo from '../../../public/umsnh_logo.png';
import { url } from "inspector/promises"
import jsPDF from "jspdf"

// convertir la imagen a Base64
const imgToBase64 = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ActaForm {
  id: number
  unidad_responsable: number
  folio?: string
  fecha: string
  hora: string
  hora_fin?: string
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
  ine_saliente?: string
  domicilio_saliente?: string
  fecha_fin_labores?: string
  testigo_entrante?: string
  ine_testigo_entrante?: string
  testigo_saliente?: string
  ine_testigo_saliente?: string
  fecha_cierre_acta?: string
  hora_cierre_acta?: string
  observaciones?: string
  domicilio_unidad?: string
  estado: "Pendiente" | "Completada" | "Revisión"
}

interface Unidad {
  id_unidad: number
  nombre: string
  descripcion?: string
}

interface Anexos {
  id: number
  nombre: string
  tipo: "documento" | "imagen"
  url: string
}

const createDate = () => {
  return new Date().toISOString().split("T")[0]
}

export default function ActasPage() {
  const [actas, setActas] = useState<ActaForm[]>([])
  const [filteredActas, setFilteredActas] = useState<ActaForm[]>([])
  const [showForm, setShowForm] = useState(false)
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [editingActa, setEditingActa] = useState<ActaForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actaToDelete, setActaToDelete] = useState<number | null>(null)
  const router = useRouter()

  /*   // funcion para generar el PDF
    const generateActaPDF = async (acta: ActaForm) => {
  
      try {
  
        // crear un elemento PDF
        const pdfContainer = document.createElement("div")
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        // ancho en tamaño carta
        pdfContainer.style.width = '794px';
        pdfContainer.style.padding = '20px';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.backgroundColor = 'white';
        // forzar paginado
        pdfContainer.style.pageBreakAfter = 'always';
      
  
        const safe = (v?: string | number) => {
          return v !== undefined && v !== null ? v : 'N/A';
        };
  
        // obtener nombre de la unidad
        const unidadNombre = unidades.find(u => u.id_unidad === acta.unidad_responsable)?.nombre || "Unidad UMSNH";
  
        // Formatear fechas
        const formatDate = (dateString?: string) => {
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        };
  
        // Formatear hora
        const formatTime = (timeString?: string) => {
          if (!timeString) return 'N/A';
          return timeString;
        };
  
       
  
        // Agregar al documento
        document.body.appendChild(pdfContainer);
  
        // Usar html2canvas y jsPDF para generar el PDF
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;
  
        const canvas = await html2canvas(pdfContainer, {
          scale: 2,
          useCORS: true,
          logging: false
        });
  
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`acta-${acta.folio || acta.id}.pdf`);
  
        // Limpiar
        document.body.removeChild(pdfContainer);
  
        toast.success(`PDF generado para el acta ${acta.folio || acta.id}`);
      } catch (error) {
        console.error('Error generando PDF:', error);
        toast.error('Error al generar el PDF');
        throw error;
      }
    }; */


  // segunda funcion
  /* const generateActaPDF = async (acta: ActaForm) => {
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf/dist/polyfills.es.js'); // asegura compatibilidad
      await import('html2canvas'); // necesario para que pdf.html() funcione

      const base64Logo = await imgToBase64(Logo.src);
      
      // Crear contenedor invisible
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '210mm'; // tamaño A4
      pdfContainer.style.padding = '20px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.fontSize = '12pt';
      pdfContainer.style.backgroundColor = 'white';

      // logo a base64 mas corto
      const pdf = new jsPDF("p", "pt", "a4");

      imgToBase64(Logo.src).then((base64Logo) => {
        pdf.addImage(base64Logo, "PNG", 20, 20, 50, 50);
      });

      //Ahora el resto del HTML
      await pdf.html(pdfContainer, {
        callback: (doc) => doc.save("acta.pdf"),
        margin: [100, 40, 40, 40], // margen superior mayor para que no tape el logo
        autoPaging: "text",
        html2canvas: { scale: 1 },
        x: 0,
         y: 100, // dejamos espacio para el logo
         width: pdf.internal.pageSize.getWidth() - 80,
         windowWidth: pdfContainer.scrollWidth || 794,
       });

      const formatDate = (dateString?: string) => {
        if (!dateString) return '___________';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
      };

      const formatTime = (timeString?: string) => {
        return timeString || '___________';
      };

      const safe = (v?: string | number) => {
        if (v === undefined || v === null || v === "") return '___________';
        return typeof v === "number" ? v.toString() : v;
      };

      pdfContainer.innerHTML = `
            <style>
                body { font-family: Arial, sans-serif; font-size: 12pt; }
                .title-container { text-align: center; margin-bottom: 20px; }
                .logo { height: 80px; margin-bottom: 10px; }
                h2,h3 { margin:0; color:#000; }
                h2 { font-size:14pt; }
                h3 { font-size:12pt; }
                p { text-align: justify; line-height: 1.5; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th,td { border: 1px solid black; padding: 5px; }
                .signature-table { width: 100%; margin-top: 50px; text-align: center; border-collapse: separate; border-spacing: 0 40px; }
                .signature-line { display:block; border-top:1px solid black; padding-top:5px; margin:0 auto; width:80%; }
            </style>

            <div class="title-container">
                <img src="${Logo.src}" alt="Logo" class="logo">
                <h2>UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO</h2>
                <h3>ACTA ADMINISTRATIVA DE ENTREGA-RECEPCIÓN</h3>
            </div>

            <p>
                Se levanta la presente Acta Administrativa con motivo de la Entrega-Recepción de la Unidad
                <strong>${safe(acta.unidad_responsable)}</strong>; en la ciudad de MORELIA, Michoacán, siendo las
                <strong>${formatTime(acta.hora)}</strong> horas del día <strong>${formatDate(acta.fecha)}</strong>,
                para lo cual se reunieron en las oficinas que ocupa la misma, sitio en ${safe(acta.domicilio_unidad)},
                el/la C. <strong>${safe(acta.saliente)}</strong>, quien se identifica con credencial INE número ${safe(acta.ine_saliente)},
                y señala como domicilio ${safe(acta.domicilio_saliente)},
                quien al día ${formatDate(acta.fecha_fin_labores)} deja de ocupar el cargo de
                <strong>${safe(acta.asignacion)}</strong>, y el/la C. <strong>${safe(acta.entrante)}</strong>,
                quien se identifica con credencial INE número ${safe(acta.ine_entrante)}, con domicilio
                ${safe(acta.domicilio_entrante)}, quien a partir del día
                ${formatDate(acta.fecha_inicio_labores)} recibe en calidad de Superior Jerárquico el área de
                <strong>${safe(acta.unidad_responsable)}</strong>, hasta en tanto no sea designado un nuevo titular.
            </p>

            <p>
                Acto seguido, la C. <strong>${safe(acta.saliente)}</strong> y la C. <strong>${safe(acta.entrante)}</strong>, Servidor Público
                saliente y entrante respectivamente, designan como testigos a C. <strong>${safe(acta.testigo_saliente)}</strong>
                y C. <strong>${safe(acta.testigo_entrante)}</strong>, quienes se identificaron con credenciales oficiales
                ${safe(acta.ine_testigo_saliente)} y ${safe(acta.ine_testigo_entrante)}.
                Asimismo, se encuentra presente el C. <strong>${safe(acta.comisionado)}</strong>, auditor comisionado por la
                Contraloría, mediante oficio número ${safe(acta.oficio_comision)  } de fecha
                ${formatDate(acta.fecha_oficio_comision)}.
            </p>

            <p>
                Continuando con la parte principal de esta Acta y con fundamento en lo dispuesto por la Ley General de
                Responsabilidades Administrativas, el auditor comisionado exhorta a las partes a cumplir con sus
                responsabilidades como servidores públicos, señalando que su presencia no implica la realización de una
                revisión, únicamente la formalización del acto de entrega-recepción.
            </p>

            <p>
                La C. <strong>${safe(acta.saliente)}</strong>, hace entrega de la <strong>${safe(acta.unidad_responsable)}</strong> en la que
                fungió como responsable, comprometiéndose a realizar las acciones normativas correspondientes a su cargo.
            </p>

            <p>
                Acreditadas las personalidades de los comparecientes, se procede a entregar los anexos que contienen la
                información relacionada con los asuntos de su competencia, así como los recursos asignados, conforme al
                siguiente orden:
            </p>

            <!-- Aquí las tablas de anexos (MJ, EO, RM, ADI, IG, AG, AR) que ya viste arriba -->
            

            <p>
                Acto seguido, la C. <strong>${safe(acta.saliente)}</strong>, Servidor Público saliente, dio curso a la entrega
                del área a la C. <strong>${safe(acta.entrante)}</strong>, Servidor Público entrante.
            </p>

            <p>
                Los informes, anexos y documentos mencionados forman parte integrante de la presente acta y se firman en
                todas sus fojas para efectos legales.
            </p>

            <p>
                La C. <strong>${safe(acta.entrante)}</strong>, recibe con las reservas de Ley, toda la información, recursos y
                documentos que se precisan en esta Acta y sus anexos.
            </p>

            <p><strong>Respecto a la propiedad de la documentación:</strong> El auditor comisionado hace del conocimiento
                que la documentación contable, financiera y administrativa generada durante cada administración debe
                permanecer bajo resguardo en la <strong>${safe(acta.unidad_responsable)}</strong>.
            </p>

            <p><strong>Seguimiento del servidor público saliente:</strong> De conformidad con la normativa universitaria,
                el servidor saliente deberá participar en la atención de auditorías, requerimientos de información y
                observaciones posteriores.
            </p>

            <p><strong>Verificación de la información:</strong> El servidor público entrante podrá solicitar por escrito
                aclaraciones dentro de los 30 días hábiles siguientes a la firma del Acta, mismas que deberán ser
                respondidas por el servidor saliente en igual plazo.
            </p>

            <p><strong>Término prudencial:</strong> El Departamento de Auditoría Interna establece un término prudencial
                adicional de 30 días hábiles para observaciones sobre la información y documentación soporte del Acta.
            </p>

            <p>
                El presente instrumento no libera a las partes de su responsabilidad por actos u omisiones en el ejercicio
                de sus funciones, mismas que podrán determinarse por autoridad competente.
            </p>

            <p>
                No habiendo otro hecho que hacer constar, leída la presente Acta, siendo las
                <strong>${formatTime(acta.hora_fin)}</strong> horas del día <strong>${formatDate(acta.fecha)}</strong>,
                se da por terminada.
            </p>

            <!-- FIRMAS -->
            <table class="signature-table">
                <tr>
                    <td>
                        <span class="signature-line"></span><br/>
                        <strong>ENTREGA:</strong><br/>C. ${safe(acta.saliente)}
                    </td>
                    <td>
                        <span class="signature-line"></span><br/>
                        <strong>RECIBE:</strong><br/>C. ${safe(acta.entrante)}
                    </td>
                </tr>
            </table>

            <table class="signature-table">
                <tr>
                    <td>
                        <span class="signature-line"></span><br/>
                        <strong>POR LA CONTRALORÍA</strong><br/>C. ${safe(acta.comisionado)}
                    </td>
                    <td>
                        <span class="signature-line"></span><br/>
                        <strong>TESTIGOS DE ASISTENCIA</strong><br/>C. ${safe(acta.testigo_saliente)}
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <span class="signature-line"></span><br/>C. ${safe(acta.testigo_entrante)}
                    </td>
                </tr>
            </table>
        `;

      console.log(pdfContainer.innerHTML);

      document.body.appendChild(pdfContainer);

      const margins = { top: 40, bottom: 40, left: 40, right: 40 };

      pdf.html(pdfContainer, {
        callback: (doc) => {
          doc.save(`acta-${acta.folio || acta.id}.pdf`);
          document.body.removeChild(pdfContainer);
        },
        margin: [margins.top, margins.right, margins.bottom, margins.left],
        autoPaging: 'text',
        html2canvas: {
          scale: 0.6, // reduce para que quepa todo
          useCORS: true
        },
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }; */


  // función para generar el PDF
  const generateActaPDF = async (acta: ActaForm) => {
    try {
      // crear un elemento oculto para renderizar HTML
      const pdfContainer = document.createElement("div");
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.width = "794px"; // ancho carta
      pdfContainer.style.padding = "20px";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.backgroundColor = "white";

      const safe = (v?: string | number) =>
        v !== undefined && v !== null ? v : "N/A";

      const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      };

      const formatTime = (timeString?: string) => {
        if (!timeString) return "N/A";
        return timeString;
      };

      // Generar contenido HTML exacto
      pdfContainer.innerHTML = `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12px; 
          line-height: 1.3;
          margin: 0 90px 0 90px;
        }
        .title-container { 
          text-align: center; 
          margin-bottom: 20px; 
        }
        h2, h3 { 
          margin: 0; 
          color: #000; 
        }
        h2 { 
          font-size: 14px; 
          font-weight: bold;
        }
        h3 { 
          font-size: 12px; 
          font-weight: bold;
        }
        p { 
          text-align: justify; 
          margin: 0 90px 0 90px;
          padding: 0 0 10px 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 90px 10px 90px;
          font-size: 11px;
        }
        th, td { 
          border: 1px solid black; 
          padding: 5px; 
          text-align: left;
        }
        th { 
          font-weight: bold; 
          background-color: #f0f0f0;
        }
        .signature-table {
          width: 100%;
          margin-top: 30px;
          border: none;
        }
        .signature-table td {
          border: none;
          padding: 10px;
          text-align: center;
          vertical-align: top;
        }
        .signature-line {
          display: block;
          border-top: 1px solid black;
          padding-top: 5px;
          margin: 90px 0 90px 0;
          width: 80%;
        }
        .page-number {
          text-align: center;
          font-size: 10px;
          margin-top: 20px;
        }
      </style>

      <div class="title-container">
      <table class="signature-table">
        <tr>
          <td>
            <img src="${Logo.src}" alt="Logo" class="logo">
          </td>
          <td>
            <h2>UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO</h2>
            <h3>ACTA ADMINISTRATIVA DE ENTREGA-RECEPCIÓN</h3>
          </td>
        </tr>
      </table>
      <p>
        Se levanta la presente <strong>Acta Administrativa</strong> con motivo de la <strong>Entrega-Recepción</strong> de
        la Unidad ACADEMICA denominada <strong>${safe(acta.unidad_responsable)}</strong>; en la ciudad de
        MORELIA, siendo las <strong>${safe(acta.hora)}</strong> horas del día <strong>${formatDate(acta.fecha) || '21 de agosto de 2025'}</strong> para lo cual se
        reunieron en las oficinas que ocupa la misma, sitio en FRANCISCO J. MÚJICA S/N, ANTIGUA TORRE DE RECTORÍA, COL. FELÍCITAS DEL
        RÍO, C.P. 58040 EN LAS INSTALACIONES DEL DEPARTAMENTO DE AUDITORÍA INTERNA., el/la C. <strong>${safe(acta.saliente)}</strong>, quien
        se identifica con número <strong>${safe(acta.ine_saliente)}</strong> y señala como domicilio para recibir notificaciones o
        documentos relacionados con la presente acta, el ubicado en ${safe(acta.domicilio_saliente)},
        quien al día <strong>${formatDate(acta.fecha_fin_labores) || '10 de marzo de 2025'}</strong> deja de ocupar el cargo de <strong>${safe(acta.asignacion)}</strong> y
        <strong>${safe(acta.entrante)}</strong>, quien se identifica con credencial
        expedida por el Instituto Nacional Electoral número <strong>${safe(acta.ine_entrante)}</strong> y señala como
        domicilio para recibir notificaciones o documentos relacionados con la presente acta,
        el ubicado en <strong>${safe(acta.domicilio_entrante)}</strong>, quien
        a partir del día <strong>${formatDate(acta.fecha_inicio_labores) || '10 de marzo de 2025'}</strong> recibe el área en calidad de <strong>${safe(acta.asignacion)}</strong>, en atención a la
        designación de que fue objeto por parte de la <strong>Doctora Yarabí Ávila González</strong> en su
        carácter de <strong>Rectora de la Universidad Michoacana de San Nicolás de Hidalgo</strong>, a
        través de nombramiento número <strong>${safe(acta.nombramiento)}</strong> de fecha <strong>${formatDate(acta.fecha_nombramiento) || '10 de marzo de 2025'}</strong>, para
        asumir las funciones que se le han conferido, con fundamento en lo dispuesto por el
        Artículo 22, Fracción I de la Ley Orgánica de la Universidad Michoacana de San
        Nicolás de Hidalgo, con actividades propias de un trabajador de confianza, en
        términos de lo dispuesto en el Artículo 9° de la Ley Federal del Trabajo.
      </p>

      <p>
        Acto seguido, el/la C. <strong>${safe(acta.saliente)}</strong> y C. <strong>${safe(acta.entrante)}</strong>, Servidor
        Público Saliente y entrante respectivamente, designan como testigos de asistencia a
        los/las C. <strong>${safe(acta.testigo_saliente)}</strong> y C. <strong>${safe(acta.testigo_entrante)}</strong>
        quienes se identificaron con credencial oficial número <strong>${safe(acta.ine_testigo_saliente)}</strong> y
        <strong>${safe(acta.ine_testigo_entrante)}</strong> expedida por el Instituto Nacional Electoral. También se encuentra
        presente en este acto el C. <strong>${safe(acta.comisionado)}</strong>, auditor(s)
        comisionado(s) por el Departamento de Auditoría Interna, mediante oficio número
        <strong>${safe(acta.oficio_comision)}</strong> de fecha <strong>${formatDate(acta.fecha_oficio_comision) || '21 de agosto de 2025'}</strong>, para intervenir en la presente Acta
        Administrativa.
      </p>

      <p>
        Continuando con la parte principal de esta Acta y con fundamento en lo dispuesto por
        los Artículos 1, 3, Fracción XXI, 8, 9, Fracción II, 10, 49, Fracción V y VII, 63 y 71
        Segundo Párrafo, de la Ley General de Responsabilidades Administrativas, el Auditor
        comisionado para el desahogo de la presente Acta exhorta a los que en ella
        intervienen a cumplir con la Función Pública y sus responsabilidades como servidores
        públicos en el desarrollo del objeto de la presenta Acta y hace del conocimiento, que
        su presencia <strong>NO IMPLICA LA REALIZACIÓN DE REVISIÓN</strong> únicamente tiene como
        fin primordial auxiliarlos en la formalización del acto de Entrega-Recepción.
      </p>

      <p>
        El/La C. <strong>${safe(acta.saliente)}</strong>, hace entrega del y/o la <strong>${safe(acta.unidad_responsable)}</strong> del/la ${safe(acta.asignado_por)}
        de esta Casa de Estudios, en la que fungió como <strong>${safe(acta.asignacion)}</strong>, por lo que de
        conformidad, hace entrega y se compromete a realizar las acciones que contempla la
        Normatividad señalada respecto de su cargo en la Administración del/la <strong>${safe(acta.unidad_responsable)}</strong> en cuestion.
      </p>

      <p>
        Para efectos de la presente Acta, se entenderá que el Servidor Público Entrante, es
        la persona que recibe y el Servidor Público Saliente, es el que entrega.
      </p>

      <p>
        Acreditadas las personalidades con que comparecen los participantes en la presenta
        Acta, se procede a entregar los Anexos que contienen la información relacionada con
        los asuntos de su competencia, así como los recursos asignados para el ejercicio de
        sus atribuciones legales, por lo que, para estos efectos se hace entrega conforme al
        siguiente orden:
      </p>

      <p>
        <strong>MARCO JURIDICO:</strong>
      </p>
      <!-- Tabla de MARCO JURIDICO -->
      <table style="margin-right: 90px; width: 76%;">
        <thead>
          <tr>
            <th>ANEXOS</th>
            <th>CLAVE</th>
            <th>NO. FOJAS</th>
            <th>OBSERVACIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ADMINISTRATIVO DE ACTUACION</td>
            <td>MJ-01</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <!-- Otras tablas de anexos (puedes agregar más según necesites) -->

      <p>
        Acto seguido, el/la C. <strong>${safe(acta.saliente)}</strong>, Servidor Público Saliente, dio curso a la entrega del/la
        <strong>${safe(acta.unidad_responsable)}</strong> al/la C. <strong>${safe(acta.entrante)}</strong>, Servidor Público
        Entrante.
      </p>

      <p>
        Los informes, anexos y documentos que se mencionan, son parte integrante de la
        misma y se firman en todas sus fojas para su identificación y efectos legales a que
        haya lugar, las cuales están foliadas en forma consecutiva, por la(s) persona(s)
        designada(s) para elaborarla y verificarla(s).
      </p>

      <p>
        El/La C. <strong>${safe(acta.entrante)}</strong>, recibe con las reservas de la Ley, del/la C.
        <strong>${safe(acta.saliente)}</strong>, toda la información, recursos y documentos que se precisan en el contenido de la
        presente Acta y sus Anexos.
      </p>

      <!-- Texto adicional sobre documentación -->
      <p>
        <strong>Respecto a la propiedad de Documentación y Expedientes:</strong> Tomando la
        palabra el Auditor comisionado hace del conocimiento a las partes, que
        la documentación contable, financiera, administrativa y expedientes
        generada durante cada administración, debe quedar bajo resguardo y
        conservación en el ${safe(acta.unidad_responsable)}, para los
        fines a que haya lugar.
      </p>

      <!-- Más texto legal según el formato -->

      <p>
        No habiendo otro hecho que hacer constar, leída que fue la presente Acta, y enterado de su contenido y alcance, siendo las 
        <strong>${safe(acta.hora_cierre_acta)}</strong> horas del día <strong>${formatDate(acta.fecha_cierre_acta) || '14 de julio de 2025'}</strong>, se da por terminada, firmando al margen y al calce cada una de sus hojas todos los que en ella intervinieron y quisieron hacerlo.
      </p>

      <!-- Firmas -->
      <table class="signature-table" style="margin-right: 90px; width: 76%;">
        <tr>
          <td>
            <span class="signature-line"></span><br/>
            <strong>ENTREGA:</strong><br/>
            C. ${safe(acta.saliente)}
          </td>
          <td>
            <span class="signature-line"></span><br/>
            <strong>RECIBE:</strong><br/>
            C. ${safe(acta.entrante)}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-top: 30px;">
            <span class="signature-line" style="width: 60%;"></span><br/>
            <strong>POR LA CONTRALORÍA</strong><br/>
            C. ${safe(acta.comisionado ? 'GUERRERO VARGAS LIA BÁRBARA' : '')}
          </td>
        </tr>
        <tr>
          <td>
            <span class="signature-line"></span><br/>
            <strong>TESTIGOS DE ASISTENCIA</strong><br/>
            C. ${safe(acta.testigo_saliente ? 'BOCANEGRA DÍAZ CHRISTIAN ISRAEL' : '')}
          </td>
          <td>
            <span class="signature-line"></span><br/>
            C. ${safe(acta.testigo_entrante ? 'CALDERON RAMÍREZ MANUEL' : '')}
          </td>
        </tr>
      </table>

      <div class="page-number">1/5</div>
    `;

      document.body.appendChild(pdfContainer);

      // generar el canvas
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // proporción de la imagen escalada al ancho del PDF
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // primera página
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // páginas siguientes
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`acta-${acta.folio || acta.id}.pdf`);

      document.body.removeChild(pdfContainer);

      toast.success(`PDF generado para el acta ${acta.folio || acta.id}`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar el PDF");
      throw error;
    }
  };


  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    getUnidadesResponsables()
    getActas()
  }, [router])

  // Filtrar actas cuando cambian los filtros o búsqueda
  useEffect(() => {
    let result = actas

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(acta =>
        acta.folio?.toLowerCase().includes(term) ||
        acta.entrante.toLowerCase().includes(term) ||
        acta.saliente.toLowerCase().includes(term) ||
        unidades.find(u => u.id_unidad === acta.unidad_responsable)?.nombre.toLowerCase().includes(term) ||
        acta.fecha.includes(term)
      )
    }

    // Filtrar por estado
    if (statusFilter.length > 0) {
      result = result.filter(acta => statusFilter.includes(acta.estado))
    }

    setFilteredActas(result)
  }, [actas, searchTerm, statusFilter, unidades])

  const getUnidadesResponsables = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token no encontrado")
      return
    }

    try {
      const response = await fetch(`${API_URL}/unidades_responsables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al obtener unidades')

      const data = await response.json()
      setUnidades(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar las unidades responsables")
    }
  }, [])

  const getActas = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        // headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/actas`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/")
          return
        }
        throw new Error('Error al obtener actas')
      }

      const data = await response.json()
      setActas(data)
      console.table(data);
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar las actas")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router])

  const handleRefresh = () => {
    setIsRefreshing(true)
    getActas()
  }

  const handleEdit = (acta: ActaForm) => {
    setEditingActa(acta)
    setShowForm(true)
  }

  const handleView = (acta: ActaForm) => {
    // Aquí podrías implementar la navegación a una página de detalle
    // o abrir un modal de solo lectura
    setEditingActa(acta)
    setShowForm(true)
  }

  const confirmDelete = (id: number) => {
    setActaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!actaToDelete) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`${API_URL}/actas/${actaToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al eliminar acta')

      setActas(actas.filter(acta => acta.id !== actaToDelete))
      toast.success("Acta eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar acta:", error)
      toast.error("Error al eliminar acta")
    } finally {
      setDeleteDialogOpen(false)
      setActaToDelete(null)
    }
  }

  const updateActa = async (id: number, actaData: Partial<ActaForm>) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`${API_URL}/actas${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(actaData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar acta')
      }

      const updatedActa = await response.json()
      return updatedActa
    } catch (error) {
      console.error("Error al actualizar acta:", error)
      throw error
    }
  }

  const createActa = async (actaData: Omit<ActaForm, 'id'>) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`${API_URL}/actas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(actaData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear acta')
      }

      const newActa = await response.json()
      return newActa
    } catch (error) {
      console.error("Error al crear acta:", error)
      throw error
    }
  }

  const handleSaveActa = async (formData: ActaForm) => {
    try {
      let savedActa: ActaForm

      if (editingActa && formData.id) {
        savedActa = await updateActa(formData.id, formData)
        setActas(actas.map(a => a.id === formData.id ? savedActa : a))
        toast.success("Acta actualizada correctamente")
      } else {
        savedActa = await createActa(formData)
        setActas([...actas, savedActa])
        toast.success("Acta creada correctamente")
      }

      setShowForm(false)
      setEditingActa(null)
    } catch (error: any) {
      console.error("Error al guardar acta:", error)
      toast.error(error.message || "Error al guardar el acta")
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada": return "bg-green-100 text-green-800 border-green-200"
      case "Pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Revisión": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const exportToPDF = () => {
    toast.info("Exportando a PDF...")
    // Implementar lógica de exportación a PDF
  }

  const exportToExcel = () => {
    toast.info("Exportando a Excel...")
    // Implementar lógica de exportación a Excel
  }

  const TableSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8 w-[120px]" />
          </div>

          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4 pt-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <div className="flex items-center">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarWithBreadcrumb role="ADMIN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Actas</h2>
            <p className="text-gray-600">Administra las actas de entrega y recepción</p>
          </div>

          <div className="flex space-x-2">
            {!showForm && (
              <>
                <Button
                  variant="outline"
                  onClick={exportToPDF}
                  className="border-[#751518] text-[#751518] hover:bg-[#751518] hover:text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className="border-[#B59E60] text-[#B59E60] hover:bg-[#B59E60] hover:text-white"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RotateCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                setEditingActa(null)
                setShowForm(!showForm)
              }}
              className="bg-[#751518] hover:bg-[#8a1a1d]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Ver lista' : 'Nueva acta'}
            </Button>
          </div>
        </div>

        {showForm ? (
          <FormActa
            acta={editingActa || {
              id: 0,
              unidad_responsable: unidades[0]?.id_unidad || 0,
              fecha: createDate(),
              hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              entrante: "",
              saliente: "",
              estado: "Pendiente"
            }}
            unidades={unidades}
            onCancel={() => {
              setShowForm(false)
              setEditingActa(null)
            }}
            onSave={handleSaveActa}
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar actas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["Pendiente", "Completada", "Revisión"].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status])
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== status))
                        }
                      }}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {statusFilter.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStatusFilter([])}>
                        Limpiar filtros
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isLoading ? (
              <TableSkeleton />
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Lista de Actas</CardTitle>
                      <CardDescription>
                        Mostrando {filteredActas.length} de {actas.length} actas
                        {statusFilter.length > 0 && ` (filtradas por estado)`}
                        {searchTerm && ` (filtradas por búsqueda)`}
                      </CardDescription>
                    </div>
                    {filteredActas.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const element = document.createElement("a")
                        const file = new Blob([JSON.stringify(filteredActas, null, 2)], { type: 'text/plain' })
                        element.href = URL.createObjectURL(file)
                        element.download = "actas.json"
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar datos
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredActas.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {actas.length === 0
                          ? "No hay actas registradas. Crea tu primera acta."
                          : "No se encontraron actas que coincidan con los criterios de búsqueda."}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fólio</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead>Entrega</TableHead>
                            <TableHead>Recibe</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredActas.map((acta) => (
                            <TableRow key={acta.id}>
                              <TableCell className="font-medium">{acta.folio || "Sin folio"}</TableCell>
                              <TableCell>{new Date(acta.fecha).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {unidades.find(u => u.id_unidad === acta.unidad_responsable)?.nombre ||
                                  `Unidad ${acta.unidad_responsable}`}
                              </TableCell>
                              <TableCell>{acta.entrante}</TableCell>
                              <TableCell>{acta.saliente}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getEstadoColor(acta.estado)}>
                                  {acta.estado}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <GenActaButton acta={acta} onGenerate={generateActaPDF} />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(acta)}
                                    title="Ver detalles"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(acta)}
                                    title="Editar acta"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => confirmDelete(acta.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Eliminar acta"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Diálogo de confirmación para eliminar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el acta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}