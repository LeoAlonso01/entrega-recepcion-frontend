"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { imageToDataUrl } from "./helpPngPdf";
import { normalizarActaPdf } from "./actaPdfData";
import { textoInstitucional } from "./actaTextoInstitucional";

export async function crearActaPdf(raw: Record<string, any>): Promise<jsPDF> {
    const acta = normalizarActaPdf(raw);
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter", compress: true });
    doc.setProperties({ title: `Acta ${acta.folio}`, subject: "Acta administrativa de entrega-recepción", author: "Universidad Michoacana de San Nicolás de Hidalgo" });
    const logo = await imageToDataUrl("/logos/ESCUDO-UMSNH.jpg");
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 18;
    const usable = width - margin * 2;
    const top = 39;
    const bottom = height - 21;
    const lineHeight = 5;
    let y = top;

    const font = (bold = false, size = 10.5) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(25, 25, 25);
    };
    const nextPage = () => { doc.addPage(); y = top; };
    const space = (required: number) => { if (y + required > bottom) nextPage(); };
    const paragraph = (text: string, justify = true) => {
        if (!text.trim()) return;
        font();
        const lines: string[] = doc.splitTextToSize(text, usable);
        let offset = 0;
        while (offset < lines.length) {
            let available = Math.floor((bottom - y) / lineHeight);
            if (available < Math.min(2, lines.length - offset)) { nextPage(); available = Math.floor((bottom - y) / lineHeight); }
            let count = Math.min(available, lines.length - offset);
            if (lines.length - offset - count === 1 && count > 2) count--;
            doc.text(lines.slice(offset, offset + count), margin, y, { lineHeightFactor: lineHeight / (10.5 * 25.4 / 72), align: justify ? "justify" : "left", maxWidth: usable });
            y += count * lineHeight;
            offset += count;
            if (offset < lines.length) nextPage();
        }
        y += 3;
    };
    const section = (title: string) => {
        space(19);
        font(true, 10.5);
        doc.text(title, margin, y);
        y += 9;
    };
    const identificacion = (ine: string) => ine ? `, quien se identifica con credencial del Instituto Nacional Electoral número ${ine}` : "";
    const fecha = (value: string) => value ? ` de fecha ${value}` : "";
    const hora = (value: string) => value ? `, a las ${value} horas` : "";
    const rowsFirmas = (items: { title: string; name: string }[]) => {
        const columnWidth = (usable - 16) / 2;
        for (let i = 0; i < items.length; i += 2) {
            const pair = items.slice(i, i + 2);
            font();
            const measured = pair.map(item => ({ ...item, lines: doc.splitTextToSize(item.name, columnWidth - 4) as string[] }));
            const rowHeight = 34 + Math.max(...measured.map(item => item.lines.length)) * 4.8;
            if (y + rowHeight > bottom) {
                nextPage();
                font(true);
                doc.text("V. FIRMAS (CONTINUACIÓN)", margin, y);
                y += 9;
            }
            measured.forEach((item, column) => {
                const center = pair.length === 1 ? width / 2 : margin + columnWidth / 2 + column * (columnWidth + 16);
                font(true, 9.5);
                doc.text(item.title, center, y, { align: "center" });
                doc.setDrawColor(70);
                doc.setLineWidth(0.25);
                doc.line(center - columnWidth / 2, y + 22, center + columnWidth / 2, y + 22);
                font(false, 10);
                doc.text(item.lines, center, y + 28, { align: "center", lineHeightFactor: 1.35 });
            });
            y += rowHeight + 4;
        }
    };

    paragraph(`Folio: ${acta.folio}`, false);
    section("I. COMPARECENCIA");
    paragraph(`Se levanta la presente Acta Administrativa de Entrega-Recepción de la unidad responsable denominada ${acta.unidad}, el día ${acta.fecha}${hora(acta.hora)}.`);
    paragraph(`Comparece ${acta.saliente}, en su carácter de persona servidora pública saliente${identificacion(acta.ineSaliente)}${acta.domicilioSaliente ? `, con domicilio para notificaciones en ${acta.domicilioSaliente}` : ""}, quien hace entrega de la unidad${acta.finLabores ? ` y concluye sus labores el ${acta.finLabores}` : ""}.`);
    paragraph(`Asimismo comparece ${acta.entrante}, en su carácter de persona servidora pública entrante${identificacion(acta.ineEntrante)}${acta.domicilioEntrante ? `, con domicilio para notificaciones en ${acta.domicilioEntrante}` : ""}, quien recibe la unidad${acta.inicioLabores ? ` e inicia sus labores el ${acta.inicioLabores}` : ""}.${acta.telefonoEntrante ? ` Teléfono de contacto: ${acta.telefonoEntrante}.` : ""}`);
    const asignaciones: Record<string, string> = { nombramiento: "nombramiento", designacion: "designación", jerarquia: "jerarquía" };
    const autoridades: Record<string, string> = { rectoria: "Rectoría", h_consejo: "H. Consejo" };
    if (acta.nombramiento || acta.asignacion || acta.asignadoPor || acta.fechaNombramiento) {
        paragraph(`La persona entrante asume las funciones de la unidad${acta.asignacion ? ` mediante ${asignaciones[acta.asignacion] || acta.asignacion}` : ""}${acta.nombramiento ? `, según documento número ${acta.nombramiento}` : ""}${fecha(acta.fechaNombramiento)}${acta.asignadoPor ? `, emitido por ${autoridades[acta.asignadoPor] || acta.asignadoPor}` : ""}.`);
    }
    if (acta.testigoSaliente) paragraph(`${acta.saliente} designa como testigo de entrega a ${acta.testigoSaliente}${identificacion(acta.ineTestigoSaliente)}.`);
    if (acta.testigoEntrante) paragraph(`${acta.entrante} designa como testigo de recepción a ${acta.testigoEntrante}${identificacion(acta.ineTestigoEntrante)}.`);
    acta.comisiones.forEach(comision => paragraph(`Interviene en este acto ${comision.nombre}, como persona comisionada por la Contraloría${comision.oficio ? ` mediante oficio ${comision.oficio}` : ""}${fecha(comision.fecha)}, para auxiliar en la formalización de la presente Acta Administrativa.`));

    section("II. ENTREGA-RECEPCIÓN Y RELACIÓN DE ANEXOS");
    paragraph(textoInstitucional[7].replace("el auditor comisionado", "la representación comisionada"));
    paragraph(textoInstitucional[8].replace("del auditor comisionado", "de la representación comisionada"));
    paragraph(`${acta.saliente} hace entrega de ${acta.unidad} a ${acta.entrante}, con la información, los recursos y los documentos que se relacionan en esta acta.`);
    paragraph(textoInstitucional[10]);
    paragraph(textoInstitucional[11]);
    if (acta.anexos.length === 0) paragraph("No hay anexos asociados a esta acta.");
    for (const [categoria, anexos] of acta.gruposAnexos) {
        space(33);
        autoTable(doc, {
            startY: y,
            margin: { top, bottom: height - bottom, left: margin, right: margin },
            tableWidth: usable,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5, lineColor: [185, 185, 185], lineWidth: 0.15, textColor: [25, 25, 25], overflow: "linebreak" },
            headStyles: { fillColor: [240, 240, 240], textColor: [25, 25, 25], fontStyle: "bold" },
            columnStyles: { 0: { cellWidth: 21 }, 1: { cellWidth: usable - 84 }, 2: { cellWidth: 31 }, 3: { cellWidth: 32 } },
            head: [[{ content: categoria, colSpan: 4 }], ["CLAVE", "DESCRIPCIÓN", "ESTADO", "FOJAS"]],
            body: anexos.map(anexo => [anexo.clave, anexo.descripcion, anexo.estado, anexo.fojas === null ? "Pendiente de generar" : String(anexo.fojas)]),
            rowPageBreak: "avoid",
            showHead: "everyPage",
        });
        y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    }
    paragraph(`${acta.saliente}, persona servidora pública saliente, da curso a la entrega de ${acta.unidad} a ${acta.entrante}, persona servidora pública entrante.`);
    paragraph(textoInstitucional[13]);
    paragraph(`${acta.entrante} recibe, con las reservas de ley, de ${acta.saliente}, la información, los recursos y los documentos precisados en esta acta y sus anexos.`);
    paragraph(`La documentación contable, financiera, administrativa y los expedientes generados durante cada administración deben quedar bajo resguardo y conservación en ${acta.unidad}, para los fines a que haya lugar.`);
    paragraph(`Se deja asentado que la documentación para la integración del presente instrumento fue proporcionada por ${acta.saliente}, quien señala que los documentos originales y la información de soporte obran en las áreas administrativas de ${acta.unidad} para su cotejo y validación.`);
    for (const key of [17, 18, 19, 20, 21] as const) paragraph(textoInstitucional[key]);

    section("III. OBSERVACIONES");
    paragraph(acta.observaciones || "No se registraron observaciones en el acta.", false);
    section("IV. CIERRE DEL ACTA");
    paragraph(`Leída la presente acta y enteradas las personas participantes de su contenido y alcance, se da por terminado el acto${acta.fechaCierre ? ` el día ${acta.fechaCierre}` : ""}${hora(acta.horaCierre)}, firmando al margen y al calce quienes intervinieron.${!acta.fechaCierre || !acta.horaCierre ? " No se registró la fecha o la hora de cierre completa en el acta." : ""}`);

    const firmasPrincipales = [{ title: "ENTREGA", name: acta.saliente }, { title: "RECIBE", name: acta.entrante }];
    const firmasTestigos = [
        ...(acta.testigoSaliente ? [{ title: "TESTIGO DE ENTREGA", name: acta.testigoSaliente }] : []),
        ...(acta.testigoEntrante ? [{ title: "TESTIGO DE RECEPCIÓN", name: acta.testigoEntrante }] : []),
    ];
    const firmasComisiones = acta.comisiones.map(comision => ({ title: "POR LA CONTRALORÍA", name: comision.nombre }));
    font();
    let espacioFirmas = 9;
    for (const bloque of [firmasPrincipales, firmasTestigos, firmasComisiones]) {
        for (let i = 0; i < bloque.length; i += 2) {
            const lineas = bloque.slice(i, i + 2).map(item => doc.splitTextToSize(item.name, (usable - 16) / 2 - 4).length);
            espacioFirmas += 38 + Math.max(...lineas) * 4.8;
        }
    }
    space(espacioFirmas <= bottom - top ? espacioFirmas : 63);
    section("V. FIRMAS");
    rowsFirmas(firmasPrincipales);
    rowsFirmas(firmasTestigos);
    rowsFirmas(firmasComisiones);

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.addImage(logo, "JPEG", margin, 10, 16, 16);
        font(true, 9.5);
        doc.text("UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO", width / 2 + 9, 15, { align: "center" });
        font(true, 10.5);
        doc.text("ACTA ADMINISTRATIVA DE ENTREGA-RECEPCIÓN", width / 2 + 9, 22, { align: "center" });
        doc.setDrawColor(145);
        doc.setLineWidth(0.2);
        doc.line(margin, 31, width - margin, 31);
        doc.line(margin, height - 16, width - margin, height - 16);
        font(false, 8.5);
        const folioLines: string[] = doc.splitTextToSize(`Folio: ${acta.folio}`, usable - 42);
        doc.text(folioLines.slice(0, 2), margin, height - 11, { lineHeightFactor: 1.15 });
        doc.text(`Página ${i} de ${pages}`, width - margin, height - 11, { align: "right" });
    }
    return doc;
}

export const generarActa = async (actaData: Record<string, any>, options?: { preview?: boolean }) => {
    const doc = await crearActaPdf(actaData);
    if (options?.preview) return doc.output("blob");
    doc.save(`acta_${String(actaData.folio).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
};
