import { act, renderHook, waitFor } from "@testing-library/react";
import { clavePermitida, filtrarAnexosAsignados, usePermisosAnexos } from "./usePermisosAnexos";
import type { MisPermisosAnexos } from "./permisosAnexosApi";

const data: MisPermisosAnexos = { user_id: 2, claves: ["RH01"], configurado: true, revision: 1, modo: "gradual", confirmado_en: null, confirmado_por: 1, sin_restriccion: false };
beforeEach(() => { localStorage.setItem("token", "test-token"); });

it("normalizes legacy keys, denies missing permissions and supports ADMIN access", () => {
  expect(clavePermitida(null, "RH01")).toBe(false);
  expect(clavePermitida(data, " rrh01 ")).toBe(true);
  expect(clavePermitida(data, "RF01")).toBe(false);
  expect(clavePermitida({ ...data, sin_restriccion: true }, "RF01")).toBe(true);
});

it("refreshes revocations and fails closed without clearing form data", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => data });
  const { result } = renderHook(() => usePermisosAnexos(2, "nuevoAnexo"));
  await waitFor(() => expect(result.current.cargando).toBe(false));
  expect(result.current.puedeCapturar("RH01")).toBe(true);
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ...data, revision: 2, claves: [] }) });
  await act(async () => { await result.current.refrescar(); });
  expect(result.current.puedeCapturar("RH01")).toBe(false);
  (fetch as jest.Mock).mockRejectedValue(new Error("Sin conexión"));
  await act(async () => { await result.current.refrescar(); });
  expect(result.current.error).toBe("Sin conexión");
  expect(result.current.permisos).toBeNull();
});

it("filters the personal list using the authenticated user's assignments, including ID 1", () => {
  const anexos = [{ id: 1, clave: "MJ01" }, { id: 2, clave: "RF01" }, { id: 3, clave: "RRH01" }];
  const user1 = { ...data, user_id: 1, claves: ["MJ01", "RH01"] };
  const user2 = { ...data, user_id: 2, claves: ["RF01"] };
  expect(filtrarAnexosAsignados(anexos, user1)).toEqual([anexos[0], anexos[2]]);
  expect(filtrarAnexosAsignados(anexos, user2)).toEqual([anexos[1]]);
  expect(filtrarAnexosAsignados(anexos, { ...user1, claves: [] })).toEqual([]);
  expect(filtrarAnexosAsignados(anexos, null)).toEqual([]);
  expect(anexos).toHaveLength(3);
});

it("loads ID 1's confirmed assignments without a frontend ADMIN exception", async () => {
  const assigned = { ...data, user_id: 1, claves: ["MJ01"] };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => assigned });
  const { result } = renderHook(() => usePermisosAnexos(1, "anexos"));
  await waitFor(() => expect(result.current.cargando).toBe(false));
  expect(result.current.puedeCapturar("MJ01")).toBe(true);
  expect(result.current.puedeCapturar("RF01")).toBe(false);
});
