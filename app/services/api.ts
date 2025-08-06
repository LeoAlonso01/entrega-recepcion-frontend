
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
}