// lib/estructuras.ts por ahora en el mismo archivo
export const EstructuraDatosPorClave: Record<string, string[]> = {
  // Marco Jurídico
  MJ01: ["ORDENAMIENTO", "TITULO", "FECHA DE EMISION"], // CHECKED
  AR01: ["ASUNTO", "DESCRIPCION", "FECHA INICIO", "RESPONSABLE", "ESTATUS"],

  // planeacion 
  PP02: ["Tipo de Documento", "Nombre", "Fecha", "Observaciones"],

  // organizacion
  EO02: ["Tipo", "Fecha Actualización, Autorización ó Publicación", "Observaciones"],

  // Recursos Humanos
  RH01: ["NUMERO DE EMPLEADO", "NOMBRE", "R.F.C.", "PLAZA (CATEGORÍA)", "TIPO", "FECHA DE INGRESO", "SUELDO", "OTRAS PERCEPCIONES", "TOTAL", "UNIDAD DE ADSCRIPCIÓN (UPP)", "ÁREA LABORAL (UR)", "ESTATUS", "OBSERVACIONES"],
  RH02: ["NOMBRE", "RFC", "FECHA DE INICIO DE CONTRATO", "FECHA FIN DE CONTRATO", "FUENTE DE RECURSO", "ACTIVIDADES A DESARROLLAR", "FECHA DE INGRESO", "SUELDO", "OTRAS PERCEPCIONES", "TOTAL", "UNIDAD DE ADSCRIPCIÓN (UPP)", "ÁREA LABORAL (UR)", "OBSERVACIONES"],
  RH03: ["NUMERO DE EMPLEADO", "NOMBRE", "R.F.C.", "CATEGORÍA: DENOMINACIÓN", "TIPO", "UNIDAD DE ADSCRIPCIÓN (UPP)", "COMISIONADO A: UR", "REFERENCIA DOCUMENTAL (OFICIO)", "FOLIO DE OFICIO DE COMISIÓN", "INICIO DE COMISIÓN", "FIN DE COMISIÓN", "SUELDO", "OTRAS PERCEPCIONES", "OBSERVACIONES"],
  RH04: ["NOMBRE", "R.F.C.", "FECHA INICIO DE CONTRATO", "FECHA FIN DE CONTRATO", "FUENTE DEL RECURSO", "ACTIVIDADES A DESARROLLAR", "SALARIO", "OTRA PERCEPCIÓN", "TOTAL", "UNIDAD DE ADSCRIPCION (UPP)", "ÁREA LABORAL(UR)", "OBSERVACIONES"],


  // Derechos y Obligaciones
  DO01: ["NOMBRE Y PUESTO DEL SERVIDOR QUE OTORGA EL PODER", "TIPO DE PODER OTORGADO", "ESPECIFICAR", "FECHA DE EXPEDICIÓN", "NOTARIO No.", "INSCRITO EN EL REGISTRO PÚBLICO DE LA PROPIEDAD Y COMERCIO", "OBSERVACIONES"],
  DO02: ["DATOS DE LA SESIÓN: No. DE SESIÓN", "DATOS DE LA SESIÓN: FECHA", "DATOS DE LA SESIÓN: ORD/EXT", "DATOS DEL ACUERDO: NÚMERO", "DATOS DEL ACUERDO: DESCRIPCIÓN BREVE", "DATOS DEL ACUERDO: RESPONSABLE", "DATOS DEL ACUERDO: ÁREAS INVOLUCRADAS", "ESTATUS DEL ACUERDO: % DE AVANCE", "ESTATUS DEL ACUERDO: COMENTARIOS"],
  DO03: ["AUDITORÍA REALIZADA POR:", "PERIODO AUDITADO DE:", "PERIODO AUDITADO A:", "TIPO DE AUDITORIA", "OBSERVACIONES: No.", "OBSERVACIONES: ATENDIDAS", "OBSERVACIONES: PENDIENTES", "SITUACIÓN ACTUAL"],
  DO04: ["CARGO", "CON DERECHO A:", "FECHA DE INICIO DEL CARGO", "PERIODICIDAD CON QUE SE REÚNEN", "OBSERVACIONES"],


  // Recursos Presupuestales
  RF01: ["PARTIDA", "DENOMINACION","PRESUPUESTO: AUTORIZADO","PRESUPUESTO: AMPLIACIONES Y/O REDUCCIONES", "PRESUPUESTO: MODIFICADO", "PRESUPUESTO: EJERCIDO", "PRESUPUESTO: POR EJERCER"],
  RF02: ["PARTIDA", "DESCRIPCION", "PRESUPUESTO: AUTORIZADO", "PRESUPUESTO: AMPLIACIONES Y/O REDUCCIONES", "MODIFICADO", "EJERCIDO", "POR EJERCER"],
  RF03: ["RAMO", "PROGRAMA", "DEPENDENCIA EJECUTORA", "NÚMERO DEL CONVENIO O REFERENCIA DE LA AUTORIZACIÓN", "IMPORTE: APROBADO", "IMPORTE: MODIFICADO", "IMPORTE: EJERCIDO", "IMPORTE: POR EJERCER", "IMPORTE: NUMERO DE ACCIONES", "ACCIONES: APROBADAS","ACCIONES: EJECUTADAS", "ACCIONES: PENDENTES","OBSERVACIONES"],
  RF04: ["NOMBRE DEL PROGRAMA", "NUMERO DEL CAPITULO", "NOMBRE DEL CAPITULO", "PRESUPUESTO", "AUTORIZADO", "AMPLIACIONES Y/O REDUCCIONES", "MODIFICADO", "EJERCIDO", "POR EJERCER"],
  RF05: ["INSTITUCION BANCARIA", "CLAVE DE SUCURSAL", "TIPO DE CUENTA", "NUMERO DE CUENTA", "FIRMAS REGISTRADAS", "NOMBRE", "CARGO", "FOLIO DEL ULTIMO CHEQUE EXPEDIDO","SALDO SEGUN BANCO","CARGOS NO CORRESPONDIDOS", "ABONOS NO CORRESPONDIDOS", "SALDO SEGUN REGISTROS", "RESPONSABLE DEL MANEJO"],
  RF06: ["OFICIO DE AUTORIZACION NUM.", "DE FECHA", "NOMBRE DEL RESPONSABLE", "CARGO DEL RESPONSABLE", "IMPORTE AL VERIFICAR","DESTINO DEL FONDO ASIGNADO", "RESULTADO DEL ULTIMO ARQUEO PRACTICADO","SALDO EN CUENTA DE CHEQUES", "NO. DE CUENTA", "BANCO", "BANCO", "FECHA", "SALDO", "MONTO DISPONIBLE EN EFECTIVO", "COMPROBANTES", "ACREEDORES DIVERSOS", "DEUDORES DIVERSOS", "DOCUMENTOS POR RECUPERAR"],
  RF07: ["NUMERO DE FOLIO DEL CONTRARECIBO", "NOMBRE DEL BENEFICIARIO", "FECHA DE RECEPCION", "NUMERO DE ESTIMACION O FACTURA", "IMPORTE TOTAL", "OBSERVACIONES"],
  RF08: ["FECHA", "NUMERO DE CHEQUE", "CUENTA", "BANCO", "MONTO", "BENEFICIARIO", "CONCEPTO"],
  RF09: ["ÁREA GENERADORA DEL INGRESO", "CONCEPTO QUE DA ORIGEN AL INGRESO", "FECHA DEL INGRESO", "DOCUMENTO QUE IDENTIFICA AL INGRESO", "IMPORTE DEL INGRESO: MONTO", "IMPORTE DEL INGRESO: CUENTA BANCARIA DONDE SE DEPOSITARA", ""],
  RF11: ["NOMBRE DEL DEUDOR", "CONCEPTO", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: FECHA", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: TIPO", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: FOLIO", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: IMPORTE", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: FECHA DE VENCIMIENTO", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: NUMERO CONTABLE", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: TITULO", "DOCUMENTO QUE ACREDITA LA CUENTA POR COBRAR: SALDO VENCIDO", "OBSERVACIONES"],
  RF12: ["CONCEPTO", "DOCUMENTO QUE ACREDITA LA CUENTA POR PAGAR: FECHA", "DOCUMENTO QUE ACREDITA LA CUENTA POR PAGAR: TIPO", "DOCUMENTO QUE ACREDITA LA CUENTA POR PAGAR: FOLIO", "DOCUMENTO QUE ACREDITA LA CUENTA POR PAGAR: DEPENDENCIA", "DOCUMENTO QUE ACREDITA LA CUENTA POR PAGAR: PARTIDA", "DOCUMENTO QUE ACREDITA LA CUENTA POR PAGAR: FECHA DE VENCIMIENTO", "DATOS DE LA CUENTA POR PAGAR: NÚMERO", "DATOS DE LA CUENTA POR PAGAR: TÍTULO", "DATOS DE LA CUENTA POR PAGAR: SALDO VENCIDO", "OBSERVACIONES"],
  RF13: ["CONCEPTO DEL IMPUESTO", "ENTEROS PROVISIONALES: PERIODO; POR PAGAR", "ENTEROS PROVISIONALES: PERIODO; T/D", "ENTEROS PROVISIONALES: IMPORTE; CLAVE", "ENTEROS PROVISIONALES: MULTAS Y RECARGOS", "DECLARACIONES ANUALES: PRESENTADAS", "DECLARACIONES ANUALES: POR PRESENTAR", "DECLARACIONES ANUALES: AÑO"],
  RF14: ["TIPO DE POLIZA", "COMPAÑIA", "MONTO", "COBERTURA", "VIGENCIA","DEL","HASTA", "OBSERVACIONES"],
  RF15: ["COMPAÑIA ASEGURADORA", "TIPO DE FIANZA O GARANTIA", "CONCEPTO U OBRA DE LA FIANZA O GARANTÍA", "COBERTURA DE LA FIANZA O GARANTÍA", "MONTO DE LA FIANZA O GARANTÍA", "VIGENCIA DE LA FIANZA O GARANTÍA","VIGENCIA","DEL","AL","OBSERVACIONES"],
  RF16: ["DESCRIPCION DEL CONVENIO O CONTRATO", "NOMBRE QUIEN CONVIENE O CONTRATA POR LA UNIDA RESPONSABLE", "IMPORTE", "PERIODO"],
  RF17: ["TIPO DE DOCUMENTO", "FOLIO", "DEL", "AL", "FECHA DE ULTIMO REGISTRO", "OBSERVACIONES"],


  // Contratos y Convenios
  CCL01: ["TIPO DE INSTRUMENTO", "OBJETIVO", "PARTES INVOLUCRADAS", "VIGENCIA", "IMPORTE CONVENIDO", "OBSERVACIONES"],
  CCL02: ["NOMBRE", "DESCRIPCION", "ORIGEN", "RECUPERACION PRESUPUESTAL", "VIGENCIA", "ACCIONES RELEVANTES POR CONCLUIR"],
  CCL03: ["DATOS DEL CONTRATO"  , "MONTO", "OBJETIVO", "FECHA INICIO", "FECHA FIN"],

  // Estructura Interna
  

  // Recursos Materiales
  RM01: ["Descripción", "Marca", "Modelo", "No. de serie", "No. de patrimonio", "No. de resguardo interno", "Estado de uso", "UR", "Número de Empleado", "Responsable", "Puesto del usuario resguardante"],
  RM02: ["Marca", "Modelo", "Color", "Placas / Matrícula / Registro", "No. de serie", "No. de motor", "Estado físico", "UR", "Clave Patrimonial", "Número de resguardo interno", "Número de Empleado del resguardante", "Responsable del uso del vehiculo", "Cargo de usuario resguardante"],
  RM03: ["Descripción", "Marca", "Modelo", "Serie", "Clave patrimonial", "No. de resguardo interno", "Número de Empleado", "Responsable", "Estado físico", "UR", "Ubicación actual", "Observaciones"],
  RM04: ["Clave patrimonial", "Descripción", "Marca", "Modelo", "No. Serie", "CANTIDAD", "PRECIO UNITARIO", "PRECIO TOTAL", "LOCALIZACIÓN", "UR"],
  RM05: ["Tipo de bien", "Descripción del bien", "Marca", "Modelo", "No. de serie", "Estado físico", "Ubicación", "Nombre del otorgante", "Fecha de firma del comodato", "Período"],
  RM06: ["Descripción", "Tipo de predio", "Superficie m2", "Calle y número", "Localidad", "Estatus legal", "Descripción de la situación jurídica y/o administrativa"],
  RM07: ["No. DE INVENTARIO", "No. CTA. PREDIAL", "UBICACIÓN", "SUPERFICIE TERRENO MTS2", "ZONA", "DOCT. QUE ACREDITA LA POSESION", "FECHA DE ADQUISICIÓN", "COSTO DE ADQUISICIÓN", "USO O DESTINO", "COMENTARIOS"],
  RM08: ["Número de registro y/o inventario", "Título de la obra / artículo", "Descripción", "Ubicación", "Certificado de autenticidad", "Estado físico", "Datos del resguardante Nombre", "Datos del resguardante Puesto", "Datos del resguardante Núm. de resguardo", "Observaciones"],
  RM09: ["Especie", "Cantidad de planta en existencia", "Tipo de producción", "Fecha de siembra", "Talla", "Observaciones"],
  RM10: ["Nombre común", "Nombre científico", "Clave", "Origen", "Familia", "Sexo", "Marcaje", "Fecha Alta", "Observaciones"],
  RM11: ["Nombre común del animal", "Ubicación física", "No. de resguardo", "Observaciones"],
  RM12: ["Descripción", "Tipo y calibre", "Marca y modelo", "Matrícula", "No. de serie", "No. de registro", "UR", "Estado", "No. de inventario", "No. de resguardo", "Número de empleado del responsable", "Nombre del responsable", "Puesto del responsable", "Observaciones"],
  RM13: ["Nombre del paquete", "Licencia", "Versión", "No. de serie", "Origen", "Fecha de adquisición", "Equipo en que opera", "Usuario", "Medio de almacenamiento", "No. de manuales"],
  RM14: ["Nombre del sistema / subsistema", "Fase de", "Fecha de liberación", "Origen", "Equipo en que opera", "Medio de distribución", "Documentación", "UR", "código fuente"],
  RM15: ["Descripción del equipo", "Especificaciones", "Marca", "Modelo", "No. de serie", "Estado", "Área de asignación", "Ubicación física del equipo", "Número de Empleado del responsable", "Nombre del usuario responsable", "Puesto del usuario responsable", "No. de resguardo"],
  RM16: ["Área", "Descripción", "Responsable", "Número de Empleado", "Fecha de Entrega", "URE", "Descripción.1", "Observaciones"],
  

  // Obra Publica
  OP01: ["No. de Expediente", "Clave de contrato o Acuerdo", "Nombre de Obra y Ubicación", "Fecha de contrato o acuerdo", "Estado de la Obra", "Fuente de Financiamiento", "Origen de Recurso", "Suficiencia Presupuestal", "Monto Contratado", "Monto ejercido", "Avance Físico (%)", "Avance Financiero (%)", "Modalidad de Contratación"],
  OP02: ["No. de Expediente", "Tipo de Obra", "Programa de Inversión", "Nombre de la Obra", "Municipio", "Localidad", "Dependencia Beneficiada", "Ejercicio Presupuestal", "Ejecutora", "Documentación contenida en el expediente unitario de las obras", "Observaciones"],
  OP03: ["No. de Expediente", "Tipo de Obra", "Programa de Inversión", "Nombre de la Obra", "Municipio", "Localidad", "Dependencia Beneficiada", "Ejercicio Presupuestal", "Ejecutora", "Documentación contenida en el expediente unitario de las obras", "Observaciones"],
  OP04: ["LICITACIÓN", "OBRA", "LOCALIDAD", "MUNICIPIO", "ÁREA OPERATIVA", "TRÁMITE ACTUAL", "OBSERVACIONES"],

  // Documentación y Archivo
  DA01: ["SISTEMA", "FRECUENCIA", "ULTIMO_RESPALDO", "RESPONSABLE"],
  DA02: ["TITULO", "AUTOR", "TIPO", "UBICACION"],
  DA03: ["TIPO", "DESCRIPCION", "FECHA_INICIO", "FECHA_FIN", "RESPONSABLE"],
  DA04: ["TIPO", "DESCRIPCION", "FECHA_INICIO", "FECHA_FIN", "RESPONSABLE"],
  DA05: ["TIPO", "DESCRIPCION", "FECHA_INICIO", "FECHA_FIN", "RESPONSABLE"],
  DA07: ["EXPEDIENTE", "PROYECTO", "UBICACION", "RESPONSABLE"],

  // archivos documegntales e Informaticos
  ADI01: ["Nombre del sistema, programa o archivo", "Descripción", "Tipo de respaldo", "Periodicidad del respaldo", "Medio", "Fecha", "Nombre del responsable", "Puesto del responsable", "Observaciones"],
  ADI02: ["No. de clasificación", "Título", "Acervo bibliográfico Autor", "Acervo bibliográfico Editorial", "Acervo bibliográfico Fecha de publicación", "Acervo bibliográfico No. de tomos", "Acervo hemerográfico Fecha del", "Acervo hemerográfico Fecha hasta", "Acervo hemerográfico No. de ejemplares", "Estado físico"],

  //Control y Fiscalizacion
  CF01: ["Unidad Responsable Solicitante", "Adquisición", "Pedido", "Trámite Actual"],
  CF02: ["Asunto", "Fecha de Inicio", "Situación actual", "Observaciones"],

  // Informe de Gestion
  IG01: ["Clave documento o expediente", "Contenido del acrhivo o expediente", "Unidad De concentración"],
  IG02: ["Tipo de Acta", "Número de Acta", "Fecha de Acta", "Descripción", "Observaciones"],

  //Transparencia y acceso a la información
  TAI01: ["Fecha de Solicitud", "Área que atiende", "No. De Expediente o Solicitud", "Estado de Solicitud", "Fecha Límite de Respuesta", "Recurso de Revisión", "Status Actual"],

  // Convenios y Contratos
  CC01: ["Tipo de Instrumento", "Objetivo", "Partes Involucradas", "Vigencia", "Importe Convenido", "Observaciones"],
  CC02: ["Nombre", "Descripción", "Origen", "Repercución Presupuestal", "Vigencia", "Acciones Relevantes por Concluir"],


  // Por defecto
  default: ["*"]
};

export const CALVES_CON_PDF: Record<string, string[]> = {
  PP01: ["url", "blob"],
  ENI01: ["url", "blob"]
}

// categhorias o Rubros 
export const CATEGORIAS: { id: string; nombre_categoria: string }[] = [
 {
  "id": "1",
  "nombre_categoria": "RECURSOS PRESUPUESTALES Y FINANCIEROS"
 },
 {
  "id": "2",
  "nombre_categoria": "CONTRATOS, CONVENIOS Y LICITACIONES"
 },
 {
  "id": "3",
  "nombre_categoria": "ESTRUCTURA Y NORMATIVA INTERNA"
 },
 {
  "id": "4",
  "nombre_categoria": "RECURSOS HUMANOS"
 },
 {
  "id": "5",
  "nombre_categoria": "INVENTARIO DE BIENES MUEBLES E INMUEBLES"
 },
 {
  "id": "6",
  "nombre_categoria": "SEGURIDAD Y CONTROL DE ACCESOS"
 },
 {
  "id": "7",
  "nombre_categoria": "DOCUMENTACIÓN Y ARCHIVO"
 },
 {
  "id": "8",
  "nombre_categoria": "ASUNTOS LEGALES Y DE AUDITORÍA"
 },
 {
  "id": "9",
  "nombre_categoria": "PROGRAMAS Y PROYECTOS:"
 },
 {
  "id": "10",
  "nombre_categoria": "TRANSPARENCIA"
 },
 {
  "id": "11",
  "nombre_categoria": "OTROS"
 },
 {
  "id": "12",
  "nombre_categoria": "SISTEMA DE GESTIÓN DE CALIDAD"
 }
];