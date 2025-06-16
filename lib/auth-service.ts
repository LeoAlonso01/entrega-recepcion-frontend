// Auth Service (lib/auth-service.ts)
import {api} from './api-service'; 

interface User {
  id: string;
  email: string;
  name: string;
}
export const login = async (email: string, password: string): Promise<{ user: User }> => {
  const response = await api.post("/token", { email, password });
  return { user: response.data.user };
};

export const authService = {
  login: async (email: string, password: string) => { /* ... */ },
  register: async (userData: User) => {
    const response = await api.post("/register", userData);
    return response.data;
  },
  logout: async () => {
    await api.post("/logout");
  },
  getProfile: async () => {
    const response = await api.get("/me");
    return response.data;
  },
};