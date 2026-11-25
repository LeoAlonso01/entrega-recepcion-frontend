import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FiltroConBusqueda from "./FiltroConBusqueda";

function Filtro() {
  const [value, setValue] = useState("__all__");
  return <FiltroConBusqueda label="Unidad responsable" allLabel="Todas las unidades" value={value} onChange={setValue}
    options={[{ value: "1", label: "Dirección de Administración" }, { value: "2", label: "Rectoría" }]} />;
}

it("busca sin acentos, selecciona por teclado y permite limpiar y reabrir el filtro", () => {
  render(<Filtro />);
  const input = screen.getByRole("combobox", { name: "Filtrar por unidad responsable" });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "administracion" } });
  expect(screen.queryByRole("option", { name: "Rectoría" })).toBeNull();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("Dirección de Administración");
  expect(screen.queryByRole("listbox")).toBeNull();
  fireEvent.click(input);
  expect(screen.getByRole("option", { name: "Rectoría" })).toBeVisible();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(input).toHaveValue("Dirección de Administración");
  fireEvent.click(screen.getByRole("button", { name: "Limpiar filtro unidad responsable" }));
  expect(input).toHaveValue("Todas las unidades");
});

it("muestra sin resultados y conserva la selección al salir sin elegir", () => {
  render(<Filtro />);
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "No existe" } });
  expect(screen.getByText("Sin resultados")).toBeVisible();
  fireEvent.blur(input);
  expect(input).toHaveValue("Todas las unidades");
});
