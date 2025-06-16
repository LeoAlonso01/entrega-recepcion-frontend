// lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:8000",
  withCredentials: true, // Para cookies en autenticación
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    throw new Error(error.response?.data?.message || "Request failed");
  }
);

export const login = (email: string, password: string) => {
  return api.post("/token", { email, password });
};

// Uso igual que con Fetch, pero con sintaxis más limpia.

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango de 2xx
            console.error("Error en la respuesta del servidor:", error.response.data);
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            console.error("No se recibió respuesta del servidor:", error.request);
        } else {
            // Algo sucedió al configurar la solicitud que provocó un error
            console.error("Error al configurar la solicitud:", error.message);
        }
        return Promise.reject(error);
    }
);

