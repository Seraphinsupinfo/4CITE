<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const countdown = ref(5);

const goHome = () => {
  router.push('/');
};

onMounted(() => {
  const interval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(interval);
      goHome();
    }
  }, 1000);
});
</script>

<template>
  <div class="error-container">
    <div class="error-card">
      <div class="hotel-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
        </svg>
      </div>
      <h1 class="error-code">404</h1>
      <div class="error-divider"></div>
      <h2 class="error-title">Chambre non trouvée</h2>
      <p class="error-message">
        Il semble que la page que vous recherchez n'existe pas.
        Peut-être avez-vous mal saisi l'adresse ou la page a été déplacée.
      </p>
      <div class="hotel-keys">
        <div class="key"></div>
        <div class="key"></div>
        <div class="key"></div>
      </div>
      <button class="btn-return" @click="goHome">
        Retour à l'accueil
        <span class="countdown" v-if="countdown > 0">({{ countdown }})</span>
      </button>
      <p class="redirect-message">Vous serez automatiquement redirigé dans {{ countdown }} secondes...</p>
    </div>
  </div>
</template>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  font-family: 'Arial', 'Helvetica', sans-serif;
  padding: 20px;
}

.error-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 40px;
  text-align: center;
  max-width: 550px;
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.hotel-icon {
  color: #c19b76;
  margin-bottom: 20px;
}

.error-code {
  font-size: 72px;
  color: #343a40;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.error-divider {
  height: 2px;
  width: 60px;
  background-color: #c19b76;
  margin: 0 auto 20px;
}

.error-title {
  color: #495057;
  font-size: 24px;
  margin-bottom: 15px;
}

.error-message {
  color: #6c757d;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.hotel-keys {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.key {
  width: 20px;
  height: 30px;
  background-color: #e9ecef;
  border-radius: 4px;
  position: relative;
}

.key::before {
  content: "";
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #c19b76;
  top: 5px;
  left: 4px;
}

.key::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 10px;
  background-color: #c19b76;
  bottom: 5px;
  left: 8px;
}

.btn-return {
  background-color: #c19b76;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-block;
  margin-bottom: 15px;
}

.btn-return:hover {
  background-color: #a78259;
}

.countdown {
  font-weight: normal;
  opacity: 0.9;
}

.redirect-message {
  color: #adb5bd;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 576px) {
  .error-card {
    padding: 30px 20px;
  }

  .error-code {
    font-size: 60px;
  }

  .error-title {
    font-size: 20px;
  }
}
</style>
