"use client";

import { useId, useState } from "react";

type Option = { id: number; label: string; description?: string; nombre?: string };

export default function ActaSearch({ label, value, options, onChange, onSelect, disabled = false }: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  onSelect: (option: Option) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matches = options.filter(option => normalize(`${option.label} ${option.description || ""}`).includes(normalize(value)));
  const select = (option: Option) => { onSelect(option); setOpen(false); };

  return (
    <div className="relative" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id} role="combobox" autoComplete="off" aria-autocomplete="list"
        aria-expanded={open} aria-controls={`${id}-results`}
        aria-activedescendant={open && matches[active] ? `${id}-${active}` : undefined}
        value={value} disabled={disabled} placeholder={`Buscar ${label.toLowerCase()}...`}
        className="w-full border border-gray-300 rounded px-3 py-2 mt-1 disabled:opacity-50"
        onFocus={() => { setActive(0); setOpen(true); }}
        onChange={event => { onChange(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === "Escape") { setOpen(false); return; }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            setActive(index => Math.max(0, Math.min(matches.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
          }
          if (event.key === "Enter" && open) {
            event.preventDefault(); if (matches[active]) select(matches[active]);
          }
        }}
      />
      {open && <ul id={`${id}-results`} role="listbox" aria-label={label}
        className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-lg">
        {matches.map((option, index) => (
          <li key={option.id} id={`${id}-${index}`} role="option" aria-selected={active === index}
            onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)}
            onClick={() => select(option)}
            className={`cursor-pointer px-3 py-2 text-sm ${active === index ? "bg-gray-100" : ""}`}>
            <span className="block">{option.label}</span>
            {option.description && <span className="text-xs text-gray-500">{option.description}</span>}
          </li>
        ))}
        {!matches.length && <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>}
      </ul>}
    </div>
  );
}
