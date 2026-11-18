"use client";

import { useEffect, useMemo, useState } from "react";
import { categoria_anexos } from "@/lib/anexosCatalogo";
import { clavesHabilitables, contarAnexosUsuario, validarClavesHabilitadas } from "@/lib/habilitacionAnexos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Usuario = { id: number; username: string };
type Anexo = { creador_id: number; clave: string; estado: string; is_deleted?: boolean };
type Props = { adminId: number; role: string; anexos: Anexo[]; cargandoAnexos: boolean };

export default function HabilitacionAnexos({ adminId, role, anexos, cargandoAnexos }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [usuarioId, setUsuarioId] = useState("");
  const [asignaciones, setAsignaciones] = useState<Record<string, string[]>>({});
  const [claves, setClaves] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("__all__");
  const [listo, setListo] = useState(false);
  const storageKey = `anexos-habilitados-prueba:v1:${process.env.NEXT_PUBLIC_API_URL}:${adminId}`;
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  useEffect(() => {
    if (role !== "ADMIN" || adminId <= 0) return;
    const controller = new AbortController();
    setCargando(true);
    setError("");
    setListo(false);
    setUsuarioId("");
    setClaves([]);
    setAsignaciones({});
    try {
      const guardado = localStorage.getItem(storageKey);
      if (guardado) {
        const data: unknown = JSON.parse(guardado);
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Formato inválido");
        const entries = Object.entries(data).map(([id, lista]) => {
          if (!/^[1-9]\d*$/.test(id)) throw new Error("Usuario inválido");
          return [id, validarClavesHabilitadas(lista)] as const;
        });
        setAsignaciones(Object.fromEntries(entries));
      }
      setListo(true);
    } catch {
      setError("No se pudo leer la configuración local. Revisa el almacenamiento del navegador antes de guardar.");
    }
    async function cargarUsuarios() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Inicia sesión nuevamente para consultar usuarios.");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error(`No se pudieron cargar los usuarios (${response.status}).`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(user => Number.isInteger(Number(user.id)) && Number(user.id) > 0 && typeof user.username === "string")) {
          throw new Error("La respuesta de usuarios no es válida.");
        }
        if (!controller.signal.aborted) setUsuarios(data.map(user => ({ id: Number(user.id), username: user.username }))
          .sort((a, b) => a.username.localeCompare(b.username, "es")));
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Error al cargar usuarios.");
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    void cargarUsuarios();
    return () => controller.abort();
  }, [adminId, role, storageKey, recarga]);

  const resumen = useMemo(() => contarAnexosUsuario(Number(usuarioId), claves, anexos), [usuarioId, claves, anexos]);
  const modificada = JSON.stringify([...claves].sort()) !== JSON.stringify([...(asignaciones[usuarioId] ?? [])].sort());
  const listaVisible = clavesHabilitables.filter(item =>
    (categoriaId === "__all__" || item.id_categoria === categoriaId) &&
    normalizar(`${item.clave} ${item.descripcion}`).includes(normalizar(busqueda))
  );
  const cambiarClaves = (lista: string[], habilitar: boolean) => setClaves(actuales =>
    habilitar ? Array.from(new Set([...actuales, ...lista])) : actuales.filter(clave => !lista.includes(clave))
  );
  function seleccionarUsuario(id: string) {
    if (modificada && !window.confirm("Hay cambios sin guardar. ¿Descartarlos y cambiar de usuario?")) return;
    setUsuarioId(id);
    setClaves(asignaciones[id] ?? []);
  }
  function guardar() {
    if (role !== "ADMIN" || !listo || error || !usuarios.some(user => String(user.id) === usuarioId)) return;
    try {
      const nuevas = { ...asignaciones, [usuarioId]: validarClavesHabilitadas(claves) };
      localStorage.setItem(storageKey, JSON.stringify(nuevas));
      setAsignaciones(nuevas);
      toast.success("Configuración de prueba guardada en este navegador");
    } catch {
      toast.error("No se pudo guardar la configuración local");
    }
  }

  if (role !== "ADMIN") return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilitar anexos por usuario</CardTitle>
        <CardDescription>Prueba local: selecciona las claves que aplican a cada usuario. Esta configuración no modifica los permisos de captura ni se comparte con otros navegadores.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div role="alert" className="rounded border border-red-300 p-3 text-red-700">{error}
          <Button variant="outline" className="ml-3" onClick={() => setRecarga(valor => valor + 1)}>Reintentar</Button>
        </div>}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="usuario-habilitacion">Usuario</Label>
            <Select value={usuarioId} onValueChange={seleccionarUsuario} disabled={cargando || !listo || !!error}>
              <SelectTrigger id="usuario-habilitacion"><SelectValue placeholder={cargando ? "Cargando usuarios…" : "Selecciona un usuario"} /></SelectTrigger>
              <SelectContent>{usuarios.map(user => <SelectItem key={user.id} value={String(user.id)}>{user.username} · ID {user.id}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria-habilitacion">Categoría</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger id="categoria-habilitacion"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="__all__">Todas las categorías</SelectItem>
                {categoria_anexos.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buscar-habilitacion">Clave o descripción</Label>
            <Input id="buscar-habilitacion" type="search" placeholder="Buscar clave o descripción" value={busqueda} onChange={event => setBusqueda(event.target.value)} />
          </div>
        </div>
        {!cargando && !error && usuarios.length === 0 && <p>No hay usuarios disponibles.</p>}
        {!usuarioId ? <p className="text-sm text-gray-600">Selecciona un usuario para configurar sus anexos, incluso si aún no ha creado ninguno.</p> : <>
          <p className="text-sm text-gray-600">{modificada ? "Vista previa con cambios sin guardar." : "Configuración de prueba guardada."} Pendientes = claves habilitadas que aún no están completadas. Los conteos por clave no duplican registros y excluyen anexos eliminados.</p>
          {cargandoAnexos ? <p role="status">Cargando conteos de anexos…</p> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            {[
              ["Registros del usuario", resumen.registros], ["Claves habilitadas", resumen.habilitadas],
              ["Habilitadas creadas", resumen.creadas], ["Habilitadas completadas", resumen.completadas],
              ["Pendientes de completar", resumen.pendientes], ["Sin crear", resumen.sinCrear],
            ].map(([label, value]) => <div key={label} className="rounded border p-3"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-semibold">{value}</p></div>)}
          </div>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={guardar} disabled={!modificada || !listo || !!error}>Guardar prueba</Button>
            <Button variant="outline" disabled={!modificada} onClick={() => setClaves(asignaciones[usuarioId] ?? [])}>Descartar cambios</Button>
          </div>
          <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
            {categoria_anexos.map(categoria => {
              const items = listaVisible.filter(item => item.id_categoria === categoria.id);
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
          </div>
        </>}
      </CardContent>
    </Card>
  );
}
