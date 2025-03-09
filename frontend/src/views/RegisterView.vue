<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore.ts";
import { useUserStore } from "@/stores/UserStore.ts";

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const email = ref("");
const pseudo = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

const handleRegister = async () => {
  if (!email.value || !pseudo.value || !password.value || !confirmPassword.value) {
    errorMessage.value = "Veuillez remplir tous les champs.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  const success = await authStore.register(email.value, pseudo.value ,password.value, confirmPassword.value);
  if (success) {
    await userStore.fetchUserFromToken();
    router.push("/login");
  } else {
    errorMessage.value = "Erreur lors de l'inscription.";
  }
};
</script>

<template>
  <section class="py-5">
    <div class="container py-5">
      <div class="row mb-4 mb-lg-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <h2 class="fw-bold">Créez un compte</h2>
        </div>
      </div>
      <div class="row d-flex justify-content-center">
        <div class="col-md-6 col-xl-4">
          <div class="card">
            <div class="card-body text-center d-flex flex-column align-items-center">
              <form @submit.prevent="handleRegister" data-bs-theme="light">
                <div class="mb-3">
                  <input v-model="pseudo" class="form-control" placeholder="Nom d'utilisateur" />
                </div>
                <div class="mb-3">
                  <input v-model="email" class="form-control" type="email" placeholder="Adresse email" />
                </div>
                <div class="mb-3">
                  <input v-model="password" class="form-control" type="password" placeholder="Mot de passe" />
                </div>
                <div class="mb-3">
                  <input v-model="confirmPassword" class="form-control" type="password" placeholder="Confirmez le mot de passe" />
                </div>
                <div class="mb-3">
                  <button class="btn btn-primary shadow d-block w-100" type="submit">S'inscrire</button>
                </div>
              </form>
              <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
              <p class="text-muted">Déjà un compte ? <router-link to="/login">Connectez-vous</router-link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  border: none;
}
</style>
