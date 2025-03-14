<script lang="ts">
// Definir clave para el contexto del sidebar
export const SIDEBAR_CONTEXT_KEY = Symbol('sidebar-context');

// Tipo para el contexto del sidebar
import { Ref } from 'vue';

export interface SidebarContext {
  isOpen: Ref<boolean>;
  toggleSidebar: () => void;
}

// Función para inyectar el contexto del sidebar en componentes
import { inject } from 'vue';

export function injectSidebarContext() {
  return inject<SidebarContext>(SIDEBAR_CONTEXT_KEY);
}
</script>

<script setup lang="ts">
// Proveedor de contexto para el sidebar
import { provide, ref } from 'vue';
// No necesitamos importar SIDEBAR_CONTEXT_KEY ya que está definido en el script anterior
// y está disponible automáticamente en este script setup

// Estado para controlar si el sidebar está abierto
const isOpen = ref(true);

// Función para alternar el estado del sidebar
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

// Proporcionar el contexto a los componentes hijos
provide(SIDEBAR_CONTEXT_KEY, {
  isOpen,
  toggleSidebar
});
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-white">
    <slot></slot>
  </div>
</template>

<style scoped>
/* Asegurar que el contenido se ajuste a la pantalla */
.h-screen {
  height: 100vh;
}
</style> 