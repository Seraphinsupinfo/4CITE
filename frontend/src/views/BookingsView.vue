<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useUserStore} from "@/stores/UserStore.ts";
import api from "@/services/axiosConfig.ts";

const reservations = ref([]);

const userStore = useUserStore();

async function getBookings() {
  try {
    const response = await api.get(`/users/${userStore.user.id}/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    });
    reservations.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await getBookings();
});

const modifiedReservations = ref(reservations.value.map(reservation => ({
  ...reservation,
  startDate: reservation.startDate,
  endDate: reservation.endDate,
  isModified: false
})));

const consultItem = (id: number) => {
  console.log(`Consulter l'article avec ID : ${id}`);
};

const canDelete = (endDate: string) => {
  const currentDate = new Date();
  const endDateObj = new Date(endDate);
  return currentDate < endDateObj
};

const removeReservation = (id: number) => {
  const index = reservations.value.findIndex((res) => res.id === id);
  if (index !== -1) {
    reservations.value.splice(index, 1);
  }
};

const checkModified = (reservation: any) => {
  const original = reservations.value.find(res => res.id === reservation.id);
  return original?.startDate !== reservation.startDate || original?.endDate !== reservation.endDate;
};

const saveChanges = (reservation: any) => {
  const index = reservations.value.findIndex(res => res.id === reservation.id);
  if (index !== -1) {
    reservations.value[index] = { ...reservation };
  }
  reservation.isModified = false;
};
</script>

<template>
  <div class="container py-5">
    <h2 class="mb-4">Mes réservations</h2>

    <div class="row">
      <!-- Boucle sur les réservations -->
      <div v-for="(reservation) in modifiedReservations" :key="reservation.id" class="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
        <div class="d-flex align-items-center">
          <img class="ref-product-photo img-fluid" :src="reservation.image" alt="Product Image" style="max-width: 80px; margin-right: 15px;" />
          <div>
            <div class="fw-bold">{{ reservation.name }}</div>
            <div class="text-muted">{{ reservation.category }}</div>
            <div class="fw-bold">{{ reservation.price }}</div>
          </div>
        </div>
        <div class="d-flex align-items-center">
          <div class="d-flex" style="gap: 10px;">
            <input
              type="date"
              class="form-control"
              v-model="reservation.startDate"
              style="max-width: 150px;"
              @input="reservation.isModified = checkModified(reservation)"
            />
            <input
              type="date"
              class="form-control"
              v-model="reservation.endDate"
              style="max-width: 150px;"
              @input="reservation.isModified = checkModified(reservation)"
            />
          </div>
          <button class="btn btn-outline-primary ms-3" @click="consultItem(reservation.id)">Consulter</button>
          <button
            class="btn btn-danger ms-3"
            :disabled="!reservation.endDate || !canDelete(reservation.endDate)"
            @click="removeReservation(reservation.id)"
          >
            Remove
          </button>
          <button
            v-if="reservation.isModified"
            class="btn btn-success ms-3"
            @click="saveChanges(reservation)"
          >
            Sauvegarder les changements
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ref-product-photo {
  max-width: 120px;
}

.container {
  max-width: 1200px;
}
</style>
