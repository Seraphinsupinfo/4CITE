import { defineStore } from "pinia";

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null") as User | null,
    isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  }),

  actions: {
    login(user: User) {
      this.user = user;
      this.isLoggedIn = true;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
    },

    logout() {
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    },

    updateUser(updatedUser: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(this.user));
      }
    },
  },
});
