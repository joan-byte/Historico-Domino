<!-- Componente reutilizable para mostrar mensajes de estado (errores, carga, éxito, etc.) -->
<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * Tipo de mensaje: 'error', 'loading', 'success', 'warning', 'info'
   */
  type: 'error' | 'loading' | 'success' | 'warning' | 'info';
  
  /**
   * Mensaje a mostrar
   */
  message?: string;
  
  /**
   * Si el mensaje debe mostrarse o no
   */
  show: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  show: false
});

// Clases CSS basadas en el tipo de mensaje
const messageClasses = computed(() => {
  switch (props.type) {
    case 'error':
      return 'bg-red-100 border-red-400 text-red-700';
    case 'success':
      return 'bg-green-100 border-green-400 text-green-700';
    case 'warning':
      return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    case 'info':
      return 'bg-blue-100 border-blue-400 text-blue-700';
    case 'loading':
      return 'bg-gray-100 border-gray-400 text-gray-700';
    default:
      return 'bg-gray-100 border-gray-400 text-gray-700';
  }
});

// Mensaje predeterminado basado en el tipo si no se proporciona uno
const displayMessage = computed(() => {
  if (props.message) return props.message;
  
  switch (props.type) {
    case 'error':
      return 'Ha ocurrido un error. Por favor, intente nuevamente más tarde.';
    case 'success':
      return 'Operación completada con éxito.';
    case 'warning':
      return 'Advertencia: Tenga precaución.';
    case 'info':
      return 'Información importante.';
    case 'loading':
      return 'Cargando...';
    default:
      return '';
  }
});
</script>

<template>
  <!-- Mostrar mensaje según el tipo -->
  <div v-if="show && type !== 'loading'" class="border px-4 py-3 rounded mb-4" :class="messageClasses">
    {{ displayMessage }}
  </div>
  
  <!-- Mostrar indicador de carga -->
  <div v-if="show && type === 'loading'" class="flex items-center justify-center my-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    <span v-if="message" class="ml-3 text-gray-700">{{ message }}</span>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style> 