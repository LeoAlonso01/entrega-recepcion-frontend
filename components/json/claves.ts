export enum CategoriaEnum {
  RECURSOS_PRESUPUESTALES = "1",
  CONTRATOS_CONVENIOS = "2",
  ESTRUCTURA_NORMATIVA = "3",
  RECURSOS_HUMANOS = "4",
  INVENTARIO_BIENES = "5",
  SEGURIDAD_CONTROL = "6",
  DOCUMENTACION_ARCHIVO = "7",
  ASUNTOS_LEGALES = "8",
  PROGRAMAS_PROYECTOS = "9",
  TRANSPARENCIA = "10",
  MARCO_JURIDICO = "11",
  SIN_CATEGORIA = "12",
  ASUNTOS_RELEVANTES = "13"
}

// Opcional: Objeto con las etiquetas para mostrar
export const CategoriaLabels = {
  [CategoriaEnum.RECURSOS_PRESUPUESTALES]: "Recursos Presupuestales y Financieros",
  [CategoriaEnum.CONTRATOS_CONVENIOS]: "Contratos, Convenios y Licitaciones",
  [CategoriaEnum.ESTRUCTURA_NORMATIVA]: "Estructura y Normativa Interna",
  [CategoriaEnum.RECURSOS_HUMANOS]: "Recursos Humanos",
  [CategoriaEnum.INVENTARIO_BIENES]: "Inventario de Bienes Muebles e Inmuebles",
  [CategoriaEnum.SEGURIDAD_CONTROL]: "Seguridad y Control de Accesos",
  [CategoriaEnum.DOCUMENTACION_ARCHIVO]: "Documentación y Archivo",
  [CategoriaEnum.ASUNTOS_LEGALES]: "Asuntos Legales y de Auditoría",
  [CategoriaEnum.PROGRAMAS_PROYECTOS]: "Programas y Proyectos:",
  [CategoriaEnum.TRANSPARENCIA]: "Transparencia",
  [CategoriaEnum.MARCO_JURIDICO]: "Marco Jurídico",
  [CategoriaEnum.SIN_CATEGORIA]: "Sin Categoría",
  [CategoriaEnum.ASUNTOS_RELEVANTES]: "Asuntos Relevantes"
};

export enum SubcategoriaEnum {
  // Categoría 1: Recursos Presupuestales y Financieros
  PRESUPUESTO_AUTORIZADO = "1",
  PRESUPUESTO_OTROS_INGRESOS = "2",
  RECURSOS_FEDERALES = "3",
  PRESUPUESTO_PROGRAMAS_ESPECIALES = "4",
  CUENTAS_BANCARIAS = "5",
  FONDO_REVOLVENTE = "6",
  CONTRARECIBOS_PENDIENTES = "7",
  CHEQUES_PENDIENTES = "8",
  INGRESOS_POR_DEPOSITAR = "9",
  CANCELACIONES_FIRMAS = "10",
  CUENTAS_POR_COBRAR = "11",
  CUENTAS_POR_PAGAR = "12",
  IMPUESTOS_PENDIENTES = "13",
  POLIZAS_SEGUROS = "14",
  FIANZAS_GARANTIAS = "15",
  CONVENIOS_CONTRATOS_VIGENTES = "16",
  LIBROS_REGISTROS_CONTABILIDAD = "17",
  ESTADOS_FINANCIEROS = "18",

  // Categoría 2: Contratos, Convenios y Licitaciones
  CONTRATOS_CONVENIOS_VIGENTES = "19",
  LICITACIONES_TRAMITE = "20",
  PROGRAMAS_OBRA_ADQUISICIONES = "21",

  // Categoría 3: Estructura y Normativa Interna
  ORGANIGRAMA_GENERAL = "22",
  REGLAMENTOS_MANUALES = "23",
  ACTAS_ORGANOS_GOBIERNO = "24",
  REPRESENTACIONES_CARGOS = "25",
  PODERES_OTORGADOS = "26",

  // Categoría 4: Recursos Humanos
  PLANTILLAS_PERSONAL = "27",
  PERSONAL_HONORARIOS = "28",

  // Categoría 5: Inventario de Bienes Muebles e Inmuebles
  INVENTARIO_MOBILIARIO_EQUIPO = "29",
  EXISTENCIAS = "30",
  BIENES_COMODATO = "31",
  BIENES_INMUEBLES = "32",
  RESERVA_TERRITORIAL = "33",
  BIENES_CULTURALES = "34",
  INVENTARIO_FAUNISTICO = "35",
  INVENTARIO_SEGURIDAD = "36",
  INVENTARIO_TECNOLOGIA = "37",

  // Categoría 6: Seguridad y Control de Accesos
  CLAVES_FIRMAS_ACCESO = "38",
  LLAVES_DEPENDENCIA = "39",

  // Categoría 7: Documentación y Archivo
  RESPALDOS_INFORMACION = "40",
  ACERVO_BIBLIOGRAFICO = "41",
  CORTE_FORMAS_FOLIADAS = "42",
  SELLOS_OFICIALES = "43",
  ARCHIVOS = "44",
  LIBROS_REGISTROS = "45",
  EXPEDIENTES_UNITARIOS_OBRA = "46",

  // Categoría 8: Asuntos Legales y de Auditoría
  ASUNTOS_JURIDICOS = "47",
  OBSERVACIONES_AUDITORIA = "48",
  POLIZAS_SEGUROS_VIGENTES = "49",
  FIANZAS_VIGENTES = "50",
  GARANTIAS_VIGENTES = "51",

  // Categoría 9: Programas y Proyectos
  PROGRAMA_OPERATIVO_ANUAL = "52",
  OTROS_PROGRAMAS = "53",

  // Categoría 10: Transparencia
  TRANSPARENCIA_ACCESO = "54",

  // Categoría 11: Marco Jurídico
  ADMINISTRATIVO_ACTUACION = "55",
  ASUNTOS_RELEVANTES_TRAMITE = "56"
}

// Objeto con toda la información de las subcategorías
export const SubcategoriaClaves = {
  [SubcategoriaEnum.PRESUPUESTO_AUTORIZADO]: {
    clave: "RF01",
    descripcion: "PRESUPUESTO AUTORIZADO Y EJERCIDO",
    id_categoria: "1"
  },
  [SubcategoriaEnum.PRESUPUESTO_OTROS_INGRESOS]: {
    clave: "RF02",
    descripcion: "PRESUPUESTO DE OTROS INGRESOS Y EGRESOS PROPIOS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.RECURSOS_FEDERALES]: {
    clave: "RF03",
    descripcion: "RECURSOS FEDERALES RECIBIDOS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.PRESUPUESTO_PROGRAMAS_ESPECIALES]: {
    clave: "RF04",
    descripcion: "PRESUPUESTO PARA PROGRAMAS ESPECIALES",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CUENTAS_BANCARIAS]: {
    clave: "RF05",
    descripcion: "RELACION DE CUENTAS BANCARIAS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.FONDO_REVOLVENTE]: {
    clave: "RF06",
    descripcion: "CONFORMACION DEL FONDO REVOLVENTE",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CONTRARECIBOS_PENDIENTES]: {
    clave: "RF07",
    descripcion: "RELACION DE CONTRARECIBOS PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CHEQUES_PENDIENTES]: {
    clave: "RF08",
    descripcion: "RELACION DE CHEQUES PENDIENTES DE ENTREGAR A SUS BENEFICIARIOS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.INGRESOS_POR_DEPOSITAR]: {
    clave: "RF09",
    descripcion: "INGRESOS POR DEPOSITAR",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CANCELACIONES_FIRMAS]: {
    clave: "RF10",
    descripcion: "SOLICITUDES DE CANCELACIONES DE FIRMAS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CUENTAS_POR_COBRAR]: {
    clave: "RF11",
    descripcion: "RELACION DE CUENTAS POR COBRAR",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CUENTAS_POR_PAGAR]: {
    clave: "RF12",
    descripcion: "RELACION DE CUENTAS POR PAGAR (PASIVOS)",
    id_categoria: "1"
  },
  [SubcategoriaEnum.IMPUESTOS_PENDIENTES]: {
    clave: "RF13",
    descripcion: "RELACIONES DE IMPUESTOS Y CONTRIBUCIONES PENDIENTES DE PAGO",
    id_categoria: "1"
  },
  [SubcategoriaEnum.POLIZAS_SEGUROS]: {
    clave: "RF14",
    descripcion: "POLIZAS DE SEGUROS VIGENTES",
    id_categoria: "1"
  },
  [SubcategoriaEnum.FIANZAS_GARANTIAS]: {
    clave: "RF15",
    descripcion: "FIANZAS Y GARANTIAS VIGENTES",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CONVENIOS_CONTRATOS_VIGENTES]: {
    clave: "RF16",
    descripcion: "RELACION DE CONVENIOS Y CONTRATOS DE BIENES Y SERVICIOS VIGENTES",
    id_categoria: "1"
  },
  [SubcategoriaEnum.LIBROS_REGISTROS_CONTABILIDAD]: {
    clave: "RF17",
    descripcion: "RELACION DE LIBROS AND REGISTROS DE CONTABILIDAD",
    id_categoria: "1"
  },
  [SubcategoriaEnum.ESTADOS_FINANCIEROS]: {
    clave: "RF18",
    descripcion: "ESTADOS FINANCIEROS",
    id_categoria: "1"
  },
  [SubcategoriaEnum.CONTRATOS_CONVENIOS_VIGENTES]: {
    clave: "CCL01",
    descripcion: "CONTRATOS Y CONVENIOS VIGENTES (Generales, Coordinación, Fideicomisos, Bienes y Servicios)",
    id_categoria: "2"
  },
  [SubcategoriaEnum.LICITACIONES_TRAMITE]: {
    clave: "CCL02",
    descripcion: "LICITACIONES EN TRÁMITE (Bienes y Servicios, Obra)",
    id_categoria: "2"
  },
  [SubcategoriaEnum.PROGRAMAS_OBRA_ADQUISICIONES]: {
    clave: "CCL03",
    descripcion: "PROGRAMAS DE OBRA Y ADQUISICIONES (Programa Anual de Obra Pública, Listado de Expedientes de Obra, Programa Anual de Adquisiciones)",
    id_categoria: "2"
  },
  [SubcategoriaEnum.ORGANIGRAMA_GENERAL]: {
    clave: "ENI01",
    descripcion: "ORGANIGRAMA GENERAL",
    id_categoria: "3"
  },
  [SubcategoriaEnum.REGLAMENTOS_MANUALES]: {
    clave: "ENI02",
    descripcion: "REGLAMENTOS Y MANUALES (Reglamento Interior y Manuales Generales)",
    id_categoria: "3"
  },
  [SubcategoriaEnum.ACTAS_ORGANOS_GOBIERNO]: {
    clave: "ENI03",
    descripcion: "ACTAS DE ÓRGANOS DE GOBIERNO (Actas de Consejo, Acuerdo de Órganos de Gobierno)",
    id_categoria: "3"
  },
  [SubcategoriaEnum.REPRESENTACIONES_CARGOS]: {
    clave: "ENI04",
    descripcion: "REPRESENTACIONES Y CARGOS HONORÍFICOS VIGENTES",
    id_categoria: "3"
  },
  [SubcategoriaEnum.PODERES_OTORGADOS]: {
    clave: "ENI05",
    descripcion: "PODERES OTORGADOS",
    id_categoria: "3"
  },
  [SubcategoriaEnum.PLANTILLAS_PERSONAL]: {
    clave: "RRH01",
    descripcion: "PLANTILLAS DE PERSONAL (Base, Apoyo, Comisionado)",
    id_categoria: "4"
  },
  [SubcategoriaEnum.PERSONAL_HONORARIOS]: {
    clave: "RRH02",
    descripcion: "PERSONAL HONORARIOS",
    id_categoria: "4"
  },
  [SubcategoriaEnum.INVENTARIO_MOBILIARIO_EQUIPO]: {
    clave: "IBM01",
    descripcion: "INVENTARIO DE MOBILIARIO Y EQUIPO (Oficina, Vehículos, Maquinaria y Equipo)",
    id_categoria: "5"
  },
  [SubcategoriaEnum.EXISTENCIAS]: {
    clave: "IBM02",
    descripcion: "EXISTENCIAS (Almacenes, Plantas de Vivero)",
    id_categoria: "5"
  },
  [SubcategoriaEnum.BIENES_COMODATO]: {
    clave: "IBM03",
    descripcion: "BIENES EN COMODATO",
    id_categoria: "5"
  },
  [SubcategoriaEnum.BIENES_INMUEBLES]: {
    clave: "IBM04",
    descripcion: "BIENES INMUEBLES EN POSESIÓN",
    id_categoria: "5"
  },
  [SubcategoriaEnum.RESERVA_TERRITORIAL]: {
    clave: "IBM05",
    descripcion: "RESERVA TERRITORIAL",
    id_categoria: "5"
  },
  [SubcategoriaEnum.BIENES_CULTURALES]: {
    clave: "IBM06",
    descripcion: "BIENES CULTURALES Y DECORATIVOS (Obras de Arte y Artículos de Decoración)",
    id_categoria: "5"
  },
  [SubcategoriaEnum.INVENTARIO_FAUNISTICO]: {
    clave: "IBM07",
    descripcion: "INVENTARIO FAUNÍSTICO (Especímenes, Animales Taxidermizados)",
    id_categoria: "5"
  },
  [SubcategoriaEnum.INVENTARIO_SEGURIDAD]: {
    clave: "IBM08",
    descripcion: "INVENTARIO DE SEGURIDAD (Equipo de Armamento, Accesorios, Municiones)",
    id_categoria: "5"
  },
  [SubcategoriaEnum.INVENTARIO_TECNOLOGIA]: {
    clave: "IBM09",
    descripcion: "INVENTARIO DE TECNOLOGÍA (Paquetes Computacionales, Sistemas y Programas, Equipos de Comunicación)",
    id_categoria: "5"
  },
  [SubcategoriaEnum.CLAVES_FIRMAS_ACCESO]: {
    clave: "SCA01",
    descripcion: "CLAVES AND FIRMAS DE ACCESO (Sistemas, Seguridad, Cancelación, Solicitudes de Cancelación)",
    id_categoria: "6"
  },
  [SubcategoriaEnum.LLAVES_DEPENDENCIA]: {
    clave: "SCA02",
    descripcion: "RELACIÓN DE LLAVES DE LA DEPENDENCIA",
    id_categoria: "6"
  },
  [SubcategoriaEnum.RESPALDOS_INFORMACION]: {
    clave: "DA01",
    descripcion: "RESPALDOS DE INFORMACIÓN",
    id_categoria: "7"
  },
  [SubcategoriaEnum.ACERVO_BIBLIOGRAFICO]: {
    clave: "DA02",
    descripcion: "INVENTARIO DE ACERVO BIBLIOGRÁFICO Y HEMEROGRÁFICO",
    id_categoria: "7"
  },
  [SubcategoriaEnum.CORTE_FORMAS_FOLIADAS]: {
    clave: "DA03",
    descripcion: "CORTE FORMAS YU FOLIADAS",
    id_categoria: "7"
  },
  [SubcategoriaEnum.SELLOS_OFICIALES]: {
    clave: "DA04",
    descripcion: "SELLOS OFICIALES",
    id_categoria: "7"
  },
  [SubcategoriaEnum.ARCHIVOS]: {
    clave: "DA05",
    descripcion: "ARCHIVOS (Trámite y Concentración)",
    id_categoria: "7"
  },
  [SubcategoriaEnum.LIBROS_REGISTROS]: {
    clave: "DA06",
    descripcion: "LIBROS Y REGISTROS DE CONTABILIDAD",
    id_categoria: "7"
  },
  [SubcategoriaEnum.EXPEDIENTES_UNITARIOS_OBRA]: {
    clave: "DA07",
    descripcion: "LISTADO GENERAL DE EXPEDIENTES UNITARIOS DE OBRA",
    id_categoria: "7"
  },
  [SubcategoriaEnum.ASUNTOS_JURIDICOS]: {
    clave: "ALA01",
    descripcion: "ASUNTOS EN TRAMITE DE NATURALEZA JURÍDICA",
    id_categoria: "8"
  },
  [SubcategoriaEnum.OBSERVACIONES_AUDITORIA]: {
    clave: "ALA02",
    descripcion: "OBSERVACIONES DE AUDITORÍA PENDIENTES",
    id_categoria: "8"
  },
  [SubcategoriaEnum.POLIZAS_SEGUROS_VIGENTES]: {
    clave: "ALA03",
    descripcion: "PÓLIZAS Y SEGUROS VIGENTES",
    id_categoria: "8"
  },
  [SubcategoriaEnum.FIANZAS_VIGENTES]: {
    clave: "ALA04",
    descripcion: "FIANZAS VIGENTES",
    id_categoria: "8"
  },
  [SubcategoriaEnum.GARANTIAS_VIGENTES]: {
    clave: "ALA05",
    descripcion: "GARANTÍAS VIGENTES",
    id_categoria: "8"
  },
  [SubcategoriaEnum.PROGRAMA_OPERATIVO_ANUAL]: {
    clave: "PP01",
    descripcion: "PROGRAMA OPERATIVO ANUAL",
    id_categoria: "9"
  },
  [SubcategoriaEnum.OTROS_PROGRAMAS]: {
    clave: "PP02",
    descripcion: "OTROS PROGRAMAS",
    id_categoria: "9"
  },
  [SubcategoriaEnum.TRANSPARENCIA_ACCESO]: {
    clave: "TA01",
    descripcion: "TRANSPARENCIA Y ACCESO A LA INFORMACIÓN",
    id_categoria: "10"
  },
  [SubcategoriaEnum.ADMINISTRATIVO_ACTUACION]: {
    clave: "MJ01",
    descripcion: "ADMINISTRATIVO DE ACTUACIÓN",
    id_categoria: "11"
  },
  [SubcategoriaEnum.ASUNTOS_RELEVANTES_TRAMITE]: {
    clave: "AR01",
    descripcion: "ASUNTOS RELEVANTES EN TRÁMMITE Y ATENCIÓN",
    id_categoria: "11"
  }
};

// Función auxiliar para obtener subcategorías por categoría
export const getSubcategoriasByCategoria = (categoriaId: string) => {
  return Object.entries(SubcategoriaClaves)
    .filter(([_, clave]) => clave.id_categoria === categoriaId)
    .map(([key, clave]) => ({
      id: key,
      clave: clave.clave,
      descripcion: clave.descripcion
    }));
};