"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { imageToDataUrl } from "./helpPngPdf";

// helper de cambio de página
function checkPageBreak(doc: jsPDF, y: number) {

    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 20;

    if (y > pageHeight - bottomMargin) {
        doc.addPage();
        return 20;
    }

    return y;
}

// motor de escritor de parrafos, tablas y demás contenido del acta
function writeParagraph(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number
) {

    const pageHeight = doc.internal.pageSize.getHeight()
    const bottomMargin = 20

    // calcular altura del texto
    const textHeight = doc.getTextDimensions(text, { maxWidth }).h

    // salto de página si es necesario
    if (y + textHeight > pageHeight - bottomMargin) {
        doc.addPage()
        y = 25
    }

    doc.text(text, x, y, {
        maxWidth: maxWidth,
        align: "justify"
    })

    return y + textHeight + 4
}

function drawAnexoTable(doc: jsPDF, anexo: any, y: number, marginLeft: number, usableWidth: number) {

    const pageHeight = doc.internal.pageSize.getHeight()

    if (y > pageHeight - 40) {
        doc.addPage()
        y = 25
    }

    const col1 = marginLeft
    const col2 = marginLeft + usableWidth * 0.60
    const col3 = marginLeft + usableWidth * 0.75
    const col4 = marginLeft + usableWidth * 0.85

    const rowHeight = 8

    doc.setFont("helvetica", "bold")
    doc.rect(marginLeft, y, usableWidth, rowHeight)

    doc.text("ANEXOS", col1 + 2, y + 5)
    doc.text("CLAVE", col2 + 2, y + 5)
    doc.text("NO.FOJAS", col3 + 2, y + 5)
    doc.text("OBSERVACIONES", col4 + 2, y + 5)

    y += rowHeight

    doc.setFont("helvetica", "normal")

    doc.rect(marginLeft, y, usableWidth, rowHeight)

    doc.text(anexo.nombre, col1 + 2, y + 5)
    doc.text(anexo.clave, col2 + 2, y + 5)

    const fojas = anexo.datos ? anexo.datos.length : 0
    doc.text(String(fojas), col3 + 2, y + 5)

    doc.text(anexo.estado ?? "", col4 + 2, y + 5)

    y += rowHeight + 6

    return y
}

export const generarActa = async (actaData: any) => {

    const doc = new jsPDF("p", "mm", "letter");

    // Cargar logos
    const [logoIzq] = await Promise.all([
        imageToDataUrl("/logos/ESCUDO-UMSNH.jpg"),
    ]);

    // Dibujar logos
    doc.addImage(logoIzq, "JPEG", 15, 12, 22, 22);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginLeft = 18;
    const marginRight = 18;

    const usableWidth = pageWidth - marginLeft - marginRight;

    let y = 20;

    // TITULO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
        "UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO",
        pageWidth / 2,
        y,
        { align: "center" }
    );

    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
        "ACTA ADMINISTRATIVA DE ENTREGA RECEPCIÓN",
        pageWidth / 2,
        y,
        { align: "center" }
    );

    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const p1 = `Se levanta la presente Acta Administrativa con motivo de la Entrega-Recepción de la Unidad Académica denominada ${actaData.unidad_responsable}, en la ciudad de Morelia, siendo las ${actaData.hora_cierre_acta} horas del día 09 de junio de 2025. Para tal efecto se reunieron en las oficinas que ocupa el Departamento de Auditoría Interna, ubicadas en Av. Francisco J. Mújica s/n, Antigua Torre de Rectoría, colonia Felícitas del Río, código postal 58040, en la ciudad de Morelia, Michoacán.`

    const p2 = `Comparecen el C. ${actaData.entrante}, quien se identifica con credencial expedida por el Instituto Nacional Electoral número ${actaData.ine_entrante} y señala como domicilio para recibir notificaciones o documentos relacionados con la presente acta el ubicado en ${actaData.domicilio_entrante}, quien al día 27 de mayo de 2025 deja de ocupar el cargo de Secretario Académico.`

    const p3 = `Asimismo comparece el C. Barajas Pérez Beny Oliver, quien se identifica con credencial expedida por el Instituto Nacional Electoral número ${actaData.ine_saliente} y señala como domicilio para recibir notificaciones o documentos relacionados con la presente acta el ubicado en ${actaData.domicilio_saliente},interior 304, fraccionamiento Campestre del Vergel, código postal 58195, en la ciudad de Morelia, Michoacán, quien a partir del día 28 de mayo de 2025 recibe el área en calidad de Secretario Académico.`

    const p4 = `Lo anterior en atención a la designación de que fue objeto por parte de la Doctora Yarabí Ávila González, en su carácter de Rectora de la Universidad Michoacana de San Nicolás de Hidalgo, a través del nombramiento número 456/2025 de fecha 28 de mayo de 2025, para asumir las funciones que le han sido conferidas, con fundamento en lo dispuesto por el artículo 22, fracción I, de la Ley Orgánica de la Universidad Michoacana de San Nicolás de Hidalgo, con actividades propias de un trabajador de confianza en términos de lo dispuesto en el artículo 9° de la Ley Federal del Trabajo.`

    const p5 = `Acto seguido, el C. ${actaData.testigo_entrante} y el C. ${actaData.testigo_saliente}, en su carácter deservidor público saliente y entrante respectivamente, designan como testigos de asistencia a las C. Vargas Moreno Tania y C. Nambo Cervantes Arisbeth Montsserrat, quienes se identificaron con credencial oficial números ${actaData.ine_testigo_entrante} y ${actaData.ine_testigo_saliente} expedidas por el Instituto Nacional Electoral.`

    const p6 = `También se encuentra presente en este acto la C. ${actaData.comisionado}, quien se identifica con credencial oficial número ${actaData.ine_comisionado} expedida por el Instituto Nacional Electoral, en su carácter deauditora comisionada por el Departamento de Auditoría Interna, mediante oficio número 316/2025/DAI de fecha 06 de junio de 2025, para intervenir en la presente Acta Administrativa.`

    const p7 = `Continuando con la parte principal de esta Acta y con fundamento en lo dispuesto por los artículos 1, 3 fracción XXI, 8, 9 fracción II, 10, 49 fracciones V y VII, 63 y 71 segundo párrafo de la Ley General de Responsabilidades Administrativas, el auditor comisionado exhorta a los que en ella intervienen a cumplir con la función pública y con las responsabilidades que como servidores públicos les corresponden.`

    const p8 = `Asimismo se hace del conocimiento que la presencia del auditor comisionado no implica la realización de una revisión, teniendo únicamente como finalidad auxiliar en la formalización del acto administrativo de Entrega-Recepción.`

    const p9 = `El C. Montaño Ávila Eduardo hace entrega de la Secretaría Académica de la Unidad Profesional Lázaro Cárdenas de esta Casa de Estudios, área en la que fungió como titular, por lo que de conformidad hace entrega y se compromete a realizar las acciones que contempla la normatividad señalada respecto de su cargo en la administración de dicha secretaría.`

    const p10 = `Para efectos de la presente Acta se entenderá que el servidor público entrante es la persona que recibe y el servidor público saliente es quien realiza la entrega.`

    const p11 = `Acreditadas las personalidades con que comparecen los participantes en la presente Acta, se procede a entregar los anexos que contienen la información relacionada con los asuntos de su competencia, sí como los recursos asignados para el ejercicio de sus atribuciones legales, por lo que para estos efectos se hace entrega conforme al siguiente orden:`

    const p12 = `Acto seguido, el C. ${actaData.saliente.nombre}, Servidor Público Saliente, dio curso a la entrega de la ${actaData.unidad} al C. ${actaData.entrante.nombre}, Servidor Público Entrante.`

    const p13 = `Los informes, anexos y documentos que se mencionan son parte integrante de la misma y se firman en todas sus fojas para su identificación y efectos legales a que haya lugar, las cuales están foliadas en forma consecutiva por la persona designada para elaborarla y verificarla.`

    const p14 = `El C. ${actaData.entrante.nombre}, recibe con las reservas de la Ley, del C. ${actaData.saliente.nombre}, toda la información, recursos y documentos que se precisan en el contenido de la presente Acta y sus anexos.`

    const p15 = `Respecto a la propiedad de documentación y expedientes: Tomando la palabra el Auditor comisionado hace del conocimiento a las partes que la documentación contable, financiera, administrativa y expedientes generados durante cada administración deben quedar bajo resguardo y conservación en la ${actaData.unidad}, para los fines a que haya lugar.`

    const p16 = `Origen de la documentación soporte y de evidencia para integración del Acta de Entrega-Recepción: Se deja asentado que la documentación para la integración del presente instrumento fue proporcionada por el C. ${actaData.saliente.nombre}, quien en uso de la palabra señala que los documentos originales e información contenida en diversos documentos que se formularon para integrarlos en esta Acta obran en las áreas administrativas de la ${actaData.unidad} para su cotejo y validación.`

    const p17 = `Seguimiento del servidor público saliente derivado de su función pública: De conformidad con el artículo 51 de las Disposiciones Generales para la Administración, Ejercicio y Rendición de Cuentas de los Recursos Públicos Universitarios periodo 2023, el servidor público saliente que haya sido responsable de la ejecución financiera y del control de los ingresos y egresos del gasto público que deja de ocupar su cargo universitario deberá ser informado por el rector o el enlace que éste designe para la atención y seguimiento de las auditorías dentro de las siguientes veinticuatro horas de haber recibido alguna notificación para la práctica de una auditoría, así como de los oficios que de ésta se desprendan.`

    const p18 = `De la verificación física y validación de información: El servidor público que recibe tiene la obligación de revisar la información contenida en los rubros y anexos inherentes a su nuevo encargo, de la cual podrá solicitar por escrito las aclaraciones o precisiones que considere pertinentes a quien le entregó dentro de los treinta días hábiles siguientes al de la firma del Acta; el servidor público que entregó tendrá la obligación de dar respuesta a las mismas en un plazo igual contado a partir del requerimiento.`

    const p19 = `Término prudencial establecido para las observaciones y aclaraciones de la verificación física de la información: El Departamento de Auditoría Interna establece un término prudencial de treinta días hábiles contados a partir de la conclusión de los plazos señalados anteriormente; en caso de existir observaciones o aclaraciones sobre la información y documentación soporte del Acta deberá hacerse del conocimiento por escrito a las oficinas que se consideren competentes para los efectos conducentes.`

    const p20 = `El presente instrumento no libera a las partes que aquí intervienen de su responsabilidad por los actos u omisiones en que hubieran incurrido en el ejercicio de sus funciones, mismas que con posterioridad pudieran llegar a determinarse por la autoridad competente.`

    const p21 = `Los términos y condiciones que en el Acta se establecen quedan bajo la aceptación y responsabilidad de quien entrega y de quien recibe.`

    const p22 = `No habiendo otro hecho que hacer constar, leída que fue la presente Acta y enterados de su contenido y alcance, siendo las ${actaData.horaCierre} horas del día ${actaData.fecha}, se da por terminada, firmando al margen y al calce cada una de sus hojas todos los que en ella intervinieron y quisieron hacerlo.`
    // -------- PARRAFO 1 --------

    y = writeParagraph(doc, p1, marginLeft, y, usableWidth);

    // -------- PARRAFO 2 --------

    y = writeParagraph(doc, p2, marginLeft, y, usableWidth);

    // -------- PARRAFO 3 --------

    y = writeParagraph(doc, p3, marginLeft, y, usableWidth);

    // -------- PARRAFO 4 --------
    y = writeParagraph(doc, p4, marginLeft, y, usableWidth);

    // -------- PARRAFO 5 --------
    y = writeParagraph(doc, p5, marginLeft, y, usableWidth);

    // -------- PARRAFO 6 --------
    y = writeParagraph(doc, p6, marginLeft, y, usableWidth);

    // -------- PARRAFO 7 --------
    y = writeParagraph(doc, p7, marginLeft, y, usableWidth);

    // -------- PARRAFO 8 --------
    y = writeParagraph(doc, p8, marginLeft, y, usableWidth);

    // -------- PARRAFO 9 --------
    y = writeParagraph(doc, p9, marginLeft, y, usableWidth);

    // -------- PARRAFO 10 --------
    y = writeParagraph(doc, p10, marginLeft, y, usableWidth);

    // -------- PARRAFO 11 --------
    y = writeParagraph(doc, p11, marginLeft, y, usableWidth);

  // -------- TABLAS DE ANEXOS --------

const rowHeight = 8

actaData.anexos?.forEach((anexo: any) => {

    y = checkPageBreak(doc, y)

    const fojas = anexo.datos ? anexo.datos.length : 0

    // ----- TITULO DEL ANEXO (FUERA DE TABLA) -----

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)

    doc.text(anexo.nombre || "ANEXO", marginLeft, y)

    y += 6
    y = checkPageBreak(doc, y)

    // columnas
    const colClave = marginLeft
    const colFojas = marginLeft + usableWidth * 0.35
    const colObs = marginLeft + usableWidth * 0.55

    // ----- ENCABEZADO TABLA -----

    doc.setFont("helvetica", "bold")

    doc.rect(marginLeft, y, usableWidth, rowHeight)

    doc.text("CLAVE", colClave + 2, y + 5)
    doc.text("NO.FOJAS", colFojas + 2, y + 5)
    doc.text("OBSERVACIONES", colObs + 2, y + 5)

    y += rowHeight
    y = checkPageBreak(doc, y)

    // ----- FILA DATOS -----

    doc.setFont("helvetica", "normal")

    doc.rect(marginLeft, y, usableWidth, rowHeight)

    doc.text(anexo.clave || "-", colClave + 2, y + 5)
    doc.text(String(fojas), colFojas + 2, y + 5)
    doc.text(anexo.estado || "", colObs + 2, y + 5)

    y += rowHeight + 10

})

y = checkPageBreak(doc, y)

    // -------- Parrafos despues de las tablas --------

    y = writeParagraph(doc, p12, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p13, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p14, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p15, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p16, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p17, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p18, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p19, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p20, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p21, marginLeft, y, usableWidth);

    y = writeParagraph(doc, p22, marginLeft, y, usableWidth);


    // -------- FIRMAS --------

    const firmaY = y;

    doc.text("ENTREGA:", marginLeft, firmaY);
    doc.text("RECIBE:", pageWidth / 2 + 10, firmaY);

    y += 25;

    doc.line(marginLeft, y, marginLeft + 60, y);
    doc.line(pageWidth / 2 + 10, y, pageWidth / 2 + 70, y);

    y += 5;

    doc.text(actaData.saliente || "", marginLeft, y);
    doc.text(actaData.entrante || "", pageWidth / 2 + 10, y);

    y += 20;

    doc.text("POR LA CONTRALORÍA", pageWidth / 2, y, { align: "center" });

    y += 15;

    doc.line(pageWidth / 2 - 35, y, pageWidth / 2 + 35, y);

    y += 5;

    doc.text(actaData.comisionado || "", pageWidth / 2, y, { align: "center" });

    // -------- NUMERACIÓN DE PÁGINAS --------

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {

        doc.setPage(i);

        doc.setFontSize(10);

        doc.text(
            `Página ${i} de ${totalPages}`,
            pageWidth - 20,
            pageHeight - 10,
            { align: "right" }
        );
    }

    // -------- DESCARGA --------

    doc.save(`acta_${actaData.folio}.pdf`);
};