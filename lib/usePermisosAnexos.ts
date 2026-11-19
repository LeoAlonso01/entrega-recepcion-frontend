"use client";
import { useCallback, useEffect, useState } from "react";
import { permisosAnexosApi, type MisPermisosAnexos } from "./permisosAnexosApi";
import { normalizarClaveAnexo } from "./habilitacionAnexos";

export const clavePermitida = (permisos: MisPermisosAnexos | null, clave: string): boolean =>
  !!permisos && (permisos.sin_restriccion || permisos.claves.includes(normalizarClaveAnexo(clave)));

export function filtrarAnexosAsignados<T extends { clave: string }>(anexos: T[], permisos: MisPermisosAnexos | null): T[] {
  return anexos.filter(anexo => clavePermitida(permisos, anexo.clave));
}

export function usePermisosAnexos(userId: number, activeTab: string) {
  const [permisos, setPermisos] = useState<MisPermisosAnexos | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const refrescar = useCallback(async () => {
    if (userId <= 0) return null;
    try {
      const data = await permisosAnexosApi<MisPermisosAnexos>("/mios");
      if (data.user_id !== Number(userId)) throw new Error("La sesión cambió. Recarga la página.");
      setPermisos(data);
      setError("");
      return data;
    } catch (cause) {
      setPermisos(null);
      setError(cause instanceof Error ? cause.message : "No se pudieron comprobar los permisos");
      return null;
    } finally { setCargando(false); }
  }, [userId]);
  useEffect(() => {
    let activo = true;
    if (userId <= 0) return;
    setCargando(true);
    const controller = new AbortController();
    permisosAnexosApi<MisPermisosAnexos>("/mios", { signal: controller.signal }).then(data => {
      if (!activo) return;
      if (data.user_id !== Number(userId)) throw new Error("La sesión cambió. Recarga la página.");
      setPermisos(data); setError("");
    }).catch(cause => {
      if (activo) { setPermisos(null); setError(cause instanceof Error ? cause.message : "No se pudieron comprobar los permisos"); }
    }).finally(() => { if (activo) setCargando(false); });
    const onFocus = () => { void refrescar(); };
    window.addEventListener("focus", onFocus);
    return () => { activo = false; controller.abort(); window.removeEventListener("focus", onFocus); };
  }, [userId, activeTab, refrescar]);
  return { permisos, error, cargando, refrescar, puedeCapturar: (clave: string) => clavePermitida(permisos, clave) };
}
