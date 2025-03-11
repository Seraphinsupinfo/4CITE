<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from "@/services/axiosConfig.ts";
import type { Hotel } from "@/services/interfaces.ts";
import { useUserStore } from "@/stores/UserStore.ts";
import ToastMessage from "@/components/toastMessage.vue";

const props = defineProps({
  id: Number,
});

const userStore = useUserStore();
const toastRef = ref<InstanceType<typeof ToastMessage> | null>(null);
const mounted = ref(false);
const isAdmin = userStore?.user?.role === "admin";

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const today = new Date();
const startDate = ref(formatDate(new Date(today.setDate(today.getDate() + 1)))); // Lendemain
const endDate = ref(formatDate(new Date(today.setDate(today.getDate() + 1)))); // Surlendemain

const hotel = ref<Hotel>({
  id: 0,
  name: "",
  location: "",
  description: "",
  images: [],
  creationDate: ""
});

async function getActiveHotel() {
  try {
    const response = await api.get(`/hotels/${props.id}`);
    hotel.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

async function updateHotel() {
  try {
    await api.put(`/hotels/${props.id}`, {
      name: hotel.value.name,
      location: hotel.value.location,
      description: hotel.value.description,
      images: hotel.value.images,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    toastRef.value?.showToast('Hôtel mis à jour avec succès!', 'success');
  } catch (error) {
    console.error(error);
    toastRef.value?.showToast('Erreur lors de la mise à jour.', 'error');
  }
}

async function deleteHotel() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet hôtel ?")) return;

  try {
    await api.delete(`/hotels/${props.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    toastRef.value?.showToast('Hôtel supprimé avec succès!', 'success');
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  } catch (error) {
    console.error(error);
    toastRef.value?.showToast('Erreur lors de la suppression.', 'error');
  }
}

async function bookHotel() {
  try {
    await api.post(`/bookings`, {
      startDate: startDate.value,
      endDate: endDate.value,
      userId: userStore?.user?.id,
      hotelId: parseInt(props.id as unknown as string, 10),
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    toastRef.value?.showToast('Réservation effectuée avec succès!', 'success');
  } catch (error) {
    console.error(error);
    //@ts-ignore
    toastRef.value?.showToast(`Erreur lors de la réservation. Veuillez réessayer. ${error.response.data.message}`, 'error');
  }
}

function addNewImage() {
  hotel.value.images.push("");
}

onMounted(async () => {
  await getActiveHotel();
  mounted.value = true;
});
</script>

<template>
  <toast-message ref="toastRef"></toast-message>

  <section class="py-5" v-if="mounted">
    <div class="container py-5">
      <div class="row mb-4 mb-lg-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <p class="fw-bold text-success mb-2">Disponible</p>
          <h3 class="fw-bold">
            <input v-if="isAdmin" v-model="hotel.name" class="form-control text-center fw-bold" />
            <span v-else>{{ hotel.name }}</span>
          </h3>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <img class="rounded img-fluid shadow main-image" :src="hotel.images[0]" />
          <input v-if="isAdmin" v-model="hotel.images[0]" class="form-control mt-2" placeholder="Modifier URL de l'image principale" />
        </div>

        <div class="col-md-4 offset-md-2">
          <div class="card bg-light border-dark shadow">
            <div class="card-body p-3">
              <h3 class="fw-bold text-center">Réserver maintenant</h3>

              <div class="mb-3">
                <label for="startDate" class="form-label">Date d'arrivée</label>
                <input type="date" id="startDate" class="form-control" v-model="startDate" />
              </div>
              <div class="mb-3">
                <label for="endDate" class="form-label">Date de départ</label>
                <input type="date" id="endDate" class="form-control" v-model="endDate" />
              </div>

              <button class="btn btn-primary d-block w-100" type="button" @click="bookHotel" v-if="userStore.isLoggedIn">
                Réserver
              </button>

              <div class="mb-3 mx-auto" v-else>
                <span class="text-center w-100">
                  Vous devez être connecté pour réserver
                </span>
                <br>
                <a class="text-center mx-auto w-100" href="/login">
                  <button class="btn btn-primary d-block w-100">
                  Se connecter
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations sur l'hôtel -->
      <div class="row my-5">
        <div class="col-md-6">
          <h5 class="fw-bold">
            <input v-if="isAdmin" v-model="hotel.location" class="form-control fw-bold" />
            <span v-else>Situé à {{ hotel.location }}</span>
          </h5>
          <p class="text-muted mb-4">
            <textarea v-if="isAdmin" v-model="hotel.description" class="form-control"></textarea>
            <span v-else>{{ hotel.description }}</span>
          </p>
        </div>
      </div>

      <!-- Galerie d'images -->
      <div class="col-12 col-lg-10 mx-auto">
        <div class="gallery">
          <div v-for="(img, index) in hotel.images.slice(1)" :key="index" class="gallery-item">
            <img class="img-fluid rounded shadow-sm" :src="img" />
            <input v-if="isAdmin" v-model="hotel.images[index + 1]" class="form-control mt-2" placeholder="Modifier URL" />
          </div>
        </div>
        <button v-if="isAdmin" class="btn btn-secondary mt-3" @click="addNewImage">Ajouter une image</button>
      </div>

      <!-- Boutons d'administration -->
      <div v-if="isAdmin" class="text-center mt-4">
        <button class="btn btn-success me-2" @click="updateHotel">Enregistrer les modifications</button>
        <button class="btn btn-danger" @click="deleteHotel">Supprimer l'hôtel</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.main-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.gallery-item {
  width: 30%;
  min-width: 150px;
}

.gallery-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.card {
  max-width: 350px;
  margin: auto;
}
</style>
