// components/ActaPDFGenerator.tsx
'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ActaData {
  id: number;
  unidad_responsable: string;
  folio: string;
  fecha: string;
  hora: string;
  comisionado: string;
  oficio_comision: string;
  fecha_oficio_comision: string;
  entrante: string;
  ine_entrante: string;
  fecha_inicio_labores: string;
  nombramiento: string;
  fecha_nombramiento: string;
  asignacion: string;
  asignado_por: string;
  domicilio_entrante: string;
  telefono_entrante: string;
  saliente: string;
  fecha_fin_labores: string;
  testigo_entrante: string;
  ine_testigo_entrante: string;
  testigo_saliente: string;
  ine_testigo_saliente: string;
  fecha_cierre_acta: string;
  hora_cierre_acta: string;
  observaciones: string;
  estado: string;
}

interface AnexoData {
  id: number;
  clave: string;
  datos: any;
  estado: string;
  unidad_responsable_id: number;
}

interface Props {
  actaData: ActaData;
  anexosData: AnexoData[];
}

const ActaPDFGenerator: React.FC<Props> = ({ actaData, anexosData }) => {
  const generatePDF = async () => {
    // Crear un elemento HTML oculto para renderizar el acta
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.innerHTML = generateHTMLContent(actaData, anexosData);
    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`acta_entrega_${actaData.folio}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      document.body.removeChild(element);
    }
  };

  return (
    <button 
      onClick={generatePDF}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Descargar PDF
    </button>
  );
};

// Función para generar el contenido HTML del acta
const generateHTMLContent = (actaData: ActaData, anexosData: AnexoData[]): string => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1>UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO</h1>
        <h2>ACTA ADMINISTRATIVA DE ENTREGA-RECEPCIÓN</h2>
      </div>
      
      <p>Se levanta la presente <strong>Acta Administrativa</strong> con motivo de la <strong>Entrega-Recepción</strong> 
      de la Unidad ADMINISTRATIVA denominada <strong>${actaData.unidad_responsable}</strong>; 
      en la ciudad de MORELIA, siendo las <strong>${actaData.hora}</strong> horas del día 
      <strong>${formatDate(actaData.fecha)}</strong> para lo cual se reunieron en las oficinas que ocupa la misma.</p>
      
      <!-- Continúa con el resto del contenido según tu plantilla -->
      
      ${generateAnexosTable(anexosData)}
      
      <!-- Firmas y sección final -->
    </div>
  `;
};

const generateAnexosTable = (anexosData: AnexoData[]): string => {
  if (!anexosData.length) return '';
  
  return `
    <h3>ANEXOS ENTREGADOS</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>ANEXOS</th>
          <th>CLAVE</th>
          <th>NO. FOJAS</th>
          <th>OBSERVACIONES</th>
        </tr>
      </thead>
      <tbody>
        ${anexosData.map(anexo => `
          <tr>
            <td>${anexo.datos?.nombre || ''}</td>
            <td>${anexo.clave}</td>
            <td>${anexo.datos?.no_fojas || ''}</td>
            <td>${anexo.datos?.observaciones || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default ActaPDFGenerator;