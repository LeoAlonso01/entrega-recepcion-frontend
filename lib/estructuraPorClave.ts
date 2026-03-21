// campos de la tabla editable
export const ESTRUCTURA_DATOS_POR_CLAVE: Record<string, Array<{ 
  campo: string; 
  tipo: string; 
  obligatorio?: boolean; 
  Descripcion?: string }>> = {
  // Marco Jurídico (MJ01)
  MJ01: [
    { campo: "Ordenamiento", tipo: "string", obligatorio: true, Descripcion: "Ordenamiento Jurídico Aplicable" },
    { campo: "Titulo", tipo: "string", obligatorio: true, Descripcion: "Título del Asunto Relevante" },
    { campo: "Fecha de emision", tipo: "string", obligatorio: true, Descripcion: "Fecha de emisión del documento que sustenta el asunto relevante" },
  ]
  ,
  // Planeacion (PP01)
  PP01: [
    { campo: "Tipo de Documento", tipo: "string", obligatorio: true, Descripcion: "Nombre del programa" },
    { campo: "Nombre ", tipo: "string", obligatorio: true, Descripcion: "Descripción del programa" },
    { campo: "Fecha", tipo: "string", obligatorio: true, Descripcion: "Fecha de emisión del programa" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el programa" },
  ],

  //Derechos y Obligaciones (DO01-DO04)
  DO01: [
    { campo: "Nombre y puesto del servidor que otorga el poder", tipo: "string", obligatorio: true, Descripcion: "Nombre y puesto del servidor que otorga el poder" },
    { campo: "Tipo de poder otorgado", tipo: "string", obligatorio: true, Descripcion: "Tipo de poder otorgado" },
    { campo: "Especificar", tipo: "string", obligatorio: true, Descripcion: "Fecha de otorgamiento del poder" },
    { campo: "Fecha de Expedición", tipo: "date", obligatorio: true, Descripcion: "Fecha de expedición del poder" },
    { campo: "Notario Público que autoriza el poder", tipo: "string", obligatorio: true, Descripcion: "Notario Público que autoriza el poder" },
    { campo: "Inscrito en el Registro Público de la Propiedad y del Comercio", tipo: "string", obligatorio: true, Descripcion: "Número de inscripción en el Registro Público de la Propiedad y del Comercio" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el poder otorgado" },
  ],

  DO02: [
    { campo: "Numero de sesion", tipo: "string", obligatorio: true, Descripcion: "Número de sesión" },
    { campo: "Fecha de sesion", tipo: "string", obligatorio: true, Descripcion: "Fecha de la sesión" },
    { campo: "Ordinaria o Extraordinaria", tipo: "string", obligatorio: true, Descripcion: "Tipo de sesión (Ordinaria o Extraordinaria)" },
    { campo: "Acuerdos tomados", tipo: "string", obligatorio: true, Descripcion: "Descripción de los acuerdos tomados en la sesión" },
    { campo: "Descripcion de los acuerdos", tipo: "string", obligatorio: true, Descripcion: "Descripción detallada de los acuerdos tomados en la sesión" },
    { campo: "Responsable de los acuerdos", tipo: "string", obligatorio: true, Descripcion: "Nombre del responsable de dar seguimiento a los acuerdos" },
    { campo: "Áreas involucradas", tipo: "string", obligatorio: true, Descripcion: "Áreas involucradas en el seguimiento de los acuerdos" },
    { campo: "Porcentaje de avance", tipo: "number", obligatorio: true, Descripcion: "Porcentaje de avance en el seguimiento de los acuerdos" },
    { campo: "Comentarios", tipo: "string", obligatorio: false, Descripcion: "Comentarios adicionales sobre el seguimiento de los acuerdos" },
  ],
  DO03: [
    { campo: "Auditoria realizada por", tipo: "string", obligatorio: true, Descripcion: "Nombre del ente auditor que realizó la auditoría" },
    { campo: "Periodo auditado: desde", tipo: "string", obligatorio: true, Descripcion: "Fecha de inicio del periodo auditado" },
    { campo: "Periodo auditado: hasta", tipo: "string", obligatorio: true, Descripcion: "Fecha de fin del periodo auditado" },
    { campo: "Tipo de auditoría", tipo: "string", obligatorio: true, Descripcion: "Tipo de auditoría realizada (financiera, de cumplimiento, etc.)" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre la auditoría realizada" },
    { campo: "Observaciones atendidas", tipo: "string", obligatorio: false, Descripcion: "Observaciones de auditoría que han sido atendidas" },
    { campo: "Observaciones pendientes", tipo: "string", obligatorio: false, Descripcion: "Observaciones de auditoría que aún están pendientes de atender" },
    { campo: "Situación actual", tipo: "string", obligatorio: false, Descripcion: "Situación actual de las observaciones de auditoría (atendidas, pendientes, etc.)" },
  ],
  DO04: [
    { campo: "Cargo", tipo: "string", obligatorio: true, Descripcion: "Cargo del responsable" },
    { campo: "Con derecho a ", tipo: "string", obligatorio: true, Descripcion: "Derechos asociados al cargo" },
    { campo: "Fecha de inicio del cargo", tipo: "string", obligatorio: true, Descripcion: "Fecha de inicio del cargo" },
    { campo: "Periodicidad con que se reúnen", tipo: "string", obligatorio: true, Descripcion: "Periodicidad con que se reúnen los responsables" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre las representaciones y cargos honoríficos" },
  ],

  // EO - Organizacion
  EO02: [
    { campo: "Tipo", tipo: "string", obligatorio: true, Descripcion: "Tipo de reglamento o manual" },
    { campo: "Fecha de Actualización, Autorización ó Publicación", tipo: "string", obligatorio: true, Descripcion: "Fecha de actualización, autorización o publicación del reglamento o manual" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el reglamento o manual" },
  ],

  // RH - Recursos Humanos
  RH01: [
    { campo: "Número de empleado", tipo: "string", obligatorio: true, Descripcion: "Número de empleado del personal de base" },
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre completo del personal de base" },
    { campo: "RFC", tipo: "string", obligatorio: true, Descripcion: "RFC del personal de base" },
    { campo: "Plaza (Categoría)", tipo: "string", obligatorio: true, Descripcion: "Plaza o categoría del personal de base" },
    { campo: "Tipo", tipo: "string", obligatorio: true, Descripcion: "Tipo de personal (base, apoyo, comisionado, honorarios)" },
    { campo: "Fecha de ingreso", tipo: "string", obligatorio: true, Descripcion: "Fecha de ingreso del personal a la dependencia" },
    { campo: "Fecha de Ingreso", tipo: "string", obligatorio: true, Descripcion: "Fecha de ingreso del personal a la dependencia" },
    { campo: "Sueldo", tipo: "number", obligatorio: true, Descripcion: "Sueldo del personal de base" },
    { campo: "Otras percepciones", tipo: "number", obligatorio: false, Descripcion: "Otras percepciones económicas del personal de base" },
    { campo: "Total", tipo: "number", obligatorio: true, Descripcion: "Total de percepciones económicas del personal de base" },
    { campo: "Unidad de Adscripción", tipo: "string", obligatorio: true, Descripcion: "Unidad de adscripción del personal de base" },
    { campo: "Área Laboral", tipo: "string", obligatorio: true, Descripcion: "Área laboral del personal de base" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el personal de base" },
  ],
  RH02: [
    { campo: "Número de empleado", tipo: "string", obligatorio: true, Descripcion: "Número de empleado del personal de apoyo" },
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre completo del personal de apoyo" },
    { campo: "RFC", tipo: "string", obligatorio: true, Descripcion: "RFC del personal de apoyo" },
    { campo: "Plaza (Categoría)", tipo: "string", obligatorio: true, Descripcion: "Plaza o categoría del personal de apoyo" },
    { campo: "Tipo", tipo: "string", obligatorio: true, Descripcion: "Tipo de personal (base, apoyo, comisionado, honorarios)" },
    { campo: "Fecha de ingreso", tipo: "string", obligatorio: true, Descripcion: "Fecha de ingreso del personal a la dependencia" },
    { campo: "Sueldo", tipo: "number", obligatorio: true, Descripcion: "Sueldo del personal de apoyo" },
    { campo: "Otras percepciones", tipo: "number", obligatorio: false, Descripcion: "Otras percepciones económicas del personal de apoyo" },
    { campo: "Total", tipo: "number", obligatorio: true, Descripcion: "Total de percepciones económicas del personal de apoyo" },
    { campo: "Unidad de Adscripción", tipo: "string", obligatorio: true, Descripcion: "Unidad de adscripción del personal de apoyo" },
    { campo: "Área Laboral", tipo: "string", obligatorio: true, Descripcion: "Área laboral del personal de apoyo" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el personal de apoyo" },
  ],
  RH03: [
    { campo: "Número de empleado", tipo: "string", obligatorio: true, Descripcion: "Número de empleado del personal comisionado" },
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre completo del personal comisionado" },
    { campo: "RFC", tipo: "string", obligatorio: true, Descripcion: "RFC del personal comisionado" },
    { campo: "Categoría: Denominación", tipo: "string", obligatorio: true, Descripcion: "Plaza o categoría del personal comisionado" },
    { campo: "Tipo", tipo: "string", obligatorio: true, Descripcion: "Tipo de personal (base, apoyo, comisionado, honorarios)" },
    { campo: "Unidad de Adscripción", tipo: "string", obligatorio: true, Descripcion: "Unidad de adscripción del personal comisionado" },
    { campo: "Área Laboral", tipo: "string", obligatorio: true, Descripcion: "Área laboral del personal comisionado" },
    { campo: "Comisionado a", tipo: "string", obligatorio: true, Descripcion: "Dependencia o entidad a la que el personal comisionado está asignado" },
    { campo: "Referencia Documental", tipo: "string", obligatorio: true, Descripcion: "Referencia documental que sustenta la comisión del personal" },
    { campo: "Inicio de comisión", tipo: "string", obligatorio: true, Descripcion: "Fecha de inicio de la comisión del personal" },
    { campo: "Fin de comisión", tipo: "string", obligatorio: true, Descripcion: "Fecha de fin de la comisión del personal" },
    { campo: "Sueldo", tipo: "number", obligatorio: true, Descripcion: "Sueldo del personal comisionado" },
    { campo: "Otras percepciones", tipo: "number", obligatorio: false, Descripcion: "Otras percepciones económicas del personal comisionado" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el personal comisionado" },
  ]
  ,
  RH04: [
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre completo del personal de honorarios" },
    { campo: "RFC", tipo: "string", obligatorio: true, Descripcion: "RFC del personal de honorarios" },
    { campo: "Fecha de Inicio de contrato", tipo: "string", obligatorio: true, Descripcion: "Fecha de inicio del contrato del personal de honorarios" },
    { campo: "Fecha de fin de contrato", tipo: "string", obligatorio: true, Descripcion: "Fecha de fin del contrato del personal de honorarios" },
    { campo: "Fuente de Recurso", tipo: "string", obligatorio: true, Descripcion: "Fuente de recursos para el pago del personal de honorarios" },
    { campo: "Actividades a Desarrollar", tipo: "string", obligatorio: true, Descripcion: "Descripción de las actividades a desarrollar por el personal de honorarios" },
    { campo: "Salario", tipo: "number", obligatorio: true, Descripcion: "Salario del personal de honorarios" },
    { campo: "Otras percepciones", tipo: "number", obligatorio: false, Descripcion: "Otras percepciones económicas del personal de honorarios" },
    { campo: "Total", tipo: "number", obligatorio: true, Descripcion: "Total de percepciones económicas del personal de honorarios" },
    { campo: "Unidad de Adscripción", tipo: "string", obligatorio: true, Descripcion: "Unidad de adscripción del personal de honorarios" },
    { campo: "Área Laboral", tipo: "string", obligatorio: true, Descripcion: "Área laboral del personal de honorarios" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones adicionales sobre el personal de honorarios" },
  ]

  ,
  RF01: [
    { campo: "partida", tipo: "string", obligatorio: true, Descripcion: "Partida Presupuestal" },
    { campo: "Denominacion", tipo: "string", obligatorio: true, Descripcion: "Denominación de la partida" },
    { campo: "Presupuesto_Autorizado", tipo: "number", obligatorio: true, Descripcion: "Monto Aprobado" },
    { campo: "Presupuesto_Modificado", tipo: "number", obligatorio: false, Descripcion: "Monto Modificado" },
    { campo: "Presupuesto_Ejercido", tipo: "number", obligatorio: false, Descripcion: "Monto Ejercido" },
    { campo: "Presupuesto_Por_Ejercer", tipo: "number", obligatorio: false, Descripcion: "Monto por Ejercer" },
  ],
}