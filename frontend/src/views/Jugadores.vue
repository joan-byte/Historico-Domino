<script setup lang="ts">
// Vista de Jugadores - Muestra la lista de jugadores y permite operaciones CRUD
import { onMounted, ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StatusMessage from '../components/ui/StatusMessage.vue';
import Pagination from '../components/ui/Pagination.vue';
import DataTable from '../components/ui/DataTable.vue';

// Definir la interfaz para jugador
interface Jugador {
  licencia: string;
  nombre: string;
  apodo: string;
  club: string;
  nivel: string;
  telefono: string;
  email: string;
  [key: string]: string; // Para permitir indexación dinámica
}

// Definir la interfaz para columna de DataTable conforme al componente
interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  class?: string;
  render?: (item: Jugador) => string;
}

// Router y route
const router = useRouter();
const route = useRoute();

// Estado del componente
const jugadores = ref<Jugador[]>([
  { licencia: '001', nombre: 'Juan Pérez', apodo: 'El Maestro', club: 'Club Domino A', nivel: 'Avanzado', telefono: '555-123-456', email: 'juan@example.com' },
  { licencia: '002', nombre: 'María López', apodo: 'La Estratega', club: 'Club Domino B', nivel: 'Intermedio', telefono: '555-789-012', email: 'maria@example.com' },
  { licencia: '003', nombre: 'Carlos Rodríguez', apodo: 'El Rápido', club: 'Club Domino A', nivel: 'Experto', telefono: '555-345-678', email: 'carlos@example.com' },
  { licencia: '004', nombre: 'Ana Martínez', apodo: 'La Táctica', club: 'Club Domino C', nivel: 'Avanzado', telefono: '555-901-234', email: 'ana@example.com' },
  { licencia: '005', nombre: 'Pedro Sánchez', apodo: 'El Calculador', club: 'Club Domino D', nivel: 'Principiante', telefono: '555-567-890', email: 'pedro@example.com' }
]);

const isLoading = ref(false);
const error = ref('');
const sortBy = ref('nombre');
const sortDir = ref(1); // 1 = asc, -1 = desc
const selectedJugador = ref<Jugador | null>(null);

// Función para simular la carga de jugadores
const fetchJugadores = () => {
  isLoading.value = true;
  error.value = '';
  
  // Simulamos una llamada a la API
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
};

// Jugadores ordenados
const sortedJugadores = computed(() => {
  const field = sortBy.value;
  return [...jugadores.value].sort((a, b) => {
    if (a[field] < b[field]) return -1 * sortDir.value;
    if (a[field] > b[field]) return 1 * sortDir.value;
    return 0;
  });
});

// Configurar paginación
const currentPage = ref(1);
const pageSize = ref(10);
const totalJugadores = computed(() => jugadores.value.length);
const totalPages = computed(() => Math.ceil(totalJugadores.value / pageSize.value));

const paginatedJugadores = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedJugadores.value.slice(start, end);
});

// Configurar rango de páginas para la paginación
const pageRange = computed<(number | string)[]>(() => {
  const range: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Si hay pocas páginas, mostrar todas
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i);
    }
  } else {
    // Mostrar un rango con elipsis
    range.push(1);
    
    const leftBound = Math.max(2, currentPage.value - 1);
    const rightBound = Math.min(totalPages.value - 1, currentPage.value + 1);
    
    if (leftBound > 2) range.push('...');
    
    for (let i = leftBound; i <= rightBound; i++) {
      range.push(i);
    }
    
    if (rightBound < totalPages.value - 1) range.push('...');
    
    range.push(totalPages.value);
  }
  
  return range;
});

// Propiedades para navegación de páginas
const canGoPrev = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);

// Función para cambiar de página
const changePage = (page: number) => {
  currentPage.value = page;
};

// Funciones para la paginación
const goToFirstPage = () => {
  currentPage.value = 1;
};

const goToPrevPage = () => {
  if (canGoPrev.value) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (canGoNext.value) {
    currentPage.value++;
  }
};

const goToLastPage = () => {
  currentPage.value = totalPages.value;
};

// Definir las columnas para la tabla
const columns = computed<Column[]>(() => {
  const baseColumns: Column[] = [
    { field: 'licencia', header: 'Licencia', sortable: true },
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'apodo', header: 'Apodo', sortable: true },
    { field: 'club', header: 'Club', sortable: true },
    { field: 'nivel', header: 'Nivel', sortable: true }
  ];
  
  // Si estamos en modo edición o eliminación, añadir columna de acciones
  if (route.query.action === 'edit' || route.query.action === 'delete') {
    baseColumns.push({
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      render: (item: Jugador) => {
        if (route.query.action === 'edit') {
          return `<button class="text-blue-600 hover:text-blue-800" @click="editarJugador($event, '${item.licencia}')">Editar</button>`;
        } else if (route.query.action === 'delete') {
          return `<button class="text-red-600 hover:text-red-800" @click="eliminarJugador($event, '${item.licencia}')">Eliminar</button>`;
        }
        return '';
      }
    });
  }
  
  return baseColumns;
});

// Función para manejar el clic en una fila de la tabla
const handleRowClick = (item: Jugador) => {
  selectedJugador.value = item;
  
  // Si estamos en modo edición o eliminación, navegar a la página correspondiente
  if (route.query.action === 'edit') {
    editarJugador(null, item.licencia);
  } else if (route.query.action === 'delete') {
    eliminarJugador(null, item.licencia);
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
const editarJugador = (event: MouseEvent | null, licencia: string) => {
  if (event) event.stopPropagation();
  router.push(`/jugadores/modificar/${licencia}`);
};

// Función para eliminar un jugador
const eliminarJugador = (event: MouseEvent | null, licencia: string) => {
  if (event) event.stopPropagation();
  router.push(`/jugadores/eliminar/${licencia}`);
};

// Función para obtener la clase de fila basada en el contexto
const getRowClass = (item: Jugador) => {
  if (route.query.action === 'edit' || route.query.action === 'delete') {
    return item === selectedJugador.value ? 'bg-blue-50' : '';
  }
  return '';
};

// Cargar los jugadores al montar el componente
onMounted(() => {
  fetchJugadores();
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

// Determinar si estamos en la ruta principal o una subruta
const isRootRoute = computed(() => {
  return route.path === '/jugadores' || route.path === '/jugadores/';
});

const isCrudRoute = computed(() => {
  return route.path === '/jugadores/crud' || route.path === '/jugadores/crud/';
});

const isListRoute = computed(() => {
  return route.path === '/jugadores/lista';
});

// Mostrar la vista principal si estamos en la ruta principal o en la ruta CRUD
const showMainView = computed(() => {
  return isRootRoute.value || isCrudRoute.value;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Vista principal - muestra opciones de CRUD cuando estamos en la ruta principal o CRUD -->
    <div v-if="showMainView" class="container mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Gestión de Jugadores</h1>
        <p class="text-gray-600">Selecciona una operación para administrar los jugadores</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="(option, index) in crudOptions" 
          :key="index"
          class="border rounded-md shadow-sm p-6 cursor-pointer transition-all hover:shadow-md"
          :class="option.color"
          @click="navigateTo(option.route)"
        >
          <div class="flex items-center mb-4">
            <div class="h-10 w-10 rounded-full bg-white border flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <g v-html="option.icon"></g>
              </svg>
            </div>
            <h2 class="text-lg font-medium ml-3">{{ option.title }}</h2>
          </div>
          <p class="text-sm">{{ option.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- Vista de lista - muestra la tabla de jugadores -->
    <div v-else-if="isListRoute" class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Lista de Jugadores</h1>
          <p class="text-gray-600">
            {{ route.query.action === 'edit' ? 'Selecciona un jugador para editar' : 
               route.query.action === 'delete' ? 'Selecciona un jugador para eliminar' : 
               'Jugadores registrados en el sistema' }}
          </p>
        </div>
        <div>
          <button 
            @click="navigateTo('/jugadores/crear')"
            class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Crear Jugador
          </button>
        </div>
      </div>
      
      <!-- Estado de carga y errores -->
      <StatusMessage :show="isLoading" type="loading" message="Cargando jugadores..." class="mb-4" />
      <StatusMessage :show="!!error" type="error" :message="error" class="mb-4" />
      
      <!-- Tabla de jugadores -->
      <div v-if="!isLoading && !error" class="bg-white border rounded-md shadow-sm overflow-hidden mb-4">
        <DataTable 
          :items="paginatedJugadores" 
          :columns="columns"
          itemKey="licencia"
          hover
          striped
          @row-click="handleRowClick"
        />
      </div>
      
      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ paginatedJugadores.length }} de {{ totalJugadores }} jugadores
        </div>
        <Pagination 
          :current-page="currentPage" 
          :total-pages="totalPages"
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          :page-range="pageRange"
          @update:current-page="changePage"
          @first-page="goToFirstPage"
          @prev-page="goToPrevPage"
          @next-page="goToNextPage"
          @last-page="goToLastPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 