<script setup lang="ts">
// Vista para mostrar y gestionar los resultados de los campeonatos
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useResultados } from '../composables/useResultados';
import { usePagination } from '../composables/usePagination';
import type { ResultadoResponse, ResultadosListParams } from '../lib/resultadoService';
import DataTable from '../components/ui/DataTable.vue';
import Pagination from '../components/ui/Pagination.vue';
import StatusMessage from '../components/ui/StatusMessage.vue';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.vue'; // Asumiendo que existe
import { PAGINATION_CONFIG } from '../config';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Router y route
const router = useRouter();
const route = useRoute();

// Usar el composable de resultados
const {
  resultados,
  selectedResultado,
  isLoading,
  error,
  fetchResultados,
  removeResultado
} = useResultados();

// Paginación
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
} = usePagination(resultados, { 
  initialPageSize: PAGINATION_CONFIG.defaultPageSize, 
  initialPage: 1 
});

// Estado para ordenamiento
const sortBy = ref('fecha_campeonato');
const sortDir = ref(-1); // -1 = desc, 1 = asc

// Estado para filtros
const filtros = ref<ResultadosListParams>({
  tipo_campeonato_id: undefined,
  fecha_desde: undefined,
  fecha_hasta: undefined,
  idfed_jugador: undefined,
});

// Estado para confirmación de eliminación
const showConfirmDialog = ref(false);
const resultadoToDelete = ref<ResultadoResponse | null>(null);
const successMessage = ref<string>('');
const showSuccess = ref(false);

// Determinar el modo actual (list, edit, delete) basado en query param
const currentMode = computed(() => {
  const action = route.query.action;
  if (action === 'edit') return 'edit';
  if (action === 'delete') return 'delete';
  return 'list'; // Por defecto, modo lista
});

// Obtener parámetros de la ruta para filtros y paginación inicial
onMounted(() => {
  const queryParams = route.query;
  currentPage.value = parseInt(queryParams.page as string || '1', 10);
  pageSize.value = parseInt(queryParams.size as string || PAGINATION_CONFIG.defaultPageSize.toString(), 10);
  // TODO: Leer filtros iniciales de la query si es necesario
  
  // Cargar resultados iniciales
  fetchResultados({
    skip: (currentPage.value - 1) * pageSize.value,
    limit: pageSize.value,
    ...filtros.value // Aplicar filtros iniciales si existen
  });
});

// Observar cambios en filtros, paginación y ordenamiento para recargar datos
watch([currentPage, pageSize, filtros, sortBy, sortDir], () => {
  const params: ResultadosListParams = {
    skip: (currentPage.value - 1) * pageSize.value,
    limit: pageSize.value,
    ...filtros.value,
    // TODO: Añadir parámetros de ordenamiento si la API los soporta
  };
  fetchResultados(params);
  
  // Actualizar query params (opcional, para mantener estado en URL)
  router.replace({ query: { 
    ...route.query, // Mantener otros query params
    page: currentPage.value.toString(), 
    size: pageSize.value.toString(),
    // ...otros filtros...
  }});
}, { deep: true });

// Resultados ordenados
const sortedResultados = computed(() => {
  const sorted = [...resultados.value]; // Usar resultados directamente, la paginación se encarga del resto
  if (sortBy.value) {
    sorted.sort((a, b) => {
      let valA = (a as any)[sortBy.value];
      let valB = (b as any)[sortBy.value];

      // Manejo especial para fechas
      if (sortBy.value === 'fecha_campeonato') {
        valA = parseISO(valA).getTime();
        valB = parseISO(valB).getTime();
      }
      
      if (valA < valB) return -1 * sortDir.value;
      if (valA > valB) return 1 * sortDir.value;
      return 0;
    });
  }
  return sorted;
});

// Columnas para la tabla
const columns = computed(() => {
  const baseColumns = [
    { field: 'fecha_campeonato', header: 'Fecha', sortable: true, render: (item: ResultadoResponse): string => item.fecha_campeonato ? format(parseISO(item.fecha_campeonato), 'dd/MM/yyyy', { locale: es }) : '-' },
    { field: 'nombre_campeonato', header: 'Campeonato', sortable: true },
    { field: 'nch', header: 'NCH', sortable: true },
    { field: 'nombre_jugador', header: 'Jugador', sortable: true, render: (item: ResultadoResponse): string => `${item.nombre_jugador || ''} ${item.apellido_jugador || ''}`.trim() || '-' },
    { field: 'nombre_club_jugador', header: 'Club Jugador', sortable: true },
    { field: 'nombre_pareja', header: 'Pareja', sortable: true, render: (item: ResultadoResponse): string => item.idfed_pareja ? (`${item.nombre_pareja || ''} ${item.apellido_pareja || ''}`.trim() || '-') : '-' },
    { field: 'nombre_club_pareja', header: 'Club Pareja', sortable: true, render: (item: ResultadoResponse): string => item.codigo_club_pareja ? (item.nombre_club_pareja || '-') : '-' },
    { field: 'pos', header: 'Pos', sortable: true },
    { field: 'partida', header: 'Partida', sortable: true },
    { field: 'mesa', header: 'Mesa', sortable: true },
    { field: 'gb', header: 'GB', sortable: true, render: (item: ResultadoResponse): string => item.gb ? 'A' : 'B' },
    { field: 'pg', header: 'PG', sortable: true },
    { field: 'dif', header: 'DIF', sortable: true },
    { field: 'pv', header: 'PV', sortable: true },
    { field: 'pt', header: 'PT', sortable: true },
    { field: 'mg', header: 'MG', sortable: true },
  ];

  // Solo añadir columna de acciones si no estamos en modo selección (edit/delete)
  // Usaremos el slot #acciones para mostrar botones condicionalmente
  if (currentMode.value === 'list') {
      baseColumns.push({ field: 'acciones', header: 'Acciones', sortable: false });
  }
  
  return baseColumns;
});

// Función para ordenar la tabla
const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortDir.value = -sortDir.value;
  } else {
    sortBy.value = field;
    sortDir.value = 1;
  }
};

// Función para obtener la dirección de ordenamiento para la UI
const getSortDir = (field: string) => {
  if (sortBy.value === field) {
    return sortDir.value === 1 ? 'asc' : 'desc';
  }
  return null;
};

// Función para navegar a la página de edición
const editarResultado = (resultado: ResultadoResponse) => {
  // Navegar a la ruta de modificación con los identificadores
  router.push(`/resultados/modificar/${resultado.nch}/${resultado.fecha_campeonato}/${resultado.idfed_jugador}`);
};

// Función para iniciar el proceso de eliminación
const solicitarEliminacion = (resultado: ResultadoResponse) => {
  resultadoToDelete.value = resultado;
  showConfirmDialog.value = true;
};

// Función para confirmar la eliminación
const confirmarEliminacion = async () => {
  if (!resultadoToDelete.value) return;
  
  try {
    await removeResultado(
      resultadoToDelete.value.nch, 
      resultadoToDelete.value.fecha_campeonato, 
      resultadoToDelete.value.idfed_jugador
    );
    successMessage.value = 'Resultado eliminado correctamente.';
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, 3000);
  } catch (err) {
    // El error ya se maneja en el composable, se muestra en el StatusMessage
  } finally {
    showConfirmDialog.value = false;
    resultadoToDelete.value = null;
  }
};

// Función para cancelar la eliminación
const cancelarEliminacion = () => {
  showConfirmDialog.value = false;
  resultadoToDelete.value = null;
};

// Función para aplicar filtros
const aplicarFiltros = () => {
  currentPage.value = 1; // Resetear a la primera página al aplicar filtros
  // La carga de datos se dispara por el watcher
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    tipo_campeonato_id: undefined,
    fecha_desde: undefined,
    fecha_hasta: undefined,
    idfed_jugador: undefined,
  };
  currentPage.value = 1;
  // La carga de datos se dispara por el watcher
};

// Función para manejar click en fila
const handleRowClick = (item: ResultadoResponse) => {
  if (currentMode.value === 'edit') {
    editarResultado(item);
  } else if (currentMode.value === 'delete') {
    solicitarEliminacion(item);
  } else {
    // Podrías hacer algo en modo lista, como mostrar detalles, o nada
    console.log('Row clicked in list mode:', item);
  }
};

// Clase CSS para la fila basada en el modo
const getRowClass = (item: any) => {
   if (currentMode.value === 'edit' || currentMode.value === 'delete') {
     return 'cursor-pointer hover:bg-blue-50';
   }
   return '';
 };

</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        <span v-if="currentMode === 'edit'">Selecciona un Resultado para Modificar</span>
        <span v-else-if="currentMode === 'delete'">Selecciona un Resultado para Eliminar</span>
        <span v-else>Lista de Resultados</span>
      </h1>
      <!-- Ocultar botón "Nuevo Resultado" en modo edit/delete -->
      <router-link
        v-if="currentMode === 'list'"
        to="/resultados/nuevo"
        class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
      >
        Nuevo Resultado
      </router-link>
       <router-link 
          v-else
          to="/resultados/crud"
          class="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Volver a CRUD
      </router-link>
    </div>

    <!-- Mensajes de estado -->
    <StatusMessage type="error" :show="!!error" :message="error || ''" class="mb-4" />
    <StatusMessage type="success" :show="showSuccess" :message="successMessage" class="mb-4" />
    
    <!-- Filtros -->
    <div class="bg-white border rounded-md shadow-sm p-6 mb-6">
      <h2 class="text-lg font-medium mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- TODO: Añadir select para tipo campeonato si se necesita -->
        <div>
          <label for="filtro-idfed" class="block text-sm font-medium text-gray-700">IDFED Jugador</label>
          <input 
            id="filtro-idfed"
            name="filtro-idfed"
            v-model="filtros.idfed_jugador" 
            type="text" 
            placeholder="Filtrar por IDFED" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
          />
        </div>
        <div>
          <label for="filtro-fecha-desde" class="block text-sm font-medium text-gray-700">Fecha Desde</label>
            <input 
            id="filtro-fecha-desde"
            name="filtro-fecha-desde"
            v-model="filtros.fecha_desde" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
            />
        </div>
        <div>
          <label for="filtro-fecha-hasta" class="block text-sm font-medium text-gray-700">Fecha Hasta</label>
            <input 
            id="filtro-fecha-hasta"
            name="filtro-fecha-hasta"
            v-model="filtros.fecha_hasta" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
            />
        </div>
        <!-- Añadir select para tipo_campeonato_id si se necesita -->
      </div>
      <div class="flex justify-end gap-2">
        <button 
          @click="limpiarFiltros"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Limpiar
        </button>
        <button 
          @click="aplicarFiltros"
          class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
    
    <!-- Tabla de Resultados -->
    <div class="bg-white border rounded-md shadow-sm overflow-x-auto">
      <DataTable
        :items="paginatedItems"
        :columns="columns"
        item-key="_uniqueKey"
        :is-loading="isLoading"
        :sort-by="sortBy"
        :sort-dir="sortDir === 1 ? 'asc' : 'desc'"
        @sort="handleSort"
        :row-class="getRowClass" 
        @row-click="handleRowClick" 
      >
        <template #acciones="{ item }">
          <!-- Mostrar botones solo en modo lista -->
          <div v-if="currentMode === 'list'" class="flex space-x-2">
            <button 
              @click.stop="editarResultado(item)"
              class="text-blue-600 hover:text-blue-800 text-sm"
              aria-label="Editar resultado"
            >
              Editar
            </button>
                  <button 
              @click.stop="solicitarEliminacion(item)"
              class="text-red-600 hover:text-red-800 text-sm"
              aria-label="Eliminar resultado"
                  >
                    Eliminar
                  </button>
                </div>
        </template>
      </DataTable>
    </div>

    <!-- Paginación -->
    <Pagination
      v-if="!isLoading && totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :page-range="pageRange"
      @update:currentPage="goToPage"
      @update:pageSize="setPageSize"
      @next="nextPage"
      @prev="prevPage"
      @first="firstPage"
      @last="lastPage"
      class="mt-6"
    />

    <!-- Diálogo de Confirmación -->
    <ConfirmationDialog
      :show="showConfirmDialog"
      title="Confirmar Eliminación"
      message="¿Estás seguro de que deseas eliminar este resultado? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmarEliminacion"
      @cancel="cancelarEliminacion"
    />

  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 