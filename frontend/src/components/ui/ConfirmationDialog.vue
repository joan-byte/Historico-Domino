<script setup lang="ts">
// Componente reutilizable para un diálogo de confirmación modal
import { defineProps, defineEmits, computed } from 'vue';

// Definir propiedades que el componente acepta
const props = defineProps({
  show: { // Controla la visibilidad del diálogo
    type: Boolean,
    required: true,
  },
  title: { // Título del diálogo
    type: String,
    default: 'Confirmación'
  },
  message: { // Mensaje principal del diálogo
    type: String,
    required: true,
  },
  confirmText: { // Texto del botón de confirmación
    type: String,
    default: 'Confirmar'
  },
  cancelText: { // Texto del botón de cancelación
    type: String,
    default: 'Cancelar'
  },
  confirmVariant: { // Estilo del botón de confirmación (ej: 'danger', 'primary')
    type: String,
    default: 'danger' // Por defecto, para acciones destructivas
  }
});

// Definir eventos que el componente emite
const emit = defineEmits(['confirm', 'cancel']);

// Función para emitir el evento de confirmación
const handleConfirm = () => {
  emit('confirm');
};

// Función para emitir el evento de cancelación
const handleCancel = () => {
  emit('cancel');
};

// Clases de botón basadas en la variante
const confirmButtonClass = computed(() => {
  if (props.confirmVariant === 'danger') {
    return 'bg-red-600 hover:bg-red-700 text-white';
  }
  // Añadir otras variantes si es necesario (ej: 'primary')
  return 'bg-blue-600 hover:bg-blue-700 text-white';
});

</script>

<template>
  <teleport to="body">
    <!-- <transition name="fade"> --> <!-- Transición comentada temporalmente -->
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="handleCancel"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <!-- Título -->
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-2">
            {{ title }}
          </h3>
          
          <!-- Mensaje -->
          <div class="mt-2 mb-4">
            <p class="text-sm text-gray-600">
              {{ message }}
            </p>
          </div>
          
          <!-- Botones -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button 
              type="button" 
              :class="['w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:col-start-2 sm:text-sm', confirmButtonClass]"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    <!-- </transition> -->
  </teleport>
</template>

<style scoped>
/* Estilos para la transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 