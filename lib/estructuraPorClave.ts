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
    {
      campo: "Presupuesto", tipo: "object", obligatorio: true, Descripcion: "Presupuesto", estructura: [
        { campo: "Autorizado", tipo: "number", obligatorio: true },
        { campo: "Ampliaciones_reducciones", tipo: "number", obligatorio: true },
        { campo: "Modificado", tipo: "number", obligatorio: true },
        { campo: "Ejercido", tipo: "number", obligatorio: true },
        { campo: "Por_ejercer", tipo: "number", obligatorio: true },
      ]
    },
  ],

  RF02: [
    { campo: "Origen_del_Recurso", tipo: "string", obligatorio: true, Descripcion: "Origen del Recurso" },
    { campo: "Partida", tipo: "string", obligatorio: true, Descripcion: "Partida" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    {
      campo: "Presupuesto", tipo: "object", obligatorio: true, estructura: [
        { campo: "Autorizado", tipo: "number" },
        { campo: "Ampliaciones_reducciones", tipo: "number" },
        { campo: "Modificado", tipo: "number" },
        { campo: "Ejercido", tipo: "number" },
        { campo: "Por_ejercer", tipo: "number" },
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
        { campo: "Por_ejercer", tipo: "number" },
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
    { campo: "Nombre_del_Programa", tipo: "string", obligatorio: true },
    { campo: "Numero_del_Capitulo", tipo: "number", obligatorio: true },
    { campo: "Nombre_del_Capitulo", tipo: "string", obligatorio: true },
    {
      campo: "Presupuesto", tipo: "object", obligatorio: true, estructura: [
        { campo: "Autorizado", tipo: "number" },
        { campo: "Ampliaciones_reducciones", tipo: "number" },
        { campo: "Modificado", tipo: "number" },
        { campo: "Ejercido", tipo: "number" },
        { campo: "Por_ejercer", tipo: "number" },
      ]
    },
  ],

  RF05: [
    { campo: "Institucion_Bancaria", tipo: "string", obligatorio: true },
    { campo: "Clave_de_Sucursal", tipo: "string", obligatorio: true },
    { campo: "Tipo_de_Cuenta", tipo: "string", obligatorio: true },
    { campo: "Numero_de_Cuenta", tipo: "string", obligatorio: true },

    {
      campo: "Firmas_Registradas", tipo: "array", obligatorio: true, estructura: [
        { campo: "Nombre", tipo: "string" },
        { campo: "Cargo", tipo: "string" },
      ]
    },

    { campo: "Folio_Ultimo_Cheque", tipo: "number", obligatorio: true },
    { campo: "Saldo_Segun_Banco", tipo: "number", obligatorio: true },
    { campo: "Cargos_No_Correspondidos", tipo: "number", obligatorio: true },
    { campo: "Abonos_No_Correspondidos", tipo: "number", obligatorio: true },
    { campo: "Saldo_Segun_Registros", tipo: "number", obligatorio: true },
    { campo: "Responsable_del_Manejo", tipo: "string", obligatorio: true },
  ],

  RF06: [
    { campo: "Oficio_Autorizacion", tipo: "string", obligatorio: true },
    { campo: "Fecha", tipo: "date", obligatorio: true },
    { campo: "Nombre_del_Responsable", tipo: "string", obligatorio: true },
    { campo: "Cargo_del_Responsable", tipo: "string", obligatorio: true },
    { campo: "Importe_a_Verificar", tipo: "number", obligatorio: true },
    { campo: "Destino_del_Fondo", tipo: "string", obligatorio: true },
    { campo: "Resultados_Arqueo", tipo: "string", obligatorio: true },

    {
      campo: "saldo_en_cuenta", tipo: "array", obligatorio: true, estructura: [
        { campo: "no_de_cuenta", tipo: "string" },
        { campo: "banco", tipo: "string" },
        { campo: "fecha", tipo: "date" },
        { campo: "saldo", tipo: "number" },
      ]
    },

    { campo: "monto_disponible_en_efectivo", tipo: "number", obligatorio: true },
  ],

  /* 
   */

  RF07: [
    { campo: "Folio_Contrarrecibo", tipo: "number", obligatorio: true, Descripcion: "Número de Folio del Contrarrecibo" },
    { campo: "Beneficiario", tipo: "string", obligatorio: true, Descripcion: "Nombre del Beneficiario" },
    { campo: "Fecha_Recepcion", tipo: "date", obligatorio: true, Descripcion: "Fecha de Recepción" },
    { campo: "Numero_Factura", tipo: "string", obligatorio: true, Descripcion: "Número de Estimación o Factura" },
    { campo: "Importe_Total", tipo: "number", obligatorio: true, Descripcion: "Importe Total" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF08: [
    { campo: "Fecha", tipo: "date", obligatorio: true, Descripcion: "Fecha" },
    { campo: "Numero_Cheque", tipo: "number", obligatorio: true, Descripcion: "Número de Cheque" },
    { campo: "Cuenta", tipo: "number", obligatorio: true, Descripcion: "Cuenta" },
    { campo: "Banco", tipo: "string", obligatorio: true, Descripcion: "Banco" },
    { campo: "Monto", tipo: "number", obligatorio: true, Descripcion: "Monto" },
    { campo: "Beneficiario", tipo: "string", obligatorio: true, Descripcion: "Beneficiario" },
    { campo: "Concepto", tipo: "string", obligatorio: true, Descripcion: "Concepto" },
  ],

  RF09: [
    { campo: "Area_Generadora", tipo: "string", obligatorio: true, Descripcion: "Área Generadora del Ingreso" },
    { campo: "Concepto_Ingreso", tipo: "string", obligatorio: true, Descripcion: "Concepto del Ingreso" },
    { campo: "Fecha_Ingreso", tipo: "date", obligatorio: true, Descripcion: "Fecha del Ingreso" },
    { campo: "Documento_Ingreso", tipo: "string", obligatorio: true, Descripcion: "Documento del Ingreso" },
    { campo: "Importe", tipo: "number", obligatorio: true, Descripcion: "Importe del Ingreso" },
    { campo: "Cuenta_Bancaria", tipo: "string", obligatorio: true, Descripcion: "Cuenta Bancaria" },
    { campo: "Institucion_Bancaria", tipo: "string", obligatorio: true, Descripcion: "Institución Bancaria" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable de la Custodia" },
  ],

  RF11: [
    { campo: "Deudor", tipo: "string", obligatorio: true, Descripcion: "Nombre del Deudor" },
    { campo: "Concepto", tipo: "string", obligatorio: true, Descripcion: "Concepto" },
    { campo: "Fecha_Documento", tipo: "date", obligatorio: true, Descripcion: "Fecha del Documento" },
    { campo: "Tipo_Documento", tipo: "string", obligatorio: true, Descripcion: "Tipo de Documento" },
    { campo: "Folio", tipo: "string", obligatorio: true, Descripcion: "Folio" },
    { campo: "Importe", tipo: "number", obligatorio: true, Descripcion: "Importe" },
    { campo: "Fecha_Vencimiento", tipo: "date", obligatorio: true, Descripcion: "Fecha de Vencimiento" },
    { campo: "Numero_Contable", tipo: "number", obligatorio: true, Descripcion: "Número Contable" },
    { campo: "Titulo", tipo: "string", obligatorio: true, Descripcion: "Título" },
    { campo: "Saldo_Vencido", tipo: "number", obligatorio: true, Descripcion: "Saldo Vencido" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF12: [
    { campo: "Concepto", tipo: "string", obligatorio: true, Descripcion: "Concepto" },
    { campo: "Fecha_Documento", tipo: "date", obligatorio: true, Descripcion: "Fecha del Documento" },
    { campo: "Tipo_Documento", tipo: "string", obligatorio: true, Descripcion: "Tipo de Documento" },
    { campo: "Folio", tipo: "string", obligatorio: true, Descripcion: "Folio" },
    { campo: "Dependencia", tipo: "string", obligatorio: true, Descripcion: "Dependencia" },
    { campo: "Partida", tipo: "string", obligatorio: true, Descripcion: "Partida" },
    { campo: "Fecha_Vencimiento", tipo: "date", obligatorio: true, Descripcion: "Fecha de Vencimiento" },
    { campo: "Numero", tipo: "number", obligatorio: true, Descripcion: "Número" },
    { campo: "Titulo", tipo: "string", obligatorio: true, Descripcion: "Título" },
    { campo: "Saldo_Vencido", tipo: "number", obligatorio: true, Descripcion: "Saldo Vencido" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF13: [
    { campo: "Concepto_Impuesto", tipo: "string", obligatorio: true, Descripcion: "Concepto del Impuesto" },
    { campo: "Enteros_Periodo_Por_Pagar", tipo: "string", obligatorio: true, Descripcion: "Periodo por pagar (Enteros Provisionales)" },
    { campo: "Enteros_Periodo_TD", tipo: "string", obligatorio: true, Descripcion: "Periodo T/D (Enteros Provisionales)" },
    { campo: "Enteros_Importe_Por_Pagar", tipo: "number", obligatorio: true, Descripcion: "Importe por pagar (Enteros Provisionales)" },
    { campo: "Enteros_Importe_Clave", tipo: "string", obligatorio: true, Descripcion: "Clave del importe (Enteros Provisionales)" },
    { campo: "Enteros_Multas_Recargos", tipo: "number", obligatorio: true, Descripcion: "Multas y Recargos" },
    { campo: "Declaraciones_Presentadas", tipo: "number", obligatorio: true, Descripcion: "Declaraciones Anuales Presentadas" },
    { campo: "Declaraciones_Por_Presentar", tipo: "number", obligatorio: true, Descripcion: "Declaraciones Anuales por Presentar" },
    { campo: "Declaraciones_Ano", tipo: "number", obligatorio: true, Descripcion: "Año de Declaraciones" },
  ],

  RF14: [
    { campo: "Tipo_Poliza", tipo: "string", obligatorio: true, Descripcion: "Tipo de Póliza" },
    { campo: "Compania", tipo: "string", obligatorio: true, Descripcion: "Compañía" },
    { campo: "Monto", tipo: "number", obligatorio: true, Descripcion: "Monto" },
    { campo: "Cobertura", tipo: "string", obligatorio: true, Descripcion: "Cobertura" },
    { campo: "Vigencia", tipo: "date", obligatorio: true, Descripcion: "Vigencia" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RF15: [
    { campo: "Numero_Poliza", tipo: "string", obligatorio: true, Descripcion: "Número de Póliza" },
    { campo: "Compania_Aseguradora", tipo: "string", obligatorio: true, Descripcion: "Compañía Aseguradora" },
    { campo: "Tipo_Fianza", tipo: "string", obligatorio: true, Descripcion: "Tipo de Fianza o Garantía" },
    { campo: "Concepto_Fianza", tipo: "string", obligatorio: true, Descripcion: "Concepto u Obra de la Fianza o Garantía" },
    { campo: "Cobertura_Fianza", tipo: "string", obligatorio: true, Descripcion: "Cobertura de la Fianza o Garantía" },
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
    { campo: "Tipo_Documento", tipo: "string", obligatorio: true, Descripcion: "Tipo de Documento" },
    { campo: "Folio", tipo: "string", obligatorio: true, Descripcion: "Folio" },
    { campo: "Fecha_Ultimo_Registro", tipo: "date", obligatorio: true, Descripcion: "Fecha de Último Registro" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  OP01: [
    { campo: "No_Expediente", tipo: "string", obligatorio: true, Descripcion: "No. de Expediente" },
    { campo: "Clave_Contrato", tipo: "string", obligatorio: true, Descripcion: "Clave de contrato o Acuerdo" },
    { campo: "Nombre_Obra_Ubicacion", tipo: "string", obligatorio: true, Descripcion: "Nombre de Obra y Ubicación" },
    { campo: "Fecha_Contrato", tipo: "date", obligatorio: true, Descripcion: "Fecha de contrato o acuerdo" },
    { campo: "Estado_Obra", tipo: "string", obligatorio: true, Descripcion: "Estado de la Obra" },
    { campo: "Fuente_Financiamiento", tipo: "string", obligatorio: true, Descripcion: "Fuente de Financiamiento" },
    { campo: "Origen_Recurso", tipo: "string", obligatorio: true, Descripcion: "Origen de Recurso" },
    { campo: "Suficiencia_Presupuestal", tipo: "string", obligatorio: true, Descripcion: "Suficiencia Presupuestal" },
    { campo: "Monto_Contratado", tipo: "number", obligatorio: true, Descripcion: "Monto Contratado" },
    { campo: "Monto_Ejercido", tipo: "number", obligatorio: true, Descripcion: "Monto ejercido" },
    { campo: "Avance_Fisico", tipo: "number", obligatorio: true, Descripcion: "Avance Físico (%)" },
    { campo: "Avance_Financiero", tipo: "number", obligatorio: true, Descripcion: "Avance Financiero (%)" },
    { campo: "Modalidad_Contratacion", tipo: "string", obligatorio: true, Descripcion: "Modalidad de Contratación" },
  ],

  OP02: [
    { campo: "No_Expediente", tipo: "string", obligatorio: true, Descripcion: "No. de Expediente" },
    { campo: "Tipo_Obra", tipo: "string", obligatorio: true, Descripcion: "Tipo de Obra" },
    { campo: "Programa_Inversion", tipo: "string", obligatorio: true, Descripcion: "Programa de Inversión" },
    { campo: "Nombre_Obra", tipo: "string", obligatorio: true, Descripcion: "Nombre de la Obra" },
    { campo: "Municipio", tipo: "string", obligatorio: true, Descripcion: "Municipio" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Dependencia_Beneficiada", tipo: "string", obligatorio: true, Descripcion: "Dependencia Beneficiada" },
    { campo: "Ejercicio_Presupuestal", tipo: "number", obligatorio: true, Descripcion: "Ejercicio Presupuestal" },
    { campo: "Ejecutora", tipo: "string", obligatorio: true, Descripcion: "Ejecutora" },
    { campo: "Documentacion_Expediente", tipo: "string", obligatorio: true, Descripcion: "Documentación contenida en el expediente unitario de las obras" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  OP03: [
    { campo: "No_Expediente", tipo: "string", obligatorio: true, Descripcion: "No. de Expediente" },
    { campo: "Tipo_Obra", tipo: "string", obligatorio: true, Descripcion: "Tipo de Obra" },
    { campo: "Programa_Inversion", tipo: "string", obligatorio: true, Descripcion: "Programa de Inversión" },
    { campo: "Nombre_Obra", tipo: "string", obligatorio: true, Descripcion: "Nombre de la Obra" },
    { campo: "Municipio", tipo: "string", obligatorio: true, Descripcion: "Municipio" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Dependencia_Beneficiada", tipo: "string", obligatorio: true, Descripcion: "Dependencia Beneficiada" },
    { campo: "Ejercicio_Presupuestal", tipo: "number", obligatorio: true, Descripcion: "Ejercicio Presupuestal" },
    { campo: "Ejecutora", tipo: "string", obligatorio: true, Descripcion: "Ejecutora" },
    { campo: "Documentacion_Expediente", tipo: "string", obligatorio: true, Descripcion: "Documentación contenida en el expediente unitario de las obras" },
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
    { campo: "No_de_serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "No_de_patrimonio", tipo: "string", obligatorio: true, Descripcion: "No. de patrimonio" },
    { campo: "No_de_resguardo_interno", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo interno" },
    { campo: "Estado_de_uso", tipo: "string", obligatorio: true, Descripcion: "Estado de uso" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Numero_de_Empleado", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Puesto_del_usuario_resguardante", tipo: "string", obligatorio: true, Descripcion: "Puesto del usuario resguardante" },
  ],


  RM02: [
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "Color", tipo: "string", obligatorio: true, Descripcion: "Color" },
    { campo: "Placas_Matricula_Registro", tipo: "string", obligatorio: true, Descripcion: "Placas / Matrícula / Registro" },
    { campo: "No_de_serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "No_de_motor", tipo: "string", obligatorio: true, Descripcion: "No. de motor" },
    { campo: "Estado_fisico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Clave_Patrimonial", tipo: "string", obligatorio: true, Descripcion: "Clave Patrimonial" },
    { campo: "Numero_de_resguardo_interno", tipo: "string", obligatorio: true, Descripcion: "Número de resguardo interno" },
    { campo: "Numero_de_Empleado_del_resguardante", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado del resguardante" },
    { campo: "Responsable_del_uso_del_vehiculo", tipo: "string", obligatorio: true, Descripcion: "Responsable del uso del vehiculo" },
    { campo: "Cargo_de_usuario_resguardante", tipo: "string", obligatorio: true, Descripcion: "Cargo de usuario resguardante" },
  ],

  RM03: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "Serie", tipo: "string", obligatorio: true, Descripcion: "Serie" },
    { campo: "Clave_patrimonial", tipo: "string", obligatorio: true, Descripcion: "Clave patrimonial" },
    { campo: "No_de_resguardo_interno", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo interno" },
    { campo: "Numero_de_Empleado", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Estado_fisico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Ubicacion_actual", tipo: "string", obligatorio: true, Descripcion: "Ubicación actual" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM04: [
    { campo: "Clave_patrimonial", tipo: "string", obligatorio: true, Descripcion: "Clave patrimonial" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No_Serie", tipo: "string", obligatorio: true, Descripcion: "No. Serie" },
    { campo: "CANTIDAD", tipo: "number", obligatorio: true, Descripcion: "CANTIDAD" },
    { campo: "PRECIO_UNITARIO", tipo: "number", obligatorio: true, Descripcion: "PRECIO UNITARIO" },
    { campo: "PRECIO_TOTAL", tipo: "number", obligatorio: true, Descripcion: "PRECIO TOTAL" },
    { campo: "LOCALIZACION", tipo: "string", obligatorio: true, Descripcion: "LOCALIZACIÓN" },
    { campo: "ur", tipo: "string", obligatorio: true, Descripcion: "UR" }, // minúsculas como pediste
  ],

  RM05: [
    { campo: "Tipo_de_bien", tipo: "string", obligatorio: true, Descripcion: "Tipo de bien" },
    { campo: "Descripcion_del_bien", tipo: "string", obligatorio: true, Descripcion: "Descripción del bien" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No_de_serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "Estado_fisico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "Ubicacion", tipo: "string", obligatorio: true, Descripcion: "Ubicación" },
    { campo: "Nombre_del_otorgante", tipo: "string", obligatorio: true, Descripcion: "Nombre del otorgante" },
    { campo: "Fecha_de_firma_del_comodato", tipo: "date", obligatorio: true, Descripcion: "Fecha de firma del comodato" },
    { campo: "Periodo", tipo: "string", obligatorio: true, Descripcion: "Período" },
  ],

  RM06: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Tipo_de_predio", tipo: "string", obligatorio: true, Descripcion: "Tipo de predio" },
    { campo: "Superficie_m2", tipo: "number", obligatorio: true, Descripcion: "Superficie m2" },
    { campo: "Calle_y_numero", tipo: "string", obligatorio: true, Descripcion: "Calle y número" },
    { campo: "Localidad", tipo: "string", obligatorio: true, Descripcion: "Localidad" },
    { campo: "Estatus_legal", tipo: "string", obligatorio: true, Descripcion: "Estatus legal" },
    { campo: "Descripcion_de_la_situacion_juridica_y_o_administrativa", tipo: "string", obligatorio: true, Descripcion: "Descripción de la situación jurídica y/o administrativa" },
  ],

  RM07: [
    { campo: "No_DE_INVENTARIO", tipo: "string", obligatorio: true, Descripcion: "No. DE INVENTARIO" },
    { campo: "No_CTA_PREDIAL", tipo: "string", obligatorio: true, Descripcion: "No. CTA. PREDIAL" },
    { campo: "UBICACION", tipo: "string", obligatorio: true, Descripcion: "UBICACIÓN" },
    { campo: "SUPERFICIE_TERRENO_MTS2", tipo: "number", obligatorio: true, Descripcion: "SUPERFICIE TERRENO MTS2" },
    { campo: "ZONA", tipo: "string", obligatorio: true, Descripcion: "ZONA" },
    { campo: "DOCT_QUE_ACREDITA_LA_POSESION", tipo: "string", obligatorio: true, Descripcion: "DOCT. QUE ACREDITA LA POSESION" },
    { campo: "FECHA_DE_ADQUISICION", tipo: "date", obligatorio: true, Descripcion: "FECHA DE ADQUISICIÓN" },
    { campo: "COSTO_DE_ADQUISICION", tipo: "number", obligatorio: true, Descripcion: "COSTO DE ADQUISICIÓN" },
    { campo: "USO_O_DESTINO", tipo: "string", obligatorio: true, Descripcion: "USO O DESTINO" },
    { campo: "comentarios", tipo: "string", obligatorio: false, Descripcion: "COMENTARIOS" }, // minúsculas como pediste
  ],

  RM08: [
    { campo: "Numero_de_registro_y_o_inventario", tipo: "string", obligatorio: true, Descripcion: "Número de registro y/o inventario" },
    { campo: "Titulo_de_la_obra_articulo", tipo: "string", obligatorio: true, Descripcion: "Título de la obra / artículo" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Ubicacion", tipo: "string", obligatorio: true, Descripcion: "Ubicación" },
    { campo: "Certificado_de_autenticidad", tipo: "string", obligatorio: true, Descripcion: "Certificado de autenticidad" },
    { campo: "Estado_fisico", tipo: "string", obligatorio: true, Descripcion: "Estado físico" },
    { campo: "Datos_del_resguardante_Nombre", tipo: "string", obligatorio: true, Descripcion: "Datos del resguardante Nombre" },
    { campo: "Datos_del_resguardante_Puesto", tipo: "string", obligatorio: true, Descripcion: "Datos del resguardante Puesto" },
    { campo: "Datos_del_resguardante_Num_de_resguardo", tipo: "string", obligatorio: true, Descripcion: "Datos del resguardante Núm. de resguardo" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM09: [
    { campo: "Especie", tipo: "string", obligatorio: true, Descripcion: "Especie" },
    { campo: "Cantidad_de_planta_en_existencia", tipo: "number", obligatorio: true, Descripcion: "Cantidad de planta en existencia" },
    { campo: "Tipo_de_produccion", tipo: "string", obligatorio: true, Descripcion: "Tipo de producción" },
    { campo: "Fecha_de_siembra", tipo: "date", obligatorio: true, Descripcion: "Fecha de siembra" },
    { campo: "Talla", tipo: "string", obligatorio: true, Descripcion: "Talla" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM10: [
    { campo: "Nombre_comun", tipo: "string", obligatorio: true, Descripcion: "Nombre común" },
    { campo: "Nombre_cientifico", tipo: "string", obligatorio: true, Descripcion: "Nombre científico" },
    { campo: "Clave", tipo: "string", obligatorio: true, Descripcion: "Clave" },
    { campo: "Origen", tipo: "string", obligatorio: true, Descripcion: "Origen" },
    { campo: "Familia", tipo: "string", obligatorio: true, Descripcion: "Familia" },
    { campo: "Sexo", tipo: "string", obligatorio: true, Descripcion: "Sexo" },
    { campo: "Marcaje", tipo: "string", obligatorio: true, Descripcion: "Marcaje" },
    { campo: "Fecha_Alta", tipo: "date", obligatorio: true, Descripcion: "Fecha Alta" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM11: [
    { campo: "Nombre_comun_del_animal", tipo: "string", obligatorio: true, Descripcion: "Nombre común del animal" },
    { campo: "Ubicacion_fisica", tipo: "string", obligatorio: true, Descripcion: "Ubicación física" },
    { campo: "No_de_resguardo", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM12: [
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Tipo_y_calibre", tipo: "string", obligatorio: true, Descripcion: "Tipo y calibre" },
    { campo: "Marca_y_modelo", tipo: "string", obligatorio: true, Descripcion: "Marca y modelo" },
    { campo: "Matricula", tipo: "string", obligatorio: true, Descripcion: "Matrícula" },
    { campo: "No_de_serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "No_de_registro", tipo: "string", obligatorio: true, Descripcion: "No. de registro" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "Estado", tipo: "string", obligatorio: true, Descripcion: "Estado" },
    { campo: "No_de_inventario", tipo: "string", obligatorio: true, Descripcion: "No. de inventario" },
    { campo: "No_de_resguardo", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo" },
    { campo: "Numero_de_empleado_del_responsable", tipo: "number", obligatorio: true, Descripcion: "Número de empleado del responsable" },
    { campo: "Nombre_del_responsable", tipo: "string", obligatorio: true, Descripcion: "Nombre del responsable" },
    { campo: "Puesto_del_responsable", tipo: "string", obligatorio: true, Descripcion: "Puesto del responsable" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],

  RM13: [
    { campo: "Nombre_del_paquete", tipo: "string", obligatorio: true, Descripcion: "Nombre del paquete" },
    { campo: "Licencia", tipo: "string", obligatorio: true, Descripcion: "Licencia" },
    { campo: "Version", tipo: "string", obligatorio: true, Descripcion: "Versión" },
    { campo: "No_de_serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "Origen", tipo: "string", obligatorio: true, Descripcion: "Origen" },
    { campo: "Fecha_de_adquisicion", tipo: "date", obligatorio: true, Descripcion: "Fecha de adquisición" },
    { campo: "Equipo_en_que_opera", tipo: "string", obligatorio: true, Descripcion: "Equipo en que opera" },
    { campo: "Usuario", tipo: "string", obligatorio: true, Descripcion: "Usuario" },
    { campo: "Medio_de_almacenamiento", tipo: "string", obligatorio: true, Descripcion: "Medio de almacenamiento" },
    { campo: "No_de_manuales", tipo: "number", obligatorio: true, Descripcion: "No. de manuales" },
  ],

  RM14: [
    { campo: "Nombre_del_sistema_subsistema", tipo: "string", obligatorio: true, Descripcion: "Nombre del sistema / subsistema" },
    { campo: "Fase_de", tipo: "string", obligatorio: true, Descripcion: "Fase de" },
    { campo: "Fecha_de_liberacion", tipo: "date", obligatorio: true, Descripcion: "Fecha de liberación" },
    { campo: "Origen", tipo: "string", obligatorio: true, Descripcion: "Origen" },
    { campo: "Equipo_en_que_opera", tipo: "string", obligatorio: true, Descripcion: "Equipo en que opera" },
    { campo: "Medio_de_distribucion", tipo: "string", obligatorio: true, Descripcion: "Medio de distribución" },
    { campo: "Documentacion", tipo: "string", obligatorio: true, Descripcion: "Documentación" },
    { campo: "UR", tipo: "string", obligatorio: true, Descripcion: "UR" },
    { campo: "codigo_fuente", tipo: "string", obligatorio: true, Descripcion: "código fuente" },
  ],

  RM15: [
    { campo: "Descripcion_del_equipo", tipo: "string", obligatorio: true, Descripcion: "Descripción del equipo" },
    { campo: "Especificaciones", tipo: "string", obligatorio: true, Descripcion: "Especificaciones" },
    { campo: "Marca", tipo: "string", obligatorio: true, Descripcion: "Marca" },
    { campo: "Modelo", tipo: "string", obligatorio: true, Descripcion: "Modelo" },
    { campo: "No_de_serie", tipo: "string", obligatorio: true, Descripcion: "No. de serie" },
    { campo: "Estado", tipo: "string", obligatorio: true, Descripcion: "Estado" },
    { campo: "Area_de_asignacion", tipo: "string", obligatorio: true, Descripcion: "Área de asignación" },
    { campo: "Ubicacion_fisica_del_equipo", tipo: "string", obligatorio: true, Descripcion: "Ubicación física del equipo" },
    { campo: "Numero_de_Empleado_del_responsable", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado del responsable" },
    { campo: "Nombre_del_usuario_responsable", tipo: "string", obligatorio: true, Descripcion: "Nombre del usuario responsable" },
    { campo: "Puesto_del_usuario_responsable", tipo: "string", obligatorio: true, Descripcion: "Puesto del usuario responsable" },
    { campo: "No_de_resguardo", tipo: "string", obligatorio: true, Descripcion: "No. de resguardo" },
  ],

  RM16: [
    { campo: "Area", tipo: "string", obligatorio: true, Descripcion: "Área" },
    { campo: "Descripcion", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Responsable", tipo: "string", obligatorio: true, Descripcion: "Responsable" },
    { campo: "Numero_de_Empleado", tipo: "number", obligatorio: true, Descripcion: "Número de Empleado" },
    { campo: "Fecha_de_Entrega", tipo: "date", obligatorio: true, Descripcion: "Fecha de Entrega" },
    { campo: "URE", tipo: "string", obligatorio: true, Descripcion: "URE" },
    { campo: "Descripcion_2", tipo: "string", obligatorio: true, Descripcion: "Descripción" },
    { campo: "Observaciones", tipo: "string", obligatorio: false, Descripcion: "Observaciones" },
  ],





}