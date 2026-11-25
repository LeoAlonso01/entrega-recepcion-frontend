import { crearReporteAnexo, FORMATO_REPORTE_ANEXO, type PdfMeta } from "./exports/pdf";
import { obtenerCategoriaPorClave } from "./anexosCatalogo";

export interface AnexoParaFojas {
  id: number;
  clave: string;
  categoria?: string;
  datos: Record<string, unknown>[] | Record<string, unknown> | null;
  unidad_responsable_id: number;
  unidad_responsable_nombre: string;
  unidad_padre_id?: number | null;
  unidad_padre_nombre?: string | null;
  creador_nombre: string;
  fecha_creacion?: string;
  creado_en?: string;
  actualizado_en?: string;
  reporte_revision_actual: string;
  reporte_formato_actual: string;
  fojas_por_defecto?: boolean;
  fojas_reporte?: number | null;
  reporte_vigente?: boolean;
  reporte_generado_en?: string | null;
}

export class ErrorCalculoFojas extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

export function metadatosFojas(anexo: AnexoParaFojas): PdfMeta {
  // Pie automático estable: creador como elaboró; supervisión y entrega sin
  // nombres inventados. La fecha guardada evita depender del día de consulta.
  return {
    fechaElaboracion: anexo.actualizado_en || anexo.creado_en || anexo.fecha_creacion || "",
    elaboro: anexo.creador_nombre || "", superviso: "", entrego: "",
    dependenciaClave: String(anexo.unidad_responsable_id), dependenciaNombre: anexo.unidad_responsable_nombre,
    urClave: anexo.unidad_padre_id == null ? "" : String(anexo.unidad_padre_id), urNombre: anexo.unidad_padre_nombre || "",
    categoriaNombre: obtenerCategoriaPorClave(anexo.clave) || anexo.categoria || "",
    claveAnexo: anexo.clave, infoActualizadaAl: anexo.actualizado_en || anexo.creado_en || anexo.fecha_creacion,
    revisionDatos: anexo.reporte_revision_actual,
  };
}

export async function calcularFojasAnexo(id: number, apiUrl: string, token: string, fetcher: typeof fetch = fetch): Promise<AnexoParaFojas> {
  if (!token) throw new ErrorCalculoFojas("Inicia sesión nuevamente para calcular las fojas.");
  const leer = async (response: Response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ErrorCalculoFojas(typeof data.detail === "string" ? data.detail : "No se pudieron calcular las fojas del anexo.", response.status);
    return data as AnexoParaFojas;
  };
  const anexo = await leer(await fetcher(`${apiUrl}/anexos/${id}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  }));
  if (anexo.id === id && anexo.fojas_por_defecto === true && anexo.fojas_reporte === 1 && anexo.reporte_vigente === true) return anexo;
  if (anexo.id !== id || !anexo.reporte_revision_actual || anexo.reporte_formato_actual !== FORMATO_REPORTE_ANEXO) {
    throw new ErrorCalculoFojas("Actualiza la aplicación para calcular las fojas con el formato vigente.");
  }
  const filas = Array.isArray(anexo.datos) ? anexo.datos : anexo.datos ? [anexo.datos] : [];
  // Se conserva toda la geometría del reporte. Los logos no cambian el número
  // de páginas y se omiten en este documento temporal, que nunca se descarga.
  const { doc, fojas } = await crearReporteAnexo(anexo.clave, metadatosFojas(anexo), filas, { incluirLogos: false });
  const form = new FormData();
  form.append("file", doc.output("blob"), `Conteo_${anexo.clave}.pdf`);
  form.append("revision", anexo.reporte_revision_actual);
  form.append("formato", anexo.reporte_formato_actual);
  const confirmado = await leer(await fetcher(`${apiUrl}/anexos/${id}/reporte`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
  }));
  if (confirmado.fojas_reporte !== fojas || confirmado.reporte_vigente !== true) {
    throw new ErrorCalculoFojas("El conteo no pudo confirmarse. Actualiza la lista y recalcula las fojas.");
  }
  return confirmado;
}
