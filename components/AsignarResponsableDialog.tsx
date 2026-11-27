"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { coincideBusqueda } from "@/lib/busquedaAdministracion";

type Usuario = { id: number; username: string; email: string; is_deleted?: boolean };
type Cargo = { id: number; nombre: string; descripcion?: string; activo?: boolean; is_deleted?: boolean };
type Unidad = { id_unidad: number; nombre: string; responsable: { username: string } | null };
type Opcion = { id: number; nombre: string; detalle?: string };

function Selector({ label, placeholder, opciones, value, onChange, disabled }: {
  label: string; placeholder: string; opciones: Opcion[]; value: number | null; onChange: (id: number | null) => void; disabled: boolean;
}) {
  const id = useId();
  const [busqueda, setBusqueda] = useState("");
  const resultados = opciones.filter(opcion => coincideBusqueda(busqueda, [opcion.nombre, opcion.detalle]));
  const seleccionado = opciones.find(opcion => opcion.id === value);
  return <section className="min-w-0 space-y-3" aria-label={`Seleccionar ${label.toLowerCase()}`}>
    <label htmlFor={id} className="block font-semibold text-gray-900">{label} <span aria-hidden="true" className="text-red-700">*</span></label>
    <Input id={id} type="search" aria-label={`Buscar ${label.toLowerCase()}`} placeholder={placeholder} value={busqueda}
      disabled={disabled} onChange={event => setBusqueda(event.target.value)} className="min-w-0" />
    <p role="status" className="text-xs text-gray-500">{resultados.length} de {opciones.length} opciones</p>
    <div role="radiogroup" aria-label={label} aria-required="true" className="max-h-52 overflow-y-auto overscroll-contain rounded-lg border border-gray-200">
      {resultados.map(opcion => <label key={opcion.id} className={`flex cursor-pointer items-start gap-3 border-b p-3 last:border-b-0 ${opcion.id === value ? "bg-blue-50" : "bg-white hover:bg-gray-50"} ${disabled ? "cursor-default opacity-60" : ""}`}>
        <input type="radio" name={id} value={opcion.id} checked={opcion.id === value} disabled={disabled} onChange={() => onChange(opcion.id)} className="mt-1 shrink-0 accent-[#24356B]" />
        <span className="min-w-0"><span className="block break-words text-sm font-medium text-gray-900">{opcion.nombre}</span>
          {opcion.detalle && <span className="block break-words text-xs text-gray-500">{opcion.detalle}</span>}
        </span>
      </label>)}
      {!resultados.length && <p className="p-4 text-sm text-gray-500">No se encontraron opciones con esta búsqueda.</p>}
    </div>
    {seleccionado && <div className="flex items-start justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
      <p className="min-w-0 break-words text-[#24356B]"><span className="font-semibold">Seleccionado: </span>{seleccionado.nombre}{seleccionado.detalle ? ` · ${seleccionado.detalle}` : ""}</p>
      <button type="button" disabled={disabled} aria-label={`Quitar ${label.toLowerCase()} seleccionado`} onClick={() => onChange(null)} className="shrink-0 text-xs underline disabled:opacity-50">Quitar</button>
    </div>}
  </section>;
}

export default function AsignarResponsableDialog({ unidad, usuarios, cargos, isSubmitting, cargoGuardado, error, onClose, onConfirm }: {
  unidad: Unidad; usuarios: Usuario[]; cargos: Cargo[]; isSubmitting: boolean; cargoGuardado: boolean; error: string | null;
  onClose: () => void; onConfirm: (usuarioId: number, cargoId: number) => Promise<void>;
}) {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [cargoId, setCargoId] = useState<number | null>(null);
  const disponibles = usuarios.filter(usuario => !usuario.is_deleted);
  const activos = cargos.filter(cargo => !cargo.is_deleted && (cargo.activo ?? true));
  const usuario = disponibles.find(item => item.id === usuarioId);
  const cargo = activos.find(item => item.id === cargoId);

  return <Dialog open onOpenChange={open => { if (!open && !isSubmitting) onClose(); }}>
    <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-4xl"
      onCloseAutoFocus={event => event.preventDefault()}>
      <DialogHeader className="shrink-0 border-b p-5 pr-12 text-left">
        <DialogTitle>Seleccionar responsable y cargo</DialogTitle>
        <DialogDescription>Busca y selecciona un usuario y un cargo. Revisa el resumen antes de confirmar la asignación.</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
        <div className="space-y-1 rounded-lg border bg-gray-50 p-3 text-sm">
          <p className="break-words"><span className="font-semibold">Unidad: </span>{unidad.nombre}</p>
          <p className="break-words text-gray-600">Responsable actual: {unidad.responsable?.username || "Sin asignar"}</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
          <Selector label="Usuario" placeholder="Buscar por nombre o email" opciones={disponibles.map(item => ({ id: item.id, nombre: item.username, detalle: item.email }))}
            value={usuarioId} onChange={setUsuarioId} disabled={isSubmitting || cargoGuardado} />
          <Selector label="Cargo" placeholder="Buscar por nombre o descripción" opciones={activos.map(item => ({ id: item.id, nombre: item.nombre, detalle: item.descripcion }))}
            value={cargoId} onChange={setCargoId} disabled={isSubmitting || cargoGuardado} />
        </div>
        <section aria-label="Resumen de asignación" className="space-y-2 rounded-lg border border-[#24356B]/20 bg-blue-50 p-4 text-sm">
          <h3 className="font-semibold text-[#24356B]">Resumen de la asignación</h3>
          <dl className="space-y-2">
            <div><dt className="font-medium">Unidad</dt><dd className="break-words">{unidad.nombre}</dd></div>
            <div><dt className="font-medium">Usuario</dt><dd className="break-words">{usuario ? `${usuario.username} (${usuario.email})` : "Selecciona un usuario"}</dd></div>
            <div><dt className="font-medium">Cargo</dt><dd className="break-words">{cargo?.nombre || "Selecciona un cargo"}</dd></div>
          </dl>
        </section>
        {cargoGuardado && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">El cargo ya quedó asignado. Falta actualizar al responsable de la unidad; puedes reintentar para completar este paso.</p>}
        {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
      <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-white p-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>Cancelar</Button>
        <Button type="button" disabled={isSubmitting || !usuario || !cargo} onClick={() => { if (usuario && cargo) void onConfirm(usuario.id, cargo.id); }}>
          {isSubmitting ? "Procesando…" : cargoGuardado ? "Reintentar actualizar responsable" : "Confirmar asignación"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>;
}
