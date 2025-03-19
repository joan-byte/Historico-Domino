<!-- Vista de Clubs - Muestra las opciones de gestión de clubs -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClubs } from '../composables/useClubs';
import { usePagination } from '../composables/usePagination';
import StatusMessage from '../components/ui/StatusMessage.vue';
import Pagination from '../components/ui/Pagination.vue';
import DataTable from '../components/ui/DataTable.vue';
import type { ClubResponse } from '../lib/clubService';

const router = useRouter();
const route = useRoute();

// Usar el composable de clubs
const { clubs, isLoading, error, fetchClubs, sortedClubs } = useClubs();

// Configurar paginación
const { 
  currentPage, 
  pageSize, 
  totalPages, 
  paginatedItems: paginatedClubs, 
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

// Determinar si estamos en la ruta principal de clubs o una subruta
const isRootRoute = computed(() => {
  return route.path === '/clubes' || route.path === '/clubes/';
});

const isCrudRoute = computed(() => {
  return route.path === '/clubes/crud' || route.path === '/clubes/crud/';
});

const isListRoute = computed(() => {
  return route.path === '/clubes/lista';
});

// Mostrar la vista principal si estamos en la ruta principal o en la ruta CRUD
const showMainView = computed(() => {
  return isRootRoute.value || isCrudRoute.value;
});

// Opciones de CRUD para la vista principal
const crudOptions = [
  { 
    title: 'CRUD',
    route: '/clubes/crud',
    description: 'Gestionar operaciones CRUD de clubs',
    icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  { 
    title: 'Lista',
    route: '/clubes/lista', 
    description: 'Ver todos los clubs registrados',
    icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  { 
    title: 'Estadísticas',
    route: '/clubes/estadisticas', 
    description: 'Ver métricas y estadísticas de clubs',
    icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  }
];

// Definir las columnas para la tabla
const columns = computed(() => [
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
]);

// Cargar la lista de clubs al montar el componente
onMounted(() => {
  if (isListRoute.value) {
    fetchClubs();
  }
});

// Función para navegar a una ruta
const navigateTo = (routePath: string) => {
  router.push(routePath);
};

// Manejar el clic en una fila
const handleRowClick = (club: ClubResponse) => {
  // Si venimos de la ruta CRUD y queremos editar
  if (route.query.action === 'edit') {
    router.push(`/clubes/modificar/${club.codigo_club}`);
    return;
  }
};

// Función para obtener la clase de fila basada en el contexto
const getRowClass = (item: ClubResponse): string => {
  if (route.query.action === 'edit') {
    return 'hover:bg-blue-50 cursor-pointer';
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

    <!-- Vista de lista de clubs -->
    <div v-else-if="isListRoute" class="space-y-4">
      <!-- Título dinámico según el contexto -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">
          {{ route.query.action === 'edit' ? 'Elige el club a editar' : 'Lista de Clubs' }}
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
        message="Cargando clubs..."
        class="mb-4"
      />
      
      <!-- Tabla de datos -->
      <div class="rounded-md border">
        <DataTable 
          :items="paginatedClubs" 
          :columns="columns" 
          item-key="codigo_club"
          :hover="true"
          initial-sort-field="nombre"
          initial-sort-direction="asc"
          @row-click="handleRowClick"
          :row-class="getRowClass"
        >
          <template #empty>
            No hay clubs que coincidan con los criterios de búsqueda.
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

    <!-- Router view para mostrar las subvistas -->
    <router-view v-else></router-view>
  </div>
</template> 