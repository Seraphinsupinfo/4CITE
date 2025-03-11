<script setup lang="ts">
import { useUserStore } from "@/stores/UserStore.ts";
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
  if (userStore?.user?.role !== "admin") {
    router.push("/");
  }
});

function goTo(path: string) {
  router.push(path);
}
</script>

<template>
  <section class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 text-center">
        <h2 class="mb-4">Panneau d'administration</h2>
        <button class="btn btn-primary w-100 mb-3" @click="goTo('/admin/hotel/create')">
          🏨 Créer un hôtel
        </button>
        <button class="btn btn-secondary w-100 mb-3" @click="goTo('bookings')">
          📅 Afficher les réservations
        </button>
        <button class="btn btn-danger w-100" @click="goTo('/admin/accounts')">
          👤 Gestion des comptes
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
button {
  font-size: 1.1rem;
  padding: 12px;
}
</style>
