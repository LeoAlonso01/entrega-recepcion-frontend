import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ActaPreviewDialog from "./ActaPreviewDialog";

const datos = { unidad_responsable: 212, folio: "ACTA-LOCAL", entrante: "Ana Pérez", saliente: "Juan López" };
const preview = {
  anexos_creador_id: 1, anexos_creador_usuario: "Cuenta local", anexos_origen: "usuario_autenticado",
  unidad_responsable: 212, unidad_nombre: "Auditoría Interna", total: 1, anexos_revision: "a".repeat(64),
  anexos: [{ id: 38, clave: "DO04", estado: "Borrador", fecha_creacion: "2026-11-20T12:00:00", filas: 3 }],
};
const response = (body: unknown, ok = true) => ({ ok, json: async () => body });
beforeEach(() => {
  localStorage.setItem("token", "test-token");
  global.fetch = jest.fn().mockResolvedValue(response(preview));
});
afterEach(() => jest.restoreAllMocks());

it("muestra anexos y estado sin guardar, y permite volver al formulario", async () => {
  const confirm = jest.fn(); const cancel = jest.fn();
  render(<ActaPreviewDialog datos={datos} onConfirm={confirm} onCancel={cancel} />);
  expect(await screen.findByText("Borrador")).toBeInTheDocument();
  expect(screen.queryByText("#38")).not.toBeInTheDocument();
  expect(screen.getByText("DERECHOS Y OBLIGACIONES")).toBeInTheDocument();
  expect(screen.queryByRole("columnheader", { name: "Filas" })).not.toBeInTheDocument();
  expect(screen.queryByText(/filas/i)).not.toBeInTheDocument();
  expect(screen.getByText("20/11/2026")).toBeInTheDocument();
  expect(screen.getByText("Auditoría Interna", { exact: false })).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/actas/vista-previa"), expect.objectContaining({
    method: "POST", body: JSON.stringify({ unidad_responsable: 212, saliente_id: null }),
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
  }));
  expect(confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Volver al formulario" }));
  expect(cancel).toHaveBeenCalledTimes(1);
});

it("envía la revisión confirmada una sola vez mientras se crea el acta", async () => {
  const confirm = jest.fn(() => new Promise<void>(() => {}));
  const cancel = jest.fn();
  render(<ActaPreviewDialog datos={datos} onConfirm={confirm} onCancel={cancel} />);
  await screen.findByText("Borrador");
  const button = screen.getByRole("button", { name: "Crear acta y asociar anexos" });
  fireEvent.click(button); fireEvent.click(button);
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(confirm).toHaveBeenCalledWith(preview.anexos_revision);
  expect(screen.getByRole("button", { name: "Volver al formulario" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(cancel).not.toHaveBeenCalled();
});

it("indica cuando no hay anexos y permite confirmar sin ellos", async () => {
  (fetch as jest.Mock).mockResolvedValue(response({ ...preview, total: 0, anexos: [] }));
  const confirm = jest.fn().mockResolvedValue(undefined);
  render(<ActaPreviewDialog datos={datos} onConfirm={confirm} onCancel={() => {}} />);
  expect(await screen.findByText(/Puedes crear el acta sin anexos/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Crear acta y asociar anexos" }));
  await waitFor(() => expect(confirm).toHaveBeenCalledWith(preview.anexos_revision));
});

it("bloquea la confirmación si la consulta falla y permite reintentar", async () => {
  (fetch as jest.Mock).mockRejectedValueOnce(new Error("Sin conexión"));
  render(<ActaPreviewDialog datos={datos} onConfirm={jest.fn()} onCancel={() => {}} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión");
  expect(screen.getByRole("button", { name: "Crear acta y asociar anexos" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Actualizar lista" }));
  await screen.findByText("Borrador");
  expect(screen.getByRole("button", { name: "Crear acta y asociar anexos" })).toBeEnabled();
});

it("actualiza la lista ante 409 y exige una nueva confirmación", async () => {
  const nuevaRevision = "b".repeat(64);
  (fetch as jest.Mock).mockResolvedValueOnce(response(preview)).mockResolvedValueOnce(response({
    ...preview, anexos_revision: nuevaRevision, anexos: [{ ...preview.anexos[0], estado: "Completado" }],
  }));
  const confirm = jest.fn().mockRejectedValueOnce(Object.assign(new Error("Cambió la lista"), { status: 409 })).mockResolvedValue(undefined);
  render(<ActaPreviewDialog datos={datos} onConfirm={confirm} onCancel={() => {}} />);
  await screen.findByText("Borrador");
  fireEvent.click(screen.getByRole("button", { name: "Crear acta y asociar anexos" }));
  await screen.findByText("Completado");
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/Los anexos cambiaron/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Crear acta y asociar anexos" }));
  await waitFor(() => expect(confirm).toHaveBeenLastCalledWith(nuevaRevision));
});

it("envía saliente_id 16 y muestra saliente y nombre de unidad sin identificadores", async () => {
  (fetch as jest.Mock).mockResolvedValue(response({
    ...preview, unidad_responsable: 49, unidad_nombre: "Unidad 49", total: 3,
    anexos_creador_id: 16, anexos_creador_usuario: "EMP0016", anexos_origen: "saliente",
    anexos: [
      { ...preview.anexos[0], id: 54, clave: "MJ01" },
      { ...preview.anexos[0], id: 55, clave: "RM01" },
      { ...preview.anexos[0], id: 56, clave: "SGC01" },
    ],
  }));
  render(<ActaPreviewDialog datos={{ ...datos, unidad_responsable: 49, saliente_id: 16 }} onConfirm={jest.fn()} onCancel={() => {}} />);
  await screen.findByText("3 anexo(s) por asociar");
  expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ body: JSON.stringify({ unidad_responsable: 49, saliente_id: 16 }) }));
  expect(screen.getByText("Funcionario saliente: Juan López")).toBeInTheDocument();
  expect(screen.getByText("Unidad Responsable: Unidad 49")).toBeInTheDocument();
  expect(screen.queryByText(/Origen de los anexos/)).not.toBeInTheDocument();
  expect(screen.queryByText(/ID 16|ID 49|EMP0016/)).not.toBeInTheDocument();
  for (const [categoria, clave] of [["MARCO JURIDICO", "MJ01"], ["RECURSOS MATERIALES", "RM01"], ["SISTEMA DE GESTION DE CALIDAD", "SGC01"]]) {
    expect(within(screen.getByRole("rowgroup", { name: categoria })).getByText(clave)).toBeInTheDocument();
  }
  expect(screen.getByText("3 categoría(s)")).toBeInTheDocument();
});
