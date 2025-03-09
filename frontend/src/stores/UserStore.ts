import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/axiosConfig.ts";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  id: string;
  pseudo: string;
  role: string;
  exp: number;
}

interface User {
  id: string;
  pseudo: string;
  email: string;
  role: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(
      localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
  );
  const isLoggedIn = ref(localStorage.getItem("token") !== null);

  const fetchUserFromToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      isLoggedIn.value = false;
      user.value = null;
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const { id, pseudo, role } = decoded;

      const response = await api.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      user.value = { id, pseudo, email: response.data.email, role };

      localStorage.setItem("user", JSON.stringify(user.value));
      isLoggedIn.value = true;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      logout();
    }
  };

  // Déconnexion
  const logout = () => {
    user.value = null;
    isLoggedIn.value = false;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const getUser = async () => {
    return user.value;
  }
  return { user, isLoggedIn, fetchUserFromToken, logout, getUser };
});
