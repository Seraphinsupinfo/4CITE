<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from "@/stores/UserStore.ts";
import api from "@/services/axiosConfig.ts";
import type { IReservation } from "@/services/interfaces.ts";
import { useRouter } from "vue-router";
import ToastMessage from "@/components/toastMessage.vue";


const reservations = ref<IReservation[]>([]);
const modifiedReservations = ref<IReservation[]>([]);

const email = ref("");
const reservationId = ref("");
const userStore = useUserStore();
const router = useRouter();
const toastRef = ref<InstanceType<typeof ToastMessage> | null>(null);

async function getBookings() {
  try {
    const response = await api.get(`/users/${userStore.user.id}/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    });
    reservations.value = response.data;
    modifiedReservations.value = reservations.value.map(reservation => ({
      ...reservation,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      isModified: false
    }));
  } catch (error) {
    console.error(error);
  }
}

const searchReservations = async () => {
  if (!email.value.trim() && !reservationId.value) {
    toastRef.value?.showToast("Veuillez entrer un email ou un numéro de réservation", "warning");
    return;
  }

  try {
    let response;

    if (email.value.trim()) {
      response = await api.get(`/bookings`, {
        params: { user_email: email.value.trim() },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
    } else if (reservationId.value) {
      response = await api.get(`/bookings/${reservationId.value}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
    }

    if (response && response.data) {
      reservations.value = Array.isArray(response.data) ? response.data : [response.data];
      modifiedReservations.value = reservations.value.map(reservation => ({
        ...reservation,
        isModified: false
      }));
    } else {
      reservations.value = [];
      toastRef.value?.showToast("Aucune réservation trouvée", "error");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations", error);
    toastRef.value?.showToast("Une erreur est survenue lors de la recherche", "error");
  }
};
onMounted(async () => {
  await getBookings();
});

const consultItem = (id: number) => {
  router.push(`/hotel/${id}`);
};

const canDelete = (endDate: string) => {

  const currentDate = new Date();
  const endDateObj = new Date(endDate);
  return currentDate < endDateObj;
};

const removeReservation = async (id: number) => {

  try {
    await api.delete(`/bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    toastRef.value?.showToast('Réservation supprimée', 'success');
  } catch (error) {
    console.error("Erreur lors de la suppression du booking", error);

    toastRef.value?.showToast('Une erreur est survenue', 'error');
  }
  window.location.reload();
};

const saveChanges = async (reservation: IReservation) => {
  const index = reservations.value.findIndex(res => res.id === reservation.id);
  if (index !== -1) {
    reservations.value[index] = { ...reservation }; // Mise à jour côté client
  }

  try {
    await api.put(`/bookings/${reservation.id}`, {
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      userId: reservation.userId,
      hotelId: reservation.hotelId,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    reservation.isModified = false;
    toastRef.value?.showToast('Les changements ont été sauvegardés avec succès', 'success');
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des changements", error);

    toastRef.value?.showToast('Une erreur est survenue lors de la sauvegarde', 'error');
  }
};

const handleDateChange = (reservation: IReservation) => {
  const originalReservation = reservations.value.find(res => res.id === reservation.id);
  if (originalReservation) {
    reservation.isModified = reservation.startDate !== originalReservation.startDate || reservation.endDate !== originalReservation.endDate;
  }
};
</script>

<template>
  <toast-message ref="toastRef"></toast-message>

  <div class="container py-5">
    <h2 v-if="userStore.user.role == 'admin'" class="mb-4">Gérer les réservations</h2>
    <h2 v-else class="mb-4">Mes réservations</h2>
    <div class="mb-4 d-flex gap-3" v-if="userStore.user.role == 'admin'">
      <input v-model="email" class="form-control" placeholder="Rechercher par email" />
      <input v-model="reservationId" class="form-control" placeholder="Rechercher par numéro de réservation" />
      <button class="btn btn-primary" @click="searchReservations">Rechercher</button>
    </div>

    <div class="row">
      <div v-for="reservation in modifiedReservations" :key="reservation.id" class="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
        <div class="d-flex align-items-center">
          <img class="ref-product-photo img-fluid" :src="reservation.hotel?.images[0]" alt="Product Image" style="max-width: 120px;  margin-right: 15px;" />
          <div>
            <div class="fw-bold">Réservation #{{ reservation.id }}</div>
            <div>{{ reservation.hotel?.name }}</div>
            <div class=" text-muted">{{ reservation.hotel?.location }}</div>
          </div>
        </div>
        <div class="d-flex align-items-center">
          <div class="d-flex" style="gap: 10px;">
            <input
              type="date"
              class="form-control"
              v-model="reservation.startDate"
              style="max-width: 150px;"
              @change="handleDateChange(reservation)"
              :disabled="userStore.user.role == 'admin'"
            />
            <input
              type="date"
              class="form-control"
              v-model="reservation.endDate"
              style="max-width: 150px;"
              @change="handleDateChange(reservation)"
              :disabled="userStore.user.role == 'admin'"
            />
          </div>
          <button class="btn btn-outline-primary ms-3" @click="consultItem(reservation.hotelId)">Afficher l'hôtel</button>
          <button
            v-if="userStore.user.role != 'admin'"
            class="btn btn-danger ms-3"
            :disabled="!reservation.endDate || !canDelete(reservation.endDate)"
            @click="removeReservation(reservation.id)"
          >
            Annuler la réservation
          </button>
          <button
            v-if="reservation.isModified && userStore.user.role != 'admin'"
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
