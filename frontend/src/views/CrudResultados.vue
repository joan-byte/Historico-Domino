<script setup lang="ts">
// Vista para las opciones CRUD específicas de Resultados
import { useRouter } from 'vue-router';

const router = useRouter();

const crudOptions = [
  {
    title: 'Crear Resultado',
    route: '/resultados/nuevo',
    description: 'Añadir un nuevo resultado a la base de datos',
    // Icono de CrudJugadores.vue para Crear
    icon: '<path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>', 
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    title: 'Modificar Resultado',
    route: '/resultados/lista?action=edit',
    description: 'Actualizar información de un resultado existente',
    // Icono de CrudJugadores.vue para Modificar
    icon: '<path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>', 
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    title: 'Eliminar Resultado',
    route: '/resultados/lista?action=delete',
    description: 'Eliminar un resultado de la base de datos',
    // Icono de CrudJugadores.vue para Eliminar
    icon: '<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>', 
    color: 'bg-red-100 text-red-800 border-red-300'
  }
];

// Función para navegar
const navigateTo = (routePath: string) => {
  router.push(routePath);
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Operaciones CRUD - Resultados</h1>
      <p class="text-gray-600">Selecciona la operación que deseas realizar</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="(option, index) in crudOptions" 
        :key="index" 
        :class="['border rounded-md shadow-sm p-6 cursor-pointer transition-all hover:shadow-md', option.color]"
        @click="navigateTo(option.route)"
      >
        <div class="flex items-center mb-4">
          <div class="h-10 w-10 rounded-full bg-white border flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <g v-html="option.icon"></g>
            </svg>
          </div>
          <h2 class="text-lg font-medium ml-3">{{ option.title }}</h2>
        </div>
        <p class="text-sm">{{ option.description }}</p>
      </div>
    </div>
    
    <div class="mt-6">
       <router-link 
          to="/resultados"
          class="text-blue-600 hover:text-blue-800"
        >
          ← Volver a Gestión de Resultados
      </router-link>
    </div>

  </div>
</template> 