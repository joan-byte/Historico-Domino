<!-- Vista de Clubes - Muestra la lista de clubs y permite operaciones CRUD -->
<script setup lang="ts">
import { onMounted, ref, watch, inject, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClubs } from '../composables/useClubs';
import { usePagination } from '../composables/usePagination';
import StatusMessage from '../components/ui/StatusMessage.vue';
import Pagination from '../components/ui/Pagination.vue';
import DataTable from '../components/ui/DataTable.vue';
import type { ClubResponse } from '../lib/clubService';

const router = useRouter();
const route = useRoute();
const { clubs, isLoading, error, fetchClubs, sortedClubs } = useClubs();
const selectedClub = ref<ClubResponse | null>(null);

// Emitir el club seleccionado para que el dashboard pueda destacar las tarjetas correspondientes
// Esto asume que el dashboard está escuchando este evento o usando un estado global
const emitSelectedClub = (club: ClubResponse | null) => {
  // Usar algún mecanismo para comunicar con el componente padre
  // Por ejemplo, un evento personalizado o estado global
  window.dispatchEvent(new CustomEvent('club-selected', { 
    detail: club 
  }));
};

// Configurar paginación
const { 
  currentPage, 
  pageSize, 
  totalPages, 
  paginatedItems, 
  canGoPrev, 
  canGoNext, 
  pageRange,
  pageSizeOptions,
  goToPage, 
  nextPage, 
  prevPage, 
  setPageSize,
  firstPage,
  lastPage
} = usePagination(sortedClubs);

// Definir las columnas para la tabla
const columns = computed(() => {
  return [
    {
      field: 'codigo_club',
      header: 'Código',
      sortable: true
    },
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      field: 'cp',
      header: 'CP',
      sortable: true
    },
    {
      field: 'numero_club',
      header: 'Número',
      sortable: true
    },
    {
      field: 'persona_contacto',
      header: 'Persona de Contacto',
      sortable: true
    },
    {
      field: 'telefono',
      header: 'Teléfono',
      sortable: true
    },
    {
      field: 'direccion',
      header: 'Dirección',
      sortable: true
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true
    }
  ];
});

// Cargar la lista de clubs al montar el componente
onMounted(() => {
  fetchClubs();
});

// Manejar el clic en una fila
const handleRowClick = (club: ClubResponse) => {
  // Si venimos de la ruta CRUD y queremos editar
  if (route.query.action === 'edit') {
    router.push(`/clubes/modificar/${club.codigo_club}`);
    return;
  }
  
  // Comportamiento normal de selección
  if (selectedClub.value && selectedClub.value.codigo_club === club.codigo_club) {
    selectedClub.value = null;
    emitSelectedClub(null);
  } else {
    selectedClub.value = club;
    emitSelectedClub(club);
  }
};

// Verificar si una fila está seleccionada
const isRowSelected = (club: ClubResponse): boolean => {
  return selectedClub.value?.codigo_club === club.codigo_club;
};

// Limpiar la selección cuando se desmonta el componente
onUnmounted(() => {
  selectedClub.value = null;
  emitSelectedClub(null);
});

// Definiciones para las tarjetas CRUD
interface CrudOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  buttonText?: string;
  disabled?: boolean;
}

// Opciones CRUD para las tarjetas superiores
const crudCardOptions: CrudOption[] = [
  {
    title: 'CRUD',
    description: 'Gestionar operaciones CRUD de clubs',
    icon: 'document',
    route: '/clubes/crud',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    title: 'Lista',
    description: 'Ver todos los clubs registrados',
    icon: 'list',
    route: '/clubes/lista',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    title: 'Estadísticas',
    description: 'Ver métricas y estadísticas de clubs',
    icon: 'chart',
    route: '/clubes/estadisticas',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  }
];

// Función para navegar
const navigateTo = (route: string): void => {
  console.log('Navegando a: ', route);
  router.push(route);
};

// Función para cambiar de página
const changePage = (page: number) => {
  goToPage(page);
};

// Determinar si estamos en la ruta principal de clubes o una subruta
const isRootRoute = computed(() => {
  return route.path === '/clubes' || route.path === '/clubes/';
});

const isCrudRoute = computed(() => {
  // Detección más robusta de la ruta CRUD, considerando posibles variaciones
  return route.path === '/clubes/crud' || route.path === '/clubes/crud/';
});

const isListRoute = computed(() => {
  return route.path === '/clubes/lista';
});

// Mostrar la vista principal si estamos en la ruta principal o en la ruta CRUD
const showMainView = computed(() => {
  return isRootRoute.value || isCrudRoute.value;
});

// Actualizar colores y textos de botones en las tarjetas CRUD basados en el club seleccionado
const mainCrudOptionsWithState = computed(() => {
  console.log('Recalculando opciones, ruta actual:', route.path, 'Es ruta CRUD:', isCrudRoute.value);
  
  // Si estamos en la ruta CRUD, mostrar Crear, Editar y Eliminar
  if (isCrudRoute.value) {
    return [
      {
        title: 'Crear Club',
        description: 'Añadir un nuevo club a la base de datos',
        icon: 'plus',
        route: '/clubes/crear',
        color: 'bg-green-100 text-green-800 border-green-300',
        buttonText: 'Ir a crear'
      },
      {
        title: 'Editar Club',
        description: 'Modificar información de un club existente',
        icon: 'edit',
        route: '/clubes/editar',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        buttonText: 'Ir a editar'
      },
      {
        title: 'Eliminar Club',
        description: 'Eliminar un club de la base de datos',
        icon: 'trash',
        route: '/clubes/eliminar',
        color: 'bg-red-100 text-red-800 border-red-300',
        buttonText: 'Ir a eliminar'
      }
    ];
  }
  // Para la ruta principal, mantener las opciones originales
  return [
    {
      title: 'Crear Club',
      description: 'Añadir un nuevo club a la base de datos',
      icon: 'plus',
      route: '/clubes/crear',
      color: 'bg-green-100 text-green-800 border-green-300',
      buttonText: 'Ir a crear'
    },
    {
      title: 'Ver los clubs',
      description: 'Ver todos los clubs registrados',
      icon: 'list',
      route: '/clubes/lista',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      buttonText: 'Ver todos los clubs'
    },
    {
      title: 'Estadísticas de clubs',
      description: 'Ver métricas y estadísticas de clubs',
      icon: 'chart',
      route: '/clubes/estadisticas',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      buttonText: 'Ver estadísticas'
    }
  ];
});

// Función para editar un club
const editarClub = (club: ClubResponse) => {
  router.push(`/clubes/modificar/${club.codigo_club}`);
};

// Función para eliminar un club
const eliminarClub = (club: ClubResponse) => {
  router.push(`/clubes/eliminar/${club.codigo_club}`);
};

// Función para obtener la clase de fila basada en el contexto
const getRowClass = (item: ClubResponse): string => {
  if (route.query.action === 'edit') {
    return isRowSelected(item) ? 'bg-blue-50' : '';
  }
  return '';
};
</script>

<template>
  <div class="space-y-6">
    <!-- Vista principal - muestra opciones de CRUD cuando estamos en la ruta principal o CRUD -->
    <div v-if="showMainView" class="container mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Gestión de Clubs</h1>
        <p class="text-gray-600">Selecciona una operación para administrar los clubs</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Si estamos en la ruta /clubes/crud, mostrar las tarjetas CRUD específicas -->
        <template v-if="route.path.includes('/clubes/crud')">
          <div 
            v-for="(option, index) in [
              {
                title: 'Crear Club',
                description: 'Añadir un nuevo club a la base de datos',
                icon: 'plus',
                route: '/clubes/crear',
                color: 'bg-green-100 text-green-800 border-green-300',
                buttonText: 'Ir a crear'
              },
              {
                title: 'Editar Club',
                description: 'Modificar información de un club existente',
                icon: 'edit',
                route: '/clubes/editar',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                buttonText: 'Ir a editar'
              },
              {
                title: 'Eliminar Club',
                description: 'Eliminar un club de la base de datos',
                icon: 'trash',
                route: '/clubes/eliminar',
                color: 'bg-red-100 text-red-800 border-red-300',
                buttonText: 'Ir a eliminar'
              }
            ]" 
            :key="index" 
            class="border rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md relative"
            :class="option.color"
            @click="navigateTo(option.route)"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium">{{ option.title }}</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path 
                  :d="option.icon === 'plus' 
                    ? 'M12 4v16m8-8H4' 
                    : option.icon === 'edit' 
                    ? 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' 
                    : option.icon === 'trash' 
                    ? 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' 
                    : option.icon === 'list' 
                    ? 'M4 6h16M4 10h16M4 14h16M4 18h16' 
                    : 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z'"
                />
              </svg>
            </div>
            <div class="text-xs text-gray-600 mb-8">
              {{ option.description }}
            </div>
            <div class="absolute bottom-3 left-4 right-4">
              <router-link :to="option.route" class="text-xs text-blue-500 hover:underline">
                {{ option.buttonText }}
              </router-link>
            </div>
          </div>
        </template>
        
        <!-- Para otras rutas, mostrar las tarjetas originales -->
        <template v-else>
          <div 
            v-for="(option, index) in mainCrudOptionsWithState" 
            :key="index" 
            class="border rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md relative"
            :class="option.color"
            @click="navigateTo(option.route)"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium">{{ option.title }}</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path 
                  :d="option.icon === 'plus' 
                    ? 'M12 4v16m8-8H4' 
                    : option.icon === 'edit' 
                    ? 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' 
                    : option.icon === 'trash' 
                    ? 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' 
                    : option.icon === 'list' 
                    ? 'M4 6h16M4 10h16M4 14h16M4 18h16' 
                    : 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z'"
                />
              </svg>
            </div>
            <div class="text-xs text-gray-600 mb-8">
              {{ option.description }}
            </div>
            <div class="absolute bottom-3 left-4 right-4">
              <router-link :to="option.route" class="text-xs text-blue-500 hover:underline">
                {{ option.buttonText }}
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Vista de lista de clubes -->
    <div v-else-if="isListRoute" class="space-y-4">
      <!-- Título dinámico según el contexto -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">
          {{ route.query.action === 'edit' ? 'Elige el club a editar' : 'Lista de Clubes' }}
        </h1>
      </div>

      <!-- Instrucciones para el modo edición -->
      <div v-if="route.query.action === 'edit'" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
        Haz clic en el club que deseas editar. Se abrirá el formulario de edición con los datos del club seleccionado.
      </div>
      
      <!-- Mensajes de estado -->
      <StatusMessage
        type="error"
        :show="!!error"
        :message="error || ''"
        class="mb-4"
      />
      
      <StatusMessage
        type="loading"
        :show="isLoading"
        message="Cargando clubes..."
        class="mb-4"
      />
      
      <!-- Tabla de datos -->
      <div class="rounded-md border">
        <DataTable 
          :items="paginatedItems" 
          :columns="columns" 
          item-key="codigo_club"
          :hover="true"
          initial-sort-field="nombre"
          initial-sort-direction="asc"
          @row-click="handleRowClick"
          :row-class="(item: ClubResponse) => getRowClass(item)"
        >
          <template #empty>
            No hay clubes que coincidan con los criterios de búsqueda.
          </template>
        </DataTable>
      </div>
      
      <!-- Paginación -->
      <div class="flex justify-center mt-4">
        <Pagination
          v-if="clubs.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          :page-range="pageRange"
          :show-page-size-selector="true"
          :page-size-options="pageSizeOptions"
          :page-size="pageSize"
          @update:current-page="goToPage"
          @first-page="firstPage"
          @prev-page="prevPage"
          @next-page="nextPage"
          @last-page="lastPage"
          @update:page-size="setPageSize"
        />
      </div>
    </div>

    <!-- Vista alternativa cuando no estamos en la ruta principal ni en la lista -->
    <router-view v-else />
  </div>
</template>

<style scoped>
/* Estilos específicos de la vista si se necesitan */
</style> 