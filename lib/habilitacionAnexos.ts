import { claves_anexos } from "./anexosCatalogo";
import { ESTRUCTURA_DATOS_POR_CLAVE } from "./estructuraPorClave";

export const clavesHabilitables = claves_anexos.filter(item =>
  Object.prototype.hasOwnProperty.call(ESTRUCTURA_DATOS_POR_CLAVE, item.clave)
);
const clavesValidas = new Set<string>(clavesHabilitables.map(item => item.clave));

export function normalizarClaveAnexo(clave: string): string {
  return clave.trim().toUpperCase().replace(/^RRH(?=\d)/, "RH");
}

export function validarClavesHabilitadas(valor: unknown): string[] {
  if (!Array.isArray(valor)) throw new Error("La asignación no es válida");
  if (!valor.every(clave => typeof clave === "string" && clavesValidas.has(clave))) {
    throw new Error("La asignación contiene claves desconocidas o sin estructura");
  }
  return Array.from(new Set(valor));
}

type AnexoConteo = {
  creador_id: number;
  clave: string;
  estado: string;
  is_deleted?: boolean;
};

export function contarAnexosUsuario(usuarioId: number, claves: string[], anexos: AnexoConteo[]) {
  const propios = anexos.filter(anexo => !anexo.is_deleted && Number(anexo.creador_id) === usuarioId);
  const creadas = new Set(propios.map(anexo => normalizarClaveAnexo(anexo.clave)));
  const completadas = new Set(propios.filter(anexo => anexo.estado === "Completado")
    .map(anexo => normalizarClaveAnexo(anexo.clave)));
  return {
    registros: propios.length,
    habilitadas: claves.length,
    creadas: claves.filter(clave => creadas.has(clave)).length,
    completadas: claves.filter(clave => completadas.has(clave)).length,
    pendientes: claves.filter(clave => !completadas.has(clave)).length,
    sinCrear: claves.filter(clave => !creadas.has(clave)).length,
    creadasPorClave: creadas,
    completadasPorClave: completadas,
  };
}
