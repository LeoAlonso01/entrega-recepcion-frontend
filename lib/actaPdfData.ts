import { categoria_anexos, claves_anexos, obtenerCategoriaPorClave } from "./anexosCatalogo";

export interface ComisionPdf {
  nombre: string;
  oficio: string;
  fecha: string;
}

export interface AnexoPdf {
  id?: number;
  clave: string;
  categoria: string;
  descripcion: string;
  estado: string;
  fojas: number | null;
}

export function textoPdf(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim();
  }
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return textoPdf(item.nombre ?? item.name);
  }
  return "";
}

export function fechaPdf(value: unknown): string {
  const text = textoPdf(value);
  if (!text) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(text);
  if (!match) throw new Error(`Fecha del acta no válida: ${text}`);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
    throw new Error(`Fecha del acta no válida: ${text}`);
  }
  return date.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function horaPdf(value: unknown): string {
  const text = textoPdf(value);
  if (!text) return "";
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(text)) throw new Error(`Hora del acta no válida: ${text}`);
  return text.slice(0, 5);
}

export function normalizarActaPdf(raw: Record<string, any>) {
  const nombreUnidad = textoPdf(raw.unidad_nombre) || textoPdf(raw.unidad) ||
    (typeof raw.unidad_responsable === "object" || typeof raw.unidad_responsable === "string" && !/^\d+$/.test(raw.unidad_responsable)
      ? textoPdf(raw.unidad_responsable) : "");
  const folio = textoPdf(raw.folio);
  const entrante = textoPdf(raw.entrante);
  const saliente = textoPdf(raw.saliente);
  if (!nombreUnidad || !folio || !entrante || !saliente || !raw.fecha) {
    throw new Error("Completa folio, fecha, unidad y nombres de entrante y saliente antes de generar el PDF.");
  }
  const comisiones: ComisionPdf[] = Array.isArray(raw.comisiones) && raw.comisiones.length
    ? raw.comisiones.map((item: Record<string, unknown>) => {
      const comun = item.mismo_oficio !== false;
      return { nombre: textoPdf(item.nombre), oficio: textoPdf(comun ? raw.oficio_comision : item.oficio_comision),
        fecha: fechaPdf(comun ? raw.fecha_oficio_comision : item.fecha_oficio_comision) };
    }) : textoPdf(raw.comisionado) ? [{ nombre: textoPdf(raw.comisionado), oficio: textoPdf(raw.oficio_comision), fecha: fechaPdf(raw.fecha_oficio_comision) }] : [];
  if (comisiones.some(item => !item.nombre)) throw new Error("Falta el nombre completo de un comisionado del acta.");

  const anexos: AnexoPdf[] = (Array.isArray(raw.anexos) ? raw.anexos : [])
    .filter((item: Record<string, unknown>) => item.is_deleted !== true &&
      (raw.id == null || item.acta_id == null || Number(item.acta_id) === Number(raw.id)))
    .map((item: Record<string, unknown>) => {
      const clave = textoPdf(item.clave).toUpperCase();
      const catalogKey = clave.replace(/^RRH(?=\d)/, "RH");
      const entrada = claves_anexos.find(entry => entry.clave === catalogKey);
      return { id: item.id as number | undefined, clave: clave || "Sin clave", categoria: obtenerCategoriaPorClave(clave) || textoPdf(item.categoria) || "Sin categoría",
        descripcion: textoPdf(item.descripcion) || entrada?.descripcion || "Anexo asociado al acta", estado: textoPdf(item.estado) || "No registrado",
        fojas: item.reporte_vigente === true && Number.isInteger(item.fojas_reporte) && Number(item.fojas_reporte) > 0 ? Number(item.fojas_reporte) : null };
    });
  const grupos = new Map<string, AnexoPdf[]>();
  for (const anexo of anexos) grupos.set(anexo.categoria, [...(grupos.get(anexo.categoria) || []), anexo]);
  const orden = (nombre: string) => {
    const index = categoria_anexos.findIndex(item => item.nombre_categoria === nombre);
    return index === -1 ? categoria_anexos.length : index;
  };
  return {
    folio, unidad: nombreUnidad, entrante, saliente,
    fecha: fechaPdf(raw.fecha), hora: horaPdf(raw.hora),
    fechaCierre: fechaPdf(raw.fecha_cierre_acta), horaCierre: horaPdf(raw.hora_cierre_acta),
    inicioLabores: fechaPdf(raw.fecha_inicio_labores), finLabores: fechaPdf(raw.fecha_fin_labores),
    nombramiento: textoPdf(raw.nombramiento), fechaNombramiento: fechaPdf(raw.fecha_nombramiento),
    asignacion: textoPdf(raw.asignacion), asignadoPor: textoPdf(raw.asignado_por),
    ineEntrante: textoPdf(raw.ine_entrante), domicilioEntrante: textoPdf(raw.domicilio_entrante), telefonoEntrante: textoPdf(raw.telefono_entrante),
    ineSaliente: textoPdf(raw.ine_saliente), domicilioSaliente: textoPdf(raw.domicilio_saliente),
    testigoEntrante: textoPdf(raw.testigo_entrante), testigoSaliente: textoPdf(raw.testigo_saliente),
    ineTestigoEntrante: textoPdf(raw.ine_testigo_entrante), ineTestigoSaliente: textoPdf(raw.ine_testigo_saliente),
    observaciones: textoPdf(raw.observaciones), comisiones, anexos,
    gruposAnexos: [...grupos.entries()].sort(([a], [b]) => orden(a) - orden(b)),
  };
}

export async function cargarDatosActaPdf(id: number): Promise<Record<string, any>> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Inicia sesión antes de consultar el documento.");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actas/${id}/datos-pdf`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "No se pudieron recuperar los datos guardados del acta.");
  normalizarActaPdf(data);
  return data;
}
