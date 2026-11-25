export type UnidadJerarquica = {
    id_unidad: number;
    nombre: string;
    tipo_unidad: string | null;
    nivel: number;
    unidad_padre_id: number | null;
    responsable: { id: number; username: string; email?: string | null } | null;
    children: UnidadJerarquica[];
};

type Registro = Record<string, unknown>;

class ErrorAccesoJerarquia extends Error {}

function registros(data: unknown): Registro[] {
    if (!Array.isArray(data) || data.some(row => !row || typeof row !== "object" || Array.isArray(row))) {
        throw new Error("La respuesta de unidades no tiene el formato esperado.");
    }
    return data as Registro[];
}

function idNumerico(value: unknown): number {
    if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "" || !Number.isSafeInteger(Number(value))) {
        throw new Error("La respuesta contiene un identificador de unidad inválido.");
    }
    return Number(value);
}

// Combina el catálogo plano y el árbol. Los hijos pueden venir anidados o
// relacionados únicamente mediante unidad_padre_id, según el modelo del API.
export function construirJerarquia(jerarquia: unknown, listado: unknown = []): UnidadJerarquica[] {
    const nodes = new Map<number, UnidadJerarquica>();
    const add = (row: Registro, parentFromTree?: number | null) => {
        const id = idNumerico(row.id_unidad);
        const previous = nodes.get(id);
        const parent = row.unidad_padre_id !== undefined
            ? (row.unidad_padre_id === null ? null : idNumerico(row.unidad_padre_id))
            : previous ? previous.unidad_padre_id : parentFromTree;
        if (parent === undefined) {
            throw new Error("El listado de unidades no incluye unidad_padre_id; no se pueden reconstruir las dependencias.");
        }
        if (typeof row.nombre !== "string") throw new Error("La respuesta contiene una unidad sin nombre.");
        const responsable = row.responsable;
        nodes.set(id, {
            id_unidad: id, nombre: row.nombre,
            tipo_unidad: typeof row.tipo_unidad === "string" ? row.tipo_unidad : previous?.tipo_unidad ?? null,
            nivel: 0, unidad_padre_id: parent,
            responsable: responsable && typeof responsable === "object" && "username" in responsable
                ? responsable as UnidadJerarquica["responsable"] : previous?.responsable ?? null,
            children: [],
        });
        if (row.children != null) registros(row.children).forEach(child => add(child, id));
    };
    registros(listado).forEach(row => add(row));
    registros(jerarquia).forEach(row => add(row, null));

    // Verifica las relaciones antes de enlazar objetos para evitar ciclos
    // que bloquearían la representación o el botón Expandir todo.
    const checked = new Set<number>();
    const visiting = new Set<number>();
    const check = (node: UnidadJerarquica) => {
        if (checked.has(node.id_unidad)) return;
        if (visiting.has(node.id_unidad)) throw new Error("La jerarquía contiene una dependencia circular. Revisa las unidades padre.");
        visiting.add(node.id_unidad);
        if (node.unidad_padre_id !== null) {
            const parent = nodes.get(node.unidad_padre_id);
            if (!parent) throw new Error(`La unidad ${node.nombre} tiene una unidad padre que no aparece en la respuesta.`);
            check(parent);
            node.nivel = parent.nivel + 1;
        }
        visiting.delete(node.id_unidad);
        checked.add(node.id_unidad);
    };
    nodes.forEach(check);
    const roots: UnidadJerarquica[] = [];
    nodes.forEach(node => {
        if (node.unidad_padre_id === null) roots.push(node);
        else nodes.get(node.unidad_padre_id)!.children.push(node);
    });
    const sort = (rows: UnidadJerarquica[]) => {
        rows.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        rows.forEach(row => sort(row.children));
    };
    sort(roots);
    return roots;
}

export async function cargarUnidadesJerarquicas(apiUrl: string, token: string, fetcher: typeof fetch = fetch) {
    const consultar = async (endpoint: string) => {
        const response = await fetcher(`${apiUrl}/${endpoint}`, {
            cache: "no-store", headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 401) throw new ErrorAccesoJerarquia("Tu sesión venció. Inicia sesión nuevamente.");
            if (response.status === 403) throw new ErrorAccesoJerarquia("No tienes permiso para consultar la jerarquía.");
            throw new Error(`No se pudo consultar ${endpoint}.`);
        }
        const data: unknown = await response.json();
        registros(data);
        return data;
    };
    const [jerarquia, listado] = await Promise.allSettled([
        consultar("unidades_jerarquicas"), consultar("unidades_responsables"),
    ]);
    if (jerarquia.status === "rejected" && jerarquia.reason instanceof ErrorAccesoJerarquia) throw jerarquia.reason;
    // El catálogo permite recuperar hijos omitidos por el response_model.
    // Nunca se inventan dependencias a partir de nombres o tipos de unidad.
    if (listado.status === "fulfilled") {
        return construirJerarquia(jerarquia.status === "fulfilled" ? jerarquia.value : [], listado.value);
    }
    if (jerarquia.status === "rejected") throw jerarquia.reason;
    const completo = (rows: Registro[]): boolean => rows.every(row =>
        Array.isArray(row.children) && completo(registros(row.children)));
    if (!completo(registros(jerarquia.value))) {
        throw new Error("La jerarquía no incluye children y no se pudo consultar el listado para recuperar las dependencias. Reintenta la carga.");
    }
    return construirJerarquia(jerarquia.value);
}
