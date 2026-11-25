import { fireEvent, render, screen } from "@testing-library/react";
import FormActa, { type ActaUsuario } from "./FormActa";

const usuarios: ActaUsuario[] = [
  { id: 1, username: "Administradora", nombre_completo: "Administradora", email: "admin@test.com", role: "ADMIN" },
  { id: 2, username: "Auditor", nombre_completo: "Auditor", email: "auditor@test.com", role: "AUDITOR" },
  { id: 3, username: "Regular", nombre_completo: "Regular", email: "regular@test.com", role: "USER" },
  { id: 4, username: "Eliminado", nombre_completo: "Eliminado", email: "deleted@test.com", role: "ADMIN", is_deleted: true },
];
const unidades = [{ id_unidad: 17, nombre: "Dirección de Finanzas" }];

beforeEach(() => { jest.spyOn(window, "confirm").mockReturnValue(true); });
afterEach(() => jest.restoreAllMocks());

it("registra en desarrollo el mismo payload al salir de Observaciones sin guardar", () => {
  jest.replaceProperty(process, "env", { ...process.env, NODE_ENV: "development" });
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ unidad_responsable: 17, entrante: "  Entrante  ", saliente: "Saliente" }} />);
  const observaciones = screen.getByPlaceholderText("Observaciones");
  fireEvent.blur(observaciones);
  expect(log).not.toHaveBeenCalled();
  fireEvent.change(observaciones, { target: { value: "Información revisada" } });
  fireEvent.blur(observaciones);
  expect(onSave).not.toHaveBeenCalled();
  expect(log).toHaveBeenCalledWith("[Acta local] Datos preparados para guardar:", expect.objectContaining({
    unidad_responsable: 17, entrante: "Entrante", observaciones: "Información revisada",
  }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(log.mock.calls[0][1]).toEqual(JSON.parse(JSON.stringify(onSave.mock.calls[0][0])));
  jest.replaceProperty(process, "env", { ...process.env, NODE_ENV: "production" });
  log.mockClear();
  fireEvent.blur(observaciones);
  expect(log).not.toHaveBeenCalled();
});

function select(label: string, query: string, name: RegExp) {
  const input = screen.getByRole("combobox", { name: label });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: query } });
  fireEvent.click(screen.getByRole("option", { name }));
}

it("filtra roles y envía IDs múltiples y nombres compatibles con la generación", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}} />);
  select("Unidad Responsable", "direccion", /Dirección de Finanzas/);
  fireEvent.focus(screen.getByRole("combobox", { name: "Comisionados" }));
  expect(screen.queryByRole("option", { name: /Regular|Eliminado/ })).not.toBeInTheDocument();
  select("Comisionados", "admin@test", /Administradora/);
  fireEvent.focus(screen.getByRole("combobox", { name: "Comisionados" }));
  expect(screen.queryByRole("option", { name: /Administradora/ })).not.toBeInTheDocument();
  select("Comisionados", "auditor", /Auditor/);
  select("Funcionario Entrante", "admin", /Administradora/);
  fireEvent.focus(screen.getByRole("combobox", { name: "Funcionario Saliente" }));
  expect(screen.queryByRole("option", { name: /Administradora|Auditor/ })).not.toBeInTheDocument();
  select("Funcionario Saliente", "regular", /Regular/);
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    unidad_responsable: 17, comisionados: [1, 2], comisionado: "Administradora, Auditor",
    entrante: "Administradora", entrante_id: 1, saliente: "Regular", saliente_id: 3,
  }));
  fireEvent.click(screen.getByRole("button", { name: "Quitar comisionado Administradora" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ comisionados: [2], comisionado: "Auditor" }));
});

it("impide enviar texto libre sin seleccionar resultados", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}} />);
  fireEvent.change(screen.getByRole("combobox", { name: "Unidad Responsable" }), { target: { value: "Inventada" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Selecciona una unidad responsable");
});

it("conserva nombres de actas anteriores al editar sin modificar participantes", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ id: 9, unidad_responsable: 17, comisionado: "Comisionado anterior", entrante: "Entrante anterior", saliente: "Saliente anterior" }} />);
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 9, comisionado: "Comisionado anterior", entrante: "Entrante anterior", saliente: "Saliente anterior" }));
});

it("envía el oficio común actualizado y el oficio diferente de cada comisionado", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ unidad_responsable: 17, entrante: "Entrante", saliente: "Saliente" }} />);
  select("Comisionados", "admin", /Administradora/);
  select("Comisionados", "auditor", /Auditor/);
  fireEvent.change(screen.getByLabelText("Oficio de comisión común"), { target: { value: "COM-001" } });
  fireEvent.change(screen.getByLabelText("Fecha del oficio común"), { target: { value: "2026-11-20" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "Usar oficio común para Auditor" }));
  fireEvent.change(screen.getByLabelText("Oficio de comisión de Auditor"), { target: { value: "COM-002" } });
  fireEvent.change(screen.getByLabelText("Fecha del oficio de Auditor"), { target: { value: "2026-11-21" } });
  fireEvent.change(screen.getByLabelText("Oficio de comisión común"), { target: { value: "COM-003" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    comisionados: [1, 2],
    comisiones: [
      { usuario_id: 1, nombre: "Administradora", mismo_oficio: true, oficio_comision: "COM-003", fecha_oficio_comision: "2026-11-20" },
      { usuario_id: 2, nombre: "Auditor", mismo_oficio: false, oficio_comision: "COM-002", fecha_oficio_comision: "2026-11-21" },
    ],
  }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Usar oficio común para Auditor" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave.mock.calls[1][0].comisiones[1]).toEqual({
    usuario_id: 2, nombre: "Auditor", mismo_oficio: true, oficio_comision: "COM-003", fecha_oficio_comision: "2026-11-20",
  });
  fireEvent.click(screen.getByRole("button", { name: "Quitar comisionado Auditor" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave.mock.calls[2][0].comisiones).toHaveLength(1);
});

it("recupera los oficios individuales al editar el acta", () => {
  const onSave = jest.fn();
  const comisiones = [{ usuario_id: 2, nombre: "Auditor", mismo_oficio: false, oficio_comision: "AUD-009", fecha_oficio_comision: "2026-11-19" }];
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ id: 9, unidad_responsable: 17, entrante: "Entrante", saliente: "Saliente", comisiones }} />);
  expect(screen.getByLabelText("Oficio de comisión de Auditor")).toHaveValue("AUD-009");
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 9, comisionados: [2], comisiones }));
});

it("permite capturar participantes sin cuenta incluso si falla el catálogo y limpia IDs anteriores", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} usuariosError="Sin conexión" onSave={onSave} onCancel={() => {}}
    acta={{ unidad_responsable: 17, entrante: "Administradora", entrante_id: 1, saliente: "Regular", saliente_id: 3 }} />);
  for (const label of ["Funcionario Entrante", "Funcionario Saliente"]) {
    fireEvent.click(screen.getByRole("checkbox", { name: `Capturar nombre manualmente de ${label}` }));
    fireEvent.change(screen.getByRole("textbox", { name: label }), { target: { value: `  ${label} externo  ` } });
  }
  fireEvent.click(screen.getByRole("checkbox", { name: "Capturar nombre manualmente de Comisionado" }));
  const nombre = screen.getByLabelText("Nombre del comisionado manual");
  fireEvent.change(nombre, { target: { value: "  Persona externa  " } });
  fireEvent.click(screen.getByRole("button", { name: "Agregar comisionado manual" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Usar oficio común para Persona externa" }));
  fireEvent.change(screen.getByLabelText("Oficio de comisión de Persona externa"), { target: { value: "EXT-01" } });
  fireEvent.change(screen.getByLabelText("Fecha del oficio de Persona externa"), { target: { value: "2026-11-20" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    entrante: "Funcionario Entrante externo", entrante_id: null,
    saliente: "Funcionario Saliente externo", saliente_id: null,
    comisionado: "Persona externa", comisionados: [],
    comisiones: [{ usuario_id: null, nombre: "Persona externa", mismo_oficio: false, oficio_comision: "EXT-01", fecha_oficio_comision: "2026-11-20" }],
  }));
  fireEvent.click(screen.getByRole("button", { name: "Quitar comisionado Persona externa" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave.mock.calls[1][0].comisiones).toEqual([]);
  expect(onSave.mock.calls[1][0].comisionado).toBe("");
});

it("conserva comisionados manuales al editar sin duplicar el nombre", () => {
  const onSave = jest.fn();
  const comisiones = [{ usuario_id: null, nombre: "Persona externa", mismo_oficio: true, oficio_comision: "COM-01", fecha_oficio_comision: "2026-11-20" }];
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ id: 10, unidad_responsable: 17, entrante: "Entrante", saliente: "Saliente", comisionado: "Persona externa", comisiones,
      oficio_comision: "COM-01", fecha_oficio_comision: "2026-11-20" }} />);
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ comisionado: "Persona externa", comisionados: [], comisiones }));
});

it("al volver a buscar usuarios exige seleccionar un resultado y rechaza nombres manuales vacíos", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ unidad_responsable: 17, entrante: "Externo", saliente: "Saliente" }} />);
  fireEvent.change(screen.getByRole("textbox", { name: "Funcionario Entrante" }), { target: { value: "   " } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("checkbox", { name: "Capturar nombre manualmente de Funcionario Entrante" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Funcionario Entrante" }), { target: { value: "Administradora" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).not.toHaveBeenCalled();
  select("Funcionario Entrante", "admin", /Administradora/);
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ entrante: "Administradora", entrante_id: 1 }));
});

it("envía nombres completos editables con los IDs de las cuentas seleccionadas", () => {
  const onSave = jest.fn();
  const cuentas: ActaUsuario[] = [
    { id: 11, username: "emp001", nombre_completo: "Ana López García", email: "ana@test.com", role: "ADMIN" },
    { id: 12, username: "emp002", email: "dos@test.com", role: "USER" },
  ];
  render(<FormActa unidades={unidades} usuarios={cuentas} onSave={onSave} onCancel={() => {}}
    acta={{ unidad_responsable: 17 }} />);
  select("Comisionados", "emp001", /emp001/);
  select("Funcionario Entrante", "emp002", /emp002/);
  select("Funcionario Saliente", "emp002", /emp002/);
  const entrante = screen.getByLabelText("Nombre para el acta de Funcionario Entrante");
  expect(entrante).toHaveValue("");
  expect(screen.getByLabelText("Nombre para el acta de emp001")).toHaveValue("Ana López García");
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.change(entrante, { target: { value: "  José Pérez Hernández  " } });
  fireEvent.change(screen.getByLabelText("Nombre para el acta de Funcionario Saliente"), { target: { value: "José Pérez Hernández" } });
  fireEvent.change(screen.getByLabelText("Nombre para el acta de emp001"), { target: { value: "Ana María López García" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
    entrante_id: 12, entrante: "José Pérez Hernández", saliente_id: 12, saliente: "José Pérez Hernández",
    comisionado: "Ana María López García", comisionados: [11],
    comisiones: [expect.objectContaining({ usuario_id: 11, nombre: "Ana María López García" })],
  }));
});

it("requiere nombre para un comisionado sin nombre completo y conserva el capturado al editar", () => {
  const onSave = jest.fn();
  const cuentas: ActaUsuario[] = [{ id: 11, username: "emp001", email: "ana@test.com", role: "ADMIN" }];
  const props = { unidades, usuarios: cuentas, onSave, onCancel: () => {} };
  const { unmount } = render(<FormActa {...props} acta={{ unidad_responsable: 17, entrante: "Entrante", saliente: "Saliente" }} />);
  select("Comisionados", "emp001", /emp001/);
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("nombre completo");
  fireEvent.change(screen.getByLabelText("Nombre para el acta de emp001"), { target: { value: "Ana López García" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  const saved = onSave.mock.calls[0][0];
  unmount();
  render(<FormActa {...props} acta={{ ...saved, id: 42 }} />);
  expect(screen.getByLabelText("Nombre para el acta de emp001")).toHaveValue("Ana López García");
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ id: 42, comisionado: "Ana López García", comisiones: saved.comisiones }));
});


it("bloquea la unidad y la cuenta saliente con anexos, pero conserva la edición del nombre", () => {
  const onSave = jest.fn();
  render(<FormActa unidades={unidades} usuarios={usuarios} onSave={onSave} onCancel={() => {}}
    acta={{ id: 30, unidad_responsable: 17, entrante: "Entrante", saliente: "Regular", saliente_id: 3,
      estado: "Revisión", anexos: [{ id: 1 }] }} />);
  expect(screen.getByRole("combobox", { name: "Unidad Responsable" })).toBeDisabled();
  expect(screen.getByRole("combobox", { name: "Funcionario Saliente" })).toBeDisabled();
  expect(screen.getByRole("checkbox", { name: "Capturar nombre manualmente de Funcionario Saliente" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Nombre para el acta de Funcionario Saliente"), { target: { value: "Nombre corregido" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ saliente: "Nombre corregido", saliente_id: 3, unidad_responsable: 17 }));
});

it("impide guardar una acta completada y advierte al completar una pendiente", () => {
  const onSave = jest.fn();
  const props = { unidades, usuarios, onSave, onCancel: () => {} };
  const { unmount } = render(<FormActa {...props} acta={{ id: 31, unidad_responsable: 17, entrante: "Entrante", saliente: "Saliente", estado: "Completada" }} />);
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("cerrada");
  unmount();
  render(<FormActa {...props} acta={{ id: 32, unidad_responsable: 17, entrante: "Entrante", saliente: "Saliente", estado: "Pendiente" }} />);
  fireEvent.change(document.querySelector('select[name="estado"]')!, { target: { value: "Completada" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar Acta" }));
  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("quedará cerrada"));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ estado: "Completada" }));
});
