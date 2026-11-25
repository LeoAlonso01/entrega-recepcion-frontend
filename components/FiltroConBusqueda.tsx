"use client";

import { useId, useState } from "react";
import { ChevronDown, X } from "lucide-react";

type Opcion = { value: string; label: string };
const normalizar = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function FiltroConBusqueda({ label, value, options, allLabel, onChange, disabled = false }: {
  label: string; value: string; options: Opcion[]; allLabel: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const id = useId();
  const [busqueda, setBusqueda] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const opciones = [{ value: "__all__", label: allLabel }, ...options];
  const resultados = opciones.filter(option => normalizar(option.label).includes(normalizar(busqueda ?? "")));
  const elegir = (opcion: Opcion) => { if (disabled) return; onChange(opcion.value); setBusqueda(null); setAbierto(false); };
  return <div className="relative min-w-0 space-y-2" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setAbierto(false); setBusqueda(null); }
  }}>
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <div className="relative">
      <input id={id} role="combobox" disabled={disabled} aria-label={`Filtrar por ${label.toLowerCase()}`} autoComplete="off"
        aria-autocomplete="list" aria-expanded={abierto} aria-controls={`${id}-opciones`}
        aria-activedescendant={abierto && resultados[activo] ? `${id}-opcion-${activo}` : undefined}
        placeholder={`Buscar ${label.toLowerCase()}...`}
        value={busqueda ?? opciones.find(option => option.value === value)?.label ?? ""}
        className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#24356B] disabled:cursor-not-allowed disabled:opacity-50"
        onFocus={() => { setBusqueda(""); setAbierto(true); setActivo(0); }}
        onClick={() => { if (!abierto) { setBusqueda(""); setAbierto(true); setActivo(0); } }}
        onChange={event => { setBusqueda(event.target.value); setActivo(0); setAbierto(true); }}
        onKeyDown={event => {
          if (event.key === "Escape") { setAbierto(false); setBusqueda(null); }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setAbierto(true);
            setActivo(index => Math.max(0, Math.min(resultados.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
          }
          if (event.key === "Enter" && abierto) { event.preventDefault(); if (resultados[activo]) elegir(resultados[activo]); }
        }} />
      {value !== "__all__" ? <button type="button" disabled={disabled} aria-label={`Limpiar filtro ${label.toLowerCase()}`}
        className="absolute inset-y-0 right-0 px-2 text-gray-500 hover:text-gray-900" onClick={() => elegir(opciones[0])}>
        <X className="h-4 w-4" aria-hidden="true" />
      </button> : <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-500" aria-hidden="true" />}
    </div>
    {abierto && !disabled && <ul id={`${id}-opciones`} role="listbox" aria-label={label}
      className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto whitespace-normal rounded-md border bg-white py-1 shadow-lg">
      {resultados.map((option, index) => <li key={option.value} id={`${id}-opcion-${index}`} role="option"
        aria-selected={activo === index} onMouseDown={event => event.preventDefault()}
        onMouseEnter={() => setActivo(index)} onClick={() => elegir(option)}
        className={`cursor-pointer break-words px-3 py-2 text-sm ${activo === index ? "bg-blue-50 text-[#24356B]" : "text-gray-800"}`}>
        {option.label}
      </li>)}
      {!resultados.length && <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>}
    </ul>}
  </div>;
}
