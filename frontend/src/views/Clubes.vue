<!-- Vista de Clubes - Muestra la lista de clubs y permite operaciones CRUD -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubs } from '../composables/useClubs';
import { usePagination } from '../composables/usePagination';
import StatusMessage from '../components/ui/StatusMessage.vue';
import Pagination from '../components/ui/Pagination.vue';
import DataTable from '../components/ui/DataTable.vue';
import type { ClubResponse } from '../lib/clubService';

const router = useRouter();
const { clubs, isLoading, error, fetchClubs, deleteClub, sortedClubs } = useClubs();
const showDeleteModal = ref(false);
const clubToDelete = ref<ClubResponse | null>(null);

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
const columns = [
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
  }
];

// Cargar la lista de clubs al montar el componente
onMounted(() => {
  fetchClubs();
});

// Navegar a la página de creación de club
const navigateToCreate = () => {
  router.push('/clubes/nuevo');
};

// Abrir el modal de confirmación para eliminar un club
const confirmDelete = (club: ClubResponse) => {
  clubToDelete.value = club;
  showDeleteModal.value = true;
};

// Eliminar un club
const handleDeleteClub = async () => {
  if (!clubToDelete.value) return;
  
  try {
    await deleteClub(clubToDelete.value.codigo_club);
    showDeleteModal.value = false;
    clubToDelete.value = null;
  } catch (err) {
    // El error ya está manejado en el composable
  }
};

// Cancelar la eliminación
const cancelDelete = () => {
  showDeleteModal.value = false;
  clubToDelete.value = null;
};

// Manejar el clic en una fila
const handleRowClick = (club: ClubResponse) => {
  // Navegar a la vista de detalle del club o implementar otra lógica
  console.log('Club seleccionado:', club);
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Clubes</h1>
      <button 
        @click="navigateToCreate"
        class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
      >
        Nuevo Club
      </button>
    </div>

    <!-- Usar el componente StatusMessage para errores y carga -->
    <StatusMessage
      type="error"
      :show="!!error"
      :message="error || ''"
    />
    
    <StatusMessage
      type="loading"
      :show="isLoading"
      message="Cargando clubes..."
    />

    <!-- Usar el componente DataTable para mostrar los datos -->
    <div v-if="!isLoading" class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div v-if="clubs.length === 0" class="p-8 text-center text-gray-500">
        No hay clubes registrados. Haga clic en "Nuevo Club" para agregar uno.
      </div>
      
      <div v-else>
        <DataTable 
          :items="paginatedItems" 
          :columns="columns" 
          item-key="codigo_club"
          :hover="true"
          initial-sort-field="nombre"
          initial-sort-direction="asc"
          @row-click="handleRowClick"
        >
          <!-- Slot para las acciones por fila -->
          <template #row-actions="{ item }">
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <button 
                @click.stop="confirmDelete(item)"
                class="text-red-600 hover:text-red-900 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </td>
          </template>
          
          <!-- Mensaje cuando no hay datos -->
          <template #empty>
            No hay clubes que coincidan con los criterios de búsqueda.
          </template>
        </DataTable>
        
        <!-- Usar el componente de paginación -->
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

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="relative bg-white rounded-lg max-w-md w-full shadow-xl overflow-hidden">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Eliminar Club
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Está seguro que desea eliminar el club "{{ clubToDelete?.nombre }}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="handleDeleteClub" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Eliminar
            </button>
            <button 
              type="button" 
              @click="cancelDelete" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos de la vista si se necesitan */
</style> 