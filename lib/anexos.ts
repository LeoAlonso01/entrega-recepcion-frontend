export type AnexoBase = {
    id?: number;
    clave?: string;
    categoria?: string;
};

type AnexoCatalogo = {
    id: number;
    clave: string;
    categoria?: string;
};

export function mergeAnexosConCategorias<T extends AnexoBase>(
    anexosActa: T[] = [],
    anexosCatalogo: AnexoCatalogo[] = []
): Array<T & { categoria?: string }> {
    const catalogoPorId = new Map<number, AnexoCatalogo>();
    const catalogoPorClave = new Map<string, AnexoCatalogo>();

    anexosCatalogo.forEach((anexo) => {
        catalogoPorId.set(anexo.id, anexo);
        catalogoPorClave.set(normalizeClave(anexo.clave), anexo);
    });

    return anexosActa.map((anexo) => {
        const coincidencia =
            (anexo.id !== undefined ? catalogoPorId.get(anexo.id) : undefined) ||
            (anexo.clave ? catalogoPorClave.get(normalizeClave(anexo.clave)) : undefined);

        return {
            ...anexo,
            categoria: anexo.categoria || coincidencia?.categoria || "",
        };
    });
}

function normalizeClave(clave: string) {
    return clave.trim().toUpperCase();
}