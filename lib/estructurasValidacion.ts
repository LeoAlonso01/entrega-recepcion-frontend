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
  // Ejemplo: Contratos y Convenios (CCL01, CCL02, etc.)
  CCL01: {
    requeridos: [
      { nombre: "contrato", alias: ["nombre", "título"] },
      { nombre: "tipo", alias: ["categoría", "clase"] },
      { nombre: "monto", alias: ["importe", "valor"], tipo: "number" },
      { nombre: "proveedor", alias: ["empresa", "razón social"] },
      { nombre: "fecha_inicio", alias: ["inicio", "emisión"], tipo: "date" },
      { nombre: "fecha_fin", alias: ["fin", "vencimiento"], tipo: "date" }
    ],
  },

  // Caso especial: Contratos con celdas fusionadas
  CCL02: {
    requeridos: [
      { nombre: "licitacion", alias: ["proceso", "convocatoria"] },
      { nombre: "estado", alias: ["situación", "estatus"] },
      { nombre: "monto", alias: ["importe", "presupuesto"], tipo: "number" },
      { nombre: "fecha_apertura", alias: ["apertura", "inicio"], tipo: "date" }
    ],
  },

  // Caso con celdas fusionadas: PARTES INVOLUCRADAS, VIGENCIA
  CCL03: {
    requeridos: [
      { nombre: "tipo_de_instrumento", alias: ["instrumento", "tipo"] },
      { nombre: "objetivo", alias: ["finalidad", "propósito"] },
      { nombre: "partes_involucradas", alias: ["partes", "involucrados"] },
      { nombre: "entre", alias: ["entre_el_la"] },
      { nombre: "y", alias: ["y_el_la"] },
      { nombre: "vigencia", alias: ["periodo"] },
      { nombre: "del", alias: ["inicio"], tipo: "date" },
      { nombre: "al", alias: ["fin"], tipo: "date" },
      { nombre: "importe_convenido", alias: ["monto", "total"], tipo: "number" },
      { nombre: "observaciones", alias: ["notas", "comentarios"] }
    ],
    fusiones: [
      {
        nombre: "partes_involucradas",
        columnas: 3,
        contiene: ["entre", "y"]
      },
      {
        nombre: "vigencia",
        columnas: 3,
        contiene: ["del", "al"]
      }
    ]
  },

  // Recursos Humanos (RRH01)
  RRH01: {
    requeridos: [
      { nombre: "numero_de_empleado", alias: ["empleado", "id"] },
      { nombre: "nombre", alias: ["nombre_completo"] },
      { nombre: "rfc", alias: ["rfc"] },
      { nombre: "plaza_categoria", alias: ["plaza", "categoría"] },
      { nombre: "tipo_de_encargo", alias: ["encargo", "tipo"] },
      { nombre: "fecha_de_ingreso", alias: ["ingreso", "alta"], tipo: "date" },
      { nombre: "sueldo", alias: ["salario"], tipo: "number" },
      { nombre: "otras_percepciones", tipo: "number" },
      { nombre: "total", tipo: "number" },
      { nombre: "unidad_de_adscripcion", alias: ["unidad"] },
      { nombre: "area_laboral", alias: ["área", "departamento"] },
      { nombre: "estatus", alias: ["situación", "estatus"] }
    ]
  },

  // Marco Jurídico (MJ01)
  MJ01: {
    requeridos: [
      { nombre: "ordenamiento", alias: ["ley", "reglamento"] },
      { nombre: "titulo", alias: ["título", "nombre"] },
      { nombre: "fecha_de_emision", alias: ["emisión", "publicación"], tipo: "date" }
    ]
  }

  // ... puedes agregar todas las claves
};