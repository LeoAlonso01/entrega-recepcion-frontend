// lib/export.ts
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Anexo } from "../app/dashboard/anexos/[id]/page"; // Asegúrate de tener el tipo

export const exportAnexoToPDF = (anexo: Anexo) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(36, 53, 107);
  doc.text(`Anexo ${anexo.clave}`, 20, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Categoría: ${anexo.categoria}`, 20, 30);
  doc.text(`Estado: ${anexo.estado}`, 20, 40);
  doc.text(`Fecha: ${new Date(anexo.fecha_creacion).toLocaleDateString()}`, 20, 50);

  const data = Array.isArray(anexo.datos) ? anexo.datos : [anexo.datos];
  const columns = Object.keys(data[0] || {});
  const rows = data.map(row => Object.values(row));

  (doc as any).autoTable({
    head: [columns],
    body: rows,
    startY: 60,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [117, 21, 24] },
  });

  doc.save(`anexo_${anexo.clave}_${Date.now()}.pdf`);
};

export const exportAnexoToExcel = (anexo: Anexo) => {
  const data = Array.isArray(anexo.datos) ? anexo.datos : [anexo.datos];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, `anexo_${anexo.clave}_${Date.now()}.xlsx`);
};