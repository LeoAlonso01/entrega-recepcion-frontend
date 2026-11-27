import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/navigation", () => ({ useRouter: () => router }));
jest.mock("@/components/NavbarBreadcrumb", () => () => null);
jest.mock("@/components/ResetPasswordModal", () => () => null);
jest.mock("jspdf", () => jest.fn());
jest.mock("jspdf-autotable", () => ({}));
jest.mock("xlsx", () => ({}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const router = { push: jest.fn(), replace: jest.fn() };
process.env.NEXT_PUBLIC_API_URL = "http://serumich.test";
const AdministracionPage = require("./page").default;

const usuarios = [
  { id: 1, username: "Ana María", email: "ana@serumich.test", role: "ADMIN", unidad_responsable: { nombre: "Secretaría de Planeación" }, cargos_actuales: [{ cargo: { nombre: "Directora" } }] },
  { id: 2, username: "Luis Ramírez", email: "luis@serumich.test", role: "AUDITOR", unidad_responsable: { nombre: "Tesorería" }, cargos_actuales: [{ nombre: "Contador" }] },
  { id: 3, username: "Gloria Hurtado", email: "gloria@serumich.test", role: "USER", unidad_responsable: null, cargos_actuales: [] },
];
const cargos = [
  { id: 11, nombre: "Directora", descripcion: "Dirección general", activo: true },
  { id: 12, nombre: "Contador", descripcion: "Control presupuestal", activo: true },
  { id: 13, nombre: "Inactivo", activo: false },
  { id: 14, nombre: "Eliminado", is_deleted: true },
];
const unidades = [
  { id_unidad: 10, nombre: "Secretaría de Planeación", responsable: { id: 1, username: "Ana María" } },
  { id_unidad: 20, nombre: "Tesorería", responsable: { id: 2, username: "Luis Ramírez" } },
  { id_unidad: 30, nombre: "Archivo", responsable: null },
];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("token", "test-token");
  localStorage.setItem("user", JSON.stringify({ id: 1, username: "Ana María", role: "ADMIN" }));
  global.fetch = jest.fn().mockImplementation(async (url: string) => ({
    ok: true, status: 200,
    json: async () => url.includes("/unidades_responsables") ? unidades : url.endsWith("/cargos") ? cargos : usuarios,
  }));
  jest.spyOn(console, "log").mockImplementation(() => {});
  HTMLElement.prototype.scrollIntoView = jest.fn();
  HTMLElement.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
  HTMLElement.prototype.releasePointerCapture = jest.fn();
});
afterEach(() => jest.restoreAllMocks());

async function iniciar() {
  render(<AdministracionPage />);
  await screen.findByText("Gloria Hurtado");
  return screen.getByRole("searchbox", { name: "Buscar en Gestión de usuarios" });
}

it.each([
  [" ANA   MARIA ", "Ana María"],
  ["LUIS@SERUMICH.TEST", "Luis Ramírez"],
  ["planeacion", "Ana María"],
  ["contador", "Luis Ramírez"],
  ["ADMIN", "Ana María"],
  ["administrador", "Ana María"],
  ["usuario", "Gloria Hurtado"],
  ["luis tesoreria auditor", "Luis Ramírez"],
])("busca %s en todas las columnas de datos", async (busqueda, nombre) => {
  const input = await iniciar();
  fireEvent.change(input, { target: { value: busqueda } });
  const tabla = screen.getByRole("table");
  expect(within(tabla).getByText(nombre)).toBeVisible();
  expect(within(tabla).getAllByRole("row")).toHaveLength(2);
  expect(screen.getByText("1 de 3 usuarios")).toBeVisible();
});

it("informa cuando no hay coincidencias y restaura el listado al limpiar", async () => {
  const input = await iniciar();
  fireEvent.change(input, { target: { value: "inexistente" } });
  expect(screen.getByText("No se encontraron usuarios con esta búsqueda.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(input).toHaveValue("");
  expect(screen.getByText("3 de 3 usuarios")).toBeVisible();
});

async function abrirUnidades() {
  const principal = await iniciar();
  fireEvent.change(principal, { target: { value: "ana" } });
  fireEvent.click(screen.getByRole("button", { name: /Asignar Responsable/ }));
  const modal = await screen.findByRole("dialog", { name: "Asignar Responsable a Unidad" });
  return { principal, modal, buscarUnidad: within(modal).getByRole("searchbox", { name: "Buscar unidad o responsable actual" }) };
}

async function abrirSeleccion() {
  const { principal, modal, buscarUnidad } = await abrirUnidades();
  fireEvent.change(buscarUnidad, { target: { value: "tesoreria" } });
  fireEvent.click(within(modal).getByRole("button", { name: "Seleccionar responsable y cargo para Tesorería" }));
  const seleccion = await screen.findByRole("dialog", { name: "Seleccionar responsable y cargo" });
  return { principal, seleccion };
}

function elegir(seleccion: HTMLElement) {
  fireEvent.change(within(seleccion).getByRole("searchbox", { name: "Buscar usuario" }), { target: { value: "GLORIA@SERUMICH.TEST" } });
  fireEvent.click(within(seleccion).getByRole("radio", { name: /Gloria Hurtado/ }));
  fireEvent.change(within(seleccion).getByRole("searchbox", { name: "Buscar cargo" }), { target: { value: "presupuestal" } });
  fireEvent.click(within(seleccion).getByRole("radio", { name: /Contador/ }));
}

it("mantiene el filtro de unidades al cancelar, descarta la selección y conserva la búsqueda principal", async () => {
  const { principal, seleccion } = await abrirSeleccion();
  expect(within(seleccion).getByText("Responsable actual: Luis Ramírez")).toBeVisible();
  elegir(seleccion);
  fireEvent.click(within(seleccion).getByRole("button", { name: "Cancelar" }));
  const unidadesModal = await screen.findByRole("dialog", { name: "Asignar Responsable a Unidad" });
  expect(within(unidadesModal).getByRole("searchbox")).toHaveValue("tesoreria");
  await waitFor(() => expect(within(unidadesModal).getByRole("button", { name: "Seleccionar responsable y cargo para Tesorería" })).toHaveFocus());
  fireEvent.click(within(unidadesModal).getByRole("button", { name: "Seleccionar responsable y cargo para Tesorería" }));
  const reabierto = await screen.findByRole("dialog", { name: "Seleccionar responsable y cargo" });
  expect(within(reabierto).getByRole("searchbox", { name: "Buscar usuario" })).toHaveValue("");
  expect(within(reabierto).getByRole("button", { name: "Confirmar asignación" })).toBeDisabled();
  expect(within(reabierto).queryByRole("radio", { checked: true })).not.toBeInTheDocument();
  expect((fetch as jest.Mock).mock.calls.every(([, options]) => options.method === "GET")).toBe(true);
  fireEvent.click(within(reabierto).getByRole("button", { name: "Cancelar" }));
  const lista = await screen.findByRole("dialog", { name: "Asignar Responsable a Unidad" });
  fireEvent.click(within(lista).getByRole("button", { name: "Cancelar" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(principal).toHaveValue("ana");
  expect(screen.getByText("1 de 3 usuarios")).toBeVisible();
});

it("busca cargos por descripción y conserva ambas selecciones aunque se filtren fuera de los resultados", async () => {
  const { seleccion } = await abrirSeleccion();
  const confirmar = within(seleccion).getByRole("button", { name: "Confirmar asignación" });
  expect(confirmar).toBeDisabled();
  expect(within(seleccion).queryByRole("radio", { name: "Inactivo" })).not.toBeInTheDocument();
  expect(within(seleccion).queryByRole("radio", { name: "Eliminado" })).not.toBeInTheDocument();
  elegir(seleccion);
  expect(confirmar).toBeEnabled();
  fireEvent.change(within(seleccion).getByRole("searchbox", { name: "Buscar usuario" }), { target: { value: "ana maria" } });
  fireEvent.change(within(seleccion).getByRole("searchbox", { name: "Buscar cargo" }), { target: { value: "inexistente" } });
  expect(within(seleccion).getByText("No se encontraron opciones con esta búsqueda.")).toBeVisible();
  const resumen = within(seleccion).getByRole("region", { name: "Resumen de asignación" });
  expect(resumen).toHaveTextContent("Gloria Hurtado (gloria@serumich.test)");
  expect(resumen).toHaveTextContent("Contador");
  expect(confirmar).toBeEnabled();
  fireEvent.click(within(seleccion).getByRole("button", { name: "Quitar cargo seleccionado" }));
  expect(confirmar).toBeDisabled();
});

it("filtra unidades sin responsable y restaura sus resultados al limpiar", async () => {
  const { modal, buscarUnidad } = await abrirUnidades();
  fireEvent.change(buscarUnidad, { target: { value: "sin asignar" } });
  expect(within(modal).getByText("Archivo")).toBeVisible();
  expect(within(modal).queryByText("Tesorería")).not.toBeInTheDocument();
  fireEvent.change(buscarUnidad, { target: { value: "inexistente" } });
  expect(within(modal).getByText("No se encontraron unidades con esta búsqueda.")).toBeVisible();
  fireEvent.click(within(modal).getByRole("button", { name: "Limpiar búsqueda de unidades" }));
  expect(buscarUnidad).toHaveValue("");
  expect(within(modal).getByText("3 de 3 unidades cargadas")).toBeVisible();
});

it("confirma con los IDs seleccionados y actualiza la unidad sin recargar ni perder su filtro", async () => {
  const { seleccion } = await abrirSeleccion();
  elegir(seleccion);
  fireEvent.click(within(seleccion).getByRole("button", { name: "Confirmar asignación" }));
  const lista = await screen.findByRole("dialog", { name: "Asignar Responsable a Unidad" });
  expect(within(lista).getByRole("searchbox")).toHaveValue("tesoreria");
  expect(within(lista).getByText("Gloria Hurtado")).toBeVisible();
  const requests = (fetch as jest.Mock).mock.calls.filter(([, options]) => options.method !== "GET");
  expect(requests.map(([, options]) => options.method)).toEqual(["POST", "PUT"]);
  expect(JSON.parse(requests[0][1].body)).toEqual({ cargo_id: 12, user_id: 3, unidad_responsable_id: 20, motivo: "Asignación desde panel de administración" });
  expect(requests[0][1].headers.Authorization).toBe("Bearer test-token");
  expect(JSON.parse(requests[1][1].body)).toEqual({ responsable_id: 3 });
});

it("conserva las selecciones y muestra el error de conflicto sin actualizar la unidad", async () => {
  const { seleccion } = await abrirSeleccion();
  elegir(seleccion);
  const original = (fetch as jest.Mock).getMockImplementation()!;
  (fetch as jest.Mock).mockImplementation((url, options) => options.method === "POST" ? Promise.resolve({ ok: false, status: 409, json: async () => ({ detail: "Ya existe una asignación activa" }) }) : original(url, options));
  fireEvent.click(within(seleccion).getByRole("button", { name: "Confirmar asignación" }));
  expect(await within(seleccion).findByRole("alert")).toHaveTextContent("Ya existe una asignación activa");
  expect(within(seleccion).getByRole("region", { name: "Resumen de asignación" })).toHaveTextContent("Gloria Hurtado");
  expect((fetch as jest.Mock).mock.calls.some(([, options]) => options.method === "PUT")).toBe(false);
});

it("reintenta únicamente actualizar al responsable cuando el cargo ya se guardó", async () => {
  const { seleccion } = await abrirSeleccion();
  elegir(seleccion);
  const original = (fetch as jest.Mock).getMockImplementation()!;
  let intentos = 0;
  (fetch as jest.Mock).mockImplementation((url, options) => {
    if (options.method === "PUT" && intentos++ === 0) return Promise.resolve({ ok: false, status: 500, json: async () => ({ detail: "Fallo temporal" }) });
    return original(url, options);
  });
  fireEvent.click(within(seleccion).getByRole("button", { name: "Confirmar asignación" }));
  expect(await within(seleccion).findByRole("alert")).toHaveTextContent("Fallo temporal");
  expect(within(seleccion).getByRole("searchbox", { name: "Buscar usuario" })).toBeDisabled();
  fireEvent.click(within(seleccion).getByRole("button", { name: "Reintentar actualizar responsable" }));
  await screen.findByRole("dialog", { name: "Asignar Responsable a Unidad" });
  expect((fetch as jest.Mock).mock.calls.filter(([, options]) => options.method === "POST")).toHaveLength(1);
  expect((fetch as jest.Mock).mock.calls.filter(([, options]) => options.method === "PUT")).toHaveLength(2);
});

it("bloquea el cierre y los cambios durante el guardado y evita solicitudes duplicadas", async () => {
  const { seleccion } = await abrirSeleccion();
  elegir(seleccion);
  const original = (fetch as jest.Mock).getMockImplementation()!;
  let completar!: () => void;
  (fetch as jest.Mock).mockImplementation((url, options) => options.method === "POST" ? new Promise(resolve => { completar = () => resolve({ ok: true, status: 200 }); }) : original(url, options));
  const confirmar = within(seleccion).getByRole("button", { name: "Confirmar asignación" });
  fireEvent.click(confirmar);
  fireEvent.click(confirmar);
  expect(within(seleccion).getByRole("button", { name: "Cancelar" })).toBeDisabled();
  expect(within(seleccion).getByRole("searchbox", { name: "Buscar usuario" })).toBeDisabled();
  fireEvent.keyDown(seleccion, { key: "Escape" });
  expect(seleccion).toBeVisible();
  expect((fetch as jest.Mock).mock.calls.filter(([, options]) => options.method === "POST")).toHaveLength(1);
  completar();
  await screen.findByRole("dialog", { name: "Asignar Responsable a Unidad" });
});
