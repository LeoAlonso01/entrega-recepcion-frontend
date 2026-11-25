import { cargarUnidadesJerarquicas, construirJerarquia } from "./unidadesJerarquia";

const rectoria = { id_unidad: 1, nombre: "Rectoría", unidad_padre_id: null, responsable: null };
const direccion = { id_unidad: 2, nombre: "Dirección", unidad_padre_id: 1 };
const departamento = { id_unidad: 3, nombre: "Departamento", unidad_padre_id: 2 };
const response = (data: unknown, status = 200) => ({ ok: status === 200, status, json: async () => data }) as Response;

it("recupera los hijos del catálogo cuando el endpoint jerárquico solo devuelve Rectoría", async () => {
    const fetcher = jest.fn()
        .mockResolvedValueOnce(response([rectoria]))
        .mockResolvedValueOnce(response([departamento, rectoria, direccion]));
    const tree = await cargarUnidadesJerarquicas("/api", "token-prueba", fetcher);
    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].id_unidad).toBe(2);
    expect(tree[0].children[0].children[0]).toMatchObject({ id_unidad: 3, nivel: 2 });
    expect(fetcher).toHaveBeenCalledWith("/api/unidades_responsables", expect.objectContaining({
        cache: "no-store", headers: { Authorization: "Bearer token-prueba" },
    }));
});

it("acepta árboles anidados y listas planas, normaliza IDs y evita duplicados", () => {
    const tree = construirJerarquia([{ ...rectoria, children: [{ ...direccion, children: [departamento] }] }], [rectoria, direccion, departamento]);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(construirJerarquia([{ ...rectoria, id_unidad: "1" }, { ...direccion, unidad_padre_id: "1" }])[0].children).toHaveLength(1);
});

it("infiere el padre de hijos anidados cuando no viene unidad_padre_id", () => {
    const tree = construirJerarquia([{ id_unidad: 1, nombre: "Raíz", children: [{ id_unidad: 2, nombre: "Hija", children: [] }] }]);
    expect(tree[0].children[0]).toMatchObject({ unidad_padre_id: 1, nivel: 1 });
});

it("rechaza ciclos, padres inexistentes y catálogos sin relaciones", () => {
    expect(() => construirJerarquia([], [{ ...rectoria, unidad_padre_id: 2 }, direccion])).toThrow(/circular/);
    expect(() => construirJerarquia([], [direccion])).toThrow(/padre/);
    expect(() => construirJerarquia([], [{ id_unidad: 2, nombre: "Hija" }])).toThrow(/unidad_padre_id/);
});

it("acepta un árbol completo si falla el catálogo, y evita mostrar una raíz incompleta como si fuera todo el árbol", async () => {
    const complete = jest.fn().mockResolvedValueOnce(response([{ ...rectoria, children: [] }])).mockRejectedValueOnce(new Error("red"));
    expect(await cargarUnidadesJerarquicas("/api", "token", complete)).toHaveLength(1);
    const incomplete = jest.fn().mockResolvedValueOnce(response([rectoria])).mockRejectedValueOnce(new Error("red"));
    await expect(cargarUnidadesJerarquicas("/api", "token", incomplete)).rejects.toThrow(/children/);
});

it("recupera el árbol del catálogo si falla el endpoint jerárquico y acepta un catálogo vacío", async () => {
    const fetcher = jest.fn().mockResolvedValueOnce(response(null, 500)).mockResolvedValueOnce(response([rectoria, direccion]));
    expect((await cargarUnidadesJerarquicas("/api", "token", fetcher))[0].children).toHaveLength(1);
    expect(construirJerarquia([], [])).toEqual([]);
});

it("respeta errores de acceso del endpoint jerárquico aunque el catálogo sea público", async () => {
    const fetcher = jest.fn().mockResolvedValueOnce(response(null, 403)).mockResolvedValueOnce(response([rectoria, direccion]));
    await expect(cargarUnidadesJerarquicas("/api", "token", fetcher)).rejects.toThrow(/permiso/);
});
