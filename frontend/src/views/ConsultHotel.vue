<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from "@/services/axiosConfig.ts";
import type {Hotel} from "@/interfaces.ts";

const props = defineProps({
  id: Number,
});

const hotel = ref<Hotel>({
  id: 0,
  name: "",
  location: "",
  description: "",
  images: [],
  creationDate: ""
});
const mounted = ref(false);

async function getActiveHotel() {
  try {
    const response = await api.get(`/hotels/${props.id}`);
    hotel.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async() => {
  await getActiveHotel();
  mounted.value = true;
});
</script>

<template>
  <section class="py-5" v-if="mounted">
    <div class="container py-5">
      <div class="row mb-4 mb-lg-5">
        <div class="col-md-8 col-xl-6 text-center mx-auto">
          <p class="fw-bold text-success mb-2">Disponible</p>
          <h3 class="fw-bold">{{hotel.name}}</h3>
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
              <div>
              </div>
              <button class="btn btn-primary d-block w-100" type="button">Réserver</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section avec les images -->
      <div class="row row-cols-1 row-cols-md-2 mx-auto" style="max-width: 900px;">
        <div class="col mb-5"><img class="rounded img-fluid shadow" :src="hotel.images[0]" /></div>
        <div class="col d-md-flex align-items-md-end align-items-lg-center mb-5">
          <div>
            <h5 class="fw-bold">{{hotel.location}}</h5>
            <p class="text-muted mb-4">{{hotel.description}}</p><button class="btn btn-primary shadow" type="button">Réserver</button>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-10 mx-auto">
        <div class="position-relative" style="display: flex;flex-wrap: wrap;justify-content: flex-end;">
          <div v-if="hotel.images[1]" style="position: relative;flex: 0 0 45%;transform: translate3d(-15%, 35%, 0);"><img class="img-fluid" :src="hotel.images[1]" /></div>
          <div v-if="hotel.images[2]" style="position: relative;flex: 0 0 45%;transform: translate3d(-5%, 20%, 0);"><img class="img-fluid" :src="hotel.images[2]" /></div>
          <div v-if="hotel.images[3]" style="position: relative;flex: 0 0 60%;transform: translate3d(0, 0%, 0);"><img class="img-fluid" :src="hotel.images[3]" width="466" height="310" /></div>
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
