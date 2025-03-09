<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from "@/stores/AuthStore.ts";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const email = ref(userStore.user.email || '');
const pseudo = ref(userStore.user.pseudo || '');
const actualPdwUpdateUsername = ref('');
const actualPdw = ref('');
const newPwd = ref('');
const confirmPwd = ref('');


const updateInfo = () => {
  userStore.updateUser(email.value, pseudo.value, actualPdwUpdateUsername.value)
};

const updatePassword = () => {
  if (newPwd.value === confirmPwd.value) {
    console.log("Mot de passe mis à jour");
  } else {
    console.error("Les mots de passe ne correspondent pas");
  }
};

const logout = () => {
  authStore.logout();
};

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/');
  }
});
</script>

<template>
  <section class="position-relative py-4 py-xl-5">
    <div class="container">
      <div class="row mb-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <h2>Mon compte</h2>
          <p class="w-lg-50">Modifiez vos informations personnelles ou changez votre mot de passe.</p>
        </div>
      </div>

      <!-- Informations générales -->
      <div class="row d-flex justify-content-center">

        <div class="col-md-6 col-xl-4">
          <div class="card mb-5">
            <div class="card-body d-flex flex-column align-items-center">
              <h5>Informations générales</h5>
              <form @submit.prevent="updateInfo" class="text-center">
                <div class="mb-3">
                  <input class="form-control mt-sm-5" v-model="email" type="email" placeholder="Email" />
                  <input class="form-control mt-sm-3" v-model="pseudo" type="text" placeholder="Pseudo" />
                  <input class="form-control mt-sm-3" v-if="(userStore.user.email != email) || (userStore.user.pseudo != pseudo)" v-model="actualPdwUpdateUsername" type="password" placeholder="Mot de passe" />
                </div>
                <div class="mb-3">
                  <button class="btn btn-primary btn-blue border rounded-pill d-block w-100 mt-sm-4" type="submit">
                    Modifier mes informations
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modification du mot de passe -->
        <div class="col-md-6 col-xl-4">
          <div class="card mb-5">
            <div class="card-body d-flex flex-column align-items-center">
              <h5>Mot de passe</h5>
              <form @submit.prevent="updatePassword" class="text-center">
                <div class="mb-3">
                  <input class="form-control mt-sm-5" v-model="actualPdw" type="password" placeholder="Ancien mot de passe" />
                  <input class="form-control mt-sm-3" v-model="newPwd" type="password" placeholder="Nouveau mot de passe" />
                  <input class="form-control mt-sm-3" v-model="confirmPwd" type="password" placeholder="Confirmer" />
                </div>
                <div class="mb-3">
                  <button class="btn-primary btn-blue btn border rounded-pill d-block w-100 mt-sm-4" type="submit">
                    Modifier le mot de passe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons pour déconnexion et suppression -->
      <div class="row">
        <div class="col">
          <button class="btn btn-danger border rounded-pill d-block w-100" @click="logout">
            Se déconnecter
          </button>
        </div>
        <div class="col">
          <button class="btn btn-outline-danger border rounded-pill d-block w-100" type="submit">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 2rem;
}

button {
  font-size: 1rem;
  padding: 0.75rem 1rem;
}

input.form-control {
  width: 100%;
  max-width: 350px;
}

h2 {
  font-weight: 700;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
}
</style>
