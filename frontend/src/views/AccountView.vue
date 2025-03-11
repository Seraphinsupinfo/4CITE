<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/UserStore.ts';
import { useAuthStore } from "@/stores/AuthStore.ts";
import { useRouter } from "vue-router";
import api from "@/services/axiosConfig.ts";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const email = ref(userStore.user?.email || '');
const pseudo = ref(userStore.user?.pseudo || '');
const actualPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const statusMessage = ref('');
const statusType = ref<'success' | 'error' | ''>('');

const updateUserData = async () => {
  try {
    await userStore.updateUserData(email.value, pseudo.value, actualPassword.value, newPassword.value || null, confirmNewPassword.value || null);
    statusMessage.value = "Mise à jour réussie.";
    statusType.value = "success";
  } catch (error) {
    //@ts-ignore
    statusMessage.value = `Échec de la mise à jour. ${error.response.data.message}`;
    statusType.value = "error";
  }
};

const deleteUser = async () => {
  try {
    await api.delete(`users/${userStore?.user?.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    authStore.logout();
    statusMessage.value = "Compte supprimé avec succès.";
    statusType.value = "success";
    setTimeout(() => router.push('/'), 1000);
  } catch(error) {
    console.log(error);
    statusMessage.value = "Échec de la suppression du compte.";
    statusType.value = "error";
  }
};

const logout = () => {
  authStore.logout();
  statusMessage.value = "Déconnexion réussie.";
  statusType.value = "success";
  setTimeout(() => router.push('/'), 1000);
};

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/');
  }
});
</script>

<template>
  <section class="container py-5">
    <div class="text-center">
      <h2>Mon compte</h2>
      <p>Gérez vos informations personnelles et votre mot de passe.</p>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4">
          <h5 class="text-center">Modifier mes informations</h5>
          <form @submit.prevent="updateUserData">
            <input class="form-control mb-2" v-model="email" type="email" placeholder="Email" />
            <input class="form-control mb-2" v-model="pseudo" type="text" placeholder="Pseudo" />
            <input class="form-control mb-2" v-model="actualPassword" type="password" placeholder="Mot de passe actuel" required />
            <input class="form-control mb-2" v-model="newPassword" type="password" placeholder="Nouveau mot de passe (optionnel)" />
            <input class="form-control mb-2" v-model="confirmNewPassword" type="password" placeholder="Confirmer (optionnel)" />
            <button class="btn btn-primary w-100 mt-2" type="submit">Mettre à jour</button>
          </form>
        </div>
      </div>
    </div>

    <div class="row justify-content-center mt-3">
      <div class="col-md-6 text-center">
        <button class="btn btn-danger w-100" @click="logout">Se déconnecter</button>
      </div>
    </div>

    <div class="row justify-content-center mt-3">
      <div class="col-md-6 text-center">
        <button class="btn btn-outline-danger w-100" @click="deleteUser">Supprimer mon compte</button>
      </div>
    </div>

    <p v-if="statusMessage" :class="{'text-success': statusType === 'success', 'text-danger': statusType === 'error'}" class="text-center mt-3">
      {{ statusMessage }}
    </p>
  </section>
</template>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
