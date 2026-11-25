import type { normalizarActaPdf } from "./actaPdfData";

type Acta = ReturnType<typeof normalizarActaPdf>;
const identificacion = (ine: string) => ine ? `, quien se identifica con credencial del Instituto Nacional Electoral número ${ine}` : "";
const fecha = (value: string) => value ? ` de fecha ${value}` : "";
const hora = (value: string) => value ? `, a las ${value} horas` : "";
const asignaciones: Record<string, string> = { nombramiento: "nombramiento", designacion: "designación", jerarquia: "jerarquía" };
const autoridades: Record<string, string> = { rectoria: "Rectoría", h_consejo: "H. Consejo" };

function nombramiento(rol: "entrante" | "saliente", documento: string, tipo: string, autoridad: string, fechaDocumento = "") {
  if (!documento && !tipo && !autoridad && !fechaDocumento) return "";
  const inicio = rol === "entrante" ? "La persona entrante asume las funciones de la unidad" : "La persona saliente acredita el encargo de la unidad";
  return `${inicio}${tipo ? ` mediante ${asignaciones[tipo] || tipo}` : ""}${documento ? `, según documento número ${documento}` : ""}${fecha(fechaDocumento)}${autoridad ? `, emitido por ${autoridades[autoridad] || autoridad}` : ""}.`;
}

function presentar(rol: "entrante" | "saliente", nombre: string, ine: string, domicilio: string, telefono: string, fechaEfectos: string) {
  const inicio = rol === "saliente" ? "Comparece" : "Asimismo comparece";
  const direccion = domicilio ? `${ine ? " y señala" : ", quien señala"} como domicilio para recibir notificaciones y documentos relacionados con la presente acta el ubicado en ${domicilio}` : "";
  const accion = rol === "saliente" ? "hace entrega de la unidad" : "recibe la unidad";
  const efectos = fechaEfectos ? ` y ${rol === "saliente" ? "concluye" : "inicia"} sus labores el ${fechaEfectos}` : "";
  return `${inicio} ${nombre}${identificacion(ine)}${direccion}, en su carácter de persona servidora pública ${rol}, quien ${accion}${efectos}.${telefono ? ` Teléfono de contacto: ${telefono}.` : ""}`;
}

export function parrafosComparecencia(acta: Acta): string[] {
  // Las actas anteriores a la captura homologada no tienen estos campos.
  // Conservan su redacción original hasta que sus datos se editen expresamente.
  const homologada = !!(acta.lugar || acta.ineSaliente || acta.domicilioSaliente || acta.telefonoSaliente ||
    acta.nombramientoSaliente || acta.asignacionSaliente || acta.asignadoPorSaliente);
  const apertura = acta.lugar
    ? `En ${acta.lugar}, el día ${acta.fecha}${hora(acta.hora)}, se levanta la presente Acta Administrativa de Entrega-Recepción de la unidad responsable denominada ${acta.unidad}.`
    : `Se levanta la presente Acta Administrativa de Entrega-Recepción de la unidad responsable denominada ${acta.unidad}, el día ${acta.fecha}${hora(acta.hora)}.`;
  if (!homologada) return [
    apertura,
    `Comparece ${acta.saliente}, en su carácter de persona servidora pública saliente${identificacion(acta.ineSaliente)}${acta.domicilioSaliente ? `, con domicilio para notificaciones en ${acta.domicilioSaliente}` : ""}, quien hace entrega de la unidad${acta.finLabores ? ` y concluye sus labores el ${acta.finLabores}` : ""}.`,
    `Asimismo comparece ${acta.entrante}, en su carácter de persona servidora pública entrante${identificacion(acta.ineEntrante)}${acta.domicilioEntrante ? `, con domicilio para notificaciones en ${acta.domicilioEntrante}` : ""}, quien recibe la unidad${acta.inicioLabores ? ` e inicia sus labores el ${acta.inicioLabores}` : ""}.${acta.telefonoEntrante ? ` Teléfono de contacto: ${acta.telefonoEntrante}.` : ""}`,
    nombramiento("entrante", acta.nombramiento, acta.asignacion, acta.asignadoPor, acta.fechaNombramiento),
  ].filter(Boolean);
  return [
    apertura,
    presentar("saliente", acta.saliente, acta.ineSaliente, acta.domicilioSaliente, acta.telefonoSaliente, acta.finLabores),
    nombramiento("saliente", acta.nombramientoSaliente, acta.asignacionSaliente, acta.asignadoPorSaliente),
    presentar("entrante", acta.entrante, acta.ineEntrante, acta.domicilioEntrante, acta.telefonoEntrante, acta.inicioLabores),
    nombramiento("entrante", acta.nombramiento, acta.asignacion, acta.asignadoPor, acta.fechaNombramiento),
  ].filter(Boolean);
}
