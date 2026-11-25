/** @jest-environment node */
import { crearActaPdf } from "./generarActa";
import { fechaPdf, normalizarActaPdf } from "./actaPdfData";
import { getDocument } from "pdfjs-dist";

jest.mock("./helpPngPdf", () => ({
  imageToDataUrl: jest.fn(async () => "data:image/jpeg;base64," + require("fs").readFileSync(require("path").join(process.cwd(), "public/logos/ESCUDO-UMSNH.jpg")).toString("base64")),
}));

const data = {
  id: 15, folio: "ACTA-VALIDACION-26", unidad_responsable: 49, unidad_nombre: "Departamento de Auditoría Interna",
  fecha: "2001-02-03", hora: "09:15", fecha_cierre_acta: "2001-02-04", hora_cierre_acta: "14:30",
  entrante: "María Guadalupe Villalón", saliente: "Roberto González López",
  testigo_saliente: "José Rubén Martínez López", testigo_entrante: "José Alberto Rojas Flores",
  ine_entrante: "INE-ENT-001", domicilio_entrante: "Madero Poniente 556", telefono_entrante: "4432449881",
  ine_testigo_entrante: "TESTIGO-ENT", ine_testigo_saliente: "TESTIGO-SAL",
  fecha_inicio_labores: "2001-02-02", fecha_fin_labores: "2001-02-01",
  nombramiento: "234/2001", fecha_nombramiento: "2001-01-30", asignacion: "nombramiento", asignado_por: "rectoria",
  oficio_comision: "OIC-COMUN", fecha_oficio_comision: "2001-02-01", comisionado: "Texto legado que no debe sustituir el detalle",
  comisiones: [
    { usuario_id: 1, nombre: "Leonardo Daniel Alonso Ledesma", mismo_oficio: true, oficio_comision: "IGNORAR", fecha_oficio_comision: "2001-01-01" },
    { usuario_id: null, nombre: "Auditor Externo", mismo_oficio: false, oficio_comision: "EXT-002", fecha_oficio_comision: "2001-02-02" },
  ], observaciones: "Observación guardada: entregar las llaves del archivo.",
  anexos: [
    { id: 56, acta_id: 15, clave: "SGC01", estado: "Borrador", datos: [{ dato: 1 }] },
    { id: 55, acta_id: 15, clave: "RM01", estado: "Revisión", datos: [{ dato: 1 }, { dato: 2 }] },
    { id: 54, acta_id: 15, clave: "MJ01", estado: "Completado", datos: [] },
  ],
};

async function readPdf(raw: Record<string, any> = data) {
  const doc = await crearActaPdf(raw);
  const pdf = await getDocument({ data: new Uint8Array(doc.output("arraybuffer")), useSystemFonts: true }).promise;
  const pages = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    pages.push({ width: page.view[2], height: page.view[3], items: content.items.filter((item): item is import("pdfjs-dist/types/src/display/api").TextItem => "str" in item) });
  }
  await pdf.destroy();
  return { pages, text: pages.flatMap(page => page.items.map(item => item.str)).join(" ").replace(/\s+/g, " ") };
}

it("genera un PDF real con fechas guardadas, roles correctos y todos los oficios", async () => {
  const { text } = await readPdf();
  expect(text).toContain("3 de febrero de 2001, a las 09:15 horas");
  expect(text).toContain("4 de febrero de 2001, a las 14:30 horas");
  expect(text).toContain("Roberto González López, en su carácter de persona servidora pública saliente");
  expect(text).toContain("María Guadalupe Villalón, en su carácter de persona servidora pública entrante");
  expect(text).toContain("Roberto González López designa como testigo de entrega a José Rubén Martínez López");
  expect(text).toContain("María Guadalupe Villalón designa como testigo de recepción a José Alberto Rojas Flores");
  expect(text).toContain("Leonardo Daniel Alonso Ledesma"); expect(text).toContain("Auditor Externo");
  expect(text).toContain("OIC-COMUN"); expect(text).toContain("EXT-002");
  expect(text).toContain(data.observaciones); expect(text).toContain(data.telefono_entrante);
  expect(text).not.toContain("Secretario Académico"); expect(text).not.toContain("IGNORAR");
  expect(text).not.toContain("undefined"); expect(text).not.toContain("[object Object]");
  expect(text).not.toContain("NO.FOJAS");
  expect(text.indexOf("MARCO JURIDICO")).toBeLessThan(text.indexOf("RECURSOS MATERIALES"));
  expect(text.indexOf("RECURSOS MATERIALES")).toBeLessThan(text.indexOf("SISTEMA DE GESTION DE CALIDAD"));
});

it("mantiene márgenes, encabezados y firmas con observaciones largas y varios comisionados", async () => {
  const { pages, text } = await readPdf({ ...data,
    observaciones: Array.from({ length: 100 }, (_, i) => `Observación ${i + 1}: resguardo de documentación y recursos de la unidad.`).join("\n"),
    comisiones: Array.from({ length: 7 }, (_, i) => ({ usuario_id: null, nombre: `Comisionado ${i + 1} con nombre y apellidos extensos de validación`, mismo_oficio: false, oficio_comision: `OF-${i}`, fecha_oficio_comision: "2001-02-01" })),
  });
  expect(pages.length).toBeGreaterThan(3);
  expect(text).toContain("Observación 100:");
  expect(text).toContain("Comisionado 7 con nombre y apellidos extensos de validación");
  pages.forEach((page, index) => {
    const textPage = page.items.map(item => item.str).join(" ");
    expect(textPage).toContain(`Página ${index + 1} de ${pages.length}`);
    expect(textPage).toContain("UNIVERSIDAD MICHOACANA");
    for (const item of page.items.filter(item => item.str.trim())) {
      expect(item.transform[4]).toBeGreaterThanOrEqual(30);
      expect(item.transform[4] + item.width).toBeLessThanOrEqual(page.width - 25);
      expect(item.transform[5]).toBeGreaterThan(10);
      expect(item.transform[5]).toBeLessThan(page.height - 20);
    }
  });
});

it("normaliza nombres antiguos, claves heredadas y excluye anexos eliminados o de otra acta", () => {
  const result = normalizarActaPdf({ ...data, comisiones: [], comisionado: { nombre: "Comisionada anterior" },
    entrante: { nombre: "Nombre desde objeto" }, anexos: [
      { id: 1, clave: "RRH01", acta_id: 15, estado: "Borrador" },
      { id: 2, clave: "RM01", acta_id: 99 }, { id: 3, clave: "MJ01", is_deleted: true },
    ] });
  expect(result.entrante).toBe("Nombre desde objeto");
  expect(result.comisiones[0].nombre).toBe("Comisionada anterior");
  expect(result.anexos).toHaveLength(1); expect(result.anexos[0].categoria).toBe("RECURSOS HUMANOS");
  expect(() => normalizarActaPdf({ ...data, unidad_nombre: "", unidad_responsable: 49 })).toThrow("Completa");
  expect(() => fechaPdf("2026-02-30")).toThrow("Fecha");
});

it("usa únicamente fojas confirmadas y vigentes en el inventario del acta", () => {
  const acta = normalizarActaPdf({ ...data, anexos: [
    { ...data.anexos[0], fojas_reporte: 3, reporte_vigente: true },
    { ...data.anexos[1], fojas_reporte: 9, reporte_vigente: false },
  ] });
  expect(acta.anexos.find(item => item.clave === "SGC01")?.fojas).toBe(3);
  expect(acta.anexos.find(item => item.clave === "RM01")?.fojas).toBeNull();
});

it("presenta lugar, INE y domicilio inmediatamente después del nombre de cada funcionario", async () => {
  const { text } = await readPdf({ ...data, lugar_acta: "Uruapan, Michoacán",
    ine_entrante: "0000123456789", ine_saliente: "0000987654321",
    domicilio_saliente: "Calle de Prueba 45, colonia Centro, Uruapan, Michoacán",
    telefono_saliente: "4430000001", nombramiento_saliente: "NOM-SAL-2024",
    asignacion_saliente: "nombramiento", asignado_por_saliente: "h_consejo",
  });
  expect(text).toContain("En Uruapan, Michoacán, el día 3 de febrero de 2001, a las 09:15 horas, se levanta");
  expect(text).toContain("Comparece Roberto González López, quien se identifica con credencial del Instituto Nacional Electoral número 0000987654321");
  expect(text).toContain("Asimismo comparece María Guadalupe Villalón, quien se identifica con credencial del Instituto Nacional Electoral número 0000123456789");
  const saliente = text.slice(text.indexOf("Comparece Roberto"), text.indexOf("Asimismo comparece"));
  const entrante = text.slice(text.indexOf("Asimismo comparece"), text.indexOf("designa como testigo"));
  expect(saliente).toContain("domicilio para recibir notificaciones y documentos relacionados con la presente acta el ubicado en Calle de Prueba 45");
  expect(saliente).toContain("NOM-SAL-2024"); expect(saliente).toContain("H. Consejo");
  expect(saliente).toContain("4430000001"); expect(saliente).not.toContain("0000123456789");
  expect(entrante).toContain("Madero Poniente 556"); expect(entrante).toContain(data.telefono_entrante);
  expect(entrante).not.toContain("0000987654321");
});

it("conserva domicilio y nombres largos sin salir de los márgenes ni perder el final", async () => {
  const { pages, text } = await readPdf({ ...data, lugar_acta: "Comunidad de prueba del municipio de Uruapan, Michoacán",
    ine_saliente: "0000000000012",
    domicilio_saliente: Array.from({ length: 45 }, (_, i) => `Referencia ${i + 1}: localidad y domicilio para notificaciones del funcionario saliente.`).join(" ") + " FIN-DOMICILIO-SALIENTE",
    domicilio_entrante: Array.from({ length: 45 }, (_, i) => `Referencia ${i + 1}: localidad y domicilio para notificaciones del funcionario entrante.`).join(" ") + " FIN-DOMICILIO-ENTRANTE",
  });
  expect(pages.length).toBeGreaterThan(3);
  expect(text).toContain("FIN-DOMICILIO-SALIENTE");
  expect(text).toContain("FIN-DOMICILIO-ENTRANTE");
  for (const page of pages) for (const item of page.items.filter(item => item.str.trim())) {
    expect(item.transform[4]).toBeGreaterThanOrEqual(30);
    expect(item.transform[4] + item.width).toBeLessThanOrEqual(page.width - 25);
    expect(item.transform[5]).toBeGreaterThan(10);
    expect(item.transform[5]).toBeLessThan(page.height - 20);
  }
});
