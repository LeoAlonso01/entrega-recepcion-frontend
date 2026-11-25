export type ActorActa = { id: number; role: string };
export type ActaEditable = { estado?: string | null; creador_id?: number | null };

export const estadoActaEditable = (estado?: string | null) =>
  estado === "Pendiente" || estado === "Revisión" || estado === "Borrador";

export function puedeEditarActa(acta: ActaEditable, actor: ActorActa | null): boolean {
  if (!actor || !estadoActaEditable(acta.estado)) return false;
  return actor.role === "ADMIN" || actor.role === "AUDITOR" ||
    (actor.role === "USER" && acta.creador_id != null && actor.id === acta.creador_id);
}

export function actorActaLocal(): ActorActa | null {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.id == null || !Number.isSafeInteger(Number(user.id))) return null;
    return { id: Number(user.id), role: String(user.role || localStorage.getItem("role") || "").trim().toUpperCase() };
  } catch {
    return null;
  }
}
