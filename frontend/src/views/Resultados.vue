<script setup lang="ts">
// Vista para mostrar y gestionar los resultados de los campeonatos
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useResultados } from '../composables/useResultados';
import { useCampeonatos } from '../composables/useCampeonatos';
import { useClubs } from '../composables/useClubs';
import { useTiposCampeonato } from '../composables/useTiposCampeonato';
import type { ResultadoResponse, FilterConditionFE } from '../lib/resultadoService';
import type { CampeonatoResponse } from '../lib/campeonatoService';
import type { ClubResponse } from '../lib/clubService';
import type { TipoCampeonatoResponse } from '../lib/tipoCampeonatoService';
import DataTable from '../components/ui/DataTable.vue';
import Pagination from '../components/ui/Pagination.vue';
import StatusMessage from '../components/ui/StatusMessage.vue';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.vue';
import { PAGINATION_CONFIG } from '../config';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Columna } from '@/interfaces/DataTable';
import type { FiltrosResultados } from '@/types/filtros';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos para las filas de filtro
import Button from '../components/ui/Button.vue'; // Asumiendo Button de Shadcn/ui
import Select from '../components/ui/Select.vue'; // Asumiendo Select de Shadcn/ui
import Input from '../components/ui/Input.vue'; // Asumiendo Input de Shadcn/ui
import DatePicker from '../components/ui/DatePicker.vue'; // Asumiendo DatePicker de Shadcn/ui
import { Trash2 } from 'lucide-vue-next'; // Icono para eliminar fila

// Router y route
const router = useRouter();
const route = useRoute();

// Usar composables
const {
  resultados,
  totalResultados,
  selectedResultado,
  isLoading,
  error,
  fetchResultados,
  removeResultado,
  reloadCurrentPage,
  currentFiltros
} = useResultados();
const { campeonatos, fetchCampeonatos, isLoading: isLoadingCampeonatos } = useCampeonatos();
const { clubs, fetchClubs, isLoading: isLoadingClubs } = useClubs();
const { tiposCampeonato, fetchTiposCampeonato, isLoading: isLoadingTipos } = useTiposCampeonato();

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

// Tipo para las opciones del filtro principal
type ConceptoFiltro = 'todos' | 'idfed' | 'campeonato' | 'club' | 'tipo';

// Estado para filtros
const filtros = ref<{ 
  concepto: ConceptoFiltro; // Qué filtrar
  valorIdfed: string; // Valor si concepto es 'idfed'
  valorCampeonato: string; // Valor si concepto es 'campeonato' (NCH)
  valorClub: string; // Valor si concepto es 'club' (Código)
  valorTipo: number | undefined; // Valor si concepto es 'tipo' (ID)
  fecha_desde?: string;
  fecha_hasta?: string;
}> ({
  concepto: 'todos', // Por defecto, mostrar todos
  valorIdfed: '',
  valorCampeonato: '',
  valorClub: '',
  valorTipo: undefined,
  fecha_desde: undefined,
  fecha_hasta: undefined,
});

// Opciones para el selector de concepto
const opcionesConcepto: { value: ConceptoFiltro, label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'idfed', label: 'IDFED Jugador' },
  { value: 'campeonato', label: 'Campeonato' },
  { value: 'club', label: 'Club Jugador' },
  { value: 'tipo', label: 'Tipo Campeonato' },
];

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

// Obtener datos iniciales
onMounted(() => {
  const queryParams = route.query;
  currentPage.value = parseInt(queryParams.page as string || '1', 10);
  pageSize.value = parseInt(queryParams.size as string || PAGINATION_CONFIG.defaultPageSize.toString(), 10);
  // TODO: Leer filtros iniciales de la query si es necesario
  // Filtros se inicializan vacíos, aplicarFiltros los cargará si es necesario

  // Cargar datos para los filtros
  fetchCampeonatos();
  fetchClubs();
  fetchTiposCampeonato();
  
  // Cargar resultados iniciales
  aplicarFiltros(); // Usar la función aplicarFiltros para la carga inicial
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

// Observar cambios en paginación para recargar (el watcher de filtros se elimina, aplicarFiltros lo maneja)
watch([currentPage, pageSize], () => {
    // Ya no llamamos a fetchResultados aquí directamente
    // En su lugar, podríamos llamar a aplicarFiltros si quisiéramos que los filtros se reapliquen
    // al cambiar de página/tamaño, pero es mejor que aplicarFiltros sea explícito.
    // Para recargar la página actual con los filtros existentes:
    const skip = (currentPage.value - 1) * pageSize.value;
    const limit = pageSize.value;
    // Reconstruir filtrosParaApi para asegurar que pasamos lo correcto
     const filtrosParaApi: FiltrosResultados = {
      fecha_desde: filtros.value.fecha_desde || undefined,
      fecha_hasta: filtros.value.fecha_hasta || undefined,
      idfed_jugador: filtros.value.concepto === 'idfed' ? filtros.value.valorIdfed || undefined : undefined,
      campeonato_nch: filtros.value.concepto === 'campeonato' ? filtros.value.valorCampeonato || undefined : undefined,
      codigo_club_jugador: filtros.value.concepto === 'club' ? filtros.value.valorClub || undefined : undefined,
      tipo_campeonato_id: filtros.value.concepto === 'tipo' ? filtros.value.valorTipo : undefined,
    };
    fetchResultados(filtrosParaApi, skip, limit); 
    
     // Actualizar query params
     router.replace({ 
      query: { 
        ...route.query, // Mantener otros query params como 'action'
        page: currentPage.value.toString(), 
        size: pageSize.value.toString(),
      }
    });
});

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

// Función para aplicar filtros y recargar datos
const aplicarFiltros = () => {
  currentPage.value = 1; // Resetear a página 1 al aplicar filtros
  const skip = 0;
  const limit = pageSize.value;
  
  // Construir ARRAY de filtros para la API basado en la selección actual
  const conditions: FilterConditionFE[] = []; // Empezar con array vacío

  // Añadir filtro de fechas si existen
  if (filtros.value.fecha_desde) {
    conditions.push({ 
      field: 'fecha_campeonato', 
      operator: 'after', // O 'gte' si queremos incluir el día
      value: filtros.value.fecha_desde 
    });
  }
  if (filtros.value.fecha_hasta) {
    conditions.push({ 
      field: 'fecha_campeonato', 
      operator: 'before', // O 'lte' si queremos incluir el día
      value: filtros.value.fecha_hasta 
    });
  }

  // Añadir filtro específico según el concepto
  switch (filtros.value.concepto) {
    case 'idfed':
      if (filtros.value.valorIdfed) {
        conditions.push({ field: 'idfed_jugador', operator: 'eq', value: filtros.value.valorIdfed });
        // Podríamos añadir aquí operador 'contains' si tuviéramos un selector de operador
      }
      break;
    case 'campeonato':
      if (filtros.value.valorCampeonato) {
        conditions.push({ field: 'campeonato_nch', operator: 'eq', value: filtros.value.valorCampeonato });
      }
      break;
    case 'club':
      if (filtros.value.valorClub) {
        conditions.push({ field: 'codigo_club_jugador', operator: 'eq', value: filtros.value.valorClub });
      }
      break;
    case 'tipo':
      if (filtros.value.valorTipo !== undefined) { // Comprobar undefined explícitamente
        conditions.push({ field: 'tipo_campeonato_id', operator: 'eq', value: filtros.value.valorTipo });
      }
      break;
    // 'todos' no añade ninguna condición específica de concepto
  }
  
  // Llamar a fetchResultados con el ARRAY de condiciones
  fetchResultados(conditions, skip, limit); 
  
  // Actualizar query params (opcional, mantener como estaba)
  router.replace({ 
    query: { 
      page: currentPage.value.toString(), 
      size: pageSize.value.toString(),
      concepto: filtros.value.concepto,
      valorIdfed: filtros.value.valorIdfed || undefined,
      valorCampeonato: filtros.value.valorCampeonato || undefined,
      valorClub: filtros.value.valorClub || undefined,
      valorTipo: filtros.value.valorTipo?.toString() || undefined,
      fecha_desde: filtros.value.fecha_desde || undefined,
      fecha_hasta: filtros.value.fecha_hasta || undefined,
    }
  });
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    concepto: 'todos',
    valorIdfed: '',
    valorCampeonato: '',
    valorClub: '',
    valorTipo: undefined,
    fecha_desde: undefined,
    fecha_hasta: undefined,
  };
  aplicarFiltros(); // Recargar con filtros limpios
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <!-- Selector de Concepto -->
        <div>
          <label for="filtro_concepto" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por</label>
          <select id="filtro_concepto" v-model="filtros.concepto" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option v-for="opcion in opcionesConcepto" :key="opcion.value" :value="opcion.value">
              {{ opcion.label }}
            </option>
          </select>
        </div>

        <!-- Input/Select Dinámico para el Concepto -->
        <div :class="{'md:col-span-1': filtros.concepto !== 'todos'}"> 
          <label v-if="filtros.concepto !== 'todos'" :for="'filtro_valor_' + filtros.concepto" class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
          
          <!-- Input para IDFED -->
          <input 
            v-if="filtros.concepto === 'idfed'"
            id="filtro_valor_idfed" type="text" 
            v-model="filtros.valorIdfed" 
            placeholder="Escribir IDFED Jugador" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          <!-- Select para Campeonato -->
          <select 
            v-if="filtros.concepto === 'campeonato'"
            id="filtro_valor_campeonato" 
            v-model="filtros.valorCampeonato" 
            :disabled="isLoadingCampeonatos" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Seleccionar Campeonato</option>
            <option v-for="camp in campeonatos" :key="camp.nch" :value="camp.nch">{{ camp.nch }} - {{ camp.nombre }}</option>
          </select>

          <!-- Select para Club -->
          <select 
            v-if="filtros.concepto === 'club'"
            id="filtro_valor_club" 
            v-model="filtros.valorClub" 
            :disabled="isLoadingClubs" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Seleccionar Club</option>
            <option v-for="club in clubs" :key="club.codigo_club" :value="club.codigo_club">{{ club.codigo_club }} - {{ club.nombre }}</option>
          </select>

          <!-- Select para Tipo Campeonato -->
          <select 
            v-if="filtros.concepto === 'tipo'"
            id="filtro_valor_tipo" 
            v-model="filtros.valorTipo" 
            :disabled="isLoadingTipos" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option :value="undefined">Seleccionar Tipo</option> <!-- Permitir quitar el filtro -->
            <option v-for="tipo in tiposCampeonato" :key="tipo.id" :value="tipo.id">{{ tipo.codigo }} - {{ tipo.nombre }}</option>
          </select>
          
          <!-- Espacio reservado cuando es 'todos' -->
           <div v-if="filtros.concepto === 'todos'" class="h-10"></div> 

        </div>

        <!-- Fecha Desde y Fecha Hasta (siempre visibles) -->
         <div>
          <label for="filtro_fecha_desde" class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
          <input 
            id="filtro_fecha_desde" type="date" 
            v-model="filtros.fecha_desde" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label for="filtro_fecha_hasta" class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
          <input 
            id="filtro_fecha_hasta" type="date" 
            v-model="filtros.fecha_hasta" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <!-- Botones -->
        <div class="flex gap-2 justify-end md:col-span-3">
          <button @click="limpiarFiltros" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Limpiar</button>
          <button @click="aplicarFiltros" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700" :disabled="isLoading">Aplicar Filtros</button>
        </div>
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