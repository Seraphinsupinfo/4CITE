<script setup lang="ts">
import router from "@/router";
import {useUserStore} from "@/stores/UserStore.ts";

const userStore = useUserStore();

</script>

<template>
  <nav class="navbar navbar-expand-md sticky-top navbar-shrink py-3" id="mainNav">
    <div class="container"><a class="navbar-brand d-flex align-items-center" href="/"><span>AKKOR HOTEL</span></a><button data-bs-toggle="collapse" class="navbar-toggler" data-bs-target="#navcol-1"><span class="visually-hidden">Toggle navigation</span><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="navcol-1">
        <span class="navbar-text interactive" @click="router.push('/hotels')">Hôtels</span>
        <span class="navbar-text ps-sm-3 interactive" @click="router.push('/bookings')">Réservations</span>
        <span class="navbar-text pb-sm-2 ps-sm-3 interactive" @click="router.push('/account')" v-if="userStore.isLoggedIn">Mon compte</span>
        <span class="navbar-text pb-sm-2 ps-sm-3 interactive adminText" @click="router.push('/admin')" v-if="userStore.isLoggedIn && userStore.user.role=='admin'">Administration</span>
        <ul class="navbar-nav mx-auto"></ul><a v-if="!userStore.isLoggedIn" class="btn btn-primary shadow" role="button" @click="router.push('/login')" style="--bs-primary: #13262f;--bs-primary-rgb: 19,38,47;">Se connecter</a>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.navbar {
  background-color: white;
}
.interactive {
  cursor: pointer;
  transition: color 0.3s ease-in-out;
}

.interactive:hover {
  color: #007bff;
}

.adminText{
  color: red;
}
</style>
