<!-- ListaCampeonatos.vue - Vista para mostrar y gestionar la lista de campeonatos -->
<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import StatusMessage from '../components/ui/StatusMessage.vue';
import DataTable from '../components/ui/DataTable.vue';
import Pagination from '../components/ui/Pagination.vue';
import { usePagination } from '../composables/usePagination';
import type { CampeonatoResponse } from '../lib/campeonatoService';

// Router y route
const router = useRouter();
const route = useRoute();

// Usar el composable de campeonatos
const { 
  campeonatos, 
  selectedCampeonato, 
  isLoading, 
  error, 
  fetchCampeonatos, 
  deleteCampeonato,
  sortedCampeonatos
} = useCampeonatos();

// Configurar paginación
const { 
  currentPage, 
  pageSize, 
  totalPages, 
  paginatedItems: paginatedCampeonatos, 
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
} = usePagination(sortedCampeonatos);

// Estado para ordenamiento
const sortBy = ref('nombre');
const sortDir = ref(1); // 1 = asc, -1 = desc

// Estado para confirmación de eliminación
const showConfirmDialog = ref(false);
const campeonatoToDelete = ref<CampeonatoResponse | null>(null);
const successMessage = ref<string>('');
const showSuccess = ref(false);

// Definir las columnas para la tabla
const columns = computed(() => {
  const baseColumns = [
    { field: 'nombre', header: 'Nombre', sortable: true },
    { 
      field: 'fecha_inicio', 
      header: 'Fecha Inicio', 
      sortable: true,
      render: (item: CampeonatoResponse) => new Date(item.fecha_inicio).toLocaleDateString()
    },
    { 
      field: 'fecha_fin', 
      header: 'Fecha Fin', 
      sortable: true,
      render: (item: CampeonatoResponse) => new Date(item.fecha_fin).toLocaleDateString()
    },
    { 
      field: 'tipo_campeonato', 
      header: 'Tipo', 
      sortable: true,
      render: (item: CampeonatoResponse) => `${item.tipo_campeonato?.nombre} (${item.tipo_campeonato?.codigo})`
    }
  ];
  
  // Solo añadir acciones en modo edición, no en modo eliminación
  if (route.query.action === 'edit') {
    baseColumns.push({
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      render: (item: CampeonatoResponse) => {
        return `<button class="text-blue-600 hover:text-blue-800" onclick="document.dispatchEvent(new CustomEvent('edit-campeonato', {detail: '${item.id}' }))" type="button" aria-label="Editar campeonato">Editar</button>`;
      }
    });
  }
  
  return baseColumns;
});

// Función para manejar el clic en una fila de la tabla
const handleRowClick = (item: CampeonatoResponse) => {
  selectedCampeonato.value = item;
  
  // Si estamos en modo edición, navegar a la página correspondiente
  if (route.query.action === 'edit') {
    editarCampeonato(null, item.id);
  } else if (route.query.action === 'delete') {
    // En modo eliminación, mostrar diálogo de confirmación en lugar de navegar
    campeonatoToDelete.value = item;
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

// Función para editar un campeonato
const editarCampeonato = (event: MouseEvent | null, id: number) => {
  if (event) event.stopPropagation();
  router.push(`/campeonatos/modificar/${id}`);
};

// Función para confirmar eliminación de campeonato
const confirmarEliminacion = async () => {
  if (campeonatoToDelete.value) {
    try {
      await deleteCampeonato(campeonatoToDelete.value.id);
      
      // Mostrar mensaje de éxito
      successMessage.value = `El campeonato ${campeonatoToDelete.value.nombre} ha sido eliminado correctamente.`;
      showSuccess.value = true;
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
      
      showConfirmDialog.value = false;
      campeonatoToDelete.value = null;
    } catch (err) {
      // No vamos a registrar el error en la consola, ya usamos el valor error
    }
  }
};

// Función para cancelar eliminación
const cancelarEliminacion = () => {
  showConfirmDialog.value = false;
  campeonatoToDelete.value = null;
};

// Función para obtener la clase de fila basada en el contexto
const getRowClass = (item: CampeonatoResponse): string => {
  if (route.query.action === 'edit' || route.query.action === 'delete') {
    if (selectedCampeonato.value?.id === item.id) {
      return 'bg-blue-50';
    }
  }
  return '';
};

// Referenciar las funciones de los manejadores de eventos para poder eliminarlas
const handleEditCampeonato = (e: any) => {
  editarCampeonato(null, parseInt(e.detail, 10));
};

// Cargar los campeonatos al montar el componente
onMounted(() => {
  fetchCampeonatos();
  
  // Agregar escuchadores para los eventos de edición
  document.addEventListener('edit-campeonato', handleEditCampeonato);
});

// Limpiar los escuchadores de eventos al desmontar el componente
onUnmounted(() => {
  document.removeEventListener('edit-campeonato', handleEditCampeonato);
});
</script>

<template>
  <div class="space-y-4">
    <!-- Título dinámico según el contexto -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">
        {{ route.query.action === 'edit' ? 'Elige el campeonato a editar' : route.query.action === 'delete' ? 'Elige el campeonato a eliminar' : 'Lista de Campeonatos' }}
      </h1>
    </div>

    <!-- Instrucciones para el modo edición -->
    <div v-if="route.query.action === 'edit'" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
      Haz clic en el campeonato que deseas editar. Se abrirá el formulario de edición con los datos del campeonato seleccionado.
    </div>
    
    <!-- Instrucciones para el modo eliminación -->
    <div v-if="route.query.action === 'delete'" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      Haz clic en el campeonato que deseas eliminar. Se abrirá la pantalla de confirmación para eliminar el campeonato seleccionado.
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
      message="Cargando campeonatos..."
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
        :items="paginatedCampeonatos" 
        :columns="columns"
        itemKey="id"
        hover
        striped
        @row-click="handleRowClick"
        @sort="handleSort"
        :sort-field="sortBy"
        :sort-direction="getSortDir(sortBy)"
        :row-class="getRowClass"
      >
        <template #empty>
          No hay campeonatos que coincidan con los criterios de búsqueda.
        </template>
      </DataTable>
    </div>
    
    <!-- Paginación -->
    <div class="flex justify-center mt-4">
      <Pagination
        v-if="campeonatos.length > 0"
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
    
    <!-- Modal de confirmación para eliminar campeonato -->
    <div v-if="showConfirmDialog" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div class="relative p-6 bg-white w-full max-w-md m-auto rounded-md shadow-lg">
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900">¿Estás seguro de eliminar este campeonato?</h3>
          <p class="mt-2 text-sm text-gray-500">
            Esta acción no se puede deshacer. El campeonato 
            <span class="font-medium">{{ campeonatoToDelete?.nombre }}</span> 
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
</template> 