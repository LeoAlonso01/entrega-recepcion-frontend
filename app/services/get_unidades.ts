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

export async function UnidadesPorUsuario(usuarioId: number): Promise<Unidad>{
    const response = await fetch(`${API_URL}/unidad_por_usuario/${usuarioId}/unidad`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (!response.ok) {
        throw new Error("Error al obtener la unidad")
    }

    // solo se responden los datos necesarios
    const data = await response.json()
      return {
    id_unidad: data.id_unidad,
    nombre: data.nombre,
    responsable: {
      id: data.responsable_id ?? data.responsable?.id,
      nombre: data.responsable?.nombre || ""
    }
  };
}