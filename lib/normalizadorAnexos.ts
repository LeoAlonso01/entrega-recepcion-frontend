import { EstructuraDatosPorClave, CALVES_CON_PDF, CATEGORIAS } from "../lib/estructuraPorClave";

type AnyRow = Record<string, any>;

function stripAccents(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function canonKey(s: string) {
  return stripAccents(String(s))
    .trim()
    .toUpperCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ");
}

function buildColumnIndex(row: AnyRow) {
  const idx = new Map<string, string>(); // canon -> originalKey
  Object.keys(row || {}).forEach((k) => idx.set(canonKey(k), k));
  return idx;
}

export function normalizeRowsByClave(clave: string, raw: AnyRow[] | AnyRow | null) {
  const isPdfClave = Boolean(CALVES_CON_PDF?.[clave]);
  if (isPdfClave) return { columns: [], rows: [], isPdfClave: true as const };

  const columns = (EstructuraDatosPorClave[clave] || EstructuraDatosPorClave.default).map(canonKey);

  const rowsArray: AnyRow[] = !raw ? [] : Array.isArray(raw) ? raw : [raw];

  const normalized = rowsArray.map((r) => {
    const idx = buildColumnIndex(r);
    const out: AnyRow = {};
    for (const col of columns) {
      const originalKey = idx.get(col);
      const val = originalKey ? r[originalKey] : "";
      out[col] = val === null || val === undefined || String(val).trim() === "" ? "-" : String(val);
    }
    return out;
  });

  return { columns, rows: normalized, isPdfClave: false as const };
}
