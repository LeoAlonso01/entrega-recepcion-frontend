// lib/inferirTipo.ts
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD") // Descompone acentos
    .replace(/[\u0300-\u036f]/g, ""); // Elimina acentos
}

export function inferirTipo(columna: string): "string" | "number" | "date" | "unknown" {
  const nombre = normalizar(columna);

  // 🔹 Fechas
  if ([
    "fecha", "emision", "inicio", "fin", "ingreso", "registro", 
    "nacimiento", "cambio", "vencimiento", "pago", "asignacion", "alta", "baja"
  ].some(palabra => nombre.includes(palabra))) {
    return "date";
  }

  // 🔹 Números
  if ([
    "monto", "sueldo", "importe", "cantidad", "total", "saldo", 
    "valor", "precio", "costo", "presupuesto", "porcentaje", "numero", "no", "dias", "horas"
  ].some(palabra => nombre.includes(palabra))) {
    return "number";
  }

  // 🔹 Texto
  if ([
    "nombre", "rfc", "puesto", "area", "unidad", "descripcion", 
    "observaciones", "tipo", "estatus", "cargo", "direccion", "correo",
    "asunto", "titulo", "categoria", "clave", "sintesis", "responsable"
  ].some(palabra => nombre.includes(palabra))) {
    return "string";
  }

  return "unknown";
}