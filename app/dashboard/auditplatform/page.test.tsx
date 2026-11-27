import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AuditLog } from "@/lib/auditReferences";

jest.mock("next/navigation", () => ({ useRouter: () => router }));
jest.mock("@/components/NavbarBreadcrumb", () => () => null);
const router = { replace: jest.fn() };
process.env.NEXT_PUBLIC_API_URL = "http://serumich.test/";
const AuditPlatformPage = require("./page").default;

const event = (changes: Partial<AuditLog> = {}): AuditLog => ({
  id: 9901, actor_id: 170, action: "update", object_type: "user", object_id: 180,
  timestamp: "2026-11-27T12:00:00Z", success: true, ip_address: "127.0.0.1", metadata: null, ...changes,
});
let events: AuditLog[];
let failCatalogs: boolean;
let unauthorized: boolean;
const calls = (part: string) => (fetch as jest.Mock).mock.calls.filter(([url]) => new URL(url).pathname === part);
beforeEach(() => {
  events = [event()]; failCatalogs = false; unauthorized = false;
  localStorage.clear(); localStorage.setItem("token", "token-auditoria");
  global.fetch = jest.fn().mockImplementation(async (url: string) => {
    const path = new URL(url).pathname;
    const respond = (data: unknown, status = 200) => ({ ok: status === 200, status, statusText: status === 403 ? "Forbidden" : "", json: async () => data });
    if (path === "/admin/audit_logs") return unauthorized ? respond({}, 401) : respond({ total: 20, items: events });
    if (failCatalogs) return respond({}, 403);
    if (path === "/users") return respond([
      { id: 170, nombre_completo: "Giovanni Hurtado", username: "giovanni" },
      { id: 180, username: "Ana María" },
    ]);
    if (path === "/unidades_responsables") return respond([{ id_unidad: 190, nombre: "Dirección de Finanzas" }]);
    if (path === "/actas/210") return respond({ id: 210, folio: "ACTA-FINANZAS", unidad_responsable: 190 });
    if (path === "/anexos/220") return respond({ id: 220, clave: "MJ01", unidad_responsable_id: 190 });
    if (path === "/cargos") return respond([{ id: 230, nombre: "Contador" }]);
    return respond({}, 404);
  });
});
afterEach(() => jest.clearAllMocks());

it("muestra nombres, unidades, folios y claves en lugar de IDs", async () => {
  events = [
    event(), event({ id: 9902, object_type: "unidad_responsable", object_id: 190 }),
    event({ id: 9903, object_type: "acta", object_id: 210 }),
    event({ id: 9904, object_type: "anexo", object_id: 220 }),
    event({ id: 9905, object_type: "cargo", object_id: 230 }),
  ];
  render(<AuditPlatformPage />);
  await screen.findByText("ACTA-FINANZAS");
  const table = screen.getByRole("table");
  expect(within(table).getByText("Ana María")).toBeVisible();
  expect(within(table).getByText(/MJ01 · ADMINISTRATIVO/)).toBeVisible();
  expect(within(table).getByText("Contador")).toBeVisible();
  expect(within(table).getAllByText("Giovanni Hurtado")).toHaveLength(5);
  expect(within(table).getAllByText("Dirección de Finanzas").length).toBeGreaterThanOrEqual(3);
  for (const id of ["9901", "170", "180", "190", "210", "220", "230"]) expect(within(table).queryByText(id)).not.toBeInTheDocument();
  expect(within(table).queryByRole("columnheader", { name: /\bID\b/i })).not.toBeInTheDocument();
  expect(calls("/users")).toHaveLength(1);
  expect(calls("/unidades_responsables")).toHaveLength(1);
  expect(calls("/users")[0][1].headers.Authorization).toBe("Bearer token-auditoria");
});

it("prioriza los nombres históricos de los metadatos y evita consultar catálogos innecesarios", async () => {
  events = [event({ actor_name: "Nombre actual", metadata: { actor_nombre: "Actor histórico", usuario_nombre: "Usuario histórico", nombre_unidad: "Unidad histórica" } })];
  render(<AuditPlatformPage />);
  expect(await screen.findByText("Actor histórico")).toBeVisible();
  expect(screen.getByText("Usuario histórico")).toBeVisible();
  expect(screen.getByText("Unidad histórica")).toBeVisible();
  expect(screen.queryByText("Nombre actual")).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("resuelve anexos por clave y conserva la clave registrada de un anexo eliminado", async () => {
  events = [event({ object_type: "anexo", object_id: "MJ01" }), event({ id: 9902, object_type: "anexo", object_id: 9999, metadata: { clave: "RH01", unidad_responsable_id: 190 } }), event({ id: 9903, object_type: "anexo", object_id: "ZZ99" })];
  render(<AuditPlatformPage />);
  expect(await screen.findByText(/MJ01 · ADMINISTRATIVO/)).toBeVisible();
  expect(screen.getByText(/RH01 ·/)).toBeVisible();
  expect(screen.getByText("ZZ99")).toBeVisible();
  expect(screen.getByText("Dirección de Finanzas")).toBeVisible();
  expect((fetch as jest.Mock).mock.calls.some(([url]) => new URL(url).pathname.startsWith("/anexos"))).toBe(false);
});

it("muestra referencias no disponibles para registros eliminados o tipos desconocidos sin exponer IDs", async () => {
  events = [
    event({ actor_id: 7777, object_id: 8888 }),
    event({ id: 9902, actor_id: null, object_type: "acta", object_id: 8888 }),
    event({ id: 9903, object_type: "anexo", object_id: 8888 }),
    event({ id: 9904, object_type: "unidad", object_id: 8888 }),
    event({ id: 9905, object_type: "otro", object_id: 8888 }),
  ];
  render(<AuditPlatformPage />);
  expect(await screen.findByText("Acta no disponible")).toBeVisible();
  expect(screen.getAllByText("Usuario no disponible")).toHaveLength(3);
  expect(screen.getByText("Anexo no disponible")).toBeVisible();
  expect(screen.getAllByText("Unidad no disponible")).toHaveLength(2);
  expect(screen.getByText("Registro no disponible")).toBeVisible();
  expect(screen.queryByText("8888")).not.toBeInTheDocument();
  expect(screen.queryByText("7777")).not.toBeInTheDocument();
});

it("reutiliza catálogos y detalles al repetir referencias y cambiar de página", async () => {
  events = [event({ object_type: "acta", object_id: 210 }), event({ id: 9902, object_type: "acta", object_id: 210 })];
  render(<AuditPlatformPage />);
  await screen.findAllByText("ACTA-FINANZAS");
  fireEvent.click(screen.getByRole("button", { name: "Siguiente →" }));
  await waitFor(() => expect(calls("/admin/audit_logs")).toHaveLength(2));
  await screen.findAllByText("ACTA-FINANZAS");
  expect(calls("/users")).toHaveLength(1);
  expect(calls("/actas/210")).toHaveLength(1);
  expect(calls("/unidades_responsables")).toHaveLength(1);
});

it("mantiene visibles los eventos cuando fallan los catálogos y permite reintentar", async () => {
  failCatalogs = true;
  render(<AuditPlatformPage />);
  expect(await screen.findAllByText("Usuario no disponible")).toHaveLength(2);
  expect(screen.getByText("update")).toBeVisible();
  expect(screen.getByText(/Algunos nombres no pudieron consultarse/)).toBeVisible();
  failCatalogs = false;
  fireEvent.click(screen.getByRole("button", { name: "Reintentar nombres" }));
  expect(await screen.findByText("Giovanni Hurtado")).toBeVisible();
  expect(screen.getByText("Ana María")).toBeVisible();
  expect(screen.queryByText(/Algunos nombres no pudieron consultarse/)).not.toBeInTheDocument();
});

it("respeta la unidad registrada en el evento aunque cambie la asociación actual del acta", async () => {
  events = [event({ object_type: "acta", object_id: 210, metadata: { unidad_responsable_id: 8888 } })];
  render(<AuditPlatformPage />);
  expect(await screen.findByText("ACTA-FINANZAS")).toBeVisible();
  expect(screen.getByText("Unidad no disponible")).toBeVisible();
  expect(screen.queryByText("Dirección de Finanzas")).not.toBeInTheDocument();
});

it("redirige al inicio de sesión cuando la auditoría responde 401", async () => {
  unauthorized = true;
  render(<AuditPlatformPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent("No autorizado");
  expect(router.replace).toHaveBeenCalledWith("/");
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("mantiene una paginación válida cuando no existen eventos", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ items: [], total: 0 }) });
  render(<AuditPlatformPage />);
  expect(await screen.findByText("No hay auditorías disponibles")).toBeVisible();
  expect(screen.getByText("Página 1 de 1")).toBeVisible();
  expect(screen.getByRole("button", { name: "Siguiente →" })).toBeDisabled();
});

it("descarta las referencias en caché al cambiar de sesión", async () => {
  render(<AuditPlatformPage />);
  await screen.findByText("Giovanni Hurtado");
  localStorage.setItem("token", "otra-sesion");
  fireEvent.click(screen.getByRole("button", { name: "Siguiente →" }));
  await waitFor(() => expect(calls("/users")).toHaveLength(2));
  await screen.findByText("Giovanni Hurtado");
  expect(calls("/users")[1][1].headers.Authorization).toBe("Bearer otra-sesion");
});
