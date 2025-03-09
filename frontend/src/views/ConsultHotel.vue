<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from "@/services/axiosConfig.ts";
import type { Hotel } from "@/services/interfaces.ts";
import { useUserStore } from "@/stores/UserStore.ts";
import ToastMessage from "@/components/toastMessage.vue"; // Importer le composant ToastMessage

const props = defineProps({
  id: Number,
});
const userStore = useUserStore();
const toastRef = ref<InstanceType<typeof ToastMessage> | null>(null);
const mounted = ref(false);
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
  <toast-message ref="toastRef"></toast-message> <!-- Ajouter ici le composant ToastMessage -->

  <section class="py-5" v-if="mounted">
    <div class="container py-5">
      <div class="row mb-4 mb-lg-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <p class="fw-bold text-success mb-2">Disponible</p>
          <h3 class="fw-bold">{{ hotel.name }}</h3>
        </div>
        <div class="col-md-4 col-xl-3 mb-4">
          <div class="card bg-body-tertiary border-light">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between">
                <div>
                  <h3 class="fw-bold mb-0">Réserver maintenant</h3>
                  <h5 class="display-5 fw-bold">$25</h5>
                </div>
              </div>

              <!-- Ajout des champs pour la date d'arrivée et de départ -->
              <div class="mb-3">
                <label for="startDate" class="form-label">Date d'arrivée</label>
                <input
                  type="date"
                  id="startDate"
                  class="form-control"
                  v-model="startDate"
                />
              </div>
              <div class="mb-3">
                <label for="endDate" class="form-label">Date de départ</label>
                <input
                  type="date"
                  id="endDate"
                  class="form-control"
                  v-model="endDate"
                />
              </div>

              <button class="btn btn-primary d-block w-100" type="button" @click="bookHotel">
                Réserver
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section avec les images -->
      <div class="row row-cols-1 row-cols-md-2 mx-auto" style="max-width: 900px;">
        <div class="col mb-5">
          <img class="rounded img-fluid shadow" :src="hotel.images[0]" />
        </div>
        <div class="col d-md-flex align-items-md-end align-items-lg-center mb-5">
          <div>
            <h5 class="fw-bold">{{ hotel.location }}</h5>
            <p class="text-muted mb-4">{{ hotel.description }}</p>
            <button class="btn btn-primary shadow" type="button">Réserver</button>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-10 mx-auto">
        <div class="position-relative" style="display: flex;flex-wrap: wrap;justify-content: flex-end;">
          <div v-if="hotel.images[1]" style="position: relative;flex: 0 0 45%;transform: translate3d(-15%, 35%, 0);">
            <img class="img-fluid" :src="hotel.images[1]" />
          </div>
          <div v-if="hotel.images[2]" style="position: relative;flex: 0 0 45%;transform: translate3d(-5%, 20%, 0);">
            <img class="img-fluid" :src="hotel.images[2]" />
          </div>
          <div v-if="hotel.images[3]" style="position: relative;flex: 0 0 60%;transform: translate3d(0, 0%, 0);">
            <img class="img-fluid" :src="hotel.images[3]" width="466" height="310" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  max-width: 350px;
}

.card-body {
  padding: 1.25rem;
}
</style>
