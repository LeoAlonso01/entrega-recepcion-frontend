"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Row = Record<string, any>;
type Field = { campo: string; tipo: string; obligatorio?: boolean; Descripcion?: string };
type Issue = { nivel: "error" | "warning"; mensaje: string };
interface Props {
  rows: Row[];
  fields: Field[];
  disabled?: boolean;
  onChange: (rows: Row[]) => void;
  onValidate: (field: string, value: unknown, rowIndex: number) => Issue | null;
}

const PAGE_SIZE = 35;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/_/g, " ").trim().toLowerCase().replace(/\s+/g, " ");

export default function AnexoDataEditor({ rows, fields, disabled = false, onChange, onValidate }: Props) {
  const [page, setPage] = useState(1);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [issues, setIssues] = useState<Record<string, Issue>>({});
  const [mobile, setMobile] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const lastEditedRow = useRef(0);
  const id = useId();
  // Preserve imported keys and their order; append missing catalog fields without renaming data.
  const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  for (const field of fields) {
    if (!columns.some(column => normalize(column) === normalize(field.campo))) columns.push(field.campo);
  }
  const definition = (column: string) => fields.find(field => normalize(field.campo) === normalize(column));
  const isLong = (column: string) => /observaci|descripci|comentario/i.test(column);
  const width = (column: string) => definition(column)?.tipo === "date" ? 168 : definition(column)?.tipo === "number" ? 152 : isLong(column) ? 300 : 224;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const minimumWidth = columns.reduce((total, column) => total + width(column), 216);

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(max-width: 639px)");
    const updateViewport = () => setMobile(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    setPage(previous => Math.min(previous, pageCount));
  }, [pageCount]);

  const update = (index: number, column: string, value: string) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [column]: value } : row));
    setIssues(previous => {
      const next = { ...previous };
      delete next[`${index}:${column}`];
      return next;
    });
  };

  const validate = (index: number, column: string, value: unknown) => {
    const issue = onValidate(column, value, index);
    setIssues(previous => {
      const next = { ...previous };
      if (issue) next[`${index}:${column}`] = issue;
      else delete next[`${index}:${column}`];
      return next;
    });
  };

  const addRow = () => {
    const nextIndex = rows.length;
    onChange([...rows, Object.fromEntries(columns.map(column => [column, ""]))]);
    setPage(Math.floor(nextIndex / PAGE_SIZE) + 1);
    lastEditedRow.current = nextIndex;
    setEditingRow(nextIndex);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
    setIssues({});
  };

  const renderActions = (index: number) => <>
    <Button type="button" variant="outline" size="sm" aria-label={`Editar fila ${index + 1}`} disabled={disabled} onClick={() => { lastEditedRow.current = index; setEditingRow(index); }}>Editar fila</Button>
    <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" aria-label={`Eliminar fila ${index + 1}`} disabled={disabled} onClick={() => removeRow(index)}>Eliminar</Button>
  </>;

  const renderInput = (index: number, column: string, expanded = false) => {
    const field = definition(column);
    const issue = issues[`${index}:${column}`];
    const fieldId = `${id}-${expanded ? "editor" : "table"}-${index}-${columns.indexOf(column)}`;
    const hint = field?.tipo === "date" ? "Formato: dd/mm/aaaa" : field?.Descripcion;
    const common = {
      id: fieldId,
      value: rows[index]?.[column] ?? "",
      disabled,
      "aria-label": `${column.replace(/_/g, " ")}, fila ${index + 1}`,
      "aria-required": !!field?.obligatorio,
      "aria-invalid": issue?.nivel === "error",
      "aria-describedby": issue ? `${fieldId}-issue` : expanded && hint ? `${fieldId}-hint` : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(index, column, event.target.value),
      onBlur: () => validate(index, column, rows[index]?.[column]),
      className: `block w-full min-w-0 rounded-md border bg-white p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#24356B] disabled:opacity-60 ${issue?.nivel === "error" ? "border-red-500" : "border-gray-300"}`,
    };
    return <div className="min-w-0 space-y-1">
      {expanded && <label htmlFor={fieldId} className="block whitespace-normal text-sm font-medium text-gray-900">
        {column.replace(/_/g, " ")}{field?.obligatorio && <span aria-hidden="true" className="text-red-700"> *</span>}
      </label>}
      {isLong(column) ? <textarea {...common} rows={expanded ? 4 : 2} /> : <input {...common} type="text" inputMode={field?.tipo === "number" ? "decimal" : "text"} placeholder={field?.tipo === "date" ? "dd/mm/aaaa" : undefined} />}
      {expanded && hint && <p id={`${fieldId}-hint`} className="whitespace-normal text-xs text-gray-500">{hint}</p>}
      {issue && <p id={`${fieldId}-issue`} role={issue.nivel === "error" ? "alert" : "status"} className={`whitespace-normal break-words text-xs ${issue.nivel === "error" ? "text-red-700" : "text-amber-700"}`}>{issue.mensaje}</p>}
    </div>;
  };

  return <section className="min-w-0 max-w-full space-y-3 whitespace-normal" aria-label="Captura de datos del anexo">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="font-semibold text-gray-900">Tabla de datos</h3><p className="text-sm text-gray-600" role="status">{rows.length} {rows.length === 1 ? "registro" : "registros"} · {columns.length} columnas</p></div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={disabled || !rows.length} onClick={() => {
          if (window.confirm("¿Seguro que deseas eliminar todas las filas de la tabla? Esta acción no se puede deshacer.")) {
            onChange([]); setPage(1); setIssues({});
          }
        }}>Vaciar tabla</Button>
        <Button type="button" disabled={disabled || !columns.length} onClick={addRow}>+ Agregar fila</Button>
      </div>
    </div>
    {rows.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">No hay datos. Sube un archivo Excel o agrega una fila para comenzar.</p> : <>
      <p id={`${id}-help`} className="text-sm text-gray-600">{mobile ? "Abre «Editar fila» para revisar y capturar todos los campos." : "Desplázate horizontalmente para ver todas las columnas o usa «Editar fila» para capturar en un formulario."} * Campo obligatorio.</p>
      <div ref={region} role="region" aria-label={mobile ? "Registros del anexo" : "Tabla editable del anexo"} aria-describedby={`${id}-help`} tabIndex={0}
        className="relative max-h-[65vh] w-full min-w-0 max-w-full overflow-auto overscroll-contain rounded-lg border border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24356B]">
        {mobile ? <ol className="divide-y divide-gray-200">
          {rows.slice(start, start + PAGE_SIZE).map((row, offset) => {
            const index = start + offset;
            return <li key={index} className="space-y-3 bg-white p-3">
              <h4 className="font-semibold text-gray-900">Fila {index + 1}</h4>
              <dl className="space-y-2 text-sm">{columns.slice(0, 3).map(column => <div key={column} className="min-w-0">
                <dt className="break-words text-xs text-gray-500">{column.replace(/_/g, " ")}</dt>
                <dd className="break-words text-gray-900">{String(row[column] ?? "").trim() || "Sin capturar"}</dd>
              </div>)}</dl>
              <div className="flex flex-wrap gap-2">{renderActions(index)}</div>
            </li>;
          })}
        </ol> : <table className="w-full table-fixed border-separate border-spacing-0 text-sm" style={{ minWidth: minimumWidth }}>
          <caption className="sr-only">Datos del anexo. Página {currentPage} de {pageCount}.</caption>
          <colgroup><col style={{ width: 64 }} />{columns.map(column => <col key={column} style={{ width: width(column) }} />)}<col style={{ width: 152 }} /></colgroup>
          <thead><tr>
            <th scope="col" className="sticky left-0 top-0 z-30 border-b bg-gray-100 p-3 text-left">Fila</th>
            {columns.map(column => <th key={column} scope="col" className="sticky top-0 z-20 border-b bg-gray-100 p-3 text-left align-top font-semibold text-gray-700 break-words">
              {column.replace(/_/g, " ")}{definition(column)?.obligatorio && <span aria-hidden="true" className="text-red-700"> *</span>}
            </th>)}
            <th scope="col" className="sticky right-0 top-0 z-30 border-b border-l bg-gray-100 p-3 text-left">Acciones</th>
          </tr></thead>
          <tbody>{rows.slice(start, start + PAGE_SIZE).map((row, offset) => {
            const index = start + offset;
            return <tr key={index} className="group">
              <th scope="row" className="sticky left-0 z-10 border-b bg-white p-3 align-top text-left font-medium group-hover:bg-gray-50">{index + 1}</th>
              {columns.map(column => <td key={column} className="border-b bg-white p-3 align-top group-hover:bg-gray-50">{renderInput(index, column)}</td>)}
              <td className="sticky right-0 z-10 border-b border-l bg-white p-2 align-top group-hover:bg-gray-50">
                <div className="flex flex-col gap-2">
                  {renderActions(index)}
                </div>
              </td>
            </tr>;
          })}</tbody>
        </table>}
      </div>
      <nav aria-label="Paginación de datos del anexo" className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p role="status">Filas {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} de {rows.length}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); region.current?.scrollTo?.({ top: 0 }); }}>Anterior</Button>
          <span>Página {currentPage} de {pageCount}</span>
          <Button type="button" variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); region.current?.scrollTo?.({ top: 0 }); }}>Siguiente</Button>
        </div>
      </nav>
    </>}
    <Dialog open={editingRow !== null && !!rows[editingRow]} onOpenChange={open => { if (!open) setEditingRow(null); }}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-4xl" onCloseAutoFocus={event => {
        event.preventDefault();
        requestAnimationFrame(() => {
          const row = region.current?.querySelector<HTMLButtonElement>(`button[aria-label="Editar fila ${lastEditedRow.current + 1}"]`);
          if (row) { row.focus(); row.scrollIntoView?.({ block: "nearest", inline: "nearest" }); }
          else region.current?.focus();
        });
      }}>
        <DialogHeader className="shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle>Editar fila {(editingRow ?? 0) + 1}</DialogTitle>
          <DialogDescription>Los cambios se incorporan a la tabla al escribir. Guarda el anexo al terminar. * Campo obligatorio.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
            {editingRow !== null && rows[editingRow] && columns.map(column => <div key={column} className={isLong(column) ? "min-w-0 sm:col-span-2" : "min-w-0"}>{renderInput(editingRow, column, true)}</div>)}
          </div>
        </div>
        <div className="flex shrink-0 justify-end border-t bg-white p-4"><Button type="button" onClick={() => setEditingRow(null)}>Listo, volver a la tabla</Button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
