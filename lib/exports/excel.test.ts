import * as XLSX from "xlsx";
import { crearExcelAnexo } from "./excel";

it("conserva columnas de todas las filas, tipos e identificadores y sella el día de México", () => {
  const { libro, nombreArchivo, sello } = crearExcelAnexo({ clave: "RRH01", estado: "Borrador", unidad_responsable_id: 49, datos: [
    { Empleado: "000034", Sueldo: 0, Activo: false },
    { Empleado: "EMP002", Sueldo: 12000.50, Activo: true, Observaciones: "=dato literal" },
  ] }, new Date("2026-11-21T02:03:04Z"));
  expect(nombreArchivo).toBe("anexo_RRH01_2026-11-20_200304.xlsx");
  expect(sello).toBe("RRH01 | 20/11/2026 20:03:04 | America/Mexico_City");
  const leido = XLSX.read(XLSX.write(libro, { type: "array", bookType: "xlsx" }), { type: "array", cellNF: true });
  const hoja = leido.Sheets.Datos;
  expect(hoja.B2.v).toBe("RRH01");
  expect(hoja.B3.w).toBe("20/11/2026");
  expect(hoja.B4.w).toBe("20:03:04");
  expect(hoja.B5.v).toBe(sello);
  expect(hoja.B6.v).toBe("RECURSOS HUMANOS");
  expect(hoja.D10.v).toBe("Observaciones");
  expect(hoja.A11).toMatchObject({ t: "s", v: "000034" });
  expect(hoja.B11).toMatchObject({ t: "n", v: 0 });
  expect(hoja.C11).toMatchObject({ t: "b", v: false });
  expect(hoja.D12).toMatchObject({ t: "s", v: "=dato literal" });
  expect(hoja.D12.f).toBeUndefined();
  expect(hoja["!autofilter"]?.ref).toBe("A10:D12");
});

it("exporta un registro único, valores anidados y anexos sin registros", () => {
  const single = crearExcelAnexo({ clave: "SGC01", datos: { url: [{ url: "https://example.com/anexo.pdf" }], Título: "Archivo" } });
  const hoja = single.libro.Sheets.Datos;
  expect(hoja.A11.v).toBe(JSON.stringify([{ url: "https://example.com/anexo.pdf" }]));
  expect(hoja.B11.v).toBe("Archivo");
  const empty = crearExcelAnexo({ clave: "MJ01", datos: null });
  expect(empty.libro.Sheets.Datos.A10.v).toBe("Sin registros en este anexo");
  expect(empty.libro.Sheets.Datos.B2.v).toBe("MJ01");
});
