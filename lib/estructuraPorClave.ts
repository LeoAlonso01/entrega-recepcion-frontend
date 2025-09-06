// lib/estructuras.ts por ahora en el mismo archivo
export const EstructuraDatosPorClave: Record<string, string[]> = {
  // Marco Jurídico
  MJ01: ["ORDENAMIENTO", "TITULO", "FECHA DE EMISION"], // CHECKED
  AR01: ["ASUNTO", "DESCRIPCION", "FECHA INICIO", "RESPONSABLE", "ESTATUS"],

  // Recursos Presupuestales
  RF01: ["PARTIDA", "DENOMINACION","PRESUPUESTO", "AUTORIZADO","AMPLIACIONES Y/O REDUCCIONES", "MODIFICADO", "EJERCIDO", "POR EJERCER"],
  RF02: ["ORIGEN DEL RECURSO", "PARTIDA", "DESCRIPCION", "PRESUPUESTO", "AUTORIZADO", "AMPLIACIONES Y/O REDUCCIONES", "MODIFICADO", "EJERCIDO", "POR EJERCER"],
  RF03: ["RAMO", "PROGRAMA", "DEPENDENCIA EJECUTORA", "NÚMERO DEL CONVENIO O REFERENCIA DE LA AUTORIZACIÓN", "IMPORTE", "APROBADO", "MODIFICADO", "EJERCIDO", "POR EJERCER", "NUMERO DE ACCIONES", "APROBADAS","EJECUTADAS", "PENDENTES","OBSERVACIONES"],
  RF04: ["NOMBRE DEL PROGRAMA", "NUMERO DEL CAPITULO", "NOMBRE DEL CAPITULO", "PRESUPUESTO", "AUTORIZADO", "AMPLIACIONES Y/O REDUCCIONES", "MODIFICADO", "EJERCIDO", "POR EJERCER"],
  RF05: ["INSTITUCION BANCARIA", "CLAVE DE SUCURSAL", "TIPO DE CUENTA", "NUMERO DE CUENTA", "FIRMAS REGISTRADAS", "NOMBRE", "CARGO", "FOLIO DEL ULTIMO CHEQUE EXPEDIDO","SALDO SEGUN BANCO","CARGOS NO CORRESPONDIDOS", "ABONOS NO CORRESPONDIDOS", "SALDO SEGUN REGISTROS", "RESPONSABLE DEL MANEJO"],
  RF06: ["OFICIO DE AUTORIZACION NUM.", "DE FECHA", "NOMBRE DEL RESPONSABLE", "CARGO DEL RESPONSABLE", "IMPORTE AL VERIFICAR","DESTINO DEL FONDO ASIGNADO", "RESULTADO DEL ULTIMO ARQUEO PRACTICADO","SALDO EN CUENTA DE CHEQUES", "NO. DE CUENTA", "BANCO", "BANCO", "FECHA", "SALDO", "MONTO DISPONIBLE EN EFECTIVO", "COMPROBANTES", "ACREEDORES DIVERSOS", "DEUDORES DIVERSOS", "DOCUMENTOS POR RECUPERAR"],
  RF07: ["NUMERO DE FOLIO DEL CONTRARECIBO", "NOMBRE DEL BENEFICIARIO", "FECHA DE RECEPCION", "NUMERO DE ESTIMACION O FACTURA", "IMPORTE TOTAL", "OBSERVACIONES"],
  RF08: ["FECHA", "NUMERO DE CHEQUE", "CUENTA", "BANCO", "MONTO", "BENEFICIARIO", "CONCEPTO"],
  RF09: ["ÁREA GENERADORA DEL INGRESO", "CONCEPTO QUE DA ORIGEN AL INGRESO", "FECHA DEL INGRESO", "DOCUMENTO QUE IDENTIFICA AL INGRESO", "IMPORTE DEL INGRESO: MONTO", "IMPORTE DEL INGRESO: CUENTA BANCARIA DONDE SE DEPOSITARA", ""],
  RF10: ["PROGRAMA", "MONTO", "OBJETIVO", "FECHA INICIO", "FECHA FIN"],
  RF11: ["ACTIVIDAD", "MONTO", "RESPONSABLE", "FECHA INICIO", "FECHA FIN"],
  RF12: ["RECURSO", "MONTO", "ENTIDAD", "FECHA ASIGNACION"],
  RF13: ["PROGRAMA", "MONTO", "OBJETIVO", "FECHA INICIO", "FECHA FIN"],
  RF14: ["ACTIVIDAD", "MONTO", "RESPONSABLE", "FECHA INICIO", "FECHA FIN"],
  RF15: ["RECURSO", "MONTO", "ENTIDAD", "FECHA ASIGNACION"],
  RF16: ["PROGRAMA", "MONTO", "OBJETIVO", "FECHA INICIO", "FECHA FIN"],
  RF17: ["ACTIVIDAD", "MONTO", "RESPONSABLE", "FECHA INICIO", "FECHA FIN"],
  RF18: ["RECURSO", "MONTO", "ENTIDAD", "FECHA ASIGNACION"],

  // Contratos y Convenios
  CCL01: ["TIPO DE INSTRUMENTO", "OBJETIVO", "PARTES INVOLUCRADAS", "VIGENCIA", "IMPORTE CONVENIDO", "OBSERVACIONES"],
  CCL02: ["NOMBRE", "DESCRIPCION", "ORIGEN", "RECUPERACION PRESUPUESTAL", "VIGENCIA", "ACCIONES RELEVANTES POR CONCLUIR"],
  CCL03: ["DATOS DEL CONTRATO"  , "monto", "objetivo", "fecha_inicio", "fecha_fin"],

  // Estructura Interna
  ENI01: ["url", "blob"], // organigrama pdf libre
  ENI02: ["TIPO", 
    "NOMBRE",
    "FECHA DE PUBLICACION",
    "VERSION",
    "OBSERVACIONES"
  ], // reglamento interno y manuales generales
  ENI03: ["Número de sesión",
    "Fecha de la sesión",
    "Ordinaria o Extraordinaria",
    "Datos del acuerdo: Numero",
    "Datos del acuerdo: Descripcion breve",
    "Datos del acuerdo: Responsable",
    "Datos del acuerdo: Áreas Involucradas",
    "Estatus del acuerdo: Porcentaje del avance",
    "Estatus del acuerdo: Observaciones"
  ], // Acuerdo de organos de gobierno y Actas de consejo
  ENI04: ["cargo",
    "Con derecho a",
    "Fecha inicio del cargo",
    "Periodicidad de reuniones",
    "Observaciones"
  ], // representaciones y cargos honoríficos
  ENI05: ["Nombre y puesto del servidor que otorga el poder",
    "Tipo de poder otorgado",
    "Fecha de otorgamiento",
    "Notario No.",
    "Inscrito al registro público de la propiedad y el comercio",
    "Observaciones"], // poderes otorgados

  // Recursos Humanos
  RRH01: ["Numero de empleado",
    "NOMBRE",
    "RFC",
    "PLAZA (CATEGORIA)",
    "TIPO DE ENCARGO",
    "FECHA DE INGRESO",
    "SUELDO",
    "OTRAS PERCEPCIONES",
    "TOTAL",
    "UNIDAD DE ADSCRIPCION",
    "AREA LABORAL",
    "OBSERVACIONES",
    "ESTATUS: Base, Apoyo, Comisionado",
  ], // plantilla de personal
  RRH02: ["NOMBRE",
    "RFC",
    "FECHA DE INICIO DE CONTRATO",
    "FECHA DE FIN DE CONTRATO",
    "FUENTE DE RECURSO",
    "ACTIVIDADES A DESARROLLAR",
    "SALARIO",
    "OTRAS PERCEPCIONES",
    "TOTAL",
    "UNIDAD DE ADSCRIPCION",
    "AREA LABORAL"
  ], // personal de honorarios

  // Inventario de Bienes
  IBM01: [
    "ARTICULO",
    "MARCA",
    "MODELO",
    "NUMERO DE SERIE",
    "NUMERO DE PATRIMONIO",
    "CANTIDAD",
    "VALOR",
    "UBICACION",
    "RESPONSABLE",

  ], // MObiliario de oficina, vehiculos, maquinaria y equipo
  IBM02: ["CLAVE PATRIMONIAL",
    "DESCRIPCION",
    "MARCA",
    "MODELO",
    "NO. DE SERIE",
    "CANTIDAD",
    "VALOR",
    "UBICACION",
    "RESPONSABLE"], // Almacenes de papeleria y plantas de vivero
  IBM03: ["TIPO DE BIEN",
    "DESCRIPCION",
    "MARCA",
    "MODELO",
    "NO. DE SERIE",
    "ESTADO FÍSICO",
    "UBICACION",
    "RESPONSABLE",
    "NOMBRE DE OTORGANTE",
    "FECHA DE FIRMA DE COMODATO"
  ], // Inventario de bienes en comodato
  IBM04: [
    "DESCRIPCION",
    "TIPO DE PREDIO",
    "CALLE Y NÚMERO",
    "LOCALIDAD",
    "OBSERVACIONES",
  ], // Bienes inmuebes de la dependencia
  IBM05: [
    "NUMERO DE REGISTRO O INVENTARIO",
    "TITULO DE LA OBRA",
    "DESCRIPCION",
    "UBICACION",
    "CERTIFICADO DE AUTENTICIDAD",
    "ESTADO FISICO",
    "OBSERVACIONES"
  ], // Inventario de arte
  IBM06: [
    "NOMBRE COMUN",
    "NOMBRE CIENTIFICO",
    "CLAVE",
    "ORIGEN",
    "SEXO",
    "MARCADO",
    "FECHA DE ALTA",
    "OBSERVACIONES"
  ], //Inventario Faunistico (especimen y taxidemnizados)
  // Inventario de Armamento, accesorios de seguridad y municiones
  IBM07: [
    "TIPO DE ARMAMENTO",
    "DESCRIPCION",
    "MARCA",
    "MODELO",
    "NUMERO DE SERIE",
    "CANTIDAD",
    "UBICACION",
    "RESPONSABLE",
    "OBSERVACIONES"
  ],
  // Inventario de Software (sistemas desarrolados y paquetes computacionales)
  IBM08: [
    "NOMBRE DEL SOFTWARE",
    "VERSION",
    "PROVEEDOR",
    "NUMERO DE SERIE",
    "MANUAL",
    "LICENCIA",
    "EQUIPO EN EL QUE OPERA",
    "DOCUMENTACION"
  ],
  // Inventario de tecnologia (equipos de computo y telecomunicaciones)
  IBM09: [
    "NOMBRE DEL EQUIPO",
    "MARCA",
    "MODELO",
    "NUMERO DE SERIE",
    "CANTIDAD",
    "UBICACION",
    "RESPONSABLE",
    "OBSERVACIONES"
  ],

  // Documentación y Archivo
  DA01: ["SISTEMA", "FRECUENCIA", "ULTIMO_RESPALDO", "RESPONSABLE"],
  DA02: ["TITULO", "AUTOR", "TIPO", "UBICACION"],
  DA03: ["TIPO", "DESCRIPCION", "FECHA_INICIO", "FECHA_FIN", "RESPONSABLE"],
  DA04: ["TIPO", "DESCRIPCION", "FECHA_INICIO", "FECHA_FIN", "RESPONSABLE"],
  DA05: ["TIPO", "DESCRIPCION", "FECHA_INICIO", "FECHA_FIN", "RESPONSABLE"],
  DA07: ["EXPEDIENTE", "PROYECTO", "UBICACION", "RESPONSABLE"],

  // Asuntos Legales
  ALA01: ["asunto", "tipo", "estado", "abogado", "fecha_inicio"],
  ALA02: ["Tipo de auditoria",
    "Periodo de la Auditoria",
    "Datos de la Auditoria: Realizada por",
    "Datos de la Auditoria: Observaciones", // Observaciones de Auditorias pendientes
    "Datos de la Auditoria: Observaciones atendidas",
    "Datos de la Auditoria: Observaciones pendientes",
    "Estatus de la Auditoria: Situación actual"
  ],

  // Programas y Proyectos FORMATO LIBRE PDF 
  PP01: ["url", "blob"],// PDF libre
  PP02: ["TIPO DE DOCUMENTO", "NOMBRE", "FECHA", "OBSERVACIONES"],// checked

  // Transparencia
  TA01: ["SOLICITUD", "SOLICITANTE", "FECHA", "ESTATUS", "RESPUESTA"],

  // Por defecto
  default: ["*"]
};

export const CALVES_CON_PDF: Record<string, string[]> = {
  PP01: ["url", "blob"],
  ENI01: ["url", "blob"]
}