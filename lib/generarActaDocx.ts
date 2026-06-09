import {
    AlignmentType,
    BorderStyle,
    Document,
    ImageRun,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from "docx";
import { saveAs } from "file-saver";

async function loadUmsnhLogo() {
    try {
        const response = await fetch("/logos/ESCUDO-UMSNH.jpg");
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();

        return new ImageRun({
            data: new Uint8Array(buffer),
            type: "jpg",
            transformation: {
                width: 62,
                height: 62,
            },
        });
    } catch {
        return null;
    }
}

function getTextValue(value: any) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.nombre ?? value.name ?? value.fullName ?? "";
}

function getUnidadNombre(acta: any) {
    return (
        acta.unidad_responsable?.nombre ??
        acta.unidad_responsable?.name ??
        acta.unidad?.nombre ??
        acta.unidad?.name ??
        acta.unidad_responsable ??
        acta.unidad ??
        ""
    );
}

function textParagraph(text: string, options: { bold?: boolean; align?: any } = {}) {
    return new Paragraph({
        alignment: options.align ?? AlignmentType.JUSTIFIED,
        children: [
            new TextRun({
                text,
                bold: options.bold ?? false,
                size: 24,
                font: "Arial",
            }),
        ],
        spacing: { after: 120 },
    });
}

function titleParagraph(text: string, size: number, bold = false) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text,
                bold,
                size,
                font: "Arial",
            }),
        ],
        spacing: { after: 120 },
    });
}

function anexoTable(anexo: any) {
    const fojas = anexo.datos ? anexo.datos.length : 0;

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [textParagraph("CLAVE", { bold: true, align: AlignmentType.LEFT })] }),
                    new TableCell({ children: [textParagraph("NO.FOJAS", { bold: true, align: AlignmentType.LEFT })] }),
                    new TableCell({ children: [textParagraph("OBSERVACIONES", { bold: true, align: AlignmentType.LEFT })] }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({ children: [textParagraph(anexo.clave || "-", { align: AlignmentType.LEFT })] }),
                    new TableCell({ children: [textParagraph(String(fojas), { align: AlignmentType.LEFT })] }),
                    new TableCell({ children: [textParagraph(anexo.estado || "", { align: AlignmentType.LEFT })] }),
                ],
            }),
        ],
    });
}

function signatureLine() {
    return new Paragraph({
        children: [new TextRun({ text: "", size: 22, font: "Arial" })],
        border: {
            bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
            },
        },
        spacing: { after: 80 },
    });
}

function signatureCell(title: string, name: string) {
    return new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [
            new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({
                        text: title,
                        size: 24,
                        font: "Arial",
                    }),
                ],
                spacing: { after: 120 },
            }),
            signatureLine(),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: name,
                        size: 22,
                        font: "Arial",
                    }),
                ],
                spacing: { after: 0 },
            }),
        ],
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
    });
}

function centeredSignatureCell(title: string, name: string) {
    return new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: title,
                        size: 24,
                        font: "Arial",
                    }),
                ],
                spacing: { after: 120 },
            }),
            new Paragraph({
                children: [new TextRun({ text: "", size: 22, font: "Arial" })],
                border: {
                    bottom: {
                        color: "000000",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6,
                    },
                },
                spacing: { after: 80 },
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: name,
                        size: 22,
                        font: "Arial",
                    }),
                ],
            }),
        ],
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
    });
}

export async function generarActaDocx(acta: any) {
    const unidadNombre = getUnidadNombre(acta);
    const horaCierre = acta.hora_cierre_acta || acta.hora || "";
    const fechaCierre = acta.fecha_cierre_acta || acta.fecha || "";
    const saliente = getTextValue(acta.saliente);
    const entrante = getTextValue(acta.entrante);
    const testigoEntrante = getTextValue(acta.testigo_entrante);
    const testigoSaliente = getTextValue(acta.testigo_saliente);
    const comisionado = getTextValue(acta.comisionado);
    const logoRun = await loadUmsnhLogo();

    const anexosData = acta.anexos || [];
    const anexos = anexosData.length
        ? anexosData.flatMap((anexo: any) => [
              new Paragraph({
                  children: [
                      new TextRun({
                          text: anexo.categoria || "ANEXO",
                          bold: true,
                          size: 22,
                          font: "Arial",
                      }),
                  ],
                  spacing: { before: 120, after: 100 },
              }),
              anexoTable(anexo),
              new Paragraph({ text: "", spacing: { after: 120 } }),
          ])
        : [
              new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                      new TextRun({
                          text: "SIN ANEXOS REGISTRADOS",
                          size: 22,
                          font: "Arial",
                      }),
                  ],
                  spacing: { before: 120, after: 120 },
              }),
          ];

    const logoParagraph = logoRun
        ? [
              new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [logoRun],
                  spacing: { after: 100 },
              }),
          ]
        : [];

    const anexoSectionTitle = new Paragraph({
        children: [
            new TextRun({
                text: "ANEXOS",
                bold: true,
                size: 22,
                font: "Arial",
            }),
        ],
        spacing: { before: 120, after: 80 },
    });

    const doc = new Document({
        sections: [
            {
                children: [
                    ...logoParagraph,
                    titleParagraph("UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO", 24, true),
                    titleParagraph("ACTA ADMINISTRATIVA DE ENTREGA RECEPCIÓN", 20, false),
                    new Paragraph({ text: "", spacing: { after: 120 } }),
                    textParagraph(
                        `Se levanta la presente Acta Administrativa con motivo de la Entrega-Recepción de la Unidad Académica denominada ${unidadNombre}, en la ciudad de Morelia, siendo las ${horaCierre} horas del día ${fechaCierre}. Para tal efecto se reunieron en las oficinas que ocupa el Departamento de Auditoría Interna, ubicadas en Av. Francisco J. Mújica s/n, Antigua Torre de Rectoría, colonia Felícitas del Río, código postal 58040, en la ciudad de Morelia, Michoacán.`
                    ),
                    textParagraph(
                        `Comparecen el C. ${entrante}, quien se identifica con credencial expedida por el Instituto Nacional Electoral número ${acta.ine_entrante} y señala como domicilio para recibir notificaciones o documentos relacionados con la presente acta el ubicado en ${acta.domicilio_entrante}, quien al día 27 de mayo de 2025 deja de ocupar el cargo de Secretario Académico.`
                    ),
                    textParagraph(
                        `Asimismo comparece el C. Barajas Pérez Beny Oliver, quien se identifica con credencial expedida por el Instituto Nacional Electoral número ${acta.ine_saliente} y señala como domicilio para recibir notificaciones o documentos relacionados con la presente acta el ubicado en ${acta.domicilio_saliente},interior 304, fraccionamiento Campestre del Vergel, código postal 58195, en la ciudad de Morelia, Michoacán, quien a partir del día 28 de mayo de 2025 recibe el área en calidad de Secretario Académico.`
                    ),
                    textParagraph(
                        `Lo anterior en atención a la designación de que fue objeto por parte de la Doctora Yarabí Ávila González, en su carácter de Rectora de la Universidad Michoacana de San Nicolás de Hidalgo, a través del nombramiento número 456/2025 de fecha 28 de mayo de 2025, para asumir las funciones que le han sido conferidas, con fundamento en lo dispuesto por el artículo 22, fracción I, de la Ley Orgánica de la Universidad Michoacana de San Nicolás de Hidalgo, con actividades propias de un trabajador de confianza en términos de lo dispuesto en el artículo 9° de la Ley Federal del Trabajo.`
                    ),
                    textParagraph(
                        `Acto seguido, el C. ${testigoEntrante} y el C. ${testigoSaliente}, en su carácter deservidor público saliente y entrante respectivamente, designan como testigos de asistencia a las C. Vargas Moreno Tania y C. Nambo Cervantes Arisbeth Montsserrat, quienes se identificaron con credencial oficial números ${acta.ine_testigo_entrante} y ${acta.ine_testigo_saliente} expedidas por el Instituto Nacional Electoral.`
                    ),
                    textParagraph(
                        `También se encuentra presente en este acto la C. ${comisionado}, quien se identifica con credencial oficial número ${acta.ine_comisionado} expedida por el Instituto Nacional Electoral, en su carácter deauditora comisionada por el Departamento de Auditoría Interna, mediante oficio número 316/2025/DAI de fecha 06 de junio de 2025, para intervenir en la presente Acta Administrativa.`
                    ),
                    textParagraph(
                        `Continuando con la parte principal de esta Acta y con fundamento en lo dispuesto por los artículos 1, 3 fracción XXI, 8, 9 fracción II, 10, 49 fracciones V y VII, 63 y 71 segundo párrafo de la Ley General de Responsabilidades Administrativas, el auditor comisionado exhorta a los que en ella intervienen a cumplir con la función pública y con las responsabilidades que como servidores públicos les corresponden.`
                    ),
                    textParagraph(
                        `Asimismo se hace del conocimiento que la presencia del auditor comisionado no implica la realización de una revisión, teniendo únicamente como finalidad auxiliar en la formalización del acto administrativo de Entrega-Recepción.`
                    ),
                    textParagraph(
                        `El C. Montaño Ávila Eduardo hace entrega de la Secretaría Académica de la Unidad Profesional Lázaro Cárdenas de esta Casa de Estudios, área en la que fungió como titular, por lo que de conformidad hace entrega y se compromete a realizar las acciones que contempla la normatividad señalada respecto de su cargo en la administración de dicha secretaría.`
                    ),
                    textParagraph(
                        `Para efectos de la presente Acta se entenderá que el servidor público entrante es la persona que recibe y el servidor público saliente es quien realiza la entrega.`
                    ),
                    textParagraph(
                        `Acreditadas las personalidades con que comparecen los participantes en la presente Acta, se procede a entregar los anexos que contienen la información relacionada con los asuntos de su competencia, sí como los recursos asignados para el ejercicio de sus atribuciones legales, por lo que para estos efectos se hace entrega conforme al siguiente orden:`
                    ),
                    anexoSectionTitle,
                    ...anexos,
                    textParagraph(
                        `Acto seguido, el C. ${saliente}, Servidor Público Saliente, dio curso a la entrega de la ${unidadNombre} al C. ${entrante}, Servidor Público Entrante.`
                    ),
                    textParagraph(
                        `Los informes, anexos y documentos que se mencionan son parte integrante de la misma y se firman en todas sus fojas para su identificación y efectos legales a que haya lugar, las cuales están foliadas en forma consecutiva por la persona designada para elaborarla y verificarla.`
                    ),
                    textParagraph(
                        `El C. ${entrante}, recibe con las reservas de la Ley, del C. ${saliente}, toda la información, recursos y documentos que se precisan en el contenido de la presente Acta y sus anexos.`
                    ),
                    textParagraph(
                        `Respecto a la propiedad de documentación y expedientes: Tomando la palabra el Auditor comisionado hace del conocimiento a las partes que la documentación contable, financiera, administrativa y expedientes generados durante cada administración deben quedar bajo resguardo y conservación en la ${unidadNombre}, para los fines a que haya lugar.`
                    ),
                    textParagraph(
                        `Origen de la documentación soporte y de evidencia para integración del Acta de Entrega-Recepción: Se deja asentado que la documentación para la integración del presente instrumento fue proporcionada por el C. ${saliente}, quien en uso de la palabra señala que los documentos originales e información contenida en diversos documentos que se formularon para integrarlos en esta Acta obran en las áreas administrativas de la ${unidadNombre} para su cotejo y validación.`
                    ),
                    textParagraph(
                        `Seguimiento del servidor público saliente derivado de su función pública: De conformidad con el artículo 51 de las Disposiciones Generales para la Administración, Ejercicio y Rendición de Cuentas de los Recursos Públicos Universitarios periodo 2023, el servidor público saliente que haya sido responsable de la ejecución financiera y del control de los ingresos y egresos del gasto público que deja de ocupar su cargo universitario deberá ser informado por el rector o el enlace que éste designe para la atención y seguimiento de las auditorías dentro de las siguientes veinticuatro horas de haber recibido alguna notificación para la práctica de una auditoría, así como de los oficios que de ésta se desprendan.`
                    ),
                    textParagraph(
                        `De la verificación física y validación de información: El servidor público que recibe tiene la obligación de revisar la información contenida en los rubros y anexos inherentes a su nuevo encargo, de la cual podrá solicitar por escrito las aclaraciones o precisiones que considere pertinentes a quien le entregó dentro de los treinta días hábiles siguientes al de la firma del Acta; el servidor público que entregó tendrá la obligación de dar respuesta a las mismas en un plazo igual contado a partir del requerimiento.`
                    ),
                    textParagraph(
                        `Término prudencial establecido para las observaciones y aclaraciones de la verificación física de la información: El Departamento de Auditoría Interna establece un término prudencial de treinta días hábiles contados a partir de la conclusión de los plazos señalados anteriormente; en caso de existir observaciones o aclaraciones sobre la información y documentación soporte del Acta deberá hacerse del conocimiento por escrito a las oficinas que se consideren competentes para los efectos conducentes.`
                    ),
                    textParagraph(
                        `El presente instrumento no libera a las partes que aquí intervienen de su responsabilidad por los actos u omisiones en que hubieran incurrido en el ejercicio de sus funciones, mismas que con posterioridad pudieran llegar a determinarse por la autoridad competente.`
                    ),
                    textParagraph(
                        `Los términos y condiciones que en el Acta se establecen quedan bajo la aceptación y responsabilidad de quien entrega y de quien recibe.`
                    ),
                    textParagraph(
                        `No habiendo otro hecho que hacer constar, leída que fue la presente Acta y enterados de su contenido y alcance, siendo las ${horaCierre} horas del día ${fechaCierre}, se da por terminada, firmando al margen y al calce cada una de sus hojas todos los que en ella intervinieron y quisieron hacerlo.`
                    ),
                    new Paragraph({ text: "", pageBreakBefore: true }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    signatureCell("ENTREGA:", saliente),
                                    signatureCell("RECIBE:", entrante),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    signatureCell("TESTIGO DE ENTREGA:", testigoSaliente),
                                    signatureCell("TESTIGO DE RECEPCION:", testigoEntrante),
                                ],
                            }),
                        ],
                    }),
                    new Paragraph({ text: "", spacing: { after: 240 } }),
                    centeredSignatureCell("POR LA CONTRALORIA", comisionado),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);

    saveAs(blob, `acta_${acta.folio}.docx`);
}
