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
const isAdmin = userStore.user.role === "user"; //todo passer sur admin

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

async function bookHotel() {
  try {
    await api.post(`/bookings`, {
      startDate: startDate.value,
      endDate: endDate.value,
      userId: userStore.user.id,
      hotelId: parseInt(props.id as unknown as string, 10),
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    toastRef.value?.showToast('Réservation effectuée avec succès!', 'success');
  } catch (error) {
    console.error(error);
    toastRef.value?.showToast('Erreur lors de la réservation. Veuillez réessayer.', 'error');
  }
}

onMounted(async () => {
  await getActiveHotel();
  mounted.value = true;
});
</script>

<template>
  <toast-message ref="toastRef"></toast-message> <!-- Toast -->

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

      <!-- Section principale avec image + description + cadre réservation -->
      <div class="row">
        <!-- Image principale -->
        <div class="col-md-6">
          <img class="rounded img-fluid shadow main-image" :src="hotel.images[0]" />
        </div>

        <!-- Cadre réservation -->
        <div class="col-md-4 offset-md-2">
          <div class="card bg-light border-dark shadow">
            <div class="card-body p-3">
              <h3 class="fw-bold text-center">Réserver maintenant</h3>
              <h5 class="text-center fw-bold">$25</h5>

              <div class="mb-3">
                <label for="startDate" class="form-label">Date d'arrivée</label>
                <input type="date" id="startDate" class="form-control" v-model="startDate" />
              </div>
              <div class="mb-3">
                <label for="endDate" class="form-label">Date de départ</label>
                <input type="date" id="endDate" class="form-control" v-model="endDate" />
              </div>

              <button class="btn btn-primary d-block w-100" type="button" @click="bookHotel">
                Réserver
              </button>
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
      </div>

      <!-- Bouton d'enregistrement (admin uniquement) -->
      <div v-if="isAdmin" class="text-center mt-4">
        <button class="btn btn-success" @click="updateHotel">Enregistrer les modifications</button>
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
