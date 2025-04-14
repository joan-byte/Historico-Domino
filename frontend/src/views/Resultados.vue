<script setup lang="ts">
// Vista para mostrar y gestionar los resultados de los campeonatos
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useResultados } from '../composables/useResultados';
// import { usePagination } from '../composables/usePagination'; // Eliminado
import type { ResultadoResponse } from '../lib/resultadoService';
import DataTable from '../components/ui/DataTable.vue';
import Pagination from '../components/ui/Pagination.vue';
import StatusMessage from '../components/ui/StatusMessage.vue';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.vue'; // Asumiendo que existe
import { PAGINATION_CONFIG } from '../config';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Columna } from '@/interfaces/DataTable';
import type { FiltrosResultados } from '@/types/filtros'; // Usar el tipo correcto

// Router y route
const router = useRouter();
const route = useRoute();

// Usar el composable de resultados
const {
  resultados,
  totalResultados, // Necesitamos el total del backend
  selectedResultado,
  isLoading,
  error,
  fetchResultados,
  removeResultado, // Mantenemos removeResultado si esa es la función en el composable
  reloadCurrentPage, // Usar la función de recarga si existe
  currentFiltros // Necesitamos los filtros actuales para recargar
} = useResultados();

// Estado para paginación (manejado por el backend)
const currentPage = ref(1);
const pageSize = ref(PAGINATION_CONFIG.defaultPageSize); // Tamaño de página por defecto
const pageSizeOptions = PAGINATION_CONFIG.pageSizeOptions; // Opciones de tamaño

// Eliminar composable de paginación local
/*
const {
  // ... variables eliminadas ...
} = usePagination(resultados, { // Se elimina esta llamada
  initialPageSize: PAGINATION_CONFIG.defaultPageSize, 
  initialPage: 1 
});
*/

// Estado para ordenamiento (local por ahora)
const sortBy = ref<keyof ResultadoResponse | null>('fecha_campeonato'); // Tipo más estricto
const sortDir = ref(-1); // -1 = desc, 1 = asc

// Estado para filtros
const filtros = ref<FiltrosResultados>({ // Usar tipo correcto
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

// Calcular totalPages basado en el total de items del backend
const totalPages = computed(() => {
  if (totalResultados.value === 0) return 1;
  return Math.ceil(totalResultados.value / pageSize.value);
});

// Propiedades computadas para el componente Pagination
const canGoPrev = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);

// Rango de páginas para mostrar en la paginación (lógica movida aquí)
const pageRange = computed(() => {
  const range: (number | string)[] = [];
  const delta = 2; // Número de páginas a mostrar alrededor de la actual
  const left = currentPage.value - delta;
  const right = currentPage.value + delta;
  let l: number | null = null;

  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value || (i >= left && i <= right)) {
      if (l !== null && i - l > 1) {
        range.push('...');
      }
      range.push(i);
      l = i;
    }
  }
  return range;
});


// Obtener parámetros de la ruta para filtros y paginación inicial
onMounted(() => {
  const queryParams = route.query;
  currentPage.value = parseInt(queryParams.page as string || '1', 10);
  pageSize.value = parseInt(queryParams.size as string || PAGINATION_CONFIG.defaultPageSize.toString(), 10);
  // TODO: Leer filtros iniciales de la query si es necesario
  // Filtros se inicializan vacíos, aplicarFiltros los cargará si es necesario

  // Cargar resultados iniciales usando skip/limit
  const skip = (currentPage.value - 1) * pageSize.value;
  const limit = pageSize.value;
  fetchResultados(filtros.value, skip, limit); // Pasar filtros, skip y limit
});

// Función para cambiar de página (llamado por el componente Pagination)
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    // La carga de datos se dispara por el watcher
  }
};

// Función para cambiar tamaño de página (llamado por el componente Pagination)
const setPageSize = (size: number) => {
  if (pageSizeOptions.includes(size) && size !== pageSize.value) {
    pageSize.value = size;
    currentPage.value = 1; // Resetear a la primera página
    // La carga de datos se dispara por el watcher
  }
};

// Funciones para navegación rápida (llamadas por el componente Pagination)
const nextPage = () => goToPage(currentPage.value + 1);
const prevPage = () => goToPage(currentPage.value - 1);
const firstPage = () => goToPage(1);
const lastPage = () => goToPage(totalPages.value);

// Observar cambios en filtros, paginación y ordenamiento para recargar datos
watch(
  [currentPage, pageSize, filtros], 
  () => {
    const skip = (currentPage.value - 1) * pageSize.value;
    const limit = pageSize.value;
    fetchResultados(filtros.value, skip, limit); // Usar filtros, skip y limit

    // Actualizar query params (opcional, para mantener estado en URL)
    router.replace({ 
      query: { 
        ...route.query, // Mantener otros query params
        page: currentPage.value.toString(), 
        size: pageSize.value.toString(),
        // ...otros filtros si se añaden a la URL...
      }
    });
  }, 
  { deep: true } // Necesario para detectar cambios dentro de filtros
);

// El watcher para ordenamiento se elimina porque fetchResultados no lo usa
// y sortedResultados lo maneja localmente.

// Resultados ordenados (ordena la página actual localmente)
const sortedResultados = computed(() => {
  // Asegurarse de que resultados.value es un array antes de intentar ordenar
  if (!Array.isArray(resultados.value)) {
    return []; // Devolver siempre un array vacío si los datos no están listos
  }

  const itemsToSort = [...resultados.value]; 

  if (sortBy.value) {
    itemsToSort.sort((a, b) => {
      let valA = (a as any)[sortBy.value!];
      let valB = (b as any)[sortBy.value!];

      // Manejo especial para fechas
      if (sortBy.value === 'fecha_campeonato' && typeof valA === 'string' && typeof valB === 'string') {
        try {
          valA = parseISO(valA).getTime();
          valB = parseISO(valB).getTime();
        } catch (e) {
          // Si falla el parseo, comparar como strings
        }
      } else if (typeof valA === 'string') {
         valA = valA.toLowerCase();
      } else if (typeof valB === 'string') {
         valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * sortDir.value;
      if (valA > valB) return 1 * sortDir.value;
      return 0;
    });
  }
  return itemsToSort;
});

// Columnas para la tabla
const columns = computed<Columna<ResultadoResponse>[]>(() => { // Usar tipo Columna
  const baseColumns: Columna<ResultadoResponse>[] = [ // Tipar el array
    { field: 'fecha_campeonato', header: 'Fecha', sortable: true, render: (item) => item.fecha_campeonato ? format(parseISO(item.fecha_campeonato), 'dd/MM/yyyy', { locale: es }) : '-' },
    { field: 'nombre_campeonato', header: 'Campeonato', sortable: true },
    { field: 'nch', header: 'NCH', sortable: true },
    { field: 'nombre_jugador', header: 'Jugador', sortable: true, render: (item) => `${item.nombre_jugador || ''} ${item.apellido_jugador || ''}`.trim() || '-' },
    { field: 'nombre_club_jugador', header: 'Club Jugador', sortable: true },
    { field: 'nombre_pareja', header: 'Pareja', sortable: true, render: (item) => item.idfed_pareja ? (`${item.nombre_pareja || ''} ${item.apellido_pareja || ''}`.trim() || '-') : '-' },
    { field: 'nombre_club_pareja', header: 'Club Pareja', sortable: true, render: (item) => item.codigo_club_pareja ? (item.nombre_club_pareja || '-') : '-' },
    { field: 'pos', header: 'Pos', sortable: true },
    { field: 'partida', header: 'Partida', sortable: true },
    { field: 'mesa', header: 'Mesa', sortable: true },
    // Asegurarse que 'gb' es un número 0 o 1 si se usa como índice
    { field: 'gb', header: 'GB', sortable: true, render: (item) => typeof item.gb === 'number' ? ['A', 'B'][item.gb] : (item.gb ? 'A' : 'B') }, 
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

// Función para ordenar la tabla (modifica estado local, no llama a fetch)
const handleSort = (field: keyof ResultadoResponse | string) => {
  const sortKey = field as keyof ResultadoResponse; // Castear a tipo más específico
  if (sortBy.value === sortKey) {
    sortDir.value = -sortDir.value;
  } else {
    sortBy.value = sortKey;
    sortDir.value = 1;
  }
};

// Función para obtener la dirección de ordenamiento para la UI
const getSortDir = (field: keyof ResultadoResponse | string) => {
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
    // Usar removeResultado (o como se llame en el composable) con la PK correcta
    await removeResultado(
      resultadoToDelete.value.nch, 
      resultadoToDelete.value.fecha_campeonato, 
      resultadoToDelete.value.idfed_jugador
    );
    successMessage.value = 'Resultado eliminado correctamente.';
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, 3000);
    // No es necesario llamar a reloadCurrentPage si removeResultado ya hace refetch
  } catch (err) {
    // El error ya se maneja en el composable, se muestra en el StatusMessage
    // Se podría añadir lógica específica aquí si fuera necesario
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
  // La carga de datos se dispara por el watcher al cambiar currentPage o filtros
  // Asegurarse que el watcher reacciona a cambios en filtros (deep: true)
  // Forzar trigger si la página ya es 1:
  const skip = 0;
  const limit = pageSize.value;
  fetchResultados(filtros.value, skip, limit);
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = { // Resetear el objeto de filtros
    tipo_campeonato_id: undefined,
    fecha_desde: undefined,
    fecha_hasta: undefined,
    idfed_jugador: undefined,
  };
  if (currentPage.value !== 1) {
      currentPage.value = 1; // Esto dispara el watcher
  } else {
      // Si ya estamos en la página 1, forzar recarga con filtros limpios
      const skip = 0;
      const limit = pageSize.value;
      fetchResultados(filtros.value, skip, limit);
  }
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
        <!-- Ejemplo:
        <div>
          <label for="filtro-tipo" class="block text-sm font-medium text-gray-700">Tipo Campeonato</label>
          <select 
            id="filtro-tipo" 
            v-model="filtros.tipo_campeonato_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
          >
            <option :value="undefined">Todos</option>
            <option v-for="tipo in tiposCampeonato" :key="tipo.id" :value="tipo.id">
              {{ tipo.nombre }}
            </option>
          </select>
        </div> 
        -->
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
        v-if="!isLoading"
        :items="sortedResultados"
        :columns="columns"
        :item-key="'_uniqueKey'"
        :is-loading="isLoading"
        :sort-by="sortBy"
        :sort-dir="getSortDir(sortBy as string)"
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
         <template #empty>
            <div class="text-center py-4 text-gray-500">
                No hay resultados que coincidan con los filtros actuales.
            </div>
         </template>
      </DataTable>
      <div v-else class="p-4 text-center text-gray-500">
        Cargando resultados...
      </div>
    </div>

    <!-- Paginación -->
    <!-- Mostrar selector de tamaño de página si se desea -->
    <!-- Mostrar botones de primero/último si se desea -->
    <Pagination
      v-if="!isLoading && totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :page-range="pageRange"
      :show-page-size-selector="true" 
      :show-quick-jump="true" 
      @update:currentPage="goToPage"
      @update:pageSize="setPageSize"
      @next-page="nextPage"
      @prev-page="prevPage"
      @first-page="firstPage"
      @last-page="lastPage"
      class="mt-6"
    ></Pagination>

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