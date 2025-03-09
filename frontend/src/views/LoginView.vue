<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {useAuthStore} from "@/stores/AuthStore.ts";
import {useUserStore} from "@/stores/UserStore.ts";

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Veuillez remplir tous les champs.";
    return;
  }

  const success = await authStore.login(email.value, password.value);
  await userStore.fetchUserFromToken();
  if (success) {
    router.push("/");
  } else {
    errorMessage.value = "Email ou mot de passe incorrect.";
  }
};
</script>

<template>
  <section class="py-5">
    <div class="container py-5">
      <div class="row mb-4 mb-lg-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <h2 class="fw-bold">Bon retour parmi nous !</h2>
        </div>
      </div>
      <div class="row d-flex justify-content-center">
        <div class="col-md-6 col-xl-4">
          <div class="card">
            <div class="card-body text-center d-flex flex-column align-items-center">
              <div class="bs-icon-xl bs-icon-circle bs-icon-primary shadow bs-icon my-4"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi bi-person">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"></path>
              </svg></div>
              <form @submit.prevent="handleLogin" data-bs-theme="light">
                <div class="mb-3">
                  <input v-model="email" class="form-control" type="email" placeholder="Adresse email" />
                </div>
                <div class="mb-3">
                  <input v-model="password" class="form-control" type="password" placeholder="Mot de passe" />
                </div>
                <div class="mb-3">
                  <button class="btn-blue btn btn-primary shadow d-block w-100" type="submit">Se connecter</button>
                </div>
              </form>
              <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
              <p class="text-muted">Mot de passe oublié ?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card{
  border: none;
}
</style>
