"use client";

import { useEffect, useMemo, useState } from "react";
import { contarAnexosUsuario } from "@/lib/habilitacionAnexos";
import { permisosAnexosApi, ErrorPermisos, type ConfigAnexos, type CatalogoPermiso, type CambioPermisos } from "@/lib/permisosAnexosApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Usuario = { id: number; username: string };
type Anexo = { creador_id: number; clave: string; estado: string; is_deleted?: boolean };
type Props = { adminId: number; role: string; anexos: Anexo[]; cargandoAnexos: boolean; onDirtyChange?: (dirty: boolean) => void };

export default function HabilitacionAnexos({ adminId, role, anexos, cargandoAnexos, onDirtyChange }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [usuarioId, setUsuarioId] = useState("");
  const [config, setConfig] = useState<ConfigAnexos | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoPermiso[]>([]);
  const [historial, setHistorial] = useState<CambioPermisos[]>([]);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [conflicto, setConflicto] = useState(false);
  const [claves, setClaves] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("__all__");
  const [listo, setListo] = useState(false);
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  useEffect(() => {
    if (role !== "ADMIN" || adminId <= 0) return;
    const controller = new AbortController();
    setCargando(true);
    setError("");
    setUsuarioId("");
    setClaves([]);
    setConfig(null);
    async function cargarUsuarios() {
      try {
        const [data, lista] = await Promise.all([
          permisosAnexosApi<Usuario[]>("/usuarios", { signal: controller.signal }),
          permisosAnexosApi<CatalogoPermiso[]>("/catalogo", { signal: controller.signal }),
        ]);
        if (!controller.signal.aborted) {
          setUsuarios(data);
          setCatalogo(lista);
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Error al cargar usuarios.");
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    void cargarUsuarios();
    return () => controller.abort();
  }, [adminId, role, recarga]);

  const [recargaConfig, setRecargaConfig] = useState(0);
  useEffect(() => {
    if (!usuarioId || role !== "ADMIN") return;
    const controller = new AbortController();
    setListo(false);
    setError("");
    setConflicto(false);
    setConfig(null);
    setHistorial([]);
    setMotivo("");
    Promise.all([
      permisosAnexosApi<ConfigAnexos>(`/usuarios/${usuarioId}`, { signal: controller.signal }),
      permisosAnexosApi<CambioPermisos[]>(`/usuarios/${usuarioId}/historial`, { signal: controller.signal }),
    ]).then(([data, cambios]) => {
      if (controller.signal.aborted) return;
      setConfig(data);
      setClaves(data.claves);
      setHistorial(cambios);
      setListo(true);
    }).catch(cause => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudo cargar la configuración.");
    });
    return () => controller.abort();
  }, [usuarioId, role, recargaConfig]);

  const resumen = useMemo(() => contarAnexosUsuario(Number(usuarioId), claves, anexos), [usuarioId, claves, anexos]);
  const modificada = JSON.stringify([...claves].sort()) !== JSON.stringify([...(config?.claves ?? [])].sort()) || !!motivo;
  useEffect(() => {
    onDirtyChange?.(modificada);
    const prevenirSalida = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    if (modificada) window.addEventListener("beforeunload", prevenirSalida);
    return () => { onDirtyChange?.(false); window.removeEventListener("beforeunload", prevenirSalida); };
  }, [modificada, onDirtyChange]);
  const categorias = Array.from(new Map(catalogo.map(item => [item.categoria_id, { id: item.categoria_id, nombre_categoria: item.categoria }])).values())
    .sort((a, b) => Number(a.id) - Number(b.id));
  const listaVisible = catalogo.filter(item =>
    (categoriaId === "__all__" || item.categoria_id === categoriaId) &&
    normalizar(`${item.clave} ${item.descripcion}`).includes(normalizar(busqueda))
  );
  const cambiarClaves = (lista: string[], habilitar: boolean) => setClaves(actuales =>
    habilitar ? Array.from(new Set([...actuales, ...lista])) : actuales.filter(clave => !lista.includes(clave))
  );
  function seleccionarUsuario(id: string) {
    if (modificada && !window.confirm("Hay cambios sin guardar. ¿Descartarlos y cambiar de usuario?")) return;
    setUsuarioId(id);
    setListo(false);
    setClaves([]);
  }
  async function guardar() {
    if (role !== "ADMIN" || !listo || !config || guardando || conflicto || error) return;
    if (!claves.length && !window.confirm("Esta configuración dejará al usuario sin claves de captura. Los anexos existentes se conservarán. ¿Continuar?")) return;
    setGuardando(true);
    try {
      const data = await permisosAnexosApi<ConfigAnexos>(`/usuarios/${usuarioId}`, {
        method: "PUT", body: JSON.stringify({ revision: config.revision, claves, motivo: motivo.trim() }),
      });
      setConfig(data);
      setClaves(data.claves);
      setMotivo("");
      toast.success("Permisos guardados y aplicados al usuario");
      try { setHistorial(await permisosAnexosApi<CambioPermisos[]>(`/usuarios/${usuarioId}/historial`)); }
      catch { toast.warning("Los permisos sí se guardaron, pero no se pudo actualizar el historial. Recarga para consultarlo."); }
    } catch (cause) {
      if (cause instanceof ErrorPermisos && cause.status === 409) setConflicto(true);
      toast.error(cause instanceof Error ? cause.message : "No se pudo guardar la configuración");
    } finally {
      setGuardando(false);
    }
  }

  async function cargarPropuesta() {
    setGuardando(true);
    try {
      const data = await permisosAnexosApi<{ claves: string[]; desconocidas: string[] }>(`/usuarios/${usuarioId}/propuesta`);
      setClaves(actuales => Array.from(new Set([...actuales, ...data.claves])));
      if (data.desconocidas.length) toast.warning(`Claves anteriores fuera del catálogo: ${data.desconocidas.join(", ")}`);
      toast.info("Propuesta cargada. Revisa y guarda para aplicarla.");
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "No se pudo obtener la propuesta"); }
    finally { setGuardando(false); }
  }

  if (role !== "ADMIN") return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilitar anexos por usuario</CardTitle>
        <CardDescription>Las configuraciones guardadas limitan la captura y el listado personal, también para ADMIN. Los anexos existentes conservan su autoría y sus archivos. ADMIN puede seguir administrando permisos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div role="alert" className="rounded border border-red-300 p-3 text-red-700">{error}
          <Button variant="outline" className="ml-3" onClick={() => usuarioId ? setRecargaConfig(valor => valor + 1) : setRecarga(valor => valor + 1)}>Reintentar</Button>
        </div>}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="usuario-habilitacion">Usuario</Label>
            <Select value={usuarioId} onValueChange={seleccionarUsuario} disabled={cargando || guardando}>
              <SelectTrigger id="usuario-habilitacion"><SelectValue placeholder={cargando ? "Cargando usuarios…" : "Selecciona un usuario"} /></SelectTrigger>
              <SelectContent>{usuarios.map(user => <SelectItem key={user.id} value={String(user.id)}>{user.username} · ID {user.id}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria-habilitacion">Categoría</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger id="categoria-habilitacion"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="__all__">Todas las categorías</SelectItem>
                {categorias.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buscar-habilitacion">Clave o descripción</Label>
            <Input id="buscar-habilitacion" type="search" placeholder="Buscar clave o descripción" value={busqueda} onChange={event => setBusqueda(event.target.value)} />
          </div>
        </div>
        {!cargando && !error && usuarios.length === 0 && <p>No hay usuarios disponibles.</p>}
        {!usuarioId ? <p className="text-sm text-gray-600">Selecciona un usuario para configurar sus anexos, incluso si aún no ha creado ninguno.</p> : !listo ? <p role="status">{error ? "No se puede editar hasta cargar la configuración." : "Cargando configuración…"}</p> : <>
          <p className="text-sm text-gray-600">{config?.configurado ? `Configuración confirmada · revisión ${config.revision}.` : "Pendiente de configurar."} {config?.modo === "gradual" ? "En modo gradual, los usuarios pendientes conservan la captura; guardar activa la restricción para este usuario." : "Modo estricto: los usuarios sin configuración no pueden capturar."} {modificada && "Hay cambios sin guardar."} Pendientes = claves habilitadas que aún no están completadas. Los conteos por clave no duplican registros y excluyen anexos eliminados.</p>
          {conflicto && <div role="alert" className="rounded border border-amber-400 p-3">Otro administrador guardó cambios. Tu selección sigue visible; recarga la versión vigente antes de continuar.
            <Button variant="outline" className="ml-3" onClick={() => {
              if (window.confirm("¿Descartar tus cambios y cargar la configuración vigente?")) setRecargaConfig(value => value + 1);
            }}>Recargar configuración</Button>
          </div>}
          {cargandoAnexos ? <p role="status">Cargando conteos de anexos…</p> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            {[
              ["Registros del usuario", resumen.registros], ["Claves habilitadas", resumen.habilitadas],
              ["Habilitadas creadas", resumen.creadas], ["Habilitadas completadas", resumen.completadas],
              ["Pendientes de completar", resumen.pendientes], ["Sin crear", resumen.sinCrear],
            ].map(([label, value]) => <div key={label} className="rounded border p-3"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-semibold">{value}</p></div>)}
          </div>}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={cargarPropuesta} disabled={guardando || conflicto}>Sugerir desde anexos existentes</Button>
            <Button variant="outline" disabled={!modificada || guardando} onClick={() => { setClaves(config?.claves ?? []); setMotivo(""); }}>Descartar cambios</Button>
          </div>
          <fieldset disabled={guardando || conflicto} className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
            {categorias.map(categoria => {
              const items = listaVisible.filter(item => item.categoria_id === categoria.id);
              if (!items.length) return null;
              const seleccionadas = items.filter(item => claves.includes(item.clave)).length;
              return <fieldset key={categoria.id} className="rounded border p-4">
                <legend className="px-2 text-sm font-semibold">{categoria.nombre_categoria}</legend>
                <label className="mb-3 flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <input type="checkbox" checked={seleccionadas === items.length}
                    ref={element => { if (element) element.indeterminate = seleccionadas > 0 && seleccionadas < items.length; }}
                    onChange={event => cambiarClaves(items.map(item => item.clave), event.target.checked)} />
                  Habilitar claves visibles de esta categoría ({seleccionadas}/{items.length})
                </label>
                <div className="space-y-2">{items.map(item => <label key={item.clave} className="flex cursor-pointer items-start gap-3 rounded bg-gray-50 p-3 text-sm">
                  <input className="mt-1" type="checkbox" checked={claves.includes(item.clave)} onChange={event => cambiarClaves([item.clave], event.target.checked)} />
                  <span className="flex-1"><strong>{item.clave}</strong> · {item.descripcion}</span>
                  {!cargandoAnexos && <span className="text-xs text-gray-600">{resumen.completadasPorClave.has(item.clave) ? "Completado" : resumen.creadasPorClave.has(item.clave) ? "Creado" : "Sin crear"}</span>}
                </label>)}</div>
              </fieldset>;
            })}
            {!listaVisible.length && <p>No hay claves con estructura para estos filtros.</p>}
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="motivo-permisos">Motivo de la configuración</Label>
            <Input id="motivo-permisos" value={motivo} maxLength={500} disabled={guardando || conflicto} onChange={event => setMotivo(event.target.value)} placeholder="Explica la asignación o el cambio (mínimo 5 caracteres)" />
            <Button onClick={guardar} disabled={guardando || conflicto || !listo || !!error || motivo.trim().length < 5 || (!modificada && !!config?.configurado)}>
              {guardando ? "Guardando…" : "Guardar y aplicar permisos"}
            </Button>
          </div>
          <details>
            <summary className="cursor-pointer font-medium">Historial de cambios (últimos 20)</summary>
            {!historial.length ? <p className="mt-2 text-sm">Sin configuraciones confirmadas.</p> : <ul className="mt-3 space-y-3 text-sm">{historial.map(cambio => <li className="rounded border p-3" key={cambio.revision}>
              <p>Revisión {cambio.revision} · ADMIN ID {cambio.actor_id} · {new Date(cambio.fecha).toLocaleString("es-MX")}</p>
              <p>{cambio.motivo}</p><p>Agregadas: {cambio.nuevas.filter(clave => !cambio.anteriores.includes(clave)).join(", ") || "Ninguna"}</p>
              <p>Retiradas: {cambio.anteriores.filter(clave => !cambio.nuevas.includes(clave)).join(", ") || "Ninguna"}</p>
            </li>)}</ul>}
          </details>
        </>}
      </CardContent>
    </Card>
  );
}
