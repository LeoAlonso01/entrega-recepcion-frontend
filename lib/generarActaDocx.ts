import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";
import { saveAs } from "file-saver";

export async function generarActaDocx(acta:any){

    const rows = acta.anexos.map((anexo:any) => {

        const fojas = anexo.datos ? anexo.datos.length : 0

        return new TableRow({
            children:[
                new TableCell({
                    children:[new Paragraph(anexo.clave)]
                }),
                new TableCell({
                    children:[new Paragraph(String(fojas))]
                }),
                new TableCell({
                    children:[new Paragraph(anexo.estado)]
                })
            ]
        })

    })

    const doc = new Document({
        sections:[
            {
                children:[

                    new Paragraph({
                        text:"UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO",
                        heading:"Heading1"
                    }),

                    new Paragraph({
                        text:"ACTA ADMINISTRATIVA DE ENTREGA RECEPCIÓN",
                        heading:"Heading2"
                    }),

                    new Paragraph(""),

                    new Paragraph(
                        `En la ciudad de Morelia, siendo las ${acta.hora} horas del día ${acta.fecha},
se reunieron ${acta.saliente} como servidor público saliente y
${acta.entrante} como servidor público entrante para llevar a cabo
el proceso de entrega recepción.`
                    ),

                    new Paragraph(""),
                    new Paragraph("ANEXOS"),
                    new Paragraph(""),

                    new Table({
                        rows:[
                            new TableRow({
                                children:[
                                    new TableCell({children:[new Paragraph("CLAVE")]}),
                                    new TableCell({children:[new Paragraph("NO FOJAS")]}),
                                    new TableCell({children:[new Paragraph("ESTADO")]})
                                ]
                            }),
                            ...rows
                        ]
                    }),

                    new Paragraph(""),
                    new Paragraph(""),

                    new Paragraph("ENTREGA: " + acta.saliente),
                    new Paragraph("RECIBE: " + acta.entrante),
                    new Paragraph("AUDITOR: " + acta.comisionado)

                ]
            }
        ]
    })

    const blob = await Packer.toBlob(doc)

    saveAs(blob, `acta_${acta.folio}.docx`)
}