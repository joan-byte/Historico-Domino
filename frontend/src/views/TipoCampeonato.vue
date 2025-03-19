<script setup lang="ts">
// Componente para gestionar tipos de campeonatos
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import { usePagination } from '../composables/usePagination';
import StatusMessage from '../components/ui/StatusMessage.vue';
import Pagination from '../components/ui/Pagination.vue';
import DataTable from '../components/ui/DataTable.vue';
import type { TipoCampeonatoResponse } from '../lib/campeonatoService';

// Router para la navegación
const router = useRouter();

// Composable para campeonatos
const { 
  fetchTiposCampeonato, 
  tiposCampeonato, 
  createTipoCampeonato,
  isLoading, 
  error 
} = useCampeonatos();

// Estado para el formulario
const nuevoTipo = ref({
  nombre: '',
  descripcion: ''
});

// Estado para mensajes
const successMessage = ref<string>('');
const showSuccess = ref(false);
const formErrors = ref<Record<string, string>>({});

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
} = usePagination(tiposCampeonato);

// Definir columnas para la tabla
const columns = computed(() => [
  { field: 'id', header: 'ID', sortable: true },
  { field: 'nombre', header: 'Nombre', sortable: true },
  { field: 'descripcion', header: 'Descripción', sortable: true },
]);

// Validar el formulario
const validateForm = (): boolean => {
  formErrors.value = {};
  let isValid = true;

  if (!nuevoTipo.value.nombre.trim()) {
    formErrors.value.nombre = 'El nombre es obligatorio';
    isValid = false;
  }

  return isValid;
};

// Enviar formulario
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    const tipoCampeonatoData = {
      nombre: nuevoTipo.value.nombre,
      descripcion: nuevoTipo.value.descripcion
    };
    
    const nuevoTipoCampeonato = await createTipoCampeonato(tipoCampeonatoData);
    
    // Mostrar mensaje de éxito
    successMessage.value = `Tipo de campeonato "${nuevoTipoCampeonato.nombre}" creado con éxito.`;
    showSuccess.value = true;
    
    // Limpiar formulario
    nuevoTipo.value = {
      nombre: '',
      descripcion: ''
    };
    
    // Recargar la lista
    await fetchTiposCampeonato();
  } catch (err) {
    console.error('Error al crear tipo de campeonato:', err);
  }
};

// Cargar tipos de campeonato al montar el componente
onMounted(async () => {
  await fetchTiposCampeonato();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Gestión de Tipos de Campeonato</h1>
    
    <!-- Mensajes de error y éxito -->
    <StatusMessage v-if="error" 
                 :message="error" 
                 :type="'error'" 
                 :show="true"
                 class="mb-4" />
                 
    <StatusMessage v-if="showSuccess" 
                 :message="successMessage" 
                 :type="'success'" 
                 :show="true"
                 class="mb-4" />
    
    <!-- Formulario para crear nuevo tipo de campeonato -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-lg font-semibold mb-4">Crear Nuevo Tipo de Campeonato</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Campo: Nombre -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input 
              type="text" 
              id="nombre" 
              v-model="nuevoTipo.nombre"
              class="w-full px-3 py-2 border rounded-md" 
              :class="{ 'border-red-500': formErrors.nombre }"
              placeholder="Ej: Liga Regular"
            />
            <p v-if="formErrors.nombre" class="mt-1 text-sm text-red-600">
              {{ formErrors.nombre }}
            </p>
          </div>
          
          <!-- Campo: Descripción -->
          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input 
              type="text" 
              id="descripcion" 
              v-model="nuevoTipo.descripcion"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="Breve descripción"
            />
          </div>
        </div>
        
        <!-- Botón para enviar -->
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Guardando...</span>
            <span v-else>Guardar</span>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Tabla de tipos de campeonato existentes -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-lg font-semibold mb-4">Tipos de Campeonato Existentes</h2>
      
      <!-- Loading spinner -->
      <div v-if="isLoading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      
      <!-- Tabla -->
      <div v-else>
        <DataTable 
          :items="paginatedItems"
          :columns="columns"
          item-key="id"
          class="mb-4"
        >
          <!-- Template para cuando no hay datos -->
          <template #no-data>
            <div class="text-center py-4">
              <p>No hay tipos de campeonato para mostrar.</p>
            </div>
          </template>
        </DataTable>
        
        <!-- Paginación -->
        <Pagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-range="pageRange"
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          :page-size="pageSize"
          :page-size-options="pageSizeOptions"
          @go-to-page="goToPage"
          @next-page="nextPage"
          @prev-page="prevPage"
          @update-page-size="setPageSize"
          @first-page="firstPage"
          @last-page="lastPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 