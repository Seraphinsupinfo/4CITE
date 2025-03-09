<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import api from "@/services/axiosConfig.ts";

const userStore = useUserStore();
const router = useRouter();

const searchedId = ref('');
const user = ref<{ email: string; pseudo: string } | null>(null);
const newEmail = ref('');
const newPseudo = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');

const searchUser = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await api.get(`/users/${searchedId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.data) {
      user.value = response.data;
      newEmail.value = response.data.email;
      newPseudo.value = response.data.pseudo;
    } else {
      errorMessage.value = "Utilisateur non trouvé.";
    }
  } catch (error) {
    errorMessage.value = "Erreur lors de la recherche de l'utilisateur.";
  }
};

const updateInfo = async () => {
  if (!user.value) return;

  try {
    const response = await api.put(`/users/${searchedId.value}`, {
      pseudo: newPseudo.value,
      email: newEmail.value,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    successMessage.value = "Informations mises à jour.";
  } catch (error) {
    errorMessage.value = `Échec de la mise à jour. ${error.response.data.message}`;
  }
};

const updatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  try {
    await api.put(`/users/${searchedId.value}/password`, {
      newPassword: newPassword.value,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    successMessage.value = "Mot de passe mis à jour.";
  } catch (error) {
    errorMessage.value = "Échec de la mise à jour du mot de passe.";
  }
};

onMounted(() => {
  if (!userStore.user || userStore.user.role !== 'admin') {
    router.push('/');
  }
});
</script>

<template>
  <section class="container py-5">
    <h2 class="text-center mb-4">Rechercher un utilisateur</h2>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <input v-model="searchedId" class="form-control mb-3" placeholder="Entrez un identifiant utilisateur" />
        <button class="btn btn-primary w-100" @click="searchUser">Rechercher</button>
      </div>
    </div>

    <div v-if="user" class="card mt-4 mx-auto p-4" style="max-width: 500px;">
      <h5 class="text-center">Utilisateur trouvé</h5>
      <p><strong>Email:</strong> <input v-model="newEmail" class="form-control" /></p>
      <p><strong>Pseudo:</strong> <input v-model="newPseudo" class="form-control" /></p>
      <button class="btn btn-success mt-3 w-100" @click="updateInfo">Mettre à jour</button>

      <h6 class="mt-4">Modifier le mot de passe</h6>
      <input v-model="newPassword" class="form-control mt-2" type="password" placeholder="Nouveau mot de passe" />
      <input v-model="confirmPassword" class="form-control mt-2" type="password" placeholder="Confirmer" />
      <button class="btn btn-warning mt-3 w-100" @click="updatePassword">Modifier le mot de passe</button>
    </div>

    <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-success text-center mt-3">{{ successMessage }}</p>
  </section>
</template>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
