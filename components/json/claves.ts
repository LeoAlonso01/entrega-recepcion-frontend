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
