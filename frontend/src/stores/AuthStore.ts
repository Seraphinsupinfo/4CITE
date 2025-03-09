import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/axiosConfig.ts";
import {useRouter} from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email:email, password:password }
      );

      token.value = response.data.access_token;
      console.log(response.data.access_token)
      localStorage.setItem("token", response.data.access_token);

      return true;
    } catch (error) {
      console.error("Erreur de connexion :", error);
      return false;
    }
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem("token");
    window.location.reload();
  };

  return { token, login, logout };
});
