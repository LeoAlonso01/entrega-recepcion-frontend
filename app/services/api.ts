const apiURL = "http://localhost:8000";

export const createActa = async (actaData: any) => {
  try {
    const response = await fetch(`${apiURL}/actas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(actaData),
    });
    return response.json();
  } catch (error) {
    console.error('Error creating acta:', error);
    throw error;
  }
};

export const getActas = async () => {
    try {
        const response = await fetch(`${apiURL}/actas`);
        return response.json();
        
    } catch (error) {
        return error;

    }

}

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${apiURL}/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response);
    return response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Tipos para cargos
export interface CargoPayload {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CargoResponse {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  is_deleted?: boolean;
}

// Crear cargo
export const createCargo = async (payload: CargoPayload): Promise<CargoResponse | { detail: string }> => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${apiURL}/cargos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.status === 201) {
      return await response.json();
    } else {
      const error = await response.json();
      return { detail: error.detail || 'Error al crear el cargo' };
    }
  } catch (error: any) {
    throw new Error(error?.message || 'Error de red o servidor');
  }
};