<script setup lang="ts">
// Componente principal del Dashboard
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClubsManagement } from '@/composables/useClubsManagement';
import { useNavigation } from '@/composables/useNavigation';
import DashboardSidebar from './DashboardSidebar.vue';
import DashboardHeader from './DashboardHeader.vue';
import CrudCards from './cards/CrudCards.vue';
import NavigationCards from './cards/NavigationCards.vue';

// Información de la empresa
const company = ref({
  name: 'Historico',
  plan: 'Domino'
});

// Información del usuario
const user = ref({
  name: 'shadcn',
  email: 'm@example.com',
  avatar: 'https://github.com/shadcn.png'
});

// Obtener las rutas y navegación
const route = useRoute();
const router = useRouter();

// Obtener el estado de la vista y funciones para clubs
const { currentView, selectedClub, navigateToClubs } = useClubsManagement();
const { toggleSidebar } = useNavigation();

// Calcular el título del breadcrumb basado en la ruta actual
const breadcrumbTitle = computed(() => {
  if (route.path.includes('/clubes')) {
    return 'Clubes';
  } else if (route.path.includes('/jugadores')) {
    return 'Jugadores';
  } else if (route.path.includes('/campeonato')) {
    return 'Campeonatos';
  } else if (route.path.includes('/resultados')) {
    return 'Resultados';
  }
  return 'Dashboard';
});

// Calcular la sección para el breadcrumb
const breadcrumbSection = computed(() => {
  if (route.path.includes('/crear') || route.path.includes('/nuevo')) {
    return 'Crear';
  } else if (route.path.includes('/modificar')) {
    return 'Modificar';
  } else if (route.path.includes('/eliminar')) {
    return 'Eliminar';
  } else if (route.path.includes('/estadisticas')) {
    return 'Estadísticas';
  } else if (route.path.includes('/crud')) {
    return 'CRUD';
  }
  return 'Lista';
});
</script>

<template>
  <div class="h-screen w-full overflow-hidden">
    <div class="flex h-screen w-full">
      <!-- Sidebar component -->
      <DashboardSidebar
        :company="company"
        :user="user"
      />

      <!-- Contenido principal -->
      <div class="flex-1 flex flex-col bg-white overflow-hidden">
        <!-- Header con breadcrumb -->
        <header class="flex h-8 shrink-0 items-center gap-2 border-b px-3 sticky top-0 bg-white z-10">
          <div class="flex items-center gap-2">
            <!-- Botón para alternar el sidebar -->
            <button 
              type="button" 
              class="flex h-5 w-5 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              @click="toggleSidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                <path d="M3 9h18M3 15h18M3 5h18M3 19h18"></path>
              </svg>
              <span class="sr-only">Alternar sidebar</span>
            </button>
            
            <!-- Separador vertical -->
            <div class="h-4 w-px bg-gray-200"></div>
            
            <!-- Breadcrumb -->
            <div class="flex items-center">
              <div class="flex items-center">
                <span class="text-[11px] text-gray-500 hover:text-gray-900 hidden md:block">{{ breadcrumbTitle }}</span>
                <span class="mx-1 text-[11px] text-gray-400 hidden md:block">/</span>
                <span class="text-[11px] font-medium">{{ breadcrumbSection }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenido principal -->
        <div class="flex flex-col gap-4 p-4 overflow-auto">
          <!-- Tarjetas en la parte superior - Cambian según la vista -->
          <CrudCards v-if="currentView === 'crud'" />
          <NavigationCards v-else />
          
          <!-- Contenido del router-view -->
          <div class="rounded-md bg-white border shadow-sm p-6 flex-1">
            <router-view :key="route.fullPath" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para asegurar que el layout ocupe toda la pantalla */
.h-screen {
  height: 100vh;
}

/* Ajustes para la prosa */
.prose {
  font-size: 0.875rem;
  line-height: 1.5;
}

.prose p {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose ul {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Ajustes para el sidebar */
.flex-1 {
  min-height: 0;
}

svg {
  stroke-width: 1.5px;
}

/* Espaciado entre elementos de navegación */
.space-y-1 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
}
</style> 