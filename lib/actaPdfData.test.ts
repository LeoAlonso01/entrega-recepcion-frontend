import { cargarDatosActaPdf } from "./actaPdfData";

const data = { id: 15, folio: "ACTA-15", fecha: "2026-11-21", unidad_responsable: 49,
  unidad_nombre: "Unidad guardada", entrante: "Entrante", saliente: "Saliente" };

beforeEach(() => { localStorage.setItem("token", "pdf-token"); global.fetch = jest.fn(); });

it("consulta nuevamente los datos guardados para cada generación, con sesión y sin caché", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => data })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ ...data, saliente: "Nombre corregido en BD" }) });
  expect((await cargarDatosActaPdf(15)).saliente).toBe("Saliente");
  expect((await cargarDatosActaPdf(15)).saliente).toBe("Nombre corregido en BD");
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/actas/15/datos-pdf"), {
    headers: { Authorization: "Bearer pdf-token" }, cache: "no-store",
  });
});

it("no genera documentos con sesión ausente o datos incompletos", async () => {
  localStorage.removeItem("token");
  await expect(cargarDatosActaPdf(15)).rejects.toThrow("Inicia sesión");
  expect(fetch).not.toHaveBeenCalled();
  localStorage.setItem("token", "pdf-token");
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ...data, saliente: "" }) });
  await expect(cargarDatosActaPdf(15)).rejects.toThrow("Completa");
});
