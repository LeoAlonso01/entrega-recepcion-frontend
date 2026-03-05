import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EstructuraDatosPorClave, categoria_anexos, CATEGORIA_ID_POR_CLAVE } from "../estructuraPorClave"; // ajusta ruta si es distinta
import { imageToDataUrl } from "../helpPngPdf";

const TOTAL_PAGES_PLACEHOLDER = "{total_pages_count_string}";

function getNombreCategoria(clave: string): string {
    const catId = CATEGORIA_ID_POR_CLAVE[String(clave).toUpperCase()];
    if (!catId) return "Categoría desconocida";

    const cat = categoria_anexos.find(c => c.id === String(catId));
    return cat?.nombre_categoria ?? "Categoría desconocida";
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
}

function fmtDate(d?: string) {
    if (!d) return "";
    if (/^\d{2}-\d{2}-\d{4}$/.test(d)) return d;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    return `${dd}-${mm}-${yy}`;
}

export async function generarAnexoPdf(
    clave: string,
    meta: PdfMeta,
    filas: Array<Record<string, any>>
) {
    const doc = new jsPDF("p", "mm", "letter");

    // Logos (public/logos)
    const [logoIzq, logoDer] = await Promise.all([
        imageToDataUrl("/logos/ESCUDO-UMSNH.jpg"),
        imageToDataUrl("/logos/logo_contraloria.jpg"),
    ]);

    // Columnas/tabla según clave
    const cols = EstructuraDatosPorClave[clave] ?? EstructuraDatosPorClave.default;
    const head = [cols];

    const body = filas.map((row) =>
        cols.map((c) => {
            const v =
                row?.[c] ??
                row?.[c.toLowerCase()] ??
                row?.[c.replaceAll(" ", "_")] ??
                "";
            return v === null || v === undefined || v === "" ? "-" : String(v);
        })
    );

    // Layout base
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const marginX = 10;
    const footerH = 22;

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
    const headerH = blockY + rowGap + 8;

    function drawHeader() {
        // Logos
        doc.addImage(logoIzq, "JPEG", logoLeftX, logoY, logoW, logoH);
        doc.addImage(logoDer, "JPEG", logoRightX, logoY, logoW, logoH);

        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("ANEXOS PARA LA ENTREGA-RECEPCIÓN DE LA UMSNH", pageW / 2, titleY, {
            align: "center",
        });

        // Rubro/Categoría (segunda línea)
        const categoriaNombre = getNombreCategoria(clave);

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
        doc.text("UR", marginX, blockY + rowGap);

        doc.setFont("helvetica", "normal");
        doc.text(meta.dependenciaClave ?? "", marginX + 24, blockY);
        doc.text(meta.dependenciaNombre ?? "", marginX + 48, blockY);

        doc.text(meta.urClave ?? "", marginX + 24, blockY + rowGap);
        doc.text(meta.urNombre ?? "", marginX + 48, blockY + rowGap);

        // Caja derecha
        doc.setFont("helvetica", "bold");
        doc.text("CLAVE DE ANEXO", pageW - marginX - 46, blockY);
        doc.text("INFORMACIÓN ACTUALIZADA AL", pageW - marginX - 70, blockY + rowGap);

        doc.setFont("helvetica", "normal");
        doc.text(meta.claveAnexo || clave, pageW - marginX, blockY, { align: "right" });
        doc.text(fmtDate(meta.infoActualizadaAl), pageW - marginX, blockY + rowGap, {
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

    function drawFooter(pageNumber: number) {
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
        doc.text(meta.elaboro ?? "", col.elaboro , y + 16, { align: "center" });
        doc.text(meta.superviso ?? "", col.superviso , y + 16, { align: "center" });
        doc.text(meta.entrego ?? "", col.entrega , y + 16, { align: "center" });

        // hoja X de Y
        doc.setFont("helvetica", "bold");
        doc.text("HOJA", col.hoja, y + 6, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.text(`${pageNumber} de ${TOTAL_PAGES_PLACEHOLDER}`, col.hoja, y + 16, {
            align: "center",
        });
    }

    autoTable(doc, {
        startY: headerH,
        head,
        body,
        margin: { left: marginX, right: marginX, top: headerH, bottom: footerH },
        styles: { font: "helvetica", fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
        didDrawPage: () => {
            drawHeader();
            const pageNumber = doc.getNumberOfPages();
            drawFooter(pageNumber);
        },
    });

    // Total pages placeholder
    // @ts-ignore
    if (typeof doc.putTotalPages === "function") {
        // @ts-ignore
        doc.putTotalPages(TOTAL_PAGES_PLACEHOLDER);
    }

    doc.save(`Anexo_${clave}.pdf`);
}
