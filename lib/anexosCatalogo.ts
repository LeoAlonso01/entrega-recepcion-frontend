export const categoria_anexos = [
  { id: "1", nombre_categoria: "MARCO JURIDICO" },
  { id: "2", nombre_categoria: "PLANEACION" },
  { id: "3", nombre_categoria: "DERECHOS Y OBLIGACIONES" },
  { id: "4", nombre_categoria: "ORGANIZACION" },
  { id: "5", nombre_categoria: "RECURSOS HUMANOS" },
  { id: "6", nombre_categoria: "RECURSOS MATERIALES" },
  { id: "7", nombre_categoria: "RECURSOS PRESUPUESTALES Y FINANCIEROS" },
  { id: "8", nombre_categoria: "OBRA PÚBLICA" },
  { id: "9", nombre_categoria: "ARCHIVOS DOCUMENTALES E INFORMATICOS" },
  { id: "10", nombre_categoria: "CONTROL Y FISCALIZACION" },
  { id: "11", nombre_categoria: "INFORME DE GESTION" },
  { id: "12", nombre_categoria: "TRANSPARENCIA Y ACCESO A LA INFORMACION" },
  { id: "13", nombre_categoria: "CONVENIOS Y CONTRATOS" },
  { id: "14", nombre_categoria: "ASUNTOS GENERALES" },
  { id: "15", nombre_categoria: "ASUNTOS RELEVANTES" },
  { id: "16", nombre_categoria: "SISTEMA DE GESTION DE CALIDAD" }
] as const;


export const claves_anexos = [
  // 1) ARCHIVOS DOCUMENTALES E INFORMATICOS
  { id: "1", clave: "ADI01", descripcion: "RESPALDOS DE INFORMACION EN MEDIOS MAGNETICOS", id_categoria: "9" },
  { id: "2", clave: "ADI02", descripcion: "INVENTARIO DE ACERVO BIBLIOGRAFICOS Y HEMEROGRAFICOS", id_categoria: "9" },

  // 2) ASUNTOS GENERALES
  { id: "3", clave: "AG01", descripcion: "CORTE DE FORMAS Y FOLIADAS", id_categoria: "14" },
  { id: "4", clave: "AG02", descripcion: "SELLOS OFICIALES", id_categoria: "14" },
  { id: "5", clave: "AG03", descripcion: "CLAVES O FIRMAS DE ACCESO A SISTEMAS DE PROCESOS Y DE SEGURIDAD PARA SU OPERACION", id_categoria: "14" },
  { id: "6", clave: "AG04", descripcion: "CANCELACION DE FIRMAS O CLAVES ELECTRONICAS", id_categoria: "14" },

  // 3) ASUNTOS RELEVANTES EN TRAMITE DE ATENCION
  { id: "7", clave: "AR01", descripcion: "ASUNTOS RELEVANTES EN TRAMITE DE ATENCION", id_categoria: "15" },

  // 4) CONVENIOS Y CONTRATOS
  { id: "8", clave: "CC01", descripcion: "CONTRATOS Y CONVENIOS VIGENTES", id_categoria: "13" },
  { id: "9", clave: "CC02", descripcion: "CONVENIOS DE COORDINACION CON INSTANCIAS FEDERALES, ESTATALES, MUNICIPALES E INICIATIVA PRIVADA", id_categoria: "13" },
  { id: "10", clave: "CC03", descripcion: "RELACION DE CONTRATOS DE FIDEICOMISOS", id_categoria: "13" },

  // 5) CONTROL Y FISCALIZACION
  { id: "11", clave: "CF01", descripcion: "LICITACIONES EN TRAMITES DE BIENES Y SERVICIOS", id_categoria: "10" },
  { id: "12", clave: "CF02", descripcion: "ASUNTOS EN TRAMITE DE NATURALEZA JURIDICA", id_categoria: "10" },

  // 6) DERECHOS Y OBLIGACIONES
  { id: "13", clave: "DO01", descripcion: "PODERES OTORGADOS", id_categoria: "3" },
  { id: "14", clave: "DO02", descripcion: "ACUERDO DE ORGANOS DE GOBIERNO", id_categoria: "3" },
  { id: "15", clave: "DO03", descripcion: "OBSERVACIONES DE AUDITORIA PENDIENTES DE SOLVENTAR", id_categoria: "3" },
  { id: "16", clave: "DO04", descripcion: "REPRESENTACIONES Y CARGOS HONORIFICOS VIGENTES", id_categoria: "3" },

  // 7) ORGANIZACION
  { id: "17", clave: "EO01", descripcion: "ORGANIGRAMA GENERAL", id_categoria: "4" },
  { id: "18", clave: "EO02", descripcion: "REGLAMENTO INTERIOR Y MANUALES GENERALES", id_categoria: "4" },
  { id: "19", clave: "IG01", descripcion: "RELACION DE ARCHIVOS DE TRAMITE Y CONCENTRACION", id_categoria: "11" },
  { id: "20", clave: "IG02", descripcion: "ACTAS DE CONSEJO", id_categoria: "11" },

  // 8) MARCO JURIDICO
  { id: "21", clave: "MJ01", descripcion: "ADMINISTRATIVO DE ACTUACION", id_categoria: "1" },

  // 9) OBRAS PUBLICAS
  { id: "22", clave: "OP01", descripcion: "PROGRAMA ANUAL DE OBRA PUBLICA", id_categoria: "8" },
  { id: "23", clave: "OP02", descripcion: "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA POR CONTRATO Y SU CONTENIDO", id_categoria: "8" },
  { id: "24", clave: "OP03", descripcion: "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA POR ADMINISTRACION DIRECTA Y SU CONTENIDO", id_categoria: "8" },
  { id: "25", clave: "OP04", descripcion: "LICITACIONES DE OBRA EN TRAMITE", id_categoria: "8" },

  // 10) RECURSOS MATERIALES
  { id: "26", clave: "PPA01", descripcion: "PROGRAMA ANUAL DE ADQUISICIONES", id_categoria: "6" },

  // 11) PLANEACION
  { id: "27", clave: "PP01", descripcion: "PROGRAMA OPERATIVO ANUAL", id_categoria: "2" },
  { id: "28", clave: "PP02", descripcion: "OTROS PROGRAMAS", id_categoria: "2" }, // <-- corregido (antes venía PP01 duplicado)

  // 12) RECURSOS PRESUPUESTALES Y FINANCIEROS
  { id: "29", clave: "RF01", descripcion: "PRESUPUESTO AUTORIZADO Y EJERCIDO", id_categoria: "7" },
  { id: "30", clave: "RF02", descripcion: "PRESUPUESTO DE OTROS INGRESOS Y EGRESOS PROPIOS", id_categoria: "7" },
  { id: "31", clave: "RF03", descripcion: "RECURSOS FEDERALES RECIBIDOS", id_categoria: "7" },
  { id: "32", clave: "RF04", descripcion: "PRESUPUESTO PARA PROGRAMAS ESPECIALES", id_categoria: "7" },
  { id: "33", clave: "RF05", descripcion: "RELACION DE CUENTAS BANCARIAS", id_categoria: "7" },
  { id: "34", clave: "RF06", descripcion: "CONFORMACION DEL FONDO REVOLVENTE", id_categoria: "7" },
  { id: "35", clave: "RF07", descripcion: "RELACION DE CONTRARECIBOS PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS", id_categoria: "7" },
  { id: "36", clave: "RF08", descripcion: "RELACION DE CHEQUES PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS", id_categoria: "7" },
  { id: "37", clave: "RF09", descripcion: "INGRESOS POR DEPOSITAR", id_categoria: "7" },
  { id: "38", clave: "RF10", descripcion: "SOLICITUDES DE CANCELACIONES DE FIRMAS", id_categoria: "7" },
  { id: "39", clave: "RF11", descripcion: "RELACION DE CUENTAS POR COBRAR", id_categoria: "7" },
  { id: "40", clave: "RF12", descripcion: "RELACION DE CUENTAS POR PAGAR (PASIVOS)", id_categoria: "7" },
  { id: "41", clave: "RF13", descripcion: "RELACIONES DE IMPUESTOS Y CONTRIBUCIONES PENDIENTES DE PAGO", id_categoria: "7" },
  { id: "42", clave: "RF14", descripcion: "POLIZAS DE SEGUROS VIGENTES", id_categoria: "7" },
  { id: "43", clave: "RF15", descripcion: "FIANZAS Y GARANTIAS VIGENTES", id_categoria: "7" },
  { id: "44", clave: "RF16", descripcion: "RELACION DE CONVENIOS Y CONTRATOS DE BIENES Y SERVICIOS VIGENTES", id_categoria: "7" },
  { id: "45", clave: "RF17", descripcion: "RELACION DE LIBROS Y REGISTROS DE CONTABILIDAD", id_categoria: "7" },
  { id: "46", clave: "RF18", descripcion: "ESTADOS FINANCIEROS", id_categoria: "7" },

  // 13) RECURSOS HUMANOS
  { id: "47", clave: "RH01", descripcion: "PLANTILLA DE PERSONAL DE BASE", id_categoria: "5" },
  { id: "48", clave: "RH02", descripcion: "PLANTILLA DE PERSONAL DE APOYO", id_categoria: "5" },
  { id: "49", clave: "RH03", descripcion: "PLANTILLA DE PERSONAL COMISIONADO", id_categoria: "5" },
  { id: "50", clave: "RH04", descripcion: "PERSONAL HONORARIOS", id_categoria: "5" },

  // 10) RECURSOS MATERIALES (continúa)
  { id: "51", clave: "RM01", descripcion: "INVENTARIO DE MOBILIARIO Y EQUIPO DE OFICINA", id_categoria: "6" },
  { id: "52", clave: "RM02", descripcion: "INVENTARIO DE VEHICULOS", id_categoria: "6" },
  { id: "53", clave: "RM03", descripcion: "INVENTARIO DE MAQUINARIA Y EQUIPO", id_categoria: "6" },
  { id: "54", clave: "RM04", descripcion: "EXISTENCIA EN ALMACENES", id_categoria: "6" },
  { id: "55", clave: "RM05", descripcion: "INVENTARIO DE BIENES EN COMODATO", id_categoria: "6" },
  { id: "56", clave: "RM06", descripcion: "INVENTARIO DE BIENES INMUEBLES EN POSESION DE LA DEPENDENCIA Y/O ENTIDAD", id_categoria: "6" },
  { id: "57", clave: "RM07", descripcion: "RESERVA TERRITORIAL", id_categoria: "6" },
  { id: "58", clave: "RM08", descripcion: "INVENTARIO DE OBRAS DE ARTE Y ARTICULOS DE DECORACION", id_categoria: "6" },
  { id: "59", clave: "RM09", descripcion: "EXISTENCIA DE PLANTAS DE VIVERO", id_categoria: "6" },
  { id: "60", clave: "RM10", descripcion: "INVENTARIO FAUNISTICO POR ESPECIMEN", id_categoria: "6" },
  { id: "61", clave: "RM11", descripcion: "INVENTARIO DE ANIMALES TAXIDERMIZADOS", id_categoria: "6" },
  { id: "62", clave: "RM12", descripcion: "INVENTARIO DE EQUIPO DE ARMAMENTO, ACCESORIOS DE SEGURIDAD Y MUNICIONES", id_categoria: "6" },
  { id: "63", clave: "RM13", descripcion: "INVENTARIO DE PAQUETES COMPUTACIONALES ADQUIRIDOS", id_categoria: "6" },
  { id: "64", clave: "RM14", descripcion: "INVENTARIO DE SISTEMAS Y PROGRAMAS DESARROLLADOS Y/O EN DESARRROLLO", id_categoria: "6" },
  { id: "65", clave: "RM15", descripcion: "INVENTARIO DE EQUIPOS DE COMUNICACIONES Y TELECOMUNICACIONES", id_categoria: "6" },
  { id: "66", clave: "RM16", descripcion: "RELACION DE LLAVES DE LA DEPENDENCIA", id_categoria: "6" },

  // 14) TRANSPARENCIA Y ACCESO A LA INFORMACION
  { id: "67", clave: "TAI01", descripcion: "TRANSPARENCIA Y ACCESO A LA INFORMACION", id_categoria: "12" },

  // 15) SISTEMA DE GESTION DE CALIDAD
  { id: "68", clave: "SGC01", descripcion: "SISTEMA DE GESTION DE CALIDAD", id_categoria: "16" },
] as const;
export function obtenerCategoriaPorClave(clave?: string | null): string {
  const normalizedKey = clave?.trim().toUpperCase();
  if (!normalizedKey) return "";

  // RRH is a legacy key prefix; the current catalog stores these entries as RH.
  const catalogKey = normalizedKey.replace(/^RRH(?=\d)/, "RH");
  const catalogEntry = claves_anexos.find(
    (item) => item.clave.trim().toUpperCase() === catalogKey
  );
  const category = categoria_anexos.find(
    (item) => item.id === catalogEntry?.id_categoria
  );

  return category?.nombre_categoria ?? "";
}
