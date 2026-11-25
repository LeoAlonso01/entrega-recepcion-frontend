import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import UnidadesJerarquia, { type UnidadJerarquica } from "./UnidadesJerarquia";
import { construirJerarquia } from "@/lib/unidadesJerarquia";

const unidades: UnidadJerarquica[] = [{
    id_unidad: 1, nombre: "Dirección", tipo_unidad: "direccion", nivel: 0,
    unidad_padre_id: null, responsable: { id: 8, username: "Ana" },
    children: [{
        id_unidad: 2, nombre: "Departamento", tipo_unidad: "departamento", nivel: 1,
        unidad_padre_id: 1, responsable: null,
        children: [{
            id_unidad: 3, nombre: "Área técnica", tipo_unidad: null, nivel: 2,
            unidad_padre_id: 2, responsable: null, children: [],
        }],
    }],
}, {
    id_unidad: 4, nombre: "Unidad independiente", tipo_unidad: null, nivel: 0,
    unidad_padre_id: null, responsable: null, children: [],
}];

it("muestra raíces e hijos anidados y permite explorar niveles con teclado", () => {
    render(<UnidadesJerarquia unidades={unidades} />);
    expect(screen.getByText("Unidad independiente")).toBeVisible();
    expect(screen.getByText("Responsable: Ana")).toBeVisible();
    const departamento = screen.getByRole("button", { name: /Departamento/ });
    expect(departamento.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Área técnica")).toBeNull();
    // Los nodos son botones nativos, accesibles por teclado.
    expect(departamento.tagName).toBe("BUTTON");
    fireEvent.click(departamento);
    expect(screen.getByText("Área técnica")).toBeVisible();
    expect(screen.getAllByText("Responsable: Sin asignar")).toHaveLength(3);
    expect(screen.getAllByText("Departamento")).toHaveLength(1);
});

it("contrae y expande todos los niveles y reinicia el primer nivel al actualizar", () => {
    const { rerender } = render(<UnidadesJerarquia unidades={unidades} />);
    fireEvent.click(screen.getByRole("button", { name: "Contraer todo" }));
    expect(screen.queryByText("Departamento")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expandir todo" }));
    expect(screen.getByText("Área técnica")).toBeVisible();
    rerender(<UnidadesJerarquia unidades={[...unidades]} />);
    expect(screen.getByText("Departamento")).toBeVisible();
    expect(screen.queryByText("Área técnica")).toBeNull();
});

it("muestra flechas y permite desplegar las dependencias recuperadas del listado", () => {
    const rectoria = { id_unidad: 1, nombre: "Rectoría", unidad_padre_id: null };
    const tree = construirJerarquia([rectoria], [rectoria,
        { id_unidad: 2, nombre: "Secretaría", unidad_padre_id: 1 },
        { id_unidad: 3, nombre: "Departamento", unidad_padre_id: 2 },
    ]);
    render(<UnidadesJerarquia unidades={tree} />);
    const root = screen.getByRole("button", { name: /Rectoría/ });
    expect(root.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Secretaría")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Secretaría/ }));
    expect(screen.getByText("Departamento")).toBeVisible();
    fireEvent.click(root);
    expect(screen.queryByText("Secretaría")).toBeNull();
});
