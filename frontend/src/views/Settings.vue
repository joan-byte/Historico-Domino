<!-- Vista de Configuración - Muestra las opciones de configuración del sistema -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Determinar si estamos en la ruta principal de configuración
const isRootRoute = computed(() => {
  return route.path === '/settings' || route.path === '/settings/';
});

// Opciones de configuración
const settingsOptions = [
  { 
    title: 'Tipos de Campeonato',
    route: '/settings/tipos-campeonato',
    description: 'Gestionar los tipos de campeonatos disponibles',
    icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  }
  // Aquí puedes añadir más opciones de configuración cuando sean necesarias
];

// Función para navegar a una ruta
const navigateTo = (routePath: string) => {
  router.push(routePath);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Vista principal - muestra opciones de configuración cuando estamos en la ruta principal -->
    <div v-if="isRootRoute" class="container mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Configuración del Sistema</h1>
        <p class="text-gray-600">Gestiona la configuración general del sistema</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="(option, index) in settingsOptions" 
          :key="index" 
          class="border rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md"
          :class="option.color"
          @click="navigateTo(option.route)"
        >
          <div class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4">
              <g v-html="option.icon"></g>
            </svg>
            <h3 class="font-medium">{{ option.title }}</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">{{ option.description }}</p>
        </div>
      </div>
    </div>

    <!-- Router view para mostrar las subvistas -->
    <router-view v-else></router-view>
  </div>
</template> 