import * as XLSX from "xlsx";
import { EstructuraDatosPorClave } from "./estructuraPorClave";

export function generarPlantillaPorClave(clave: string){
    const columnas = EstructuraDatosPorClave[clave];

    if (!columnas) {
        throw new Error(`No se encontró la estructura de datos para la clave: ${clave}`);
    }

    // convertir a mayusculas 
    const encabezados = [...columnas].map(columna => columna.toUpperCase());

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([encabezados]);

    // Ajustar el ancho de las columnas
    ws["!cols"] = encabezados.map(() => ({ wch: 25 })); // ancho de 25 caracteres

    // proteger la hoja
    ws["!protect"] = {
        password: "SERUMICH2025CONT",
        objects: true,
        scenarios: true,
    };

    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `Plantilla_${clave}.xlsx`);
}