<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter()

</script>

<template>
  <header class="bg-primary-gradient">
    <div class="container pt-4 pt-xl-5">
      <div class="row pt-5">
        <div class="col-md-8 col-xl-6 text-center text-md-start mx-auto">
          <div class="text-center">
            <p class="fw-bold text-success mb-2"><span style="color: rgb(19, 38, 47);">Plus de 20 000 Hotels partout dans le monde</span></p>
            <h1 class="fw-bold">Trouvez l'hotel qui vous convient pour des vacances à votre image</h1>
          </div>
        </div>
        <div class="col-12 col-lg-10 mx-auto">
          <div class="position-relative" style="display: flex;flex-wrap: wrap;justify-content: flex-end;">
            <div style="position: relative;flex: 0 0 45%;transform: translate3d(-15%, 35%, 0);"><img class="img-fluid" data-bss-parallax="" data-bss-parallax-speed="0.8" src="../assets/img/products/lobby-398845_1920.webp?h=f8b5f0c98b2bf42bc4f7015bc3aedfd0"></div>
            <div style="position: relative;flex: 0 0 45%;transform: translate3d(-5%, 20%, 0);"><img class="img-fluid" data-bss-parallax="" data-bss-parallax-speed="0.4" src="../assets/img/products/hotel-6878058_1920.webp?h=824f67cb6b3d73a4f455d09e42d1ad34"></div>
            <div style="position: relative;flex: 0 0 60%;transform: translate3d(0, 0%, 0);"><img class="img-fluid" data-bss-parallax="" data-bss-parallax-speed="0.25" src="../assets/img/products/bedroom-1285156_1920.webp?h=2a8025ef3acc2e050c5feece8b63ca7d"></div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <section class="py-5">
    <section class="py-5 ms-0">
      <div class="container">
        <div class="border rounded border-0 d-flex flex-column justify-content-between align-items-center flex-lg-row bg-primary-gradient p-4 p-lg-5 ms-0 pe-5">
          <div class="text-center text-lg-start py-3 py-lg-1">
            <h2 class="fw-bold mb-2">Rechercher un Hotel</h2>
            <p class="mb-0">Ou allez vous ?</p>
          </div>
          <form class="d-flex justify-content-center align-items-center flex-wrap flex-lg-nowrap gap-2" @submit="router.push('hotels')" data-bs-theme="light">
            <!-- Input -->
            <div class="position-relative">
              <input class="border rounded-pill shadow-sm form-control ps-4 pe-5"
                     type="text" name="searchbar" placeholder="Une ville, un hôtel, etc..."
                     style="height: 50px;">
            </div>

            <!-- Bouton -->
            <button class="btn btn-primary shadow rounded-circle d-flex align-items-center justify-content-center"
                    type="submit" style="width: 50px; height: 50px;">
              <i class="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  </section>
</template>
<style scoped>
</style>
