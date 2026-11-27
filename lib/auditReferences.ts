import { claves_anexos } from "./anexosCatalogo";

type RecordData = Record<string, unknown>;
export interface AuditLog {
  id: number;
  actor_id: number | null;
  action: string;
  object_type: string | null;
  object_id: string | number | null;
  timestamp: string;
  success: boolean;
  ip_address: string | null;
  metadata: RecordData | null;
  actor?: RecordData | null;
  actor_name?: string;
}
type Entity = "usuario" | "unidad" | "acta" | "anexo" | "cargo";
export interface AuditDisplay {
  event: AuditLog;
  actor: string;
  object: string;
  type: string;
  unit: string;
}

const asRecord = (value: unknown): RecordData => value && typeof value === "object" && !Array.isArray(value) ? value as RecordData : {};
const name = (...values: unknown[]) => values.find(value => typeof value === "string" && value.trim() && !/^\d+$/.test(value.trim())) as string | undefined;
const cleanName = (...values: unknown[]) => name(...values)?.trim();
const referenceId = (value: unknown) => (typeof value === "number" || typeof value === "string") && /^\d+$/.test(String(value)) ? String(value) : undefined;
const personName = (record: RecordData) => cleanName(record.nombre_completo, record.full_name, record.nombre, record.username);
const unitName = (record: RecordData) => cleanName(record.nombre, record.nombre_unidad);
const aliases: Record<string, Entity> = {
  user: "usuario", users: "usuario", usuario: "usuario", usuarios: "usuario",
  unidad: "unidad", unidades: "unidad", unidad_responsable: "unidad", unidades_responsables: "unidad",
  acta: "acta", actas: "acta", anexo: "anexo", anexos: "anexo", cargo: "cargo", cargos: "cargo",
};
const typeNames: Record<Entity, string> = { usuario: "Usuario", unidad: "Unidad responsable", acta: "Acta", anexo: "Anexo", cargo: "Cargo" };
const unavailable: Record<Entity, string> = { usuario: "Usuario no disponible", unidad: "Unidad no disponible", acta: "Acta no disponible", anexo: "Anexo no disponible", cargo: "Cargo no disponible" };

const annexName = (value: unknown, description?: unknown) => {
  const clave = cleanName(value);
  if (!clave) return undefined;
  const descripcion = cleanName(description) || claves_anexos.find(item => item.clave === clave.toUpperCase())?.descripcion;
  return descripcion ? `${clave} · ${descripcion}` : clave;
};

function snapshotObject(event: AuditLog, type?: Entity): string | undefined {
  const meta = asRecord(event.metadata);
  const explicit = cleanName(meta.object_name, meta.objeto_nombre, meta.nombre_objeto);
  if (explicit) return explicit;
  switch (type) {
    case "usuario": return cleanName(meta.usuario_nombre, meta.nombre_usuario, meta.target_username, meta.username, meta.nombre_completo)
      || personName(asRecord(meta.usuario ?? meta.user ?? meta.target_user));
    case "unidad": return snapshotUnit(meta) || cleanName(meta.nombre);
    case "acta": return cleanName(meta.folio_acta, meta.folio, asRecord(meta.acta).folio)
      || (typeof event.object_id === "string" && /^ACTA[-/]/i.test(event.object_id) ? event.object_id : undefined);
    case "anexo": return annexName(meta.clave ?? meta.anexo_clave ?? asRecord(meta.anexo).clave, meta.descripcion)
      || (typeof event.object_id === "string" && /^[A-Z]{2,8}\d{2,3}$/i.test(event.object_id) ? annexName(event.object_id) : undefined);
    case "cargo": return cleanName(meta.cargo_nombre, meta.nombre_cargo, asRecord(meta.cargo).nombre);
  }
}

function snapshotUnit(record: RecordData): string | undefined {
  return cleanName(record.unidad_responsable_nombre, record.nombre_unidad_responsable, record.unidad_nombre, record.nombre_unidad)
    || unitName(asRecord(record.unidad_responsable ?? record.unidad))
    || cleanName(record.unidad_responsable, record.unidad);
}

function unitId(record: RecordData): string | undefined {
  const nested = asRecord(record.unidad_responsable ?? record.unidad);
  return referenceId(record.unidad_responsable_id ?? record.unidad_id ?? nested.id_unidad ?? nested.id ?? record.unidad_responsable ?? record.unidad);
}

/** Cache is scoped to the mounted audit view and discarded when its session changes. */
export class AuditReferenceResolver {
  private cache = new Map<string, Promise<unknown>>();
  private failed = false;
  constructor(private request: (path: string) => Promise<Response>) {}

  private read(path: string): Promise<unknown> {
    let pending = this.cache.get(path);
    if (!pending) {
      pending = this.request(path).then(async response => {
        if (!response.ok) { if (response.status !== 404) this.failed = true; return null; }
        return response.json();
      }).catch(() => { this.failed = true; return null; });
      this.cache.set(path, pending);
    }
    return pending;
  }

  private async catalog(path: string): Promise<RecordData[]> {
    const data = await this.read(path);
    const items = Array.isArray(data) ? data : asRecord(data).items;
    if (!Array.isArray(items)) { this.failed = true; return []; }
    return items.map(asRecord);
  }

  private async entity(type: Entity, id: string): Promise<RecordData> {
    if (type === "usuario" || type === "unidad" || type === "cargo") {
      const path = type === "usuario" ? "/users" : type === "unidad" ? "/unidades_responsables" : "/cargos";
      const catalog = await this.catalog(path);
      return catalog.find(item => referenceId(type === "unidad" ? item.id_unidad ?? item.id : item.id) === id) || {};
    }
    // Fetch only referenced actas/anexos rather than downloading all their captured data.
    return asRecord(await this.read(`/${type === "acta" ? "actas" : "anexos"}/${id}`));
  }

  async resolve(events: AuditLog[]): Promise<{ rows: AuditDisplay[]; incomplete: boolean }> {
    const rows = await Promise.all(events.map(async event => {
      const meta = asRecord(event.metadata);
      const type = aliases[event.object_type?.trim().toLowerCase() ?? ""];
      const actorSnapshot = cleanName(meta.actor_nombre, meta.actor_name, meta.actor_username)
        || personName(asRecord(meta.actor)) || cleanName(event.actor_name) || personName(asRecord(event.actor));
      const actorId = referenceId(event.actor_id);
      const objectId = referenceId(event.object_id);
      const snapshot = snapshotObject(event, type);
      const [actorRecord, target] = await Promise.all([
        !actorSnapshot && actorId ? this.entity("usuario", actorId) : Promise.resolve<RecordData>({}),
        !snapshot && type && objectId ? this.entity(type, objectId) : Promise.resolve<RecordData>({}),
      ]);
      let object = snapshot;
      if (!object) {
        switch (type) {
          case "usuario": object = personName(target); break;
          case "unidad": object = unitName(target); break;
          case "acta": object = cleanName(target.folio); break;
          case "anexo": object = annexName(target.clave, target.descripcion); break;
          case "cargo": object = cleanName(target.nombre); break;
        }
      }
      const recordedUnitName = snapshotUnit(meta);
      const targetUnitName = type === "unidad" ? object : snapshotUnit(target);
      const recordedUnitId = unitId(meta);
      const targetUnitId = type === "unidad" ? objectId : unitId(target);
      const resolvedUnitId = recordedUnitId || targetUnitId;
      // A recorded unit ID takes precedence over a current entity's unit association.
      const resolvedUnitName = recordedUnitName || (!recordedUnitId ? targetUnitName : undefined)
        || (resolvedUnitId ? unitName(await this.entity("unidad", resolvedUnitId)) : undefined);
      return {
        event,
        actor: actorSnapshot || personName(actorRecord) || "Usuario no disponible",
        object: object || (type ? unavailable[type] : "Registro no disponible"),
        type: type ? typeNames[type] : cleanName(event.object_type) || "Tipo no registrado",
        unit: resolvedUnitName || (resolvedUnitId ? "Unidad no disponible" : "No registrada"),
      };
    }));
    return { rows, incomplete: this.failed };
  }
}
