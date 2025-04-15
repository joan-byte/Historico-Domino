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
  totalJugadores,
  selectedJugador, 
  isLoading, 
  error, 
  fetchJugadores, 
  updateJugador,
  deleteJugador
} = useJugadores();

// Configurar paginación
const { 
  currentPage, 
  pageSize, 
  totalPages, 
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
} = usePagination(totalJugadores, { initialPageSize: 10 });

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
    { field: 'idfed', header: 'IDFED', sortable: false },
    { field: 'nombre', header: 'Nombre', sortable: false },
    { field: 'apellidos', header: 'Apellidos', sortable: false },
    { field: 'nombre_club', header: 'Club', sortable: false },
    { 
      field: 'dni', 
      header: 'DNI', 
      sortable: false,
      render: (item: JugadorResponse) => item.dni ? item.dni : '' 
    },
    { 
      field: 'telefono', 
      header: 'Teléfono', 
      sortable: false,
      render: (item: JugadorResponse) => 
        (item.telefono && item.telefono !== 'nan') ? String(item.telefono) : ''
    },
    { field: 'email', header: 'Email', sortable: false }
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

// Función para editar un jugador
const editarJugador = (event: MouseEvent | null, idfed: string) => {
  if (event) event.stopPropagation();
  router.push(`/jugadores/modificar/${idfed}`);
};

// Función para confirmar eliminación de jugador
const confirmarEliminacion = async () => {
  if (jugadorToDelete.value) {
    const jugadorEliminadoNombre = `${jugadorToDelete.value.nombre} ${jugadorToDelete.value.apellidos}`;
    try {
      await deleteJugador(jugadorToDelete.value.idfed);
      
      // Mostrar mensaje de éxito
      successMessage.value = `El jugador ${jugadorEliminadoNombre} ha sido eliminado correctamente.`;
      showSuccess.value = true;
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
      
      showConfirmDialog.value = false;
      jugadorToDelete.value = null;
      // Volver a cargar los datos de la página actual después de eliminar
      fetchJugadores((currentPage.value - 1) * pageSize.value, pageSize.value);
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
  fetchJugadores(0, pageSize.value);
  
  // Agregar escuchadores para los eventos de edición
  document.addEventListener('edit-jugador', handleEditJugador);
});

// Limpiar los escuchadores de eventos al desmontar el componente
onUnmounted(() => {
  document.removeEventListener('edit-jugador', handleEditJugador);
});

// Observar cambios en currentPage y pageSize para recargar datos
watch([currentPage, pageSize], ([newPage, newSize], [oldPage, oldSize]) => {
  // Solo recargar si la página o el tamaño realmente cambiaron
  if (newPage !== oldPage || newSize !== oldSize) {
    const skip = (newPage - 1) * newSize;
    fetchJugadores(skip, newSize);
  }
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
    <div v-else-if="isListRoute" class="container mx-auto">
      <h1 class="text-2xl font-bold mb-4">Lista de Jugadores</h1>
      
      <!-- Mostrar mensaje de carga -->
      <div v-if="isLoading" class="text-center py-8">
        <p>Cargando jugadores...</p>
      </div>
      
      <!-- Mostrar mensaje de error -->
      <StatusMessage v-if="error" :message="error" type="error" />
      
      <!-- Mostrar tabla y paginación si no hay error y no está cargando -->
      <div v-if="!isLoading && !error">
        <DataTable 
          :items="jugadores" 
          :columns="columns" 
          :itemKey="'idfed'" 
          :row-class="getRowClass"
          @row-click="handleRowClick"
        />
        
        <!-- --- Componente de Paginación --- -->
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :page-size-options="pageSizeOptions"
          :show-page-size-selector="true"
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          :page-range="pageRange"
          @update:currentPage="goToPage"
          @update:pageSize="setPageSize"
          @next-page="nextPage"
          @prev-page="prevPage"
          @first-page="firstPage"
          @last-page="lastPage"
          class="mt-4"
        />
        <!-- --- Fin Paginación --- -->
      </div>
    </div>

    <!-- Vista alternativa cuando no estamos en la ruta principal ni en la lista -->
    <router-view v-else />

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

    <!-- Mensaje de éxito flotante -->
    <transition name="fade">
      <StatusMessage v-if="showSuccess" :message="successMessage" type="success" class="fixed bottom-4 right-4 z-50" />
    </transition>
  </div>
</template>

<style scoped>
/* Estilos para la transición del mensaje de éxito */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 