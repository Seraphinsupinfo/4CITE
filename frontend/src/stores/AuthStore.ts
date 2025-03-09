import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/axiosConfig.ts";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      token.value = response.data.access_token;
      localStorage.setItem("token", response.data.access_token);

      return true;
    } catch (error) {
      console.error("Erreur de connexion :", error);
      return false;
    }
  };

  const register = async (email: string, pseudo: string, password: string, confirmPassword: string) => {
    try {
      const response = await api.post("/users", { email, pseudo, password, confirmPassword });

      token.value = response.data.access_token;
      localStorage.setItem("token", response.data.access_token);

      return true;
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      return false;
    }
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem("token");
    window.location.reload();
  };

  return { token, login, register, logout };
});
