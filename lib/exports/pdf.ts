import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EstructuraDatosPorClave } from "../estructuraPorClave";
import { CATEGORIAS } from "../estructuraPorClave";

const TOTAL_PAGES_PLACEHOLDER = "{total_pages_count_string}";

export function getNombreCategoria(categoriaId?: string | number) {
    if (!categoriaId) return "Categoría desconocida";
    const id = String(categoriaId);
    return CATEGORIAS.find(c => c.id === id)?.nombre_categoria ?? "";
}

export interface PdfMeta {
    dependenciaClave?: string;
    dependenciaNombre?: string;
    urClave?: string;
    urNombre?: string;
    claveAnexo?: string;
    infoActualizadaAl?: string;
    fechaElaboracion?: string;
    elaboro?: string;
    superviso?: string;
    entrega?: string;
}

function fmtDate(d?: string) {
    if (!d) return "";
    // si ya viene dd-mm-aaaa lo dejas; si viene ISO lo formateas simple
    if (/^\d{2}-\d{2}-\d{4}$/.test(d)) return d;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    return `${dd}-${mm}-${yy}`;
}

export function generarAnexoPdf(
    clave: string,
    meta: PdfMeta,
    filas: Array<Record<string, any>>,
) {
    const doc = new jsPDF("p", "mm", "letter");

    const cols = EstructuraDatosPorClave[clave] ?? EstructuraDatosPorClave.default;
    const head = [cols];

    const body = filas.map((row) =>
        cols.map((c) => {
            const v = row?.[c] ?? row?.[c.toLowerCase()] ?? row?.[c.replaceAll(" ", "_")] ?? "";
            return v === null || v === undefined || v === "" ? "-" : String(v);
        })
    );

    const marginX = 10;
    const headerH = 42; // ajusta a tu layout
    const footerH = 22;

    function drawHeader() {
        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("ANEXOS PARA LA ENTREGA-RECEPCIÓN DE LA UMSNH", 105, 12, { align: "center" });
        doc.setFontSize(8);

        // 👇 Aquí va el rubro/categoría (segunda línea)
        const categoriaNombre = getNombreCategoria(meta.dependenciaClave);
        if (categoriaNombre?.trim()) {
            doc.setFontSize(10);
            doc.text(categoriaNombre.trim(), 105, 30, { align: "center" });
        }

        // (Opcional) Logos: si ya los tienes en base64, aquí los dibujas con addImage
        // doc.addImage(logoIzq, "PNG", 10, 8, 18, 18);
        // doc.addImage(logoDer, "PNG", 180, 8, 18, 18);

        // Línea
        doc.setLineWidth(0.3);
        doc.line(marginX, 22, 206, 22);

        // Bloque dependencia / UR
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);

        doc.text("DEPENDENCIA", marginX, 28);
        doc.text("UR", marginX, 34);

        doc.setFont("helvetica", "normal");
        doc.text(meta.dependenciaClave ?? "", marginX + 24, 28);
        doc.text(meta.dependenciaNombre ?? "", marginX + 48, 28);

        doc.text(meta.urClave ?? "", marginX + 24, 34);
        doc.text(meta.urNombre ?? "", marginX + 48, 34);

        // Caja derecha: clave anexo + info actualizada
        doc.setFont("helvetica", "bold");
        doc.text("CLAVE DE ANEXO", 160, 28);
        doc.text("INFORMACIÓN ACTUALIZADA AL", 136, 34);

        doc.setFont("helvetica", "normal");
        doc.text(meta.claveAnexo || clave, 200, 28, { align: "right" });
        doc.text(fmtDate(meta.infoActualizadaAl), 200, 34, { align: "right" });
    }

    function drawFooter(pageNumber: number) {
        const pageH = doc.internal.pageSize.getHeight();
        const y = pageH - footerH;

        // línea superior footer
        doc.setLineWidth(0.3);
        doc.line(marginX, y, 206, y);

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("FECHA DE", marginX, y + 6);
        doc.text("ELABORACIÓN", marginX, y + 10);

        doc.setFont("helvetica", "normal");
        doc.text(fmtDate(meta.fechaElaboracion), marginX + 2, y + 16);

        // columnas: elaboró / supervisó / entrega
        doc.setFont("helvetica", "bold");
        doc.text("ELABORÓ", 70, y + 6, { align: "center" });
        doc.text("SUPERVISÓ", 130, y + 6, { align: "center" });
        doc.text("ENTREGA", 180, y + 6, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.text(meta.elaboro ?? "", 70, y + 16, { align: "center" });
        doc.text(meta.superviso ?? "", 130, y + 16, { align: "center" });
        doc.text(meta.entrega ?? "", 180, y + 16, { align: "center" });

        // hoja X de Y
        doc.setFont("helvetica", "bold");
        doc.text("HOJA", 202, y + 6, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.text(
            `${pageNumber} de ${TOTAL_PAGES_PLACEHOLDER}`,
            202,
            y + 16,
            { align: "right" }
        );
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
            const pageNumber = doc.getNumberOfPages();
            drawFooter(pageNumber);
        },
    });

    // total pages
    // @ts-ignore - putTotalPages existe en jsPDF
    if (typeof doc.putTotalPages === "function") {
        // @ts-ignore
        doc.putTotalPages(TOTAL_PAGES_PLACEHOLDER);
    }

    doc.save(`Anexo_${clave}.pdf`);
}

