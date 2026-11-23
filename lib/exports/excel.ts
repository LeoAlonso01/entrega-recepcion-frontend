import * as XLSX from "xlsx";
import { obtenerCategoriaPorClave } from "../anexosCatalogo";

interface AnexoExcel {
  clave: string;
  categoria?: string;
  estado?: string;
  unidad_responsable_id?: number;
  datos: Record<string, unknown>[] | Record<string, unknown> | null;
}

const ZONA_HORARIA = "America/Mexico_City";

export function crearExcelAnexo(anexo: AnexoExcel, momento = new Date()) {
  const partes = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(momento).map(parte => [parte.type, parte.value]));
  const { year, month, day, hour, minute, second } = partes;
  const clave = anexo.clave.trim();
  const fechaArchivo = `${year}-${month}-${day}`;
  const sello = `${clave} | ${day}/${month}/${year} ${hour}:${minute}:${second} | ${ZONA_HORARIA}`;
  const registros = (Array.isArray(anexo.datos) ? anexo.datos : anexo.datos ? [anexo.datos] : [])
    .filter((fila): fila is Record<string, unknown> => !!fila && typeof fila === "object" && !Array.isArray(fila));
  const columnas = [...new Set(registros.flatMap(fila => Object.keys(fila)))];
  const valorCelda = (valor: unknown): string | number | boolean => {
    if (valor == null) return "";
    if (typeof valor === "number" || typeof valor === "boolean" || typeof valor === "string") return valor;
    return JSON.stringify(valor);
  };
  // Fechas y horas numéricas de Excel, calculadas con el día institucional.
  const fechaExcel = (Date.UTC(Number(year), Number(month) - 1, Number(day)) - Date.UTC(1899, 11, 30)) / 86400000;
  const horaExcel = (Number(hour) * 3600 + Number(minute) * 60 + Number(second)) / 86400;
  const contenido = [
    [`ANEXO ${clave}`],
    ["Clave del anexo", clave],
    ["Fecha de descarga", fechaExcel],
    ["Hora de descarga", horaExcel],
    ["Sello de descarga", sello],
    ["Categoría", obtenerCategoriaPorClave(clave) || anexo.categoria || "Sin categoría"],
    ["Estado", anexo.estado || "No registrado"],
    ["Unidad responsable", anexo.unidad_responsable_id ?? "No registrada"],
    [],
    ...(columnas.length ? [columnas, ...registros.map(fila => columnas.map(columna => valorCelda(fila[columna])))] : [["Sin registros en este anexo"]]),
  ];
  const hoja = XLSX.utils.aoa_to_sheet(contenido);
  hoja.B3.z = "dd/mm/yyyy";
  hoja.B4.z = "hh:mm:ss";
  const ancho = Math.max(4, columnas.length);
  hoja["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: ancho - 1 } },
    ...Array.from({ length: 7 }, (_, index) => ({ s: { r: index + 1, c: 1 }, e: { r: index + 1, c: ancho - 1 } })),
  ];
  hoja["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: contenido.length - 1, c: ancho - 1 } });
  hoja["!cols"] = Array.from({ length: ancho }, (_, index) => ({
    wch: Math.min(55, Math.max(index === 0 ? 25 : 20,
      ...[columnas[index] || "", ...registros.slice(0, 100).map(fila => String(valorCelda(fila[columnas[index]])))].map(texto => texto.length + 2))),
  }));
  if (columnas.length) {
    hoja["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 9, c: 0 }, e: { r: contenido.length - 1, c: columnas.length - 1 } }) };
  }
  const libro = XLSX.utils.book_new();
  libro.Props = { Title: `Anexo ${clave}`, Subject: sello, CreatedDate: momento };
  XLSX.utils.book_append_sheet(libro, hoja, "Datos");
  const claveArchivo = clave.replace(/[^a-zA-Z0-9_-]/g, "_") || "sin_clave";
  return { libro, sello, nombreArchivo: `anexo_${claveArchivo}_${fechaArchivo}_${hour}${minute}${second}.xlsx` };
}

export function exportAnexoToExcel(anexo: AnexoExcel) {
  const { libro, nombreArchivo } = crearExcelAnexo(anexo);
  XLSX.writeFile(libro, nombreArchivo, { compression: true });
  return nombreArchivo;
}
