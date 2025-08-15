const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Responsable {
    id:number;
    nombre: string;
}

export interface Unidad {
    id_unidad: number;
    nombre: string;
    responsable: Responsable;
}

export async function UnidadesPorUsuario(usuarioId: number): Promise<Unidad> {
  const response = await fetch(`${API_URL}/unidad_por_usuario/${usuarioId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Error al obtener la unidad");
  }

  const data = await response.json();

  return {
    id_unidad: data.id_unidad,
    nombre: data.nombre,
    responsable: {
      id: data.responsable?.id || 0,
      nombre: data.responsable?.nombre || ""
    }
  };
}
