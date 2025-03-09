<script setup lang="ts">

import {onMounted, ref} from "vue";
import api from "@/services/axiosConfig.ts";
import type {Hotel} from "@/interfaces.ts";
const hotelsList = ref(<Hotel[]>[]
);

async function getHotels() {
  try {
    const response = await api.get("/hotels");
    hotelsList.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
await getHotels();
});
</script>

<template>
  <section class="py-5">
    <div class="container py-5">
      <div class="row mb-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <h2 class="fw-bold">Hôtels</h2>
          <p class="text-muted">Parcourez notre sélection d’hôtels et trouvez celui de vos rêves ! ✨🏨</p>
        </div>
      </div>
      <div class="row row-cols-1 row-cols-md-2 mx-auto" style="max-width: 900px;">
        <div class="col mb-4" v-for="hotel in hotelsList" :key="hotel.id">
          <div class="card shadow-sm">
            <a :href="`/hotel/${hotel.id}`" class="mb-1">
              <img class="rounded img-fluid w-100 fit-cover" :src="hotel.images[0]" style="height: 250px;" />
            </a>
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <span class="badge bg-primary mb-2">À partir de 123$</span>
                <h4 class="fw-bold mb-1">{{ hotel.name }}</h4>
                <p class="text-muted mb-0">{{ hotel.location }}</p>
              </div>
              <a :href="`/hotel/${hotel.id}`" class="btn btn-primary btn-sm">
                Consulter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
