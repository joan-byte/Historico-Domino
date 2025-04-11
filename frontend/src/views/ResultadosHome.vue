<script setup lang="ts">
// Vista principal para la sección de Resultados
import { useRouter } from 'vue-router';

const router = useRouter();

const mainOptions = [
  {
    title: 'CRUD',
    route: '/resultados/crud',
    description: 'Gestionar operaciones CRUD de resultados',
    icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    title: 'Lista',
    route: '/resultados/lista',
    description: 'Ver todos los resultados registrados',
    icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    title: 'Estadísticas',
    route: '/resultados/estadisticas',
    description: 'Ver métricas y estadísticas de resultados',
    icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  }
];

// Función para navegar
const navigateTo = (routePath: string) => {
  router.push(routePath);
};
</script>

<template>
  <div class="container mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Gestión de Resultados</h1>
      <p class="text-gray-600">Selecciona una operación para administrar los resultados</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="(option, index) in mainOptions" 
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
</template> 