import * as XLSX from "xlsx";
import { ESTRUCTURA_DATOS_POR_CLAVE } from "./estructuraPorClave";

export function generarPlantillaPorClave(clave: string){
    const columnas = ESTRUCTURA_DATOS_POR_CLAVE[clave];

    
    if (!columnas) {
        throw new Error(`No se encontró la estructura de datos para la clave: ${clave}`);
    }

    const encabezados = columnas.map(c => c.campo); // 👈 corregido

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([encabezados]);

    ws["!cols"] = encabezados.map(() => ({ wch: 25 }));

    // ❌ SIN PROTECCIÓN

    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `Plantilla_${clave}.xlsx`);
}