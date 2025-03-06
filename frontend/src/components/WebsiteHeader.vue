<script setup lang="ts">
import { RouterLink } from "vue-router";
import {ref} from "vue";
import router from "@/router";
const logged = ref(false)
</script>

<template>
  <nav class="navbar navbar-expand-md sticky-top navbar-shrink py-3" id="mainNav">
    <div class="container"><a class="navbar-brand d-flex align-items-center" href="/"><span>AKKOR HOTEL</span></a><button data-bs-toggle="collapse" class="navbar-toggler" data-bs-target="#navcol-1"><span class="visually-hidden">Toggle navigation</span><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="navcol-1">
        <ul class="navbar-nav mx-auto"></ul><a class="btn btn-primary shadow" role="button" href="signup.html" style="--bs-primary: #13262f;--bs-primary-rgb: 19,38,47;">Se connecter</a>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.navbar {
  background-color: white;
}
</style>
