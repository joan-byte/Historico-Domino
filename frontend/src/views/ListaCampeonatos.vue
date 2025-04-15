<!-- ListaCampeonatos.vue - Vista para mostrar y gestionar la lista de campeonatos -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCampeonatos } from '@/composables/useCampeonatos';
import { usePagination } from '@/composables/usePagination';
import StatusMessage from '@/components/ui/StatusMessage.vue';
import Pagination from '@/components/ui/Pagination.vue';
import DataTable from '@/components/ui/DataTable.vue';
import type { CampeonatoResponse, TipoCampeonatoResponse } from '@/lib/campeonatoService';

const router = useRouter();
const route = useRoute();

// Leer el parámetro de acción de la URL
const action = computed(() => route.query.action as string | undefined);

// Usar composable con total y tipos
const { 
  campeonatos, 
  totalCampeonatos, 
  isLoading, 
  error, 
  fetchCampeonatos, 
  tiposCampeonato,
  fetchTiposCampeonato
} = useCampeonatos();

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

// Definir columnas (ajustadas)
const columns = computed(() => [
  { field: 'nch', header: 'NCH', sortable: false },
  { field: 'nombre', header: 'Nombre', sortable: false },
  {
    field: 'tipo_campeonato_id',
    header: 'Tipo',
    sortable: false,
    render: (item: CampeonatoResponse) => {
      const tipo = tiposCampeonato.value.find(t => t.id === item.tipo_campeonato_id);
      return tipo?.codigo ?? 'N/A';
    }
  },
  { field: 'fecha_inicio', header: 'Fecha Inicio', sortable: false },
  { field: 'dias', header: 'Días', sortable: false },
  { field: 'partidas', header: 'Partidas', sortable: false },
  { field: 'pm', header: 'PM', sortable: false },
  {
    field: 'gb',
    header: 'GB',
    sortable: false,
    render: (item: CampeonatoResponse) => item.gb ? 'B' : 'A'
  },
  {
    field: 'gbp',
    header: 'Inicio GB',
    sortable: false,
    render: (item: CampeonatoResponse) => item.gb ? (item.gbp?.toString() ?? '-') : '-'
  },
  {
    field: 'club',
    header: 'Club Org.',
    sortable: false,
    render: (item: CampeonatoResponse) => item.club_codigo ?? 'N/A'
  }
]);

// Carga inicial y watch para paginación
onMounted(async () => {
  await fetchCampeonatos(0, pageSize.value);
  await fetchTiposCampeonato();
});

watch([currentPage, pageSize], ([newPage, newSize], [oldPage, oldSize]) => {
  if (newPage !== oldPage || newSize !== oldSize) {
    const skip = (newPage - 1) * newSize;
    fetchCampeonatos(skip, newSize);
  }
});

// Navegación para editar o eliminar según la acción
const handleRowClick = (campeonato: CampeonatoResponse) => {
  if (action.value === 'delete') {
    // Si la acción es eliminar, ir a la vista de eliminar
    router.push(`/campeonatos/eliminar/${campeonato.nch}`);
  } else {
    // Por defecto (o si action es 'edit'), ir a la vista de modificar
    router.push(`/campeonatos/modificar/${campeonato.nch}`);
  }
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
          item-key="nch"
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