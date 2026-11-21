"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoria_anexos, claves_anexos, obtenerCategoriaPorClave } from "@/lib/anexosCatalogo";
import { Loader2, Paperclip } from "lucide-react";

export interface ActaDraft {
  unidad_responsable: number | string;
  folio?: string;
  entrante?: string;
  saliente?: string;
  saliente_id?: number | null;
  [key: string]: unknown;
}

interface Preview {
  unidad_responsable: number;
  unidad_nombre: string;
  anexos_creador_id: number;
  anexos_creador_usuario: string;
  anexos_origen: string;
  total: number;
  anexos_revision: string;
  anexos: { id: number; clave: string | null; estado: string; fecha_creacion?: string | null; filas: number }[];
}

const statusColor = (estado: string) => {
  switch (estado.toLowerCase()) {
    case "completado": case "completada": return "border-green-200 bg-green-50 text-green-800";
    case "revisión": case "revision": return "border-blue-200 bg-blue-50 text-blue-800";
    default: return "border-amber-200 bg-amber-50 text-amber-800";
  }
};

export default function ActaPreviewDialog({ datos, onCancel, onConfirm }: {
  datos: ActaDraft;
  onCancel: () => void;
  onConfirm: (revision: string) => Promise<void>;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const loadPreview = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true); setError(""); setPreview(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Tu sesión no está disponible. Inicia sesión nuevamente.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actas/vista-previa`, {
        method: "POST", signal: request.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ unidad_responsable: Number(datos.unidad_responsable), saliente_id: datos.saliente_id ?? null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "No se pudieron consultar los anexos.");
      if (!Array.isArray(result.anexos) || typeof result.anexos_revision !== "string") throw new Error("La vista previa no es válida.");
      if (!request.signal.aborted) setPreview(result);
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudieron consultar los anexos.");
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }, [datos.unidad_responsable, datos.saliente_id]);

  useEffect(() => {
    void loadPreview();
    return () => controller.current?.abort();
  }, [loadPreview]);

  const confirm = async () => {
    if (busy.current || loading || !preview) return;
    busy.current = true; setSaving(true); setError(""); setNotice("");
    try {
      await onConfirm(preview.anexos_revision);
    } catch (cause) {
      if ((cause as { status?: number })?.status === 409) {
        setNotice("Los anexos cambiaron. Actualizamos la lista; revísala y confirma nuevamente.");
        await loadPreview();
      } else {
        setError(cause instanceof Error ? cause.message : "No se pudo crear el acta. Puedes intentarlo nuevamente.");
      }
    } finally {
      busy.current = false; setSaving(false);
    }
  };

  const grupos = new Map<string, Preview["anexos"]>();
  for (const anexo of preview?.anexos || []) {
    const categoria = obtenerCategoriaPorClave(anexo.clave) || "Sin categoría";
    const grupo = grupos.get(categoria) || [];
    grupo.push(anexo);
    grupos.set(categoria, grupo);
  }
  const ordenCategoria = (nombre: string) => {
    const index = categoria_anexos.findIndex(categoria => categoria.nombre_categoria === nombre);
    return index === -1 ? categoria_anexos.length : index;
  };
  const gruposAnexos = [...grupos.entries()].sort(([a], [b]) => ordenCategoria(a) - ordenCategoria(b));

  return <Dialog open onOpenChange={open => { if (!open && !busy.current) onCancel(); }}>
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Paperclip className="h-5 w-5 text-[#751518]" />Revisar anexos del acta</DialogTitle>
        <DialogDescription>Revisa los anexos que se asociarán al confirmar. Todavía no se ha creado el acta.</DialogDescription>
      </DialogHeader>
      <div className="rounded-lg border bg-gray-50 p-3 text-sm">
        <p className="font-semibold">{datos.folio || "Nueva acta"}</p>
        <p className="mt-1 text-gray-600">Unidad Responsable: {preview?.unidad_nombre || "Consultando unidad..."}</p>
        <p className="mt-2">Funcionario saliente: {datos.saliente || "–"}</p>
      </div>
      {notice && <p role="status" className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {error} {!saving && <Button type="button" variant="outline" size="sm" className="ml-2" onClick={() => void loadPreview()}>Actualizar lista</Button>}
      </div>}
      {loading ? <p role="status" className="flex items-center gap-2 py-6 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" />Consultando anexos disponibles...</p> : preview && <>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{preview.total} anexo(s) por asociar</p>
          <Badge variant="outline">{gruposAnexos.length} categoría(s)</Badge>
        </div>
        {preview.total === 0 ? <p className="rounded-lg border border-dashed p-5 text-center text-sm text-gray-600">
          No hay anexos disponibles para esta acta en la unidad seleccionada. Puedes crear el acta sin anexos.
        </p> : <div className="max-h-72 overflow-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs text-gray-500"><tr>
              <th className="p-3">Anexo</th><th className="p-3">Estado</th><th className="p-3">Fecha</th>
            </tr></thead>
            {gruposAnexos.map(([categoria, anexos]) => <tbody key={categoria} aria-label={categoria}>
              <tr className="border-t bg-[#751518]/5">
                <th colSpan={3} scope="rowgroup" className="px-3 py-2 text-xs font-semibold text-[#751518]">
                  <div className="flex items-center justify-between gap-2"><span>{categoria}</span>
                    <span className="whitespace-nowrap font-normal text-gray-500">{anexos.length} anexo(s)</span></div>
                </th>
              </tr>
              {anexos.map(item => {
              const clave = item.clave?.trim().toUpperCase() || "";
              const descripcion = claves_anexos.find(entry => entry.clave === clave || (clave === "RRH01" && entry.clave === "RH01"))?.descripcion;
              return <tr key={item.id} className="border-t align-top">
                <td className="p-3"><p className="font-medium">{item.clave || "Sin clave"}</p>
                  {descripcion && <p className="mt-1 max-w-xs text-xs text-gray-500">{descripcion}</p>}</td>
                <td className="p-3"><Badge variant="outline" className={`whitespace-nowrap ${statusColor(item.estado)}`}>{item.estado}</Badge></td>
                <td className="whitespace-nowrap p-3 text-gray-600">{item.fecha_creacion ? item.fecha_creacion.slice(0, 10).split("-").reverse().join("/") : "–"}</td>
              </tr>;
              })}
            </tbody>)}
          </table>
        </div>}
        <p className="text-xs text-gray-500">Solo se incluyen anexos disponibles de esta unidad que no están eliminados ni asociados a otra acta. Su estado actual se conservará.</p>
      </>}
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>Volver al formulario</Button>
        <Button type="button" className="bg-[#751518] text-white hover:bg-[#8a1a1d]" disabled={loading || saving || !preview} onClick={() => void confirm()}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Creando acta..." : "Crear acta y asociar anexos"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
