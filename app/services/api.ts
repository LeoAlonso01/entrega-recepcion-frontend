
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