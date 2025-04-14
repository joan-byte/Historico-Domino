<!-- ListaCampeonatos.vue - Vista para mostrar y gestionar la lista de campeonatos -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCampeonatos } from '@/composables/useCampeonatos';
import { usePagination } from '@/composables/usePagination';
import StatusMessage from '@/components/ui/StatusMessage.vue';
import Pagination from '@/components/ui/Pagination.vue';
import DataTable from '@/components/ui/DataTable.vue';
import type { CampeonatoResponse } from '@/lib/campeonatoService';

const router = useRouter();

// Usar composable con total
const { campeonatos, totalCampeonatos, isLoading, error, fetchCampeonatos } = useCampeonatos();

// Usar paginación con total
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
} = usePagination(totalCampeonatos, { initialPageSize: 10 });

// Definir columnas (quitar sortable)
const columns = computed(() => [
  { field: 'id', header: 'ID', sortable: false },
  { field: 'nombre', header: 'Nombre', sortable: false },
  {
    field: 'tipo_campeonato',
    header: 'Tipo',
    sortable: false,
    render: (item: CampeonatoResponse) => item.tipo_campeonato?.nombre ?? 'N/A'
  },
  { field: 'fecha_inicio', header: 'Fecha Inicio', sortable: false },
  { field: 'fecha_fin', header: 'Fecha Fin', sortable: false }
]);

// Carga inicial y watch para paginación
onMounted(() => {
  fetchCampeonatos(0, pageSize.value);
});

watch([currentPage, pageSize], ([newPage, newSize], [oldPage, oldSize]) => {
  if (newPage !== oldPage || newSize !== oldSize) {
    const skip = (newPage - 1) * newSize;
    fetchCampeonatos(skip, newSize);
  }
});

// Navegación para editar (puede necesitar ajuste si la ruta cambia)
const handleRowClick = (campeonato: CampeonatoResponse) => {
  router.push(`/campeonatos/modificar/${campeonato.id}`);
};

</script>

<template>
  <div class="container mx-auto p-4 space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Lista de Campeonatos</h1>
      <button @click="router.push('/campeonatos/crear')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Nuevo Campeonato
      </button>
    </div>

    <StatusMessage type="error" :show="!!error" :message="error || ''" />
    <StatusMessage type="loading" :show="isLoading" message="Cargando campeonatos..." />

    <div v-if="!isLoading && !error">
      <div class="rounded-md border">
        <DataTable
          :items="campeonatos" 
          :columns="columns"
          item-key="id"
          hover
          @row-click="handleRowClick"
        >
            <template #empty>
                No hay campeonatos registrados.
            </template>
        </DataTable>
      </div>

      <div class="flex justify-center mt-4">
        <Pagination
          v-if="totalCampeonatos > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          :page-range="pageRange"
          :show-page-size-selector="true"
          :page-size-options="pageSizeOptions"
          :page-size="pageSize"
          @update:currentPage="goToPage"
          @first-page="firstPage"
          @prev-page="prevPage"
          @next-page="nextPage"
          @last-page="lastPage"
          @update:page-size="setPageSize"
        />
      </div>
    </div>
     <div v-else-if="!isLoading && campeonatos.length === 0">
        <p class="text-center text-gray-500 py-4">No hay campeonatos registrados.</p>
    </div>

  </div>
</template> 