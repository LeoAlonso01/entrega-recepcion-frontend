// lib/estructurasValidacion.ts
import { normalizar } from "./inferirTipo";

export const ReglasValidacion: Record<
  string,
  {
    requeridos: Array<{
      nombre: string;
      alias?: string[];
      tipo?: "string" | "number" | "date";
    }>;
    opcionales?: string[];
    fusiones?: {
      nombre: string;
      columnas: number; // Número de columnas que ocupa
      contiene: string[]; // Nombres de columnas internas
    }[];
  }
> = {


  
  // ... puedes agregar todas las claves
};