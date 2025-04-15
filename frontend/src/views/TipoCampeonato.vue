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

// Calcular el total de elementos
const totalTipos = computed(() => tiposCampeonato.value.length);

// Configurar paginación pasando el total
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
} = usePagination(totalTipos);

// Calcular los items paginados
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  // Asegurarse de que tiposCampeonato.value es un array antes de slice
  return Array.isArray(tiposCampeonato.value) ? tiposCampeonato.value.slice(start, end) : [];
});

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
    
    <!-- Sección de Tipos Existentes -->
    <div class="mt-10">
      <h2 class="text-lg font-semibold mb-4">Tipos de Campeonato Existentes</h2>

      <!-- Mostrar indicador de carga -->
      <div v-if="isLoading" class="text-center py-4">Cargando...</div>

      <!-- Mostrar tabla y paginación solo si no está cargando Y tiposCampeonato es un array -->
      <!-- Se usa `tiposCampeonato` para `v-if`, pero `paginatedItems` (ahora calculado localmente) para la tabla -->
      <div v-else-if="Array.isArray(tiposCampeonato)">
        <DataTable 
          :items="paginatedItems" 
          :columns="columns"
          item-key="id"
        >
          <template #cell(acciones)="{ item }">
            <div class="flex space-x-2">
              <button @click="handleEdit(item)" class="text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="handleDelete(item)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </div>
          </template>
           <!-- Template para cuando no hay datos (usando paginatedItems) -->
          <template #no-data>
            <div class="text-center py-4">
              <p>No hay tipos de campeonato para mostrar.</p>
            </div>
          </template>
        </DataTable>

        <!-- Paginación (se muestra incluso si paginatedItems está vacío) -->
        <Pagination v-if="totalPages > 0" 
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :page-size-options="pageSizeOptions"
          :page-range="pageRange" 
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          @update:currentPage="goToPage"
          @update:pageSize="setPageSize"
          @next="nextPage"
          @prev="prevPage"
          @first="firstPage"
          @last="lastPage"
          class="mt-4"
        />
      </div>
      <!-- Mensaje si hubo un error o la carga falló -->
      <div v-else class="text-center text-gray-500 py-4">
        No se pudieron cargar los tipos de campeonato.
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