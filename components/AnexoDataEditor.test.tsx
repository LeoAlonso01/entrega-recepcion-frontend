import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import AnexoDataEditor from "./AnexoDataEditor";

const fields = [
  { campo: "Nombre", tipo: "string", obligatorio: true },
  { campo: "Fecha", tipo: "date" },
  { campo: "Importe", tipo: "number" },
  { campo: "Observaciones", tipo: "string" },
  { campo: "Unidad", tipo: "string" },
  { campo: "Referencia", tipo: "string" },
];
const initialRows = (count: number) => Array.from({ length: count }, (_, i) => ({ Nombre: `Persona ${i + 1}`, Fecha: "27/11/2026", Importe: 120, Observaciones: "", Unidad: "Dirección", Referencia: "A" }));

function Editor({ count = 36, locked = false }: { count?: number; locked?: boolean }) {
  const [rows, setRows] = useState<Record<string, any>[]>(initialRows(count));
  return <AnexoDataEditor rows={rows} fields={fields} disabled={locked} onChange={setRows}
    onValidate={(field, value) => field === "Nombre" && !value ? { nivel: "error", mensaje: "Nombre obligatorio" } : null} />;
}

it("conserva la segunda página al escribir y ajusta la página al eliminar su última fila", () => {
  render(<Editor />);
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Nombre, fila 36" }), { target: { value: "Editado" } });
  expect(screen.getByText("Página 2 de 2")).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Nombre, fila 36" })).toHaveValue("Editado");
  fireEvent.click(screen.getByRole("button", { name: "Eliminar fila 36" }));
  expect(screen.getByText("Página 1 de 1")).toBeVisible();
  expect(screen.getByText("Filas 1–35 de 35")).toBeVisible();
});

it("agrega la fila 36, abre su editor, enfoca el primer campo y conserva sus valores al cerrar", () => {
  render(<Editor count={35} />);
  fireEvent.click(screen.getByRole("button", { name: "+ Agregar fila" }));
  const dialog = screen.getByRole("dialog");
  const input = within(dialog).getByRole("textbox", { name: "Nombre, fila 36" });
  expect(input).toHaveFocus();
  fireEvent.change(input, { target: { value: "Nueva persona" } });
  expect(within(dialog).getByRole("textbox", { name: "Fecha, fila 36" })).toHaveAttribute("placeholder", "dd/mm/aaaa");
  expect(within(dialog).getByRole("textbox", { name: "Importe, fila 36" })).toHaveAttribute("inputmode", "decimal");
  fireEvent.click(within(dialog).getByRole("button", { name: "Listo, volver a la tabla" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("Página 2 de 2")).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Nombre, fila 36" })).toHaveValue("Nueva persona");
});

it("asocia los errores al campo y permite corregirlos en el formulario", () => {
  render(<Editor count={1} />);
  fireEvent.click(screen.getByRole("button", { name: "Editar fila 1" }));
  const input = within(screen.getByRole("dialog")).getByRole("textbox", { name: "Nombre, fila 1" });
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.blur(input);
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Nombre obligatorio");
  fireEvent.change(input, { target: { value: "Corregido" } });
  expect(input).toHaveAttribute("aria-invalid", "false");
});

it("conserva las claves importadas y agrega campos faltantes sin desalinear las columnas", () => {
  const onChange = jest.fn();
  render(<AnexoDataEditor rows={[{ NOMBRE: "Ana" }, { NOMBRE: "Luis", Extra: "Dato" }]} fields={fields} onChange={onChange} onValidate={() => null} />);
  expect(screen.getAllByRole("columnheader")).toHaveLength(9);
  expect(screen.getByRole("textbox", { name: "Extra, fila 1" })).toHaveValue("");
  fireEvent.change(screen.getByRole("textbox", { name: "NOMBRE, fila 1" }), { target: { value: "Editado" } });
  expect(onChange.mock.calls[0][0][0]).toEqual({ NOMBRE: "Editado" });
});

it("bloquea modificaciones cuando se retira el permiso incluso con el editor abierto", () => {
  const { rerender } = render(<Editor count={1} />);
  fireEvent.click(screen.getByRole("button", { name: "Editar fila 1" }));
  rerender(<Editor count={1} locked />);
  expect(within(screen.getByRole("dialog")).getByRole("textbox", { name: "Nombre, fila 1" })).toBeDisabled();
});

it("permite comenzar una tabla vacía y respeta la confirmación al vaciarla", () => {
  const confirm = jest.spyOn(window, "confirm");
  render(<Editor count={0} />);
  fireEvent.click(screen.getByRole("button", { name: "+ Agregar fila" }));
  expect(within(screen.getByRole("dialog")).getAllByRole("textbox")).toHaveLength(fields.length);
  fireEvent.click(screen.getByRole("button", { name: "Listo, volver a la tabla" }));
  confirm.mockReturnValue(false);
  fireEvent.click(screen.getByRole("button", { name: "Vaciar tabla" }));
  expect(screen.getByRole("table")).toBeVisible();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "Vaciar tabla" }));
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Vaciar tabla" })).toBeDisabled();
  confirm.mockRestore();
});

it("presenta tarjetas en móvil y permite editar todos los campos del registro", () => {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  const { unmount } = render(<Editor count={1} />);
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Registros del anexo" })).toHaveTextContent("Persona 1");
  fireEvent.click(screen.getByRole("button", { name: "Editar fila 1" }));
  expect(within(screen.getByRole("dialog")).getAllByRole("textbox")).toHaveLength(fields.length);
  unmount();
  window.matchMedia = original;
});
