import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HabilitacionAnexos from "./HabilitacionAnexos";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn() } }));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => <select value={value} disabled={disabled} onChange={event => onValueChange(event.target.value)}><option value="" />{children}</select>,
  SelectTrigger: () => null, SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

const props = { adminId: 1, role: "ADMIN", anexos: [], cargandoAnexos: false };
const config = { user_id: 2, configurado: false, revision: 0, claves: [] as string[], modo: "gradual", confirmado_en: null, confirmado_por: null };
let stored = { ...config };
let failSave = false;
beforeEach(() => {
  stored = { ...config, claves: [] }; failSave = false;
  localStorage.clear(); localStorage.setItem("token", "test-token");
  jest.spyOn(window, "confirm").mockReturnValue(true);
  global.fetch = jest.fn().mockImplementation(async (url: string, options: RequestInit = {}) => {
    const respond = (data: unknown, status = 200) => ({ ok: status === 200, status, json: async () => data });
    if (url.endsWith("/catalogo")) return respond([{ clave: "MJ01", categoria_id: "1", categoria: "MARCO JURIDICO", descripcion: "Marco jurídico", activo: true }]);
    if (url.endsWith("/usuarios")) return respond([{ id: 2, username: "Ana" }, { id: 3, username: "Luis" }]);
    if (url.endsWith("/historial")) return respond([]);
    if (url.endsWith("/propuesta")) return respond({ claves: ["MJ01"], desconocidas: [] });
    if (options.method === "PUT") {
      if (failSave) return respond({ detail: "Otro administrador modificó la configuración" }, 409);
      const payload = JSON.parse(options.body as string);
      stored = { ...stored, configurado: true, revision: stored.revision + 1, claves: payload.claves };
    }
    return respond({ ...stored, user_id: url.endsWith("/3") ? 3 : 2, claves: url.endsWith("/3") ? [] : stored.claves });
  });
});
afterEach(() => jest.restoreAllMocks());

async function elegirUsuario() {
  const selector = screen.getAllByRole("combobox")[0];
  await waitFor(() => expect(selector).toBeEnabled());
  fireEvent.change(selector, { target: { value: "2" } });
  await screen.findByLabelText(/MJ01 ·/);
}

it("saves server configuration with revision, reason and authentication", async () => {
  render(<HabilitacionAnexos {...props} />);
  await elegirUsuario();
  fireEvent.click(screen.getByLabelText(/MJ01 ·/));
  fireEvent.change(screen.getByLabelText("Motivo de la configuración"), { target: { value: "Asignación inicial" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar y aplicar permisos" }));
  await waitFor(() => expect(stored.revision).toBe(1));
  expect(stored.claves).toEqual(["MJ01"]);
  const call = (fetch as jest.Mock).mock.calls.find(([, options]) => options.method === "PUT");
  expect(JSON.parse(call[1].body)).toEqual({ revision: 0, claves: ["MJ01"], motivo: "Asignación inicial" });
  expect(call[1].headers.Authorization).toBe("Bearer test-token");
  expect(localStorage.length).toBe(1);
});

it("preserves unsaved changes and blocks save on a version conflict", async () => {
  failSave = true;
  render(<HabilitacionAnexos {...props} />);
  await elegirUsuario();
  fireEvent.click(screen.getByLabelText(/MJ01 ·/));
  fireEvent.change(screen.getByLabelText("Motivo de la configuración"), { target: { value: "Cambio de función" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar y aplicar permisos" }));
  await screen.findByRole("button", { name: "Recargar configuración" });
  expect(screen.getByLabelText(/MJ01 ·/)).toBeChecked();
  expect(screen.getByRole("button", { name: "Guardar y aplicar permisos" })).toBeDisabled();
  expect(stored.revision).toBe(0);
});

it("requires a reason and confirmation before saving zero permissions", async () => {
  render(<HabilitacionAnexos {...props} />);
  await elegirUsuario();
  const save = screen.getByRole("button", { name: "Guardar y aplicar permisos" });
  expect(save).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Motivo de la configuración"), { target: { value: "Sin asignación de captura" } });
  fireEvent.click(save);
  await waitFor(() => expect(stored.configurado).toBe(true));
  expect(window.confirm).toHaveBeenCalled();
  expect(stored.claves).toEqual([]);
});

it("loads a proposal without applying or saving it", async () => {
  render(<HabilitacionAnexos {...props} />);
  await elegirUsuario();
  fireEvent.click(screen.getByRole("button", { name: "Sugerir desde anexos existentes" }));
  await waitFor(() => expect(screen.getByLabelText(/MJ01 ·/)).toBeChecked());
  expect(stored.revision).toBe(0);
});

it("does not render or fetch for a regular user", () => {
  const { container } = render(<HabilitacionAnexos {...props} role="USER" />);
  expect(container).toBeEmptyDOMElement(); expect(fetch).not.toHaveBeenCalled();
});

it("blocks configuration editing when the server cannot load it", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("Sin conexión"));
  render(<HabilitacionAnexos {...props} />);
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Guardar y aplicar permisos" })).not.toBeInTheDocument();
});
