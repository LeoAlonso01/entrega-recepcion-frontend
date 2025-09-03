export function validarNombredeArchivo(file: File, clave: string): { valido: boolean; mensaje?: string } {
    if (!file || !clave) {
        return { valido: false, mensaje: "Archivo o clave no proporcionados" };
    }

    const nombre = file.name.trim();
    const extension = file.type == "application/pdf" ? "pdf" : "xlsx";
    const regex = new RegExp(`^${clave}(_[0-9]{2}_[0-9]{2}_[0-9]{4})?\\.${extension}$`, "i");

    if (!regex.test(nombre)) {
    return {
      valido: false,
      mensaje: `Nombre incorrecto. Usa: ${clave}_dd_mm_aaaa.${extension}`,
    };
  }

    return { valido: true };
}

// lib/validaciones.ts
export function validarEstructuraExcel(
  datos: Record<string, any>[],
  estructura: string[]
): { valido: boolean; errores: string[] } {
  if (datos.length === 0) {
    return { valido: false, errores: ["El archivo está vacío"] };
  }

  const columnasExcel = Object.keys(datos[0]);
  const errores: string[] = [];

  // Campos faltantes
  const faltantes = estructura.filter(campo => !columnasExcel.includes(campo));
  if (faltantes.length > 0) {
    errores.push(`Campos faltantes: ${faltantes.join(", ")}`);
  }

  // Campos extra (puedes ignorarlos o marcarlos como advertencia)
  const extras = columnasExcel.filter(campo => !estructura.includes(campo));
  if (extras.length > 0) {
    errores.push(`Campos extra ignorados: ${extras.join(", ")}`);
  }

  // Validar que no haya filas vacías
  const filasVacias = datos.filter(fila => Object.values(fila).every(valor => !valor));
  if (filasVacias.length > 0) {
    errores.push(`Hay ${filasVacias.length} filas completamente vacías`);
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}