<script setup lang="ts">
// Componente de la barra lateral del dashboard
import { useNavigation, type NavItem } from '@/composables/useNavigation';
import { useRouter } from 'vue-router';
import { useClubsManagement } from '@/composables/useClubsManagement';
// Importar injectSidebarContext para obtener el estado compartido
import { injectSidebarContext } from '@/components/ui/sidebar/SidebarProvider.vue';
import { computed } from 'vue'; // Necesario para computed property si se usa

// Propiedades para el componente
interface Props {
  company: {
    name: string;
    plan: string;
  };
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

const props = defineProps<Props>();

// Inyectar el contexto del Sidebar
const sidebarContext = injectSidebarContext();
// Obtener isOpen del contexto de forma segura
const isOpen = computed(() => sidebarContext?.isOpen.value ?? true); // Usar computed para reactividad y valor por defecto

// Obtener SOLO las funciones de navegación necesarias de useNavigation
const {
  navigation,
  toggleExpand,
  isExpanded
} = useNavigation();

// Obtener funciones específicas de clubes
const { navigateToClubs, currentView } = useClubsManagement();

const router = useRouter();

// Función para manejar el clic en los elementos del sidebar
const handleSidebarItemClick = (item: NavItem) => {
  // Si el ítem tiene hijos, solo expandir/colapsar
  if (item.children && item.children.length > 0) {
    toggleExpand(item.title);
    return;
  }
  
  // Si no tiene hijos, navegar a la ruta especificada
  if (item.href) {
    router.push(item.href);
  }
};

const handleChildClick = (href: string | undefined) => {
  if (href) {
    // Navegar directamente a la ruta especificada
    router.push(href);
  }
};

// Funciones específicas para cada elemento padre
const handleClubsClick = () => {
  // Expandir/colapsar el menú de Clubs (Comentado temporalmente)
  // toggleExpand('Clubs');
  // Navegar a /clubes/crud
  router.push('/clubes/crud');
};

const handleJugadoresClick = () => {
  // Expandir/colapsar el menú de Jugadores (Comentado temporalmente)
  // toggleExpand('Jugadores');
  // Navegar a /jugadores/crud
  router.push('/jugadores/crud');
};

const handleCampeonatosClick = () => {
  // Expandir/colapsar el menú de Campeonatos (Comentado temporalmente)
  // toggleExpand('Campeonatos');
  // Navegar a /campeonatos/crud
  router.push('/campeonatos/crud');
};

const handleResultadosClick = () => {
  // Solo expandir/colapsar el menú de Resultados
  toggleExpand('Resultados');
  // Por ahora, no navegar ni cambiar la vista
  // router.push('/resultados');
};

// Función genérica para manejar clics en elementos padre
const handleParentClick = (item: NavItem) => {
  switch (item.title) {
    case 'Clubs':
      handleClubsClick();
      break;
    case 'Jugadores':
      handleJugadoresClick();
      break;
    case 'Campeonatos':
      handleCampeonatosClick();
      break;
    case 'Resultados':
      handleResultadosClick(); // Mantener toggleExpand aquí ya que no navega
      break;
    default:
      // Para otros elementos sin navegación directa, mantener toggleExpand
      if (item.children && item.children.length > 0) { 
        toggleExpand(item.title);
      } else if (item.href) {
          router.push(item.href);
      }
      break;
  }
};
</script>

<template>
  <!-- Sidebar -->
  <div
    class="h-full flex flex-col border-r bg-[#fafafa] transition-all duration-300"
    :class="{ 'w-52': isOpen, 'w-10': !isOpen }"
  >
    <!-- Logo y nombre de la empresa -->
    <div class="flex h-8 items-center border-b px-2">
      <div class="flex items-center gap-1">
        <div class="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-gray-300 text-[10px] font-medium overflow-hidden">
          <!-- Ficha de dominó estilizada (6-6) -->
          <svg viewBox="0 0 24 36" width="12" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Borde de la ficha -->
            <rect x="2" y="2" width="20" height="32" rx="3" fill="none" stroke="black" stroke-width="1.5" />
            
            <!-- Línea divisoria horizontal -->
            <line x1="2" y1="18" x2="22" y2="18" stroke="black" stroke-width="1" />
            
            <!-- Puntos - Lado superior (6 puntos en 2 columnas) -->
            <circle cx="7.5" cy="6" r="1.2" fill="black" />
            <circle cx="7.5" cy="11" r="1.2" fill="black" />
            <circle cx="7.5" cy="16" r="1.2" fill="black" />
            
            <circle cx="16.5" cy="6" r="1.2" fill="black" />
            <circle cx="16.5" cy="11" r="1.2" fill="black" />
            <circle cx="16.5" cy="16" r="1.2" fill="black" />
            
            <!-- Puntos - Lado inferior (6 puntos en 2 columnas) -->
            <circle cx="7.5" cy="20" r="1.2" fill="black" />
            <circle cx="7.5" cy="25" r="1.2" fill="black" />
            <circle cx="7.5" cy="30" r="1.2" fill="black" />
            
            <circle cx="16.5" cy="20" r="1.2" fill="black" />
            <circle cx="16.5" cy="25" r="1.2" fill="black" />
            <circle cx="16.5" cy="30" r="1.2" fill="black" />
          </svg>
        </div>
        <div v-if="isOpen" class="flex flex-col ml-1">
          <span class="text-[11px] font-medium leading-tight">{{ company.name }}</span>
          <span class="text-[9px] text-gray-500 leading-tight">{{ company.plan }}</span>
        </div>
      </div>
    </div>

    <!-- Navegación -->
    <div class="flex-1 overflow-auto py-2">
      <div v-for="(section, i) in navigation" :key="`section-${i}`" class="px-2 py-1">
        <h3 v-if="isOpen" class="mb-1 px-1 text-[9px] font-semibold text-gray-500">
          {{ section.title }}
        </h3>
        <div class="space-y-1">
          <div v-for="(item, j) in section.items" :key="`item-${j}`">
            <button
              v-if="item.children && item.children.length > 0"
              class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900"
              :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
              @click="handleParentClick(item)"
            >
              <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0">
                <path :d="item.icon"></path>
              </svg>
              <span v-if="isOpen" class="flex-1 text-left truncate">{{ item.title }}</span>
              <svg v-if="isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ml-auto h-3 w-3" :class="{ 'rotate-180': isExpanded(item.title) }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <router-link
              v-else
              :to="item.href || ''"
              class="flex items-center gap-2 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900"
              :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
              @click="() => handleSidebarItemClick(item)"
            >
              <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0">
                <path :d="item.icon"></path>
              </svg>
              <span v-if="isOpen" class="truncate">{{ item.title }}</span>
            </router-link>
            <!-- Subelementos -->
            <div v-if="item.children && item.children.length > 0 && isExpanded(item.title) && isOpen" class="mt-1 ml-5 space-y-1">
              <router-link 
                v-for="(child, k) in item.children" 
                :key="`child-${k}`" 
                :to="child.href || '#'" 
                class="block rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900" 
                :class="{ 'bg-gray-100 text-gray-900': child.isActive }"
                @click="() => handleChildClick(child.href)"
              >
                {{ child.title }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información del usuario -->
    <div class="mt-auto border-t p-2">
      <div v-if="isOpen" class="flex items-center gap-2">
        <img :src="user.avatar" alt="Avatar" class="h-5 w-5 rounded-full" />
        <div class="flex flex-col">
          <span class="text-[10px] font-medium leading-tight">{{ user.name }}</span>
          <span class="text-[9px] text-gray-500 leading-tight">{{ user.email }}</span>
        </div>
      </div>
      <div v-else class="flex justify-center">
        <img :src="user.avatar" alt="Avatar" class="h-5 w-5 rounded-full" />
      </div>
    </div>
  </div>
</template> 