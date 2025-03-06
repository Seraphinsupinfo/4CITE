<script setup lang="ts">
import {  RouterView } from 'vue-router'
import WebsiteHeader from "@/components/WebsiteHeader.vue";
import WebsiteFooter from "@/components/WebsiteFooter.vue";
</script>

<template>
  <!DOCTYPE html>
  <html data-bs-theme="light" lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>Akkor Hotel</title>
    <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css?h=4061d3c851fb923bbd3906cb75f5fbe1">
    <link rel="stylesheet" href="assets/css/Inter.css?h=8ac465ebc3a0d71651665602f11dca05">
  </head>
  <body>
    <div class="w-100">
      <WebsiteHeader />
      <RouterView />
      <WebsiteFooter></WebsiteFooter>
    </div>
  </body>
  </html>
</template>
<style scoped></style>
