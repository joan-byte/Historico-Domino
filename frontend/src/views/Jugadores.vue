<script setup lang="ts">
// Vista de Jugadores - Muestra la lista de jugadores y permite operaciones CRUD
import { onMounted, ref, watch, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StatusMessage from '../components/ui/StatusMessage.vue';
import Pagination from '../components/ui/Pagination.vue';
import DataTable from '../components/ui/DataTable.vue';
import { useJugadores } from '../composables/useJugadores';
import { usePagination } from '../composables/usePagination';
import type { JugadorResponse } from '../lib/jugadorService';

// Definir la interfaz para columna de DataTable conforme al componente
interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  class?: string;
  render?: (item: JugadorResponse) => string;
}

// Router y route
const router = useRouter();
const route = useRoute();

// Usar el composable de jugadores
const { 
  jugadores, 
  selectedJugador, 
  isLoading, 
  error, 
  fetchJugadores, 
  updateJugador,
  deleteJugador,
  sortedJugadores
} = useJugadores();

// Configurar paginación
const { 
  currentPage, 
  pageSize, 
  totalPages, 
  paginatedItems: paginatedJugadores, 
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
} = usePagination(sortedJugadores);

// Estado para ordenamiento
const sortBy = ref('apellidos');
const sortDir = ref(1); // 1 = asc, -1 = desc

// Estado para confirmación de eliminación
const showConfirmDialog = ref(false);
const jugadorToDelete = ref<JugadorResponse | null>(null);
const successMessage = ref<string>('');
const showSuccess = ref(false);

// Definir las columnas para la tabla
const columns = computed<Column[]>(() => {
  const baseColumns: Column[] = [
    { field: 'idfed', header: 'IDFED', sortable: true },
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'apellidos', header: 'Apellidos', sortable: true },
    { field: 'nombre_club', header: 'Club', sortable: true },
    { field: 'telefono', header: 'Teléfono', sortable: true },
    { field: 'email', header: 'Email', sortable: true }
  ];
  
  // Solo añadir acciones en modo edición, no en modo eliminación
  if (route.query.action === 'edit') {
    baseColumns.push({
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      render: (item: JugadorResponse) => {
        return `<button class="text-blue-600 hover:text-blue-800" onclick="document.dispatchEvent(new CustomEvent('edit-jugador', {detail: '${item.idfed}' }))" type="button" aria-label="Editar jugador">Editar</button>`;
      }
    });
  }
  
  return baseColumns;
});

// Función para manejar el clic en una fila de la tabla
const handleRowClick = (item: JugadorResponse) => {
  selectedJugador.value = item;
  
  // Si estamos en modo edición, navegar a la página correspondiente
  if (route.query.action === 'edit') {
    editarJugador(null, item.idfed);
  } else if (route.query.action === 'delete') {
    // En modo eliminación, mostrar diálogo de confirmación en lugar de navegar
    jugadorToDelete.value = item;
    showConfirmDialog.value = true;
  }
};

// Función para ordenar las filas de la tabla
const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortDir.value = -sortDir.value;
  } else {
    sortBy.value = field;
    sortDir.value = 1;
  }
};

// Función para obtener la dirección de ordenamiento
const getSortDir = (field: string) => {
  if (sortBy.value === field) {
    return sortDir.value === 1 ? 'asc' : 'desc';
  }
  return null;
};

// Función para editar un jugador
const editarJugador = (event: MouseEvent | null, idfed: string) => {
  if (event) event.stopPropagation();
  router.push(`/jugadores/modificar/${idfed}`);
};

// Función para confirmar eliminación de jugador
const confirmarEliminacion = async () => {
  if (jugadorToDelete.value) {
    try {
      await deleteJugador(jugadorToDelete.value.idfed);
      
      // Mostrar mensaje de éxito
      successMessage.value = `El jugador ${jugadorToDelete.value.nombre} ${jugadorToDelete.value.apellidos} ha sido eliminado correctamente.`;
      showSuccess.value = true;
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
      
      showConfirmDialog.value = false;
      jugadorToDelete.value = null;
    } catch (err) {
      // No vamos a registrar el error en la consola, ya usamos el valor error
    }
  }
};

// Función para cancelar eliminación
const cancelarEliminacion = () => {
  showConfirmDialog.value = false;
  jugadorToDelete.value = null;
};

// Función para obtener la clase de fila basada en el contexto
const getRowClass = (item: JugadorResponse): string => {
  if (route.query.action === 'edit' || route.query.action === 'delete') {
    if (selectedJugador.value?.idfed === item.idfed) {
      return 'bg-blue-50';
    }
  }
  return '';
};

// Referenciar las funciones de los manejadores de eventos para poder eliminarlas
const handleEditJugador = (e: any) => {
  editarJugador(null, e.detail);
};

// Cargar los jugadores al montar el componente
onMounted(() => {
  fetchJugadores();
  
  // Agregar escuchadores para los eventos de edición
  document.addEventListener('edit-jugador', handleEditJugador);
});

// Limpiar los escuchadores de eventos al desmontar el componente
onUnmounted(() => {
  document.removeEventListener('edit-jugador', handleEditJugador);
});

// Determinar si estamos en la ruta principal de jugadores o una subruta
const isRootRoute = computed(() => {
  return route.path === '/jugadores' || route.path === '/jugadores/';
});

const isCrudRoute = computed(() => {
  // Detección más robusta de la ruta CRUD, considerando posibles variaciones
  return route.path === '/jugadores/crud' || route.path === '/jugadores/crud/';
});

const isListRoute = computed(() => {
  return route.path === '/jugadores' || route.path.includes('/jugadores/lista');
});

// Mostrar la vista principal si estamos en la ruta principal o en la ruta CRUD
const showMainView = computed(() => {
  return isRootRoute.value || isCrudRoute.value;
});

// Opciones de CRUD para la vista principal
const crudOptions = [
  { 
    title: 'CRUD',
    route: '/jugadores/crud',
    description: 'Gestionar operaciones CRUD de jugadores',
    icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  { 
    title: 'Lista',
    route: '/jugadores/lista', 
    description: 'Ver todos los jugadores registrados',
    icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  { 
    title: 'Estadísticas',
    route: '/jugadores/estadisticas', 
    description: 'Ver métricas y estadísticas de jugadores',
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
        <h1 class="text-2xl font-bold">Gestión de Jugadores</h1>
        <p class="text-gray-600">Selecciona una operación para administrar los jugadores</p>
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

    <!-- Vista de lista de jugadores -->
    <div v-else-if="isListRoute" class="space-y-4">
      <!-- Título dinámico según el contexto -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">
          {{ route.query.action === 'edit' ? 'Elige el jugador a editar' : route.query.action === 'delete' ? 'Elige el jugador a eliminar' : 'Lista de Jugadores' }}
        </h1>
      </div>

      <!-- Instrucciones para el modo edición -->
      <div v-if="route.query.action === 'edit'" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
        Haz clic en el jugador que deseas editar. Se abrirá el formulario de edición con los datos del jugador seleccionado.
      </div>
      
      <!-- Instrucciones para el modo eliminación -->
      <div v-if="route.query.action === 'delete'" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        Haz clic en el jugador que deseas eliminar. Se abrirá la pantalla de confirmación para eliminar el jugador seleccionado.
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
        message="Cargando jugadores..."
        class="mb-4"
      />
      
      <!-- Mensaje de éxito -->
      <StatusMessage
        type="success"
        :show="showSuccess"
        :message="successMessage"
        class="mb-4"
      />
      
      <!-- Tabla de datos -->
      <div class="rounded-md border">
        <DataTable 
            :items="paginatedJugadores" 
            :columns="columns"
            itemKey="idfed"
            hover
            striped
            @row-click="handleRowClick"
            @sort="handleSort"
            :sort-field="sortBy"
            :sort-direction="getSortDir(sortBy)"
            :row-class="getRowClass"
        >
          <template #empty>
            No hay jugadores que coincidan con los criterios de búsqueda.
          </template>
        </DataTable>
      </div>
      
      <!-- Paginación -->
      <div class="flex justify-center mt-4">
        <Pagination
          v-if="jugadores.length > 0"
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
      
      <!-- Modal de confirmación para eliminar jugador -->
      <div v-if="showConfirmDialog" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
        <div class="relative p-6 bg-white w-full max-w-md m-auto rounded-md shadow-lg">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900">¿Estás seguro de eliminar este jugador?</h3>
            <p class="mt-2 text-sm text-gray-500">
              Esta acción no se puede deshacer. El jugador 
              <span class="font-medium">{{ jugadorToDelete?.nombre }} {{ jugadorToDelete?.apellidos }}</span> 
              será eliminado permanentemente.
            </p>
          </div>
          
          <div class="bg-gray-50 p-4 -mx-6 -mb-6 rounded-b-md">
            <div class="flex justify-end gap-2">
              <button 
                @click="cancelarEliminacion" 
                class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                @click="confirmarEliminacion" 
                class="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista alternativa cuando no estamos en la ruta principal ni en la lista -->
    <router-view v-else />
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 