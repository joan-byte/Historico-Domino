<!-- ModificarCampeonato.vue - Formulario para editar un campeonato existente -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import type { CampeonatoUpdate } from '../lib/campeonatoService';
import StatusMessage from '../components/ui/StatusMessage.vue';

// Router y route para la navegación y acceso a parámetros
const router = useRouter();
const route = useRoute();
const campeonatoId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id, 10) : 0;
});

// Composable para campeonatos
const { 
  fetchCampeonatoById, 
  fetchTiposCampeonato,
  updateCampeonato, 
  isLoading, 
  error: campeonatoError, 
  selectedCampeonato, 
  tiposCampeonato 
} = useCampeonatos();

// Estado para el formulario
const campeonato = ref<CampeonatoUpdate>({
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  tipo_campeonato_id: 0
});

// Estado para mensajes
const successMessage = ref<string>('');
const showSuccess = ref(false);
const formErrors = ref<Record<string, string>>({});

// Validar el formulario
const validateForm = (): boolean => {
  formErrors.value = {};
  let isValid = true;

  if (campeonato.value.nombre !== undefined && !campeonato.value.nombre.trim()) {
    formErrors.value.nombre = 'El nombre es obligatorio';
    isValid = false;
  }

  if (campeonato.value.fecha_inicio && campeonato.value.fecha_fin && 
      campeonato.value.fecha_inicio > campeonato.value.fecha_fin) {
    formErrors.value.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    isValid = false;
  }

  return isValid;
};

// Manejar el envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    const updatedCampeonato = await updateCampeonato(campeonatoId.value, campeonato.value);
    
    // Mostrar mensaje de éxito
    successMessage.value = `Campeonato "${updatedCampeonato.nombre}" actualizado con éxito.`;
    showSuccess.value = true;
    
    // Volver a la lista después de un breve retraso
    setTimeout(() => {
      router.push('/campeonatos/lista');
    }, 2000);
  } catch (err) {
    console.error('Error al actualizar campeonato:', err);
  }
};

// Cancelar y volver atrás
const handleCancel = () => {
  router.go(-1);
};

// Observar cambios en el campeonato seleccionado
watch(selectedCampeonato, (newCampeonato) => {
  if (newCampeonato) {
    campeonato.value = {
      nombre: newCampeonato.nombre,
      fecha_inicio: newCampeonato.fecha_inicio,
      fecha_fin: newCampeonato.fecha_fin,
      tipo_campeonato_id: newCampeonato.tipo_campeonato_id
    };
  }
});

// Cargar datos al montar el componente
onMounted(async () => {
  if (campeonatoId.value) {
    await Promise.all([
      fetchCampeonatoById(campeonatoId.value),
      fetchTiposCampeonato()
    ]);
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Modificar Campeonato</h1>
    
    <!-- Mensajes de estado -->
    <StatusMessage 
      v-if="campeonatoError" 
      :message="campeonatoError" 
      type="error" 
      :show="true"
      class="mb-4" 
    />
    
    <StatusMessage 
      v-if="showSuccess" 
      :message="successMessage" 
      type="success" 
      :show="true"
      class="mb-4" 
    />
    
    <!-- Loading spinner -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
    
    <!-- Formulario -->
    <form v-else @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Campo: Nombre -->
        <div class="col-span-2">
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input 
            type="text" 
            id="nombre" 
            v-model="campeonato.nombre"
            class="w-full px-3 py-2 border rounded-md" 
            :class="{ 'border-red-500': formErrors.nombre }"
            placeholder="Nombre del campeonato"
          />
          <p v-if="formErrors.nombre" class="mt-1 text-sm text-red-600">
            {{ formErrors.nombre }}
          </p>
        </div>
        
        <!-- Campo: Fecha inicio -->
        <div>
          <label for="fecha_inicio" class="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio *
          </label>
          <input 
            type="date" 
            id="fecha_inicio" 
            v-model="campeonato.fecha_inicio"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.fecha_inicio }"
          />
          <p v-if="formErrors.fecha_inicio" class="mt-1 text-sm text-red-600">
            {{ formErrors.fecha_inicio }}
          </p>
        </div>
        
        <!-- Campo: Fecha fin -->
        <div>
          <label for="fecha_fin" class="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin *
          </label>
          <input 
            type="date" 
            id="fecha_fin" 
            v-model="campeonato.fecha_fin"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.fecha_fin }"
          />
          <p v-if="formErrors.fecha_fin" class="mt-1 text-sm text-red-600">
            {{ formErrors.fecha_fin }}
          </p>
        </div>
        
        <!-- Campo: Tipo de campeonato -->
        <div class="col-span-2">
          <label for="tipo_campeonato" class="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Campeonato *
          </label>
          <select 
            id="tipo_campeonato" 
            v-model="campeonato.tipo_campeonato_id"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.tipo_campeonato_id }"
          >
            <option :value="0" disabled>Seleccione un tipo</option>
            <option 
              v-for="tipo in tiposCampeonato" 
              :key="tipo.id" 
              :value="tipo.id"
            >
              {{ tipo.nombre }} ({{ tipo.codigo }})
            </option>
          </select>
          <p v-if="formErrors.tipo_campeonato_id" class="mt-1 text-sm text-red-600">
            {{ formErrors.tipo_campeonato_id }}
          </p>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="flex justify-end space-x-3 mt-8">
        <button 
          type="button" 
          @click="handleCancel"
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Guardando...</span>
          <span v-else>Guardar</span>
        </button>
      </div>
    </form>
  </div>
</template> 