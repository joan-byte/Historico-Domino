<script setup lang="ts">
// Componente para las tarjetas de navegación en el dashboard
import { useNavigation } from '@/composables/useNavigation';
import { useClubsManagement } from '@/composables/useClubsManagement';
import { useRouter } from 'vue-router';

const { currentView } = useClubsManagement();
const { toggleExpand, isExpanded } = useNavigation();
const router = useRouter();

// Función para manejar el clic en las tarjetas principales
const handleCardClick = (route: string) => {
  // Expandir el elemento correspondiente en el sidebar
  if (route.includes('/clubes')) {
    if (!isExpanded('Clubs')) {
      toggleExpand('Clubs');
    }
  } else if (route.includes('/jugadores')) {
    if (!isExpanded('Jugadores')) {
      toggleExpand('Jugadores');
    }
  } else if (route.includes('/campeonato')) {
    if (!isExpanded('Campeonatos')) {
      toggleExpand('Campeonatos');
    }
  } else if (route.includes('/resultados')) {
    if (!isExpanded('Resultados')) {
      toggleExpand('Resultados');
    }
  }
  
  // Navegar a la ruta
  router.push(route);
  
  // Actualizar la vista según la ruta
  if (route.includes('/clubes')) {
    currentView.value = 'crud';
  }
};
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    <!-- Tarjeta de Clubs -->
    <div 
      class="aspect-[3/2] rounded-md bg-green-50 border border-green-200 shadow-sm p-3 flex flex-col hover:bg-green-100 transition-colors cursor-pointer"
      @click="handleCardClick('/clubes')"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-medium text-green-800">Clubs</h3>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-green-600">
          <path d="M1 22h22V8l-11-6-11 6v14zm3-2V10l8-4.5 8 4.5v10H4zM15 14h1v4h-1v-4zm-4 0h1v4h-1v-4zm-4 0h1v4H7v-4zm-2 6h14v2H5v-2z"></path>
        </svg>
      </div>
      <div class="text-xs text-green-700 mb-2">
        Gestión de clubs y entidades
      </div>
      <div class="flex justify-between mt-auto">
        <span class="text-xs text-green-600 hover:underline">
          Acceder a Clubs
        </span>
      </div>
    </div>
    
    <!-- Tarjeta de Jugadores -->
    <div 
      class="aspect-[3/2] rounded-md bg-blue-50 border border-blue-200 shadow-sm p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer"
      @click="handleCardClick('/jugadores')"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-medium text-blue-800">Jugadores</h3>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-blue-600">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <div class="text-xs text-blue-700 mb-2">
        Gestión de jugadores y licencias
      </div>
      <div class="flex justify-between mt-auto">
        <span class="text-xs text-blue-600 hover:underline">
          Acceder a Jugadores
        </span>
      </div>
    </div>
    
    <!-- Tarjeta de Campeonatos -->
    <div 
      class="aspect-[3/2] rounded-md bg-amber-50 border border-amber-200 shadow-sm p-3 flex flex-col hover:bg-amber-100 transition-colors cursor-pointer"
      @click="handleCardClick('/campeonato')"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-medium text-amber-800">Campeonatos</h3>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-amber-600">
          <path d="M11 2a1 1 0 0 1 2 0h1a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1.5l1 3H15v2h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-2H8.5l1-3H8a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1h2zm2 17v2H9v-2h4zM8 6H6v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6z"></path>
        </svg>
      </div>
      <div class="text-xs text-amber-700 mb-2">
        Gestión de torneos y campeonatos
      </div>
      <div class="flex justify-between mt-auto">
        <span class="text-xs text-amber-600 hover:underline">
          Acceder a Campeonatos
        </span>
      </div>
    </div>
    
    <!-- Tarjeta de Resultados -->
    <div 
      class="aspect-[3/2] rounded-md bg-purple-50 border border-purple-200 shadow-sm p-3 flex flex-col hover:bg-purple-100 transition-colors cursor-pointer"
      @click="handleCardClick('/resultados')"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-medium text-purple-800">Resultados</h3>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-purple-600">
          <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
        </svg>
      </div>
      <div class="text-xs text-purple-700 mb-2">
        Registro y análisis de resultados
      </div>
      <div class="flex justify-between mt-auto">
        <span class="text-xs text-purple-600 hover:underline">
          Acceder a Resultados
        </span>
      </div>
    </div>
  </div>
</template> 