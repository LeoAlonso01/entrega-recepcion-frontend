import { calcularFojasAnexo, ErrorCalculoFojas, metadatosFojas } from "./calcularFojasAnexo";
import { crearReporteAnexo } from "./exports/pdf";

jest.mock("./exports/pdf", () => ({ crearReporteAnexo: jest.fn(), FORMATO_REPORTE_ANEXO: "anexo-carta-v1" }));
const anexo = {
  id: 7, clave: "RM04", datos: [{ Cantidad: 1 }], unidad_responsable_id: 12,
  unidad_responsable_nombre: "Unidad de prueba", unidad_padre_id: 1, unidad_padre_nombre: "Rectoría",
  creador_nombre: "Creador guardado", actualizado_en: "2026-11-25",
  reporte_revision_actual: "revision", reporte_formato_actual: "anexo-carta-v1",
};
const save = jest.fn();
const response = (data: unknown, status = 200) => ({ ok: status === 200, status, json: async () => data }) as Response;
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(crearReporteAnexo).mockResolvedValue({ fojas: 4, doc: { output: jest.fn(() => new Blob(["%PDF-temporal"], { type: "application/pdf" })), save } as any });
});

it("confirma las fojas con el backend sin descargar el documento ni crear enlaces", async () => {
  const fetcher = jest.fn().mockResolvedValueOnce(response(anexo))
    .mockResolvedValueOnce(response({ ...anexo, fojas_reporte: 4, reporte_vigente: true }));
  const confirmado = await calcularFojasAnexo(7, "/api", "token", fetcher);
  expect(confirmado.fojas_reporte).toBe(4);
  expect(crearReporteAnexo).toHaveBeenCalledWith("RM04", expect.objectContaining({ elaboro: "Creador guardado", superviso: "", entrego: "", fechaElaboracion: "2026-11-25" }), anexo.datos, { incluirLogos: false });
  const [, request] = fetcher.mock.calls[1];
  expect(request.method).toBe("POST");
  expect(request.body.get("revision")).toBe("revision");
  expect(request.body.get("formato")).toBe("anexo-carta-v1");
  expect(request.body.get("file").type).toBe("application/pdf");
  expect(save).not.toHaveBeenCalled();
});

it("usa los datos guardados del pie y no depende de la fecha de consulta", () => {
  expect(metadatosFojas(anexo)).toMatchObject({ fechaElaboracion: "2026-11-25", urClave: "1", urNombre: "Rectoría", revisionDatos: "revision" });
});

it("propaga el conflicto si cambió el anexo para actualizar la lista", async () => {
  const fetcher = jest.fn().mockResolvedValueOnce(response(anexo)).mockResolvedValueOnce(response({ detail: "El anexo cambió" }, 409));
  await expect(calcularFojasAnexo(7, "/api", "token", fetcher)).rejects.toMatchObject({ status: 409, message: "El anexo cambió" });
  expect(save).not.toHaveBeenCalled();
});

it("rechaza un conteo diferente al generado o una revisión no vigente", async () => {
  const fetcher = jest.fn().mockResolvedValueOnce(response(anexo)).mockResolvedValueOnce(response({ ...anexo, fojas_reporte: 3, reporte_vigente: true }));
  await expect(calcularFojasAnexo(7, "/api", "token", fetcher)).rejects.toThrow(/conteo/);
  const otro = jest.fn().mockResolvedValueOnce(response({ ...anexo, reporte_formato_actual: "otro" }));
  await expect(calcularFojasAnexo(7, "/api", "token", otro)).rejects.toBeInstanceOf(ErrorCalculoFojas);
  expect(otro).toHaveBeenCalledTimes(1);
});

it("no consulta ni calcula sin sesión", async () => {
  const fetcher = jest.fn();
  await expect(calcularFojasAnexo(7, "/api", "", fetcher)).rejects.toThrow(/sesión/);
  expect(fetcher).not.toHaveBeenCalled();
  expect(crearReporteAnexo).not.toHaveBeenCalled();
});

it("usa una foja por defecto para anexos PDF sin generar ni enviar un reporte", async () => {
  const fetcher = jest.fn().mockResolvedValueOnce(response({ ...anexo, clave: "PP01", fojas_por_defecto: true, fojas_reporte: 1, reporte_vigente: true }));
  const resultado = await calcularFojasAnexo(7, "/api", "token", fetcher);
  expect(resultado.fojas_reporte).toBe(1);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(crearReporteAnexo).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});
