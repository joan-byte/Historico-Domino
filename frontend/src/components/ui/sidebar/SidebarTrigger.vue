<script setup lang="ts">
// Botón para alternar el estado del sidebar
import { injectSidebarContext } from './SidebarProvider.vue';

// Definir props
const props = defineProps({
  class: {
    type: String,
    default: ''
  }
});

// Obtener el contexto del sidebar
const sidebarContext = injectSidebarContext();

// Extraer la función para alternar el sidebar
const { toggleSidebar } = sidebarContext || { toggleSidebar: () => {} };
</script>

<template>
  <button 
    type="button" 
    class="flex h-4 w-4 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
    :class="props.class"
    @click="toggleSidebar"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-2.5 w-2.5">
      <path d="M3 9h18M3 15h18M3 5h18M3 19h18"></path>
    </svg>
    <span class="sr-only">Alternar sidebar</span>
  </button>
</template> 