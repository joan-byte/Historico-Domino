<!-- Vista de Campeonatos - Muestra las opciones de gestión de campeonatos -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Determinar si estamos en la ruta principal de campeonatos o una subruta
const isRootRoute = computed(() => {
  return route.path === '/campeonatos' || route.path === '/campeonatos/';
});

const isCrudRoute = computed(() => {
  return route.path === '/campeonatos/crud' || route.path === '/campeonatos/crud/';
});

// Mostrar la vista principal si estamos en la ruta principal o en la ruta CRUD
const showMainView = computed(() => {
  return isRootRoute.value || isCrudRoute.value;
});

// Opciones de CRUD para la vista principal
const crudOptions = [
  { 
    title: 'CRUD',
    route: '/campeonatos/crud',
    description: 'Gestionar operaciones CRUD de campeonatos',
    icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  { 
    title: 'Lista',
    route: '/campeonatos/lista', 
    description: 'Ver todos los campeonatos registrados',
    icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  { 
    title: 'Estadísticas',
    route: '/campeonatos/estadisticas', 
    description: 'Ver métricas y estadísticas de campeonatos',
    icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  }
];

// Función para navegar a una ruta
const navigateTo = (routePath: string) => {
  router.push(routePath);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Vista principal - muestra opciones de CRUD cuando estamos en la ruta principal o CRUD -->
    <div v-if="showMainView" class="container mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Gestión de Campeonatos</h1>
        <p class="text-gray-600">Selecciona una operación para administrar los campeonatos</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          v-for="(option, index) in crudOptions" 
          :key="index" 
          class="border rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md"
          :class="option.color"
          @click="router.push(option.route)"
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