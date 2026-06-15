import { ESTRUCTURA_DATOS_POR_CLAVE } from "./estructuraPorClave";
import { inferirTipo } from "./inferirTipo";
import { ReglasValidacion } from "./estructurasValidacion";
import { normalizar } from "./inferirTipo";

const FECHA_DD_MM_AAAA_REGEX = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

export function parseFechaDdMmAaaa(valor: unknown): Date | null {
  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : new Date(valor.getTime());
  }

  if (typeof valor === "number" && Number.isFinite(valor)) {
    const fecha = new Date((valor - 25569) * 86400 * 1000);
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  if (typeof valor !== "string") return null;

  const limpio = valor.trim();
  const match = limpio.match(FECHA_DD_MM_AAAA_REGEX);
  if (!match) return null;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  const fecha = new Date(anio, mes - 1, dia);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  return fecha;
}

export function esFechaDdMmAaaaEstricta(valor: unknown): boolean {
  return parseFechaDdMmAaaa(valor) !== null;
}

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

export function validarEstructuraExcel(
  datos: Record<string, any>[],
  clave: string
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (datos.length === 0) {
    errores.push("El archivo está vacío");
    return { valido: false, errores };
  }

  const reglas = ReglasValidacion[clave];
  if (!reglas) {
    // Si no hay reglas, valida que haya al menos una columna
    if (Object.keys(datos[0]).length === 0) {
      errores.push("No se encontraron columnas");
    }
    return { valido: !errores.length, errores };
  }

  const columnasExcel = Object.keys(datos[0]).map(normalizar);
  const nombresRequeridos = reglas.requeridos.map(r => normalizar(r.nombre));
  const aliasRequeridos = reglas.requeridos.flatMap(r => r.alias?.map(a => normalizar(a)) || []);

  // Buscar coincidencias flexibles
  const encontradas = new Set<string>();
  const faltantes: string[] = [];

  nombresRequeridos.forEach(nombre => {
    const alias = reglas.requeridos.find(r => normalizar(r.nombre) === nombre)?.alias || [];
    const todosLosNombres = [nombre, ...alias.map(a => normalizar(a))];

    const existe = columnasExcel.some(col => todosLosNombres.includes(col));
    if (!existe) {
      faltantes.push(nombre);
    } else {
      encontradas.add(nombre);
    }
  });

  if (faltantes.length > 0) {
    errores.push(`Campos requeridos faltantes: ${faltantes.join(", ")}`);
  }

  // Validar fusiones (opcional)
  if (reglas.fusiones) {
    reglas.fusiones.forEach(fusion => {
      const indice = columnasExcel.findIndex(col => col === normalizar(fusion.nombre));
      if (indice === -1) return;

      const columnasSiguientes = columnasExcel.slice(indice + 1, indice + fusion.columnas);
      const contiene = fusion.contiene.map(normalizar);

      contiene.forEach(sub => {
        if (!columnasSiguientes.includes(sub)) {
          errores.push(`Fusión incompleta: "${fusion.nombre}" debe incluir "${sub}"`);
        }
      });
    });
  }

  return { valido: errores.length === 0, errores };
}

export function validarTiposExcel(
  datos: Record<string, any>[],
  clave?: string
): { advertencias: string[] } {
  const advertencias: string[] = [];

  if (datos.length === 0) return { advertencias };

  // Opcional: ignorar validación para ciertas claves
  if (clave && ["ENI01", "PP01"].includes(clave)) {
    return { advertencias }; // Son PDFs, no validamos tipos
  }

  const tiposEsperados = new Map<string, "string" | "number" | "date" | "unknown">();

  // Prioriza los tipos definidos en la estructura de datos por clave
  if (clave && ESTRUCTURA_DATOS_POR_CLAVE[clave]) {
    ESTRUCTURA_DATOS_POR_CLAVE[clave].forEach((item) => {
      tiposEsperados.set(normalizar(item.campo), item.tipo as any);
    });
  }

  // Si hay reglas explícitas para la clave, usa también esos tipos (sobreescribe si existe)
  const reglas = clave && clave in ReglasValidacion ? ReglasValidacion[clave] : undefined;
  if (reglas) {
    reglas.requeridos.forEach((item) => {
      if (!item.tipo) return;

      tiposEsperados.set(normalizar(item.nombre), item.tipo);

      if (!item.alias || item.alias.length === 0) return;

      for (const aliasItem of item.alias) {
        tiposEsperados.set(normalizar(aliasItem), item.tipo);
      }
    });
  }

  datos.forEach((fila, idx) => {
    Object.keys(fila).forEach((columna) => {
      const valor = fila[columna];
      if (valor == null || valor === "") return; // Celda vacía → no valida

      const nombreNormalizado = normalizar(columna);
      const tipoEsperado = tiposEsperados.get(nombreNormalizado) || inferirTipo(columna);

      if (tipoEsperado === "date") {
        if (!esFechaDdMmAaaaEstricta(valor)) {
          advertencias.push(
            `Fila ${idx + 1}: "${columna}" ('${valor}') no es una fecha válida con formato dd/mm/aaaa`
          );
        }
        return;
      }

      if (tipoEsperado === "number") {
        const num = typeof valor === "string"
          ? parseFloat(valor.replace(/[^\d.-]/g, ""))
          : valor;
        if (isNaN(num)) {
          advertencias.push(
            `Fila ${idx + 1}: "${columna}" ('${valor}') no es un número válido`
          );
        }
        return;
      }

      // Si no se infiere tipo explícito y no está en estructura/reglas, no se alerta para evitar falsos positivos
    });
  });

  return { advertencias };
}


export function detectarFusiones(
  datos: Record<string, any>[],
  clave: string
): { nombresColumnas: string[]; errores: string[] } {
  if (datos.length === 0) return { nombresColumnas: [], errores: ["Archivo vacío"] };

  const primeraFila = datos[0];
  const nombresColumnas: string[] = [];
  const errores: string[] = [];

  // Si no hay encabezados, error
  if (!primeraFila || Object.keys(primeraFila).length === 0) {
    errores.push("No se encontraron encabezados");
    return { nombresColumnas, errores };
  }

  // Usar una lista de estructuras conocidas para esta clave
  const estructuraEsperada: (string | { campo: string })[] = ESTRUCTURA_DATOS_POR_CLAVE[clave] || [];
  const nombresEsperados = estructuraEsperada.map(c => typeof c === "string" ? c : c.campo);

  // Mapear nombres esperados a índices
  const mapaNombres = new Map<string, number>();
  nombresEsperados.forEach((nombre, i) => mapaNombres.set(nombre, i));

  // Función para normalizar nombres de columnas (elimina espacios y pasa a minúsculas)
  function normalizar(nombre: string): string {
    return nombre.trim().toLowerCase().replace(/\s+/g, "");
  }

  // Recorrer las celdas de la primera fila
  let indiceActual = 0;
  for (const [nombreCelda, valor] of Object.entries(primeraFila)) {
    const nombreNormalizado = normalizar(nombreCelda);
    const nombreEncontrado = Array.from(mapaNombres.keys()).find(n => 
      normalizar(n).includes(nombreNormalizado)
    );

    if (!nombreEncontrado) {
      errores.push(`Columna desconocida: "${nombreCelda}"`);
      continue;
    }

    const indiceEsperado = mapaNombres.get(nombreEncontrado)!;

    // Si el índice actual no coincide con el esperado, hay problema
    if (indiceActual !== indiceEsperado) {
      errores.push(`Orden incorrecto: "${nombreCelda}" debería estar en posición ${indiceEsperado}, pero está en ${indiceActual}`);
    }

    // Agregar al array de nombres
    nombresColumnas.push(nombreEncontrado);
    indiceActual++;
  }

  // Verificar que todos los nombres esperados estén presentes
  const faltantes = nombresEsperados.filter(n => !nombresColumnas.includes(n));
  if (faltantes.length > 0) {
    errores.push(`Faltan columnas: ${faltantes.join(", ")}`);
  }

  return { nombresColumnas, errores };
}