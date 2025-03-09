import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/axiosConfig.ts";
import { jwtDecode } from "jwt-decode";

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

  const updateUserData = async (
    email: string,
    pseudo: string,
    actualPassword: string,
    newPassword: string | null = null,
    confirmNewPassword: string | null = null
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé, déconnexion...");
      logout();
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const { id, role } = decoded;

      const updatedData: Record<string, string | null> = {
        email,
        pseudo,
        actualPassword,
      };
      if (newPassword && confirmNewPassword) {
        updatedData.newPassword = newPassword;
        updatedData.confirmNewPassword = confirmNewPassword;
      }

      await api.put(`/users/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      user.value = { ...user.value, email, pseudo };
      localStorage.setItem("user", JSON.stringify(user.value));

      console.log("Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    }
  };

  const logout = () => {
    user.value = null;
    isLoggedIn.value = false;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const getUser = async () => {
    return user.value;
  };

  return { user, isLoggedIn, fetchUserFromToken, logout, getUser, updateUserData };
});
