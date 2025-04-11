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
    route: '/clubes/crear',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    title: 'Editar Club',
    description: 'Seleccionar un club de la lista para modificar',
    icon: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
    route: '/clubes/lista',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    title: 'Eliminar Club',
    description: 'Eliminar un club de la base de datos',
    icon: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    route: '/clubes/eliminar',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
];

// Navegar a la ruta seleccionada
const navigateTo = (route: string): void => {
  // Si la ruta es la lista y venimos del botón de editar, añadir query parameter
  if (route === '/clubes/lista') {
    router.push({ path: route, query: { action: 'edit' } });
  } else {
    router.push(route);
  }
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