export type ConfigAnexos = {
  user_id: number; configurado: boolean; revision: number; claves: string[];
  modo: "gradual" | "estricto"; confirmado_en: string | null; confirmado_por: number | null;
};
export type MisPermisosAnexos = ConfigAnexos & { sin_restriccion: boolean };
export type CatalogoPermiso = { clave: string; categoria_id: string; categoria: string; descripcion: string; activo: boolean };
export type CambioPermisos = { revision: number; actor_id: number; fecha: string; anteriores: string[]; nuevas: string[]; motivo: string };
export class ErrorPermisos extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function permisosAnexosApi<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) throw new ErrorPermisos("Inicia sesión de nuevo.", 401);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permisos-anexos${ruta}`, {
    ...opciones,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...opciones.headers, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ErrorPermisos(typeof data.detail === "string" ? data.detail : `No se pudo consultar o guardar permisos (${response.status}).`, response.status);
  }
  return response.json();
}
