<script setup lang="ts">
// Vista de opciones CRUD para Clubs
import { ref } from 'vue';
import { useRouter } from 'vue-router';

interface CrudOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const router = useRouter();

// Opciones de CRUD disponibles
const crudOptions: CrudOption[] = [
  {
    title: 'Crear Club',
    description: 'Registrar un nuevo club en el sistema',
    icon: 'M12 4v16m8-8H4',
    route: '/clubes/nuevo',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    title: 'Ver Clubs',
    description: 'Lista de todos los clubs registrados',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    route: '/clubes',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    title: 'Estadísticas',
    description: 'Ver métricas y estadísticas de clubs',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    route: '/clubes/estadisticas',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

// Navegar a la ruta seleccionada
const navigateTo = (route: string): void => {
  router.push(route);
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Gestión de Clubs</h1>
      <p class="text-gray-600">Selecciona una operación para administrar los clubs</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="(option, index) in crudOptions" 
        :key="index" 
        class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
        :class="option.color"
        @click="navigateTo(option.route)"
      >
        <div class="flex items-center mb-2">
          <div class="rounded-full p-2 mr-2 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="option.icon" />
            </svg>
          </div>
          <h3 class="text-lg font-medium">{{ option.title }}</h3>
        </div>
        <p class="text-sm">{{ option.description }}</p>
      </div>
    </div>
  </div>
</template> 