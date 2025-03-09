<template>
  <div
    class="toast-container position-fixed bottom-0 end-0 p-3"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      v-for="(toast, index) in toasts"
      :key="index"
      class="toast align-items-center text-white border-0 show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      :class="getToastClass(toast.type)"
      :style="{ zIndex: 9999 - index }"
    >
      <div class="d-flex">
        <div class="toast-body">
          {{ toast.message }}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          aria-label="Close"
          @click="removeToast(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const toasts = ref<Toast[]>([]);

const showToast = (message: string, type: Toast['type']) => {
  toasts.value.push({ message, type });

  // Supprimer après 5 secondes
  setTimeout(() => {
    toasts.value.shift();
  }, 5000);
};

const removeToast = (index: number) => {
  toasts.value.splice(index, 1);
};

// Fonction pour gérer les classes dynamiquement
const getToastClass = (type: Toast['type']) => {
  return {
    'bg-success': type === 'success',
    'bg-danger': type === 'error',
    'bg-info': type === 'info',
    'bg-warning': type === 'warning',
  };
};

defineExpose({
  showToast
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}
</style>
