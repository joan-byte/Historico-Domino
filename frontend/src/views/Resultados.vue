<script setup lang="ts">
// Vista para mostrar y gestionar los resultados de los campeonatos
import { ref, computed, onMounted, watch, reactive } from 'vue';
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

// Componentes UI (Asumiendo que existen y están registrados globalmente o se importan aquí)
// Necesitaremos: Select, Input, Button, DatePicker?

// --- Configuración de Filtros Dinámicos ---

interface FilterFieldOption {
  value: string; // Corresponde al nombre del campo en el modelo Resultado
  label: string; // Etiqueta para mostrar en el select
  type: 'text' | 'number' | 'date' | 'boolean' | 'select-tipo' | 'select-club' | 'select-campeonato'; // Tipo de dato
}

interface FilterOperatorOption {
  value: string; // Operador que se enviará a la API (eq, contains, gt, etc.)
  label: string; // Etiqueta para mostrar
  types: FilterFieldOption['type'][]; // A qué tipos de campo aplica
  valueComponent?: 'text' | 'number' | 'date' | 'date-range' | 'select-tipo' | 'select-club' | 'select-campeonato'; // Qué input mostrar (por defecto, 'text')
}

// Definir los campos filtrables
const filterFields: FilterFieldOption[] = [
  { value: 'idfed_jugador', label: 'IDFED Jugador', type: 'text' },
  { value: 'nombre_jugador', label: 'Nombre Jugador', type: 'text' },
  { value: 'apellido_jugador', label: 'Apellidos Jugador', type: 'text' },
  { value: 'campeonato_nch', label: 'NCH Campeonato', type: 'select-campeonato' }, // Cambiado a select
  { value: 'nombre_campeonato', label: 'Nombre Campeonato', type: 'text' },
  { value: 'codigo_club_jugador', label: 'Código Club Jugador', type: 'select-club' }, // Cambiado a select
  { value: 'tipo_campeonato_id', label: 'Tipo Campeonato', type: 'select-tipo' }, 
  { value: 'fecha_campeonato', label: 'Fecha Campeonato', type: 'date' },
  { value: 'partida', label: 'Partida', type: 'number' },
  { value: 'mesa', label: 'Mesa', type: 'number' },
  { value: 'pg', label: 'Partida Ganada', type: 'number' },
  { value: 'dif', label: 'Diferencia', type: 'number' },
  { value: 'pv', label: 'Puntos Válidos', type: 'number' },
  { value: 'pt', label: 'Puntos Totales', type: 'number' },
  { value: 'mg', label: 'Manos Ganadas', type: 'number' },
  { value: 'pos', label: 'Posición', type: 'number' },
  // Añadir más campos si se desea
];

// Definir los operadores disponibles
const filterOperators: FilterOperatorOption[] = [
  // Texto
  { value: 'eq', label: 'Igual a', types: ['text', 'select-campeonato', 'select-club'] },
  { value: 'contains', label: 'Contiene', types: ['text'] },
  // { value: 'startswith', label: 'Empieza por', types: ['text'] }, // Ejemplo futuro
  // { value: 'endswith', label: 'Termina en', types: ['text'] }, // Ejemplo futuro
  
  // Número y Select ID
  { value: 'eq', label: 'Igual a', types: ['number', 'select-tipo'], valueComponent: 'number' }, // eq para tipo usa ID (número)
  { value: 'gt', label: 'Mayor que', types: ['number'], valueComponent: 'number' },
  { value: 'lt', label: 'Menor que', types: ['number'], valueComponent: 'number' },
  { value: 'gte', label: 'Mayor o igual que', types: ['number'], valueComponent: 'number' }, // Ejemplo futuro
  { value: 'lte', label: 'Menor o igual que', types: ['number'], valueComponent: 'number' }, // Ejemplo futuro

  // Fecha
  { value: 'eq', label: 'En la fecha', types: ['date'], valueComponent: 'date' },
  { value: 'between', label: 'Entre fechas', types: ['date'], valueComponent: 'date-range' }, // Necesitará dos inputs
  { value: 'after', label: 'Posterior o igual a', types: ['date'], valueComponent: 'date' },
  { value: 'before', label: 'Anterior o igual a', types: ['date'], valueComponent: 'date' },
];

// Estado para los filtros dinámicos
interface DynamicFilterCondition {
  id: number; // Para key en v-for
  field: string; // Valor del campo seleccionado (ej. 'idfed_jugador')
  operator: string; // Valor del operador seleccionado (ej. 'eq')
  value: any; // Valor principal
  value2?: any; // Segundo valor (para 'between')
}

// Usar reactive para el array de filtros para facilitar la mutación
const dynamicFilters = reactive<DynamicFilterCondition[]>([]);
let nextFilterId = 0;

// --- Fin Configuración Filtros --- 

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
  currentFilterConditions
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
  fetchResultados([], 0, pageSize.value); 
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
  
  // Construir ARRAY de condiciones a partir del estado dynamicFilters
  const conditions: FilterConditionFE[] = dynamicFilters
    .map(f => {
      // Validación/Limpieza básica
      if (!f.field || !f.operator || f.value === null || f.value === '') {
          if (f.operator !== 'between') return null; // Ignorar filtro incompleto (excepto between)
      }
      
      let apiValue = f.value;
      // Manejo especial para 'between' que usa value y value2
      if (f.operator === 'between') {
          if (f.value === null || f.value === '' || f.value2 === null || f.value2 === ''){
              return null; // Ignorar between incompleto
          }
          apiValue = [f.value, f.value2];
      }
      
      // Podríamos añadir formateo de fechas aquí si DatePicker devuelve Date object
      // if (filterFields.find(ff => ff.value === f.field)?.type === 'date' && apiValue instanceof Date) {
      //    apiValue = format(apiValue, 'yyyy-MM-dd');
      // }
      // if (Array.isArray(apiValue) && filterFields.find(ff => ff.value === f.field)?.type === 'date') {
      //    apiValue = apiValue.map(d => d instanceof Date ? format(d, 'yyyy-MM-dd') : d);
      // }
      
      return { 
        field: f.field, 
        operator: f.operator, 
        value: apiValue 
      };
    })
    .filter(c => c !== null) as FilterConditionFE[]; // Filtrar nulos

  console.log("Aplicando filtros con condiciones:", conditions);
  fetchResultados(conditions, skip, limit); // Llamar a fetch con las condiciones construidas
  
  // Ya no actualizamos query params con filtros aquí, es muy complejo
  // Solo actualizamos paginación
   router.replace({ 
    query: { 
      page: currentPage.value.toString(), 
      size: pageSize.value.toString(),
    }
  });
};

// Función para limpiar filtros
const limpiarFiltros = () => {
  dynamicFilters.length = 0; // Vaciar el array reactivo
  addFilterRow(); // Opcional: añadir una fila vacía por defecto
  aplicarFiltros(); // Recargar sin filtros
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

// --- Funciones para Filtros Dinámicos --- 

// Añadir una nueva condición de filtro vacía
const addFilterRow = () => {
  dynamicFilters.push({ 
    id: nextFilterId++, 
    field: filterFields[0].value, // Valor por defecto
    operator: getAvailableOperators(filterFields[0].type)[0]?.value || '', // Operador por defecto
    value: null, 
    value2: null 
  });
};

// Eliminar una condición de filtro por su ID
const removeFilterRow = (id: number) => {
  const index = dynamicFilters.findIndex(f => f.id === id);
  if (index > -1) {
    dynamicFilters.splice(index, 1);
  }
};

// Obtener los operadores válidos para el tipo de campo seleccionado
const getAvailableOperators = (fieldType: FilterFieldOption['type']) => {
  return filterOperators.filter(op => op.types.includes(fieldType));
};

// Obtener el tipo de componente de valor necesario para un operador
const getValueComponentType = (operatorValue: string) => {
  const operator = filterOperators.find(op => op.value === operatorValue);
  // Considerar el tipo del campo también si el operador aplica a varios tipos
  // Por ahora, nos basamos solo en el operador
  return operator?.valueComponent || 'text'; // Por defecto, input de texto
};

// Resetear operador y valor cuando cambia el campo
const onFieldChange = (filter: DynamicFilterCondition) => {
  const fieldType = filterFields.find(f => f.value === filter.field)?.type || 'text';
  const availableOperators = getAvailableOperators(fieldType);
  filter.operator = availableOperators[0]?.value || '';
  filter.value = null;
  filter.value2 = null;
  // Resetear valor también cuando cambia el operador (si aplica)
  onOperatorChange(filter);
};

// Resetear valor cuando cambia el operador (si requiere un input diferente)
const onOperatorChange = (filter: DynamicFilterCondition) => {
  // Podríamos añadir lógica aquí si el cambio de operador implica limpiar valores
  // Por ejemplo, si cambiamos de 'between' a 'eq', limpiar value2
  if (filter.operator !== 'between') {
      filter.value2 = null;
  }
  // Si cambiamos de un operador de texto a uno numérico (menos probable con la lógica actual)
  // podríamos intentar convertir/limpiar el valor.
  // Por ahora, lo dejamos simple.
};

// --- Fin Funciones Filtros --- 

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
    
    <!-- Sección de Filtros (REHECHA) -->
    <div class="bg-white border rounded-md shadow-sm p-4 mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold">Filtros</h2>
        <button @click="addFilterRow" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
           <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
           Añadir Filtro
        </button>
      </div>
      
      <div v-if="dynamicFilters.length === 0" class="text-gray-500 text-sm px-3 py-2">
        No hay filtros activos. Haz clic en "Añadir Filtro" para empezar.
      </div>

      <div v-else class="space-y-3">
        <!-- Fila de Filtro (v-for) -->
        <div v-for="(filter, index) in dynamicFilters" :key="filter.id" class="flex flex-wrap md:flex-nowrap items-start gap-2 border-b pb-3 last:border-b-0">
          
          <!-- Selector Campo -->
          <div class="w-full md:w-1/4">
            <label :for="'field-' + filter.id" class="sr-only">Campo</label>
            <select :id="'field-' + filter.id" v-model="filter.field" @change="onFieldChange(filter)" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option v-for="fieldOption in filterFields" :key="fieldOption.value" :value="fieldOption.value">
                {{ fieldOption.label }}
              </option>
            </select>
          </div>

          <!-- Selector Operador -->
          <div class="w-full md:w-1/4">
             <label :for="'operator-' + filter.id" class="sr-only">Operador</label>
             <select :id="'operator-' + filter.id" v-model="filter.operator" @change="onOperatorChange(filter)" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
               <option v-for="opOption in getAvailableOperators(filterFields.find(f => f.value === filter.field)?.type || 'text')" :key="opOption.value" :value="opOption.value">
                 {{ opOption.label }}
               </option>
             </select>
          </div>

          <!-- Input/Select/Date Valor(es) -->
          <div class="w-full md:w-2/4 flex-grow flex items-start gap-2">
            <label :for="'value-' + filter.id" class="sr-only">Valor</label>
            
            <!-- Input Texto -->
            <input 
              v-if="!['date', 'date-range', 'select-tipo', 'select-club', 'select-campeonato', 'number'].includes(getValueComponentType(filter.operator))"
              :id="'value-' + filter.id" type="text" 
              v-model="filter.value" 
              placeholder="Valor" 
              class="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
            />

             <!-- Input Número -->
            <input 
              v-if="getValueComponentType(filter.operator) === 'number'" 
              :id="'value-' + filter.id" type="number" 
              v-model.number="filter.value" 
              placeholder="Valor" 
              class="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
            />

            <!-- Date Picker (Simple) -->
            <input 
              v-if="getValueComponentType(filter.operator) === 'date'" 
              :id="'value-' + filter.id" type="date" 
              v-model="filter.value" 
              class="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
            />

            <!-- Date Range Picker (Dos inputs) -->
            <template v-if="getValueComponentType(filter.operator) === 'date-range'">
              <input 
                :id="'value-' + filter.id" type="date" 
                v-model="filter.value" 
                aria-label="Fecha desde" 
                class="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input 
                :id="'value2-' + filter.id" type="date" 
                v-model="filter.value2" 
                aria-label="Fecha hasta" 
                class="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </template>
            
            <!-- Select Tipo Campeonato -->
             <select 
                v-if="getValueComponentType(filter.operator) === 'select-tipo'" 
                :id="'value-' + filter.id" 
                v-model="filter.value" 
                :disabled="isLoadingTipos" 
                class="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option :value="null">Seleccionar Tipo</option>
                <option v-for="tipo in tiposCampeonato" :key="tipo.id" :value="tipo.id">{{ tipo.codigo }} - {{ tipo.nombre }}</option>
             </select>
             
             <!-- Select Club -->
             <select 
                v-if="getValueComponentType(filter.operator) === 'select-club'" 
                :id="'value-' + filter.id" 
                v-model="filter.value" 
                :disabled="isLoadingClubs" 
                class="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option :value="null">Seleccionar Club</option>
                <option v-for="club in clubs" :key="club.codigo_club" :value="club.codigo_club">{{ club.codigo_club }} - {{ club.nombre }}</option>
             </select>

             <!-- Select Campeonato -->
             <select 
                v-if="getValueComponentType(filter.operator) === 'select-campeonato'" 
                :id="'value-' + filter.id" 
                v-model="filter.value" 
                :disabled="isLoadingCampeonatos" 
                class="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option :value="null">Seleccionar Campeonato</option>
                <option v-for="camp in campeonatos" :key="camp.nch" :value="camp.nch">{{ camp.nch }} - {{ camp.nombre }}</option>
             </select>

          </div>
          
           <!-- Botón Eliminar Fila -->
           <div class="flex-shrink-0">
             <button @click="removeFilterRow(filter.id)" class="p-2 text-gray-400 hover:text-red-600" aria-label="Eliminar filtro">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
           </div>
        </div>
      </div>

      <!-- Botones Aplicar/Limpiar (Fuera del loop) -->
       <div class="flex justify-end gap-2 mt-4 pt-3 border-t">
         <button @click="limpiarFiltros" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Limpiar Todo</button>
         <button @click="aplicarFiltros" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700" :disabled="isLoading">Aplicar Filtros</button>
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