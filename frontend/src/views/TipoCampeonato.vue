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
  updateTipoCampeonato,
  deleteTipoCampeonato,
  isLoading, 
  error 
} = useCampeonatos();

// Estado para el formulario
const nuevoTipo = ref({
  codigo: '',
  nombre: '',
  descripcion: ''
});

// Estado para edición
const editandoTipo = ref<TipoCampeonatoResponse | null>(null);
const modoEdicion = ref(false);

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
  { field: 'codigo', header: 'Código', sortable: true },
  { field: 'nombre', header: 'Nombre', sortable: true },
  { field: 'descripcion', header: 'Descripción', sortable: true },
  { field: 'acciones', header: 'Acciones', sortable: false },
]);

// Validar el formulario
const validateForm = (): boolean => {
  formErrors.value = {};
  let isValid = true;

  if (!nuevoTipo.value.nombre.trim()) {
    formErrors.value.nombre = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!nuevoTipo.value.codigo.trim()) {
    formErrors.value.codigo = 'El código es obligatorio';
    isValid = false;
  } else if (!/^[A-Z]{2}$/.test(nuevoTipo.value.codigo)) {
    formErrors.value.codigo = 'El código debe ser exactamente 2 letras mayúsculas';
    isValid = false;
  }

  return isValid;
};

// Iniciar edición
const handleEdit = (tipo: TipoCampeonatoResponse) => {
  editandoTipo.value = tipo;
  nuevoTipo.value = {
    codigo: tipo.codigo,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion || ''
  };
  modoEdicion.value = true;
};

// Cancelar edición
const handleCancelEdit = () => {
  editandoTipo.value = null;
  nuevoTipo.value = {
    codigo: '',
    nombre: '',
    descripcion: ''
  };
  modoEdicion.value = false;
  formErrors.value = {};
};

// Confirmar eliminación
const handleDelete = async (tipo: TipoCampeonatoResponse) => {
  if (!confirm(`¿Está seguro de que desea eliminar el tipo de campeonato "${tipo.nombre}"?`)) {
    return;
  }

  try {
    await deleteTipoCampeonato(tipo.id);
    successMessage.value = `Tipo de campeonato "${tipo.nombre}" eliminado con éxito.`;
    showSuccess.value = true;
    await fetchTiposCampeonato();
  } catch (err) {
    console.error('Error al eliminar tipo de campeonato:', err);
  }
};

// Enviar formulario
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    const tipoCampeonatoData = {
      codigo: nuevoTipo.value.codigo,
      nombre: nuevoTipo.value.nombre,
      descripcion: nuevoTipo.value.descripcion
    };
    
    if (modoEdicion.value && editandoTipo.value) {
      // Actualizar tipo existente
      await updateTipoCampeonato(editandoTipo.value.id, tipoCampeonatoData);
      successMessage.value = `Tipo de campeonato "${tipoCampeonatoData.nombre}" actualizado con éxito.`;
    } else {
      // Crear nuevo tipo
      const nuevoTipoCampeonato = await createTipoCampeonato(tipoCampeonatoData);
      successMessage.value = `Tipo de campeonato "${nuevoTipoCampeonato.nombre}" creado con éxito.`;
    }
    
    showSuccess.value = true;
    
    // Limpiar formulario y estado
    nuevoTipo.value = {
      codigo: '',
      nombre: '',
      descripcion: ''
    };
    modoEdicion.value = false;
    editandoTipo.value = null;
    
    // Recargar la lista
    await fetchTiposCampeonato();
  } catch (err) {
    console.error('Error al gestionar tipo de campeonato:', err);
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
    
    <!-- Formulario para crear/editar tipo de campeonato -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-lg font-semibold mb-4">
        {{ modoEdicion ? 'Editar' : 'Crear Nuevo' }} Tipo de Campeonato
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Campo: Código -->
          <div>
            <label for="codigo" class="block text-sm font-medium text-gray-700 mb-1">
              Código *
            </label>
            <input 
              type="text" 
              id="codigo" 
              v-model="nuevoTipo.codigo"
              class="w-full px-3 py-2 border rounded-md uppercase" 
              :class="{ 'border-red-500': formErrors.codigo }"
              placeholder="Ej: DP"
              maxlength="2"
            />
            <p v-if="formErrors.codigo" class="mt-1 text-sm text-red-600">
              {{ formErrors.codigo }}
            </p>
          </div>
          
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
              placeholder="Ej: Dominó Parejas"
            />
            <p v-if="formErrors.nombre" class="mt-1 text-sm text-red-600">
              {{ formErrors.nombre }}
            </p>
          </div>
          
          <!-- Campo: Descripción -->
          <div class="md:col-span-2">
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input 
              type="text" 
              id="descripcion" 
              v-model="nuevoTipo.descripcion"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="Breve descripción del tipo de campeonato"
            />
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3">
          <button 
            v-if="modoEdicion"
            type="button" 
            @click="handleCancelEdit"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            :disabled="isLoading"
          >
            <span v-if="isLoading">{{ modoEdicion ? 'Actualizando...' : 'Guardando...' }}</span>
            <span v-else>{{ modoEdicion ? 'Actualizar' : 'Guardar' }}</span>
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
          hover
        >
          <!-- Template para las acciones -->
          <template #cell-acciones="{ item }">
            <div class="flex items-center justify-center gap-2">
              <button 
                @click.stop="handleEdit(item)"
                class="inline-flex items-center px-2.5 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button 
                @click.stop="handleDelete(item)"
                class="inline-flex items-center px-2.5 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </template>

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
.datatable-row {
  cursor: pointer;
}

.datatable-row:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style> 