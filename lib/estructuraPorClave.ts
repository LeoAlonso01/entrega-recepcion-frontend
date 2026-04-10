// campos de la tabla editable
export const ESTRUCTURA_DATOS_POR_CLAVE: Record<string, Array<{
  campo: string;
  tipo: string;
  obligatorio?: boolean;
  Descripcion?: string
  estructura?: Array<{
    campo: string;
    tipo: string;
    obligatorio?: boolean;
  }>;
}>> = {
  // Marco Jurídico (MJ01)
  MJ01: [
    { campo: "Ordenamiento", tipo: "string", obligatorio: true, Descripcion: "Ordenamiento Jurídico Aplicable" },
    { campo: "Titulo", tipo: "string", obligatorio: true, Descripcion: "Título del Asunto Relevante" },
    { campo: "Fecha de emision", tipo: "string", obligatorio: true, Descripcion: "Fecha de emisión del documento que sustenta el asunto relevante" },
  ]
  ,
  // Planeacion (PP01)
  PP02: [
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
    { campo: "Partida", tipo: "string", obligatorio: true, Descripcion: "Partida" },
    { campo: "Denominacion", tipo: "string", obligatorio: true, Descripcion: "Denominación" },
    { campo: "Autorizado", tipo: "number", obligatorio: true },
    { campo: "Ampliaciones y/o reducciones", tipo: "number", obligatorio: true },
    { campo: "Modificado", tipo: "number", obligatorio: true },
    { campo: "Ejercido", tipo: "number", obligatorio: true },
    { campo: "Por ejercer", tipo: "number", obligatorio: true },
  ],

  RF02: [
    { campo: "Origen del Recurso", tipo: "string", obligatorio: true, Descripcion: "Origen del Recurso" },
    { campo: "Partida", tipo: "string", obligatorio: true, Descripcion: "Partida" },
    { campo: "Descripción", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    {
      campo: "Presupuesto", tipo: "object", obligatorio: true, estructura: [
        { campo: "Autorizado", tipo: "number" },
        { campo: "Ampliaciones y/o reducciones", tipo: "number" },
        { campo: "Modificado", tipo: "number" },
        { campo: "Ejercido", tipo: "number" },
        { campo: "Por ejercer", tipo: "number" },
      ]
    },
  ],

  RF03: [
    { campo: "Ramo", tipo: "string", obligatorio: true },
    { campo: "Programa", tipo: "string", obligatorio: true },
    { campo: "Dependencia_Ejecutora", tipo: "string", obligatorio: true },
    { campo: "Numero_Convenio", tipo: "string", obligatorio: true },
    {
      campo: "Importe", tipo: "object", obligatorio: true, estructura: [
        { campo: "Aprobado", tipo: "number" },
        { campo: "Modificado", tipo: "number" },
        { campo: "Ejercido", tipo: "number" },
        { campo: "Por ejercer", tipo: "number" },
      ]
    },
    {
      campo: "Acciones", tipo: "object", obligatorio: true, estructura: [
        { campo: "Aprobadas", tipo: "number" },
        { campo: "Ejecutadas", tipo: "number" },
        { campo: "Pendientes", tipo: "number" },
      ]
    },
    { campo: "Observaciones", tipo: "string", obligatorio: false },
  ],

  RF04: [
    { campo: "Nombre del Programa", tipo: "string", obligatorio: true },
    { campo: "Numero del Capitulo", tipo: "number", obligatorio: true },
    { campo: "Nombre del Capitulo", tipo: "string", obligatorio: true },
    {
      campo: "Presupuesto", tipo: "object", obligatorio: true, estructura: [
        { campo: "Autorizado", tipo: "number" },
        { campo: "Ampliaciones y reducciones", tipo: "number" },
        { campo: "Modificado", tipo: "number" },
        { campo: "Ejercido", tipo: "number" },
        { campo: "Por ejercer", tipo: "number" },
      ]
    },
  ],

  RF05: [
    { campo: "Institucion Bancaria", tipo: "string", obligatorio: true },
    { campo: "Clave de Sucursal", tipo: "string", obligatorio: true },
    { campo: "Tipo de Cuenta", tipo: "string", obligatorio: true },
    { campo: "Numero de Cuenta", tipo: "string", obligatorio: true },

    {
      campo: "Firmas Registradas", tipo: "array", obligatorio: true, estructura: [
        { campo: "Nombre", tipo: "string" },
        { campo: "Cargo", tipo: "string" },
      ]
    },

    { campo: "Folio Ultimo Cheque", tipo: "number", obligatorio: true },
    { campo: "Saldo Segun Banco", tipo: "number", obligatorio: true },
    { campo: "Cargos No Correspondidos", tipo: "number", obligatorio: true },
    { campo: "Abonos No Correspondidos", tipo: "number", obligatorio: true },
    { campo: "Saldo Segun Registros", tipo: "number", obligatorio: true },
    { campo: "Responsable del Manejo", tipo: "string", obligatorio: true },
  ],

  RF06: [
    { campo: "Oficio Autorizacion", tipo: "string", obligatorio: true },
    { campo: "Fecha", tipo: "date", obligatorio: true },
    { campo: "Nombre del Responsable", tipo: "string", obligatorio: true },
    { campo: "Cargo del Responsable", tipo: "string", obligatorio: true },
    { campo: "Importe a Verificar", tipo: "number", obligatorio: true },
    { campo: "Destino del Fondo", tipo: "string", obligatorio: true },
    { campo: "Resultados Arqueo", tipo: "string", obligatorio: true },

    {
      campo: "Saldo en Cuenta", tipo: "array", obligatorio: true, estructura: [
        { campo: "No de Cuenta", tipo: "string" },
        { campo: "Banco", tipo: "string" },
        { campo: "Fecha", tipo: "date" },
        { campo: "Saldo", tipo: "number" },
      ]
    },

    { campo: "Monto Disponible en Efectivo", tipo: "number", obligatorio: true },
  ],

  /* 
   */

  RF07: [
    { campo: "Folio Contrarrecibo", tipo: "number", obligatorio: true, Descripcion: "Número de Folio del Contrarrecibo" },
    { campo: "Beneficiario", tipo: "string", obligatorio: true, Descripcion: "Nombre del Beneficiario" },
    { campo: "Fecha Recepcion", tipo: "date", obligatorio: true, Descripcion: "Fecha de Recepción" },
    { campo: "Numero Factura", tipo: "string", obligatorio: true, Descripcion: "Número de Estimación o Factura" },
    { campo: "Importe Total", tipo: "number", obligatorio: true, Descripcion: "Importe Total" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF08: [
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Numero Cheque", tipo: "number", obligatorio: true, Descripcion: "Número de Cheque" },
    { campo: "Cuenta", tipo: "number", obligatorio: true, Descripcion: "Cuenta" },
    { campo: "Banco", tipo: "string", obligatorio: true, Descripcion: "Banco" },
    { campo: "Monto", tipo: "number", obligatorio: true, Descripcion: "Monto" },
    { campo: "Beneficiario", tipo: "string", obligatorio: true, Descripcion: "Beneficiario" },
    { campo: "Concepto", tipo: "string", obligatorio: true, Descripcion: "Concepto" },
  ],

  RF09: [
    { campo: "Area Generadora", tipo: "string", obligatorio: true, Descripcion: "Área Generadora del Ingreso" },
    { campo: "Concepto Ingreso", tipo: "string", obligatorio: true, Descripcion: "Concepto del Ingreso" },
    { campo: "Fecha Ingreso", tipo: "date", obligatorio: true, Descripcion: "Fecha del Ingreso" },
    { campo: "Documento Ingreso", tipo: "string", obligatorio: true, Descripcion: "Documento del Ingreso" },
    { campo: "Importe", tipo: "number", obligatorio: true, Descripcion: "Importe del Ingreso" },
    { campo: "Cuenta Bancaria", tipo: "string", obligatorio: true, Descripcion: "Cuenta Bancaria" },
    { campo: "Institucion Bancaria", tipo: "string", obligatorio: true, Descripcion: "Institución Bancaria" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable de la Custodia" },
  ],

  RF11: [
    { campo: "Deudor", tipo: "string", obligatorio: true, Descripcion: "Nombre del Deudor" },
    { campo: "Concepto", tipo: "string", obligatorio: true, Descripcion: "Concepto" },
    { campo: "Fecha Documento", tipo: "date", obligatorio: true, Descripcion: "Fecha del Documento" },
    { campo: "Tipo Documento", tipo: "string", obligatorio: true, Descripcion: "Tipo de Documento" },
    { campo: "Folio", tipo: "string", obligatorio: true, Descripcion: "Folio" },
    { campo: "Importe", tipo: "number", obligatorio: true, Descripcion: "Importe" },
    { campo: "Fecha Vencimiento", tipo: "date", obligatorio: true, Descripcion: "Fecha de Vencimiento" },
    { campo: "Numero Contable", tipo: "number", obligatorio: true, Descripcion: "Número Contable" },
    { campo: "Titulo", tipo: "string", obligatorio: true, Descripcion: "Título" },
    { campo: "Saldo Vencido", tipo: "number", obligatorio: true, Descripcion: "Saldo Vencido" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF12: [
    { campo: "Concepto", tipo: "string", obligatorio: true, Descripcion: "Concepto" },
    { campo: "Fecha Documento", tipo: "date", obligatorio: true, Descripcion: "Fecha del Documento" },
    { campo: "Tipo de Documento", tipo: "string", obligatorio: true, Descripcion: "Tipo de Documento" },
    { campo: "Folio", tipo: "string", obligatorio: true, Descripcion: "Folio" },
    { campo: "Dependencia", tipo: "string", obligatorio: true, Descripcion: "Dependencia" },
    { campo: "Partida", tipo: "string", obligatorio: true, Descripcion: "Partida" },
    { campo: "Fecha de Vencimiento", tipo: "date", obligatorio: true, Descripcion: "Fecha de Vencimiento" },
    { campo: "Numero", tipo: "number", obligatorio: true, Descripcion: "Número" },
    { campo: "Titulo", tipo: "string", obligatorio: true, Descripcion: "Título" },
    { campo: "Saldo de Vencido", tipo: "number", obligatorio: true, Descripcion: "Saldo Vencido" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF13: [
    { campo: "Concepto del mpuesto", tipo: "string", obligatorio: true, Descripcion: "Concepto del Impuesto" },
    { campo: "Enteros provisionales: Periodo Por Pagar", tipo: "string", obligatorio: true, Descripcion: "Periodo por pagar (Enteros Provisionales)" },
    { campo: "Enteros provisionales: Periodo T/D", tipo: "string", obligatorio: true, Descripcion: "Periodo T/D (Enteros Provisionales)" },
    { campo: "Enteros provisionales: Importe Por Pagar", tipo: "number", obligatorio: true, Descripcion: "Importe por pagar (Enteros Provisionales)" },
    { campo: "Enteros provisionales: Importe Clave", tipo: "string", obligatorio: true, Descripcion: "Clave del importe (Enteros Provisionales)" },
    { campo: "Enteros provisionales: Multas y Recargos", tipo: "number", obligatorio: true, Descripcion: "Multas y Recargos" },
    { campo: "Declaraciones anuales: Presentadas", tipo: "number", obligatorio: true, Descripcion: "Declaraciones Anuales Presentadas" },
    { campo: "Declaraciones anuales: Por Presentar", tipo: "number", obligatorio: true, Descripcion: "Declaraciones Anuales por Presentar" },
    { campo: "Declaraciones anuales: Año", tipo: "number", obligatorio: true, Descripcion: "Año de Declaraciones" },
  ],

  RF14: [
    { campo: "Tipo de Póliza", tipo: "string", obligatorio: true, Descripcion: "Tipo de Póliza" },
    { campo: "Compañía", tipo: "string", obligatorio: true, Descripcion: "Compañía" },
    { campo: "Monto", tipo: "number", obligatorio: true, Descripcion: "Monto" },
    { campo: "Cobertura", tipo: "string", obligatorio: true, Descripcion: "Cobertura" },
    { campo: "Vigencia", tipo: "date", obligatorio: true, Descripcion: "Vigencia" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF15: [
    { campo: "Número de Póliza", tipo: "string", obligatorio: true, Descripcion: "Número de Póliza" },
    { campo: "Compañía Aseguradora", tipo: "string", obligatorio: true, Descripcion: "Compañía Aseguradora" },
    { campo: "Tipo de Fianza", tipo: "string", obligatorio: true, Descripcion: "Tipo de Fianza o Garantía" },
    { campo: "Concepto de Fianza", tipo: "string", obligatorio: true, Descripcion: "Concepto u Obra de la Fianza o Garantía" },
    { campo: "Cobertura de Fianza", tipo: "string", obligatorio: true, Descripcion: "Cobertura de la Fianza o Garantía" },
    { campo: "Vigencia", tipo: "date", obligatorio: true, Descripcion: "Vigencia" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF16: [
    { campo: "Descripcion_Convenio", tipo: "string", obligatorio: true, Descripcion: "Descripción del Convenio o Contrato" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Nombre de quien conviene o contrata" },
    { campo: "Importe", tipo: "number", obligatorio: true, Descripcion: "Importe" },
    { campo: "Periodo", tipo: "string", obligatorio: true, Descripcion: "Periodo" },
  ],

  RF17: [
    { campo: "Tipo de Documento", tipo: "string", obligatorio: true, Descripcion: "Tipo de Documento" },
    { campo: "Folio", tipo: "string", obligatorio: true, Descripcion: "Folio" },
    { campo: "Fecha de Último Registro", tipo: "date", obligatorio: true, Descripcion: "Fecha de Último Registro" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  OP01: [
    { campo: "No. de Expediente", tipo: "string", obligatorio: true, Descripcion: "No. de Expediente" },
    { campo: "Clave de Contrato", tipo: "string", obligatorio: true, Descripcion: "Clave de contrato o Acuerdo" },
    { campo: "Nombre de Obra y Ubicación", tipo: "string", obligatorio: true, Descripcion: "Nombre de Obra y Ubicación" },
    { campo: "Fecha de Contrato", tipo: "date", obligatorio: true, Descripcion: "Fecha de contrato o acuerdo" },
    { campo: "Estado de Obra", tipo: "string", obligatorio: true, Descripcion: "Estado de la Obra" },
    { campo: "Fuente de Financiamiento", tipo: "string", obligatorio: true, Descripcion: "Fuente de Financiamiento" },
    { campo: "Origen de Recurso", tipo: "string", obligatorio: true, Descripcion: "Origen de Recurso" },
    { campo: "Suficiencia Presupuestal", tipo: "string", obligatorio: true, Descripcion: "Suficiencia Presupuestal" },
    { campo: "Monto Contratado", tipo: "number", obligatorio: true, Descripcion: "Monto Contratado" },
    { campo: "Monto Ejercido", tipo: "number", obligatorio: true, Descripcion: "Monto ejercido" },
    { campo: "Avance Físico", tipo: "number", obligatorio: true, Descripcion: "Avance Físico (%)" },
    { campo: "Avance Financiero", tipo: "number", obligatorio: true, Descripcion: "Avance Financiero (%)" },
    { campo: "Modalidad de Contratación", tipo: "string", obligatorio: true, Descripcion: "Modalidad de Contratación" },
  ],

  OP02: [
    { campo: "No. de Expediente", tipo: "string", obligatorio: true, Descripcion: "No. de Expediente" },
    { campo: "Tipo de Obra", tipo: "string", obligatorio: true, Descripcion: "Tipo de Obra" },
    { campo: "Programa de Inversión", tipo: "string", obligatorio: true, Descripcion: "Programa de Inversión" },
    { campo: "Nombre de la Obra", tipo: "string", obligatorio: true, Descripcion: "Nombre de la Obra" },
    { campo: "Municipio", tipo: "string", obligatorio: true, Descripcion: "Municipio" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Dependencia Beneficiada", tipo: "string", obligatorio: true, Descripcion: "Dependencia Beneficiada" },
    { campo: "Ejercicio Presupuestal", tipo: "number", obligatorio: true, Descripcion: "Ejercicio Presupuestal" },
    { campo: "Ejecutora", tipo: "string", obligatorio: true, Descripcion: "Ejecutora" },
    { campo: "Documentacion_Expediente", tipo: "string", obligatorio: true, Descripcion: "Documentación contenida en el expediente unitario de las obras" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  OP03: [
    { campo: "No. del Expediente", tipo: "string", obligatorio: true, Descripcion: "No. de Expediente" },
    { campo: "Tipo de Obra", tipo: "string", obligatorio: true, Descripcion: "Tipo de Obra" },
    { campo: "Programa de Inversión", tipo: "string", obligatorio: true, Descripcion: "Programa de Inversión" },
    { campo: "Nombre de la Obra", tipo: "string", obligatorio: true, Descripcion: "Nombre de la Obra" },
    { campo: "Municipio", tipo: "string", obligatorio: true, Descripcion: "Municipio" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Dependencia Beneficiada", tipo: "string", obligatorio: true, Descripcion: "Dependencia Beneficiada" },
    { campo: "Ejercicio Presupuestal", tipo: "number", obligatorio: true, Descripcion: "Ejercicio Presupuestal" },
    { campo: "Ejecutora", tipo: "string", obligatorio: true, Descripcion: "Ejecutora" },
    { campo: "Documentacion del Expediente", tipo: "string", obligatorio: true, Descripcion: "Documentación contenida en el expediente unitario de las obras" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  OP04: [
    { campo: "Licitacion", tipo: "string", obligatorio: true, Descripcion: "Licitación" },
    { campo: "Obra", tipo: "string", obligatorio: true, Descripcion: "Obra" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Municipio", tipo: "string", obligatorio: true, Descripcion: "Municipio" },
    { campo: "Area_Operativa", tipo: "string", obligatorio: true, Descripcion: "Área Operativa" },
    { campo: "Tramite_Actual", tipo: "string", obligatorio: true, Descripcion: "Trámite Actual" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  ADI01: [
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Descripcion_Bien", tipo: "string", obligatorio: true, Descripcion: "Descripción del Bien" },
    { campo: "Cantidad", tipo: "number", obligatorio: true, Descripcion: "Cantidad" },
    { campo: "Estado", tipo: "string", obligatorio: true, Descripcion: "Estado" },
    { campo: "Ubicacion", tipo: "string", obligatorio: true, Descripcion: "Ubicación" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  ADI02: [
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Descripcion_Bien", tipo: "string", obligatorio: true, Descripcion: "Descripción del Bien" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "Serie", tipo: "string", obligatorio: true, Descripcion: "Serie" },
    { campo: "Cantidad", tipo: "number", obligatorio: true, Descripcion: "Cantidad" },
    { campo: "Estado", tipo: "string", obligatorio: true, Descripcion: "Estado" },
    { campo: "Ubicacion", tipo: "string", obligatorio: true, Descripcion: "Ubicación" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  CF01: [
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre" },
    { campo: "Cargo", tipo: "string", obligatorio: true, Descripcion: "Cargo" },
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Telefono", tipo: "string", obligatorio: true, Descripcion: "Teléfono" },
    { campo: "Correo", tipo: "string", obligatorio: true, Descripcion: "Correo Electrónico" },
  ],

  CF02: [
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre" },
    { campo: "Cargo", tipo: "string", obligatorio: true, Descripcion: "Cargo" },
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Telefono", tipo: "string", obligatorio: true, Descripcion: "Teléfono" },
    { campo: "Correo", tipo: "string", obligatorio: true, Descripcion: "Correo Electrónico" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  IG01: [
    { campo: "Tipo_Informe", tipo: "string", obligatorio: true, Descripcion: "Tipo de Informe" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
  ],

  IG02: [
    { campo: "Tipo_Informe", tipo: "string", obligatorio: true, Descripcion: "Tipo de Informe" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  TAI01: [
    { campo: "Tipo_Archivo", tipo: "string", obligatorio: true, Descripcion: "Tipo de Archivo" },
    { campo: "Nombre_Archivo", tipo: "string", obligatorio: true, Descripcion: "Nombre del Archivo" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
  ],

  CC01: [
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre" },
    { campo: "Cargo", tipo: "string", obligatorio: true, Descripcion: "Cargo" },
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Firma", tipo: "string", obligatorio: true, Descripcion: "Firma" },
  ],

  CC02: [
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre" },
    { campo: "Cargo", tipo: "string", obligatorio: true, Descripcion: "Cargo" },
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Firma", tipo: "string", obligatorio: true, Descripcion: "Firma" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  CC03: [
    { campo: "Nombre", tipo: "string", obligatorio: true, Descripcion: "Nombre" },
    { campo: "Cargo", tipo: "string", obligatorio: true, Descripcion: "Cargo" },
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Firma", tipo: "string", obligatorio: true, Descripcion: "Firma" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  AG01: [
    { campo: "Numero_Acta", tipo: "string", obligatorio: true, Descripcion: "Número de Acta" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Lugar", tipo: "string", obligatorio: true, Descripcion: "Lugar" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
  ],

  AG02: [
    { campo: "Numero_Acta", tipo: "string", obligatorio: true, Descripcion: "Número de Acta" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  AG03: [
    { campo: "Numero_Acta", tipo: "string", obligatorio: true, Descripcion: "Número de Acta" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  AG04: [
    { campo: "Numero_Acta", tipo: "string", obligatorio: true, Descripcion: "Número de Acta" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  AR01: [
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Responsable_Entrega", tipo: "string", obligatorio: true, Descripcion: "Responsable que entrega" },
    { campo: "Responsable_Recibe", tipo: "string", obligatorio: true, Descripcion: "Responsable que recibe" },
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM01: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No. de serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "No. de patrimonio", tipo: "string", obligatorio: true, Descripcion: "No. de patrimonio" },
    { campo: "No. de resguardo interno", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo interno" },
    { campo: "Estado de uso", tipo: "string", obligatorio: true, Descripcion: "Estado de uso" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Número de Empleado", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Puesto del usuario resguardante", tipo: "string", obligatorio: true, Descripcion: "Puesto del usuario resguardante" },
  ],


  RM02: [
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "Color", tipo: "string", obligatorio: true, Descripcion: "Color" },
    { campo: "Placas / Matrícula / Registro", tipo: "string", obligatorio: true, Descripcion: "Placas / Matrícula / Registro" },
    { campo: "No. de serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "No. de motor", tipo: "string", obligatorio: true, Descripcion: "No. de motor" },
    { campo: "Estado físico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Clave Patrimonial", tipo: "string", obligatorio: true, Descripcion: "Clave Patrimonial" },
    { campo: "úmero de resguardo interno", tipo: "string", obligatorio: true, Descripcion: "Número de resguardo interno" },
    { campo: "Número de Empleado del resguardante", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado del resguardante" },
    { campo: "Responsable del uso del vehículo", tipo: "string", obligatorio: true, Descripcion: "Responsable del uso del vehículo" },
    { campo: "Cargo de usuario resguardante", tipo: "string", obligatorio: true, Descripcion: "Cargo de usuario resguardante" },
  ],

  RM03: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "Serie", tipo: "string", obligatorio: true, Descripcion: "Serie" },
    { campo: "Clave patrimonial", tipo: "string", obligatorio: true, Descripcion: "Clave patrimonial" },
    { campo: "No. de resguardo interno", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo interno" },
    { campo: "Número de Empleado", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Estado_fisico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Ubicacion_actual", tipo: "string", obligatorio: true, Descripcion: "Ubicación actual" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM04: [
    { campo: "Clave patrimonial", tipo: "string", obligatorio: true, Descripcion: "Clave patrimonial" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No_Serie", tipo: "string", obligatorio: true, Descripcion: "No. Serie" },
    { campo: "Cantidad", tipo: "number", obligatorio: true, Descripcion: "Cantidad" },
    { campo: "Precio_Unitario", tipo: "number", obligatorio: true, Descripcion: "Precio Unitario" },
    { campo: "Precio_Total", tipo: "number", obligatorio: true, Descripcion: "Precio Total" },
    { campo: "Localizacion", tipo: "string", obligatorio: true, Descripcion: "Localización" },
    { campo: "Ur", tipo: "string", obligatorio: true, Descripcion: "UR" }, // minúsculas como pediste
  ],

  RM05: [
    { campo: "Tipo de bien", tipo: "string", obligatorio: true, Descripcion: "Tipo de bien" },
    { campo: "Descripcion del bien", tipo: "string", obligatorio: true, Descripcion: "Descripción del bien" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No de serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "Estado físico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "Ubicación", tipo: "string", obligatorio: true, Descripcion: "Ubicación" },
    { campo: "Nombre del otorgante", tipo: "string", obligatorio: true, Descripcion: "Nombre del otorgante" },
    { campo: "Fecha de firma del comodato", tipo: "date", obligatorio: true, Descripcion: "Fecha de firma del comodato" },
    { campo: "Periodo", tipo: "string", obligatorio: true, Descripcion: "Período" },
  ],

  RM06: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Tipo de predio", tipo: "string", obligatorio: true, Descripcion: "Tipo de predio" },
    { campo: "Superficie m2", tipo: "number", obligatorio: true, Descripcion: "Superficie m2" },
    { campo: "Calle y número", tipo: "string", obligatorio: true, Descripcion: "Calle y número" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Estatus legal", tipo: "string", obligatorio: true, Descripcion: "Estatus legal" },
    { campo: "Descripción de la situación jurídica y/o administrativa", tipo: "string", obligatorio: true, Descripcion: "Descripción de la situación jurídica y/o administrativa" },
  ],

  RM07: [
    { campo: "No de Inventario", tipo: "string", obligatorio: true, Descripcion: "No. DE INVENTARIO" },
    { campo: "No de CTA Predial", tipo: "string", obligatorio: true, Descripcion: "No. CTA. PREDIAL" },
    { campo: "Ubicación", tipo: "string", obligatorio: true, Descripcion: "UBICACIÓN" },
    { campo: "Superficie Terreno MTS2", tipo: "number", obligatorio: true, Descripcion: "SUPERFICIE TERRENO MTS2" },
    { campo: "Zona", tipo: "string", obligatorio: true, Descripcion: "ZONA" },
    { campo: "Doct que acredita la posesion", tipo: "string", obligatorio: true, Descripcion: "DOCT. QUE ACREDITA LA POSESION" },
    { campo: "Fecha de adquisicion", tipo: "date", obligatorio: true, Descripcion: "FECHA DE ADQUISICIÓN" },
    { campo: "Costo de adquisicion", tipo: "number", obligatorio: true, Descripcion: "COSTO DE ADQUISICIÓN" },
    { campo: "Uso o destino", tipo: "string", obligatorio: true, Descripcion: "USO O DESTINO" },
    { campo: "comentarios", tipo: "string", obligatorio: false, Descripcion: "COMENTARIOS" }, // minúsculas como pediste
  ],

  RM08: [
    { campo: "Numero de registro y o_inventario", tipo: "string", obligatorio: true, Descripcion: "Número de registro y/o inventario" },
    { campo: "Titulo de la obra articulo", tipo: "string", obligatorio: true, Descripcion: "Título de la obra / artículo" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Ubicacion", tipo: "string", obligatorio: true, Descripcion: "Ubicación" },
    { campo: "Certificado de autenticidad", tipo: "string", obligatorio: true, Descripcion: "Certificado de autenticidad" },
    { campo: "Estado fisico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "Datos del resguardante Nombre", tipo: "string", obligatorio: true, Descripcion: "Datos del resguardante Nombre" },
    { campo: "Datos del resguardante Puesto", tipo: "string", obligatorio: true, Descripcion: "Datos del resguardante Puesto" },
    { campo: "Datos del resguardante Num de resguardo", tipo: "string", obligatorio: true, Descripcion: "Datos del resguardante Núm. de resguardo" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM09: [
    { campo: "Especie", tipo: "string", obligatorio: true, Descripcion: "Especie" },
    { campo: "Cantidad de planta en existencia", tipo: "number", obligatorio: true, Descripcion: "Cantidad de planta en existencia" },
    { campo: "Tipo de produccion", tipo: "string", obligatorio: true, Descripcion: "Tipo de producción" },
    { campo: "Fecha de siembra", tipo: "date", obligatorio: true, Descripcion: "Fecha de siembra" },
    { campo: "Talla", tipo: "string", obligatorio: true, Descripcion: "Talla" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM10: [
    { campo: "Nombre común", tipo: "string", obligatorio: true, Descripcion: "Nombre común" },
    { campo: "Nombre científico", tipo: "string", obligatorio: true, Descripcion: "Nombre científico" },
    { campo: "Clave", tipo: "string", obligatorio: true, Descripcion: "Clave" },
    { campo: "Origen", tipo: "string", obligatorio: true, Descripcion: "Origen" },
    { campo: "Familia", tipo: "string", obligatorio: true, Descripcion: "Familia" },
    { campo: "Sexo", tipo: "string", obligatorio: true, Descripcion: "Sexo" },
    { campo: "Marcaje", tipo: "string", obligatorio: true, Descripcion: "Marcaje" },
    { campo: "Fecha Alta", tipo: "date", obligatorio: true, Descripcion: "Fecha Alta" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM11: [
    { campo: "Nombre común del animal", tipo: "string", obligatorio: true, Descripcion: "Nombre común del animal" },
    { campo: "Ubicación física", tipo: "string", obligatorio: true, Descripcion: "Ubicación física" },
    { campo: "No. de resguardo", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM12: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Tipo y calibre", tipo: "string", obligatorio: true, Descripcion: "Tipo y calibre" },
    { campo: "Marca y modelo", tipo: "string", obligatorio: true, Descripcion: "Marca y modelo" },
    { campo: "Matricula", tipo: "string", obligatorio: true, Descripcion: "Matrícula" },
    { campo: "No de serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "No de registro", tipo: "string", obligatorio: true, Descripcion: "No. de registro" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Estado", tipo: "string", obligatorio: true, Descripcion: "Estado" },
    { campo: "No de inventario", tipo: "string", obligatorio: true, Descripcion: "No. de inventario" },
    { campo: "No de resguardo", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo" },
    { campo: "Numero de empleado del responsable", tipo: "number", obligatorio: true, Descripcion: "Número de empleado del responsable" },
    { campo: "Nombre del responsable", tipo: "string", obligatorio: true, Descripcion: "Nombre del responsable" },
    { campo: "Puesto del responsable", tipo: "string", obligatorio: true, Descripcion: "Puesto del responsable" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM13: [
    { campo: "Nombre del paquete", tipo: "string", obligatorio: true, Descripcion: "Nombre del paquete" },
    { campo: "Licencia", tipo: "string", obligatorio: true, Descripcion: "Licencia" },
    { campo: "Versión", tipo: "string", obligatorio: true, Descripcion: "Versión" },
    { campo: "No. de serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "Origen", tipo: "string", obligatorio: true, Descripcion: "Origen" },
    { campo: "Fecha de adquisición", tipo: "date", obligatorio: true, Descripcion: "Fecha de adquisición" },
    { campo: "Equipo en que opera", tipo: "string", obligatorio: true, Descripcion: "Equipo en que opera" },
    { campo: "Usuario", tipo: "string", obligatorio: true, Descripcion: "Usuario" },
    { campo: "Medio de almacenamiento", tipo: "string", obligatorio: true, Descripcion: "Medio de almacenamiento" },
    { campo: "No. de manuales", tipo: "number", obligatorio: true, Descripcion: "No. de manuales" },
  ],

  RM14: [
    { campo: "Nombre del sistema / subsistema", tipo: "string", obligatorio: true, Descripcion: "Nombre del sistema / subsistema" },
    { campo: "Fase de", tipo: "string", obligatorio: true, Descripcion: "Fase de" },
    { campo: "Fecha de liberación", tipo: "date", obligatorio: true, Descripcion: "Fecha de liberación" },
    { campo: "Origen", tipo: "string", obligatorio: true, Descripcion: "Origen" },
    { campo: "Equipo en que opera", tipo: "string", obligatorio: true, Descripcion: "Equipo en que opera" },
    { campo: "Medio de distribución", tipo: "string", obligatorio: true, Descripcion: "Medio de distribución" },
    { campo: "Documentación", tipo: "string", obligatorio: true, Descripcion: "Documentación" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Código fuente", tipo: "string", obligatorio: true, Descripcion: "Código fuente" },
  ],

  RM15: [
    { campo: "Descripción del equipo", tipo: "string", obligatorio: true, Descripcion: "Descripción del equipo" },
    { campo: "Especificaciones", tipo: "string", obligatorio: true, Descripcion: "Especificaciones" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No. de serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "Estado", tipo: "string", obligatorio: true, Descripcion: "Estado" },
    { campo: "Área de asignación", tipo: "string", obligatorio: true, Descripcion: "Área de asignación" },
    { campo: "Ubicación física del equipo", tipo: "string", obligatorio: true, Descripcion: "Ubicación física del equipo" },
    { campo: "úmero de Empleado del responsable", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado del responsable" },
    { campo: "Nombre del usuario responsable", tipo: "string", obligatorio: true, Descripcion: "Nombre del usuario responsable" },
    { campo: "Puesto del usuario responsable", tipo: "string", obligatorio: true, Descripcion: "Puesto del usuario responsable" },
    { campo: "No. de resguardo", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo" },
  ],

  RM16: [
    { campo: "Área", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Descripción", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Número de Empleado", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado" },
    { campo: "Fecha de Entrega", tipo: "date", obligatorio: true, Descripcion: "Fecha de Entrega" },
    { campo: "URE", tipo: "string", obligatorio: true, Descripcion: "URE" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],





}