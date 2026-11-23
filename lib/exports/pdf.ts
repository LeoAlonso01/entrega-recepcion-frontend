import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ESTRUCTURA_DATOS_POR_CLAVE } from "../estructuraPorClave"; // ajusta ruta si es distinta
import { imageToDataUrl } from "../helpPngPdf";

export const FORMATO_REPORTE_ANEXO = "anexo-carta-v1";


function getNombreCategoria(clave: string): string {
    // Note: The structure doesn't have a 'categoria' property.
    // Use resolveCategoriaNombre(meta) instead for proper category name resolution.
    return "Categoría desconocida";
}


/**
 * Resuelve el nombre de rubro/categoría desde:
 * - meta.categoriaId (id num/string)
 * - meta.categoriaNombre (texto)
 * - fallback: meta.dependenciaClave (si lo seguías usando)
 */
function resolveCategoriaNombre(meta: PdfMeta): string {
    // 1) Si viene id desde BD
    if (meta.categoriaId) {
        return getNombreCategoria(String(meta.categoriaId));
    }

    // 2) Si viene nombre directamente
    if (meta.categoriaNombre) {
        return meta.categoriaNombre;
    }

    return "Categoría desconocida";
}

// Modal para datos Intermedios (ej. "Generando PDF...")
export const showIntermedioModal = (message: string) => {
    // Aquí podrías usar tu sistema de modales, o simplemente alert() para pruebas

    alert(message);
}


export interface PdfMeta {
    // 👇 categoría/rubro (lo correcto)
    categoriaId?: string | number;      // ej. "8"
    categoriaNombre?: string;           // ej. "ASUNTOS LEGALES Y DE AUDITORÍA"

    // datos de encabezado
    dependenciaClave?: string;
    dependenciaNombre?: string;
    urClave?: string;
    urNombre?: string;
    claveAnexo?: string;
    infoActualizadaAl?: string;

    // footer
    fechaElaboracion: string;
    elaboro?: string;
    superviso?: string;
    entrego?: string;
    revisionDatos?: string;
}

function fmtDate(d?: string) {
    if (!d) return "";
    if (/^\d{2}-\d{2}-\d{4}$/.test(d)) return d;
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
    if (dateOnly) return `${dateOnly[3]}-${dateOnly[2]}-${dateOnly[1]}`;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    return `${dd}-${mm}-${yy}`;
}

export async function crearReporteAnexo(
    clave: string,
    meta: PdfMeta,
    filas: Array<Record<string, any>>,
    opciones: { incluirLogos?: boolean } = {}
) {
    const doc = new jsPDF("p", "mm", "letter");

    // Logos (public/logos)
    const [logoIzq, logoDer] = opciones.incluirLogos === false ? [null, null] : await Promise.all([
        imageToDataUrl("/logos/ESCUDO-UMSNH.jpg"),
        imageToDataUrl("/logos/logo_contraloria.jpg"),
    ]);
    doc.setProperties({ title: `Reporte de anexo ${clave}`, subject: meta.revisionDatos || "", creator: FORMATO_REPORTE_ANEXO });

    // Columnas/tabla según clave
    const normalizarCampo = (campo: string) => campo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const claveCatalogo = clave.trim().toUpperCase().replace(/^RRH(?=\d)/, "RH");
    const cols = ESTRUCTURA_DATOS_POR_CLAVE[claveCatalogo] ?? ESTRUCTURA_DATOS_POR_CLAVE.default;
    const head = [cols.map((c) => c.campo)];

    const body = filas.map((row) =>
        cols.map((c) => {
            const original = Object.keys(row).find(campo => normalizarCampo(campo) === normalizarCampo(c.campo));
            const v = original === undefined ? "" : row[original];
            return v === null || v === undefined || v === "" ? "-" : typeof v === "object" ? JSON.stringify(v) : String(v);
        })
    );

    // Layout base
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const marginX = 10;
    const anchoNombre = pageW * 0.19;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    const nombresPie = [meta.elaboro || "", meta.superviso || "", meta.entrego || ""].map(nombre => doc.splitTextToSize(nombre, anchoNombre) as string[]);
    const footerH = Math.max(22, 14 + Math.max(...nombresPie.map(lineas => lineas.length)) * 3);

    // Header layout (mm)
    const logoY = 6;
    const logoW = 18;
    const logoH = 18;
    const logoLeftX = marginX;
    const logoRightX = pageW - marginX - logoW;

    const titleY = 12;

    const lineY = logoY + logoH + 4;
    const blockY = lineY + 6;
    const rowGap = 6;

    // La tabla debe iniciar después del bloque
    const anchoDependencia = pageW - marginX * 2 - 114;
    const lineasDependencia = doc.splitTextToSize(meta.dependenciaNombre || "", anchoDependencia) as string[];
    const lineasUr = doc.splitTextToSize(meta.urNombre || "", anchoDependencia) as string[];
    const urY = blockY + Math.max(rowGap, lineasDependencia.length * 3 + 2);
    const headerH = urY + Math.max(8, lineasUr.length * 3 + 4);

    function drawHeader() {
        // Logos
        if (logoIzq) doc.addImage(logoIzq, "JPEG", logoLeftX, logoY, logoW, logoH);
        if (logoDer) doc.addImage(logoDer, "JPEG", logoRightX, logoY, logoW, logoH);

        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("ANEXOS PARA LA ENTREGA-RECEPCIÓN DE LA UMSNH", pageW / 2, titleY, {
            align: "center",
        });

        // Rubro/Categoría (segunda línea)
        const categoriaNombre = resolveCategoriaNombre(meta);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const categoriaY = lineY - 3;
        doc.text(categoriaNombre, pageW / 2, categoriaY, { align: "center" });

        // Línea
        doc.setLineWidth(0.3);
        doc.line(marginX, lineY, pageW - marginX, lineY);

        // Bloque dependencia / UR
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);

        doc.text("DEPENDENCIA", marginX, blockY);
        doc.text("UR", marginX, urY);

        doc.setFont("helvetica", "normal");
        doc.text(meta.dependenciaClave ?? "", marginX + 24, blockY);
        doc.text(lineasDependencia, marginX + 40, blockY, { lineHeightFactor: 1.2 });

        doc.text(meta.urClave ?? "", marginX + 24, urY);
        doc.text(lineasUr, marginX + 40, urY, { lineHeightFactor: 1.2 });

        // Caja derecha
        doc.setFont("helvetica", "bold");
        doc.text("CLAVE DE ANEXO", pageW - marginX - 46, blockY);
        doc.text("INFORMACIÓN ACTUALIZADA AL", pageW - marginX - 70, urY);

        doc.setFont("helvetica", "normal");
        doc.text(meta.claveAnexo || clave, pageW - marginX, blockY, { align: "right" });
        doc.text(fmtDate(meta.infoActualizadaAl), pageW - marginX, urY, {
            align: "right",
        });
    }

    const col = {
        fecha: marginX,
        elaboro: pageW * 0.32,
        superviso: pageW * 0.55,
        entrega: pageW * 0.75,
        hoja: pageW - marginX
    };

    function drawFooter(pageNumber: number, totalPages: number) {
        const y = pageH - footerH;

        doc.setLineWidth(0.3);
        doc.line(marginX, y, pageW - marginX, y);

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("FECHA DE", col.fecha, y + 6);
        doc.text("ELABORACIÓN", marginX, y + 10);

        doc.setFont("helvetica", "normal");
        doc.text(fmtDate(meta.fechaElaboracion), col.fecha + 2, y + 16);

        // elaboró / supervisó / entrega
        doc.setFont("helvetica", "bold");
        doc.text("ELABORÓ", col.elaboro, y + 6, { align: "center" });
        doc.text("SUPERVISÓ", col.superviso, y + 6, { align: "center" });
        doc.text("ENTREGA", col.entrega, y + 6, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.text(nombresPie[0], col.elaboro, y + 13, { align: "center", lineHeightFactor: 1.2 });
        doc.text(nombresPie[1], col.superviso, y + 13, { align: "center", lineHeightFactor: 1.2 });
        doc.text(nombresPie[2], col.entrega, y + 13, { align: "center", lineHeightFactor: 1.2 });

        // hoja X de Y
        doc.setFont("helvetica", "bold");
        doc.text("HOJA", col.hoja, y + 6, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.text(`${pageNumber} de ${totalPages}`, col.hoja, y + 16, {
            align: "right",
        });
    }

    function drawEmptyTableAreaX(tableBottomY?: number) {
        const bottomY = pageH - footerH - 1.5;
        const topY = Math.max(headerH + 2, (tableBottomY ?? headerH) + 1.5);
        if (bottomY - topY < 10) return;

        const leftX = marginX + 2;
        const rightX = pageW - marginX - 2;
        doc.setDrawColor(70, 70, 70);
        doc.setLineWidth(0.5);
        doc.line(leftX, topY, rightX, bottomY);
        doc.line(rightX, topY, leftX, bottomY);
    }

    autoTable(doc, {
        startY: headerH,
        head,
        body,
        margin: { left: marginX, right: marginX, top: headerH, bottom: footerH },
        styles: { font: "helvetica", fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
        didDrawPage: (data) => {
            drawHeader();
            drawEmptyTableAreaX(data.cursor?.y ?? undefined);
        },
    });

    const totalPages = doc.getNumberOfPages();
    for (let pagina = 1; pagina <= totalPages; pagina++) {
        doc.setPage(pagina);
        drawFooter(pagina, totalPages);
    }

    return { doc, fojas: doc.getNumberOfPages() };
}

export async function generarAnexoPdf(clave: string, meta: PdfMeta, filas: Array<Record<string, any>>) {
    const { doc, fojas } = await crearReporteAnexo(clave, meta, filas);
    doc.save(`Reporte_${clave}.pdf`);
    return fojas;
}
