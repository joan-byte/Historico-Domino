<script setup lang="ts">
// Contenedor principal que se ajusta cuando el sidebar cambia de tamaño
import { computed } from 'vue';
import { injectSidebarContext } from './SidebarProvider.vue';

// Obtener el contexto del sidebar
const sidebarContext = injectSidebarContext();

// Calcular clases basadas en el estado del sidebar
const containerClasses = computed(() => {
  const isOpen = sidebarContext?.isOpen.value ?? false;
  
  return {
    'flex-1 flex flex-col transition-all duration-300 ease-in-out': true,
    'ml-52': isOpen,
    'ml-10': !isOpen
  };
});
</script>

<template>
  <div :class="containerClasses" class="bg-white h-screen overflow-hidden">
    <slot></slot>
  </div>
</template>

<style scoped>
/* Asegurar que el contenido se ajuste a la pantalla */
.h-screen {
  height: 100vh;
}
</style> 