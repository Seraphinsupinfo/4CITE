<script setup lang="ts">
import { ref } from "vue";
import api from "@/services/axiosConfig.ts";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/UserStore.ts";

const router = useRouter();
const userStore = useUserStore();

if (userStore.user.role !== "admin") {
  router.push("/");
}

const hotelName = ref("");
const location = ref("");
const description = ref("");
const images = ref<string[]>([]);
const creationDate = ref(new Date().toISOString().split("T")[0]); // Date du jour
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");

async function createHotel() {
  try {
    await api.post(
      "/hotels",
      {
        name: hotelName.value,
        location: location.value,
        description: description.value,
        images: images.value.filter(img => img.trim() !== ""),
        creationDate: creationDate.value,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toastType.value = "success";
    toastMessage.value = "Hôtel créé avec succès !";
    setTimeout(() => router.push("/admin"), 2000);
  } catch (error) {
    toastType.value = "error";
    toastMessage.value = "Erreur lors de la création de l'hôtel.";
    console.error(error);
  }
}

function addImageField() {
  images.value.push("");
}
</script>

<template>
  <section class="container py-5">
    <h2 class="mb-4 text-center">Créer un nouvel hôtel</h2>

    <div v-if="toastMessage" :class="['alert', toastType === 'success' ? 'alert-success' : 'alert-danger']">
      {{ toastMessage }}
    </div>

    <form @submit.prevent="createHotel" class="card p-4">
      <div class="mb-3">
        <label class="form-label">Nom de l'hôtel</label>
        <input v-model="hotelName" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Emplacement</label>
        <input v-model="location" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea v-model="description" class="form-control" rows="3" required></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Images (URLs)</label>
        <div v-for="(img, index) in images" :key="index" class="d-flex align-items-center">
          <input v-model="images[index]" type="text" class="form-control me-2" placeholder="Coller une URL d'image" />
        </div>
        <button type="button" class="btn btn-secondary mt-2" @click="addImageField">+ Ajouter une image</button>
      </div>

      <button type="submit" class="btn btn-primary w-100">Créer l'hôtel</button>
    </form>
  </section>
</template>

<style scoped>
.card {
  max-width: 600px;
  margin: auto;
}
.alert {
  text-align: center;
  margin-bottom: 15px;
}
</style>
