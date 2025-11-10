// lib/estructuras.ts por ahora en el mismo archivo
export const EstructuraDatosPorClave: Record<string, string[]> = {
  // Marco Jurídico
  MJ01: ["Ordenamiento", "Titulo", "Fecha de emision"],
  AR01: ["Asunto", "Descripcion", "Fecha inicio", "Responsable", "Estatus"],

  // Recursos Presupuestales
  RF01: ["Partida", "Descripcion", "Monto autorizado", "Monto ejercido", "Saldo"],
  RF02: ["Ingreso", "Monto", "Fuente"],
  RF03: ["Recurso", "Monto", "Entidad", "Fecha asignacion"],
  RF04: ["Programa", "Monto", "Objetivo"],
  RF05: ["Actividad", "Monto", "Responsable", "Fecha inicio", "Fecha fin"],
  RF06: ["Recurso", "Monto", "Entidad", "Fecha asignacion"],
  RF07: ["Programa", "Monto", "Objetivo", "Fecha inicio", "Fecha fin"],
  RF08: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF09: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF10: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF11: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF12: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF13: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF14: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF15: ["recurso", "monto", "entidad", "fecha_asignacion"],
  RF16: ["programa", "monto", "objetivo", "fecha_inicio", "fecha_fin"],
  RF17: ["actividad", "monto", "responsable", "fecha_inicio", "fecha_fin"],
  RF18: ["recurso", "monto", "entidad", "fecha_asignacion"],

  // Contratos y Convenios
  CCL01: ["contrato", "tipo", "monto", "proveedor", "fecha_inicio", "fecha_fin"],
  CCL02: ["licitacion", "estado", "monto", "fecha_apertura"],

  // Estructura Interna
  ENI01: ["url", "blob"], // organigrama pdf libre
  ENI02: ["Tipo",
    "Nombre",
    "Fecha de publicación",
    "Versión",
    "Observaciones"
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
  RRH01: ["Numero De Empleado", 
    "Nombre", 
    "RFC", 
    "Plaza (categoria)", 
    "Tipo de encargo", 
    "Fecha de ingreso", 
    "Sueldo", 
    "Otras percepciones", 
    "Total",
    "Unidad de Adscripcion",
    "Área laboral",
    "Estatus: Base, Apoyo, Comisionado",
  ], // plantilla de personal
  RRH02: ["nombre",
    "RFC",
    "Fecha de inicio de contrato",
    "Fecha de fin de contrato",
    "Fuente de recurso",
    "Actividades a desarrollar",
    "Salario",
    "Otras Percepciones",
    "Total",
    "Unidad de Adscripcion",
    "Area laboral"
  ], // personal de honorarios

  // Inventario de Bienes
  IBM01: [
    "Articulo",
    "Marca",
    "Modelo",
    "Numero de serie",
    "Numero de patrimonio",
    "Cantidad",
    "Valor",
    "Ubicacion",
    "Responsable",

  ], // MObiliario de oficina, vehiculos, maquinaria y equipo
  IBM02: ["Clave patrimonial", 
    "Descripcion", 
    "Marca", 
    "Modelo", 
    "No. de serie", 
    "Cantidad", 
    "Valor", 
    "Ubicacion", 
    "Responsable"], // Almacenes de papeleria y plantas de vivero
  IBM03: ["Tipo de bien", 
    "Descripcion", 
    "Marca", 
    "Modelo",
    "No. de serie",
    "Estado físico",
    "Ubicacion",
    "Responsable",
    "Nombre de otorgante",
    "Fecha de firma de comodato"
  ], // Inventario de bienes en comodato
  IBM04: [ 
    "Descripcion", 
    "Tipo de predio", 
    "Calle y número", 
    "Localidad", 
    "Observaciones", 
  ], // Bienes inmuebes de la dependencia
  IBM05:[
    "No. de registro o inventario",
    "Titulo de la obra",
    "Descripcion",
    "Ubicacion",
    "Certificado de autenticidad",
    "Estado fisico",
    "Observaciones"
  ], // Inventario de arte
  IBM06:[
    "Nombre comun",
    "nombre cientifico",
    "Clave",
    "Origen",
    "Sexo",
    "Marcaje",
    "Fecha de Alta",
    "Observaciones"
  ], //Inventario Faunistico (especimen y taxidemnizados)
  // Inventario de Armamento, accesorios de seguridad y municiones
  IBM07:[
    "Tipo de armamento",
    "Descripción",
    "Marca",
    "Modelo",
    "Número de serie",
    "Cantidad",
    "Ubicación",
    "Responsable",
    "Observaciones"
  ],
  // Inventario de Software (sistemas desarrolados y paquetes computacionales)
  IBM08:[
    "Nombre del software",
    "Versión",
    "Proveedor",
    "No. de serie",
    "Manual",
    "Licencia",
    "Equipo en el que opera",
    "Documentación"
  ],
  // Inventario de tecnologia (equipos de computo y telecomunicaciones)
  IBM09: [
    "Nombre del equipo",
    "Marca",
    "Modelo",
    "Número de serie",
    "Cantidad",
    "Ubicación",
    "Responsable",
    "Observaciones"
  ],

  // Documentación y Archivo
  DA01: ["sistema", "frecuencia", "ultimo_respaldo", "responsable"],
  DA02: ["titulo", "autor", "tipo", "ubicacion"],
  DA07: ["expediente", "proyecto", "ubicacion", "responsable"],

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
  PP01: ["url", "blob"],
  PP02: ["Tipo de Documento", "Nombre", "Fecha", "Observaciones"],

  // Transparencia
  TA01: ["solicitud", "solicitante", "fecha", "estatus", "respuesta"],

  // Por defecto
  default: ["campo1", "campo2", "campo3"],

  // Sistenma de Gestión de Calidad
  SGC01: ["Proceso", "Responsable", "Objetivo", "Indicadores", "Recursos", "Riesgos", "Controles"],
  
};