import { actorActaLocal, estadoActaEditable, puedeEditarActa } from "./actaEdicion";

it("permite editar estados abiertos y bloquea Completada o estados desconocidos", () => {
  for (const estado of ["Pendiente", "Revisión", "Borrador"]) expect(estadoActaEditable(estado)).toBe(true);
  for (const estado of ["Completada", "Revision", "", null, undefined]) expect(estadoActaEditable(estado)).toBe(false);
  expect(puedeEditarActa({ estado: "Completada" }, { id: 1, role: "ADMIN" })).toBe(false);
});

it("aplica permisos de gestor o creador sin autorizar actas históricas sin creador a USER", () => {
  const acta = { estado: "Revisión", creador_id: 2 };
  expect(puedeEditarActa(acta, { id: 1, role: "ADMIN" })).toBe(true);
  expect(puedeEditarActa(acta, { id: 1, role: "AUDITOR" })).toBe(true);
  expect(puedeEditarActa(acta, { id: 2, role: "USER" })).toBe(true);
  expect(puedeEditarActa(acta, { id: 1, role: "USER" })).toBe(false);
  expect(puedeEditarActa({ estado: "Pendiente", creador_id: null }, { id: 1, role: "USER" })).toBe(false);
  expect(puedeEditarActa(acta, null)).toBe(false);
});

it("lee la cuenta de la sesión y maneja datos locales dañados", () => {
  localStorage.setItem("user", JSON.stringify({ id: "12", role: "admin" }));
  expect(actorActaLocal()).toEqual({ id: 12, role: "ADMIN" });
  localStorage.setItem("user", "inválido");
  expect(actorActaLocal()).toBeNull();
  localStorage.clear();
});
