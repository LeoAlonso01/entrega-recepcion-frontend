"use client";

import { useId, useState } from "react";
import ActaSearch from "./ActaSearch";

export default function ActaPersonSearch({ label, nombre, usuarioId, options, disabled, bloquearCuenta = false, onChange }: {
  label: string;
  nombre: string;
  usuarioId?: number | null;
  options: { id: number; label: string; description?: string; nombre?: string }[];
  disabled: boolean;
  bloquearCuenta?: boolean;
  onChange: (nombre: string, id: number | null) => void;
}) {
  const id = useId();
  const [manual, setManual] = useState(!!nombre && !usuarioId);
  const [busqueda, setBusqueda] = useState<string | null>(null);
  return <div>
    {manual ? <>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} value={nombre} placeholder="Nombre completo"
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        onChange={event => onChange(event.target.value, null)} />
    </> : <ActaSearch label={label} value={busqueda ?? (usuarioId ? options.find(option => option.id === usuarioId)?.label || "" : nombre)} options={options} disabled={disabled || bloquearCuenta}
      onChange={value => { setBusqueda(value); onChange("", null); }}
      onSelect={option => { setBusqueda(null); onChange(option.nombre || "", option.id); }} />}
    {!manual && usuarioId != null && <div className="mt-2">
      <p className="mb-1 text-xs text-gray-500">Cuenta seleccionada: {options.find(option => option.id === usuarioId)?.label || "Usuario"} · ID {usuarioId}</p>
      <label htmlFor={`${id}-nombre`} className="block text-sm font-medium text-gray-700">Nombre para el acta de {label}</label>
      <input id={`${id}-nombre`} value={nombre} placeholder="Captura el nombre completo" required
        aria-invalid={!nombre.trim()} aria-describedby={!nombre.trim() ? `${id}-aviso` : undefined}
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        onChange={event => onChange(event.target.value, usuarioId)} />
      {!nombre.trim() && <p id={`${id}-aviso`} className="mt-1 text-sm text-red-700">Falta el nombre completo. Captúralo aquí; se conservará el ID de la cuenta seleccionada.</p>}
    </div>}
    <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
      <input type="checkbox" checked={manual} disabled={bloquearCuenta} aria-label={`Capturar nombre manualmente de ${label}`}
        onChange={event => {
          setManual(event.target.checked); setBusqueda(null);
          onChange(event.target.checked ? nombre : "", null);
        }} />
      Capturar persona sin cuenta en el sistema
    </label>
    {!manual && usuarioId != null && <p className="mt-1 text-xs text-gray-500">Para completar el nombre de esta cuenta, usa el campo de arriba. Esta opción es solo para personas sin cuenta.</p>}
  </div>;
}
