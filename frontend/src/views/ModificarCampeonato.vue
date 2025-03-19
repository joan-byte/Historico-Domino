<!-- ModificarCampeonato.vue - Formulario para editar un campeonato existente -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import StatusMessage from '../components/ui/StatusMessage.vue';
import type { CampeonatoResponse, CampeonatoCreate } from '../lib/campeonatoService';

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
  error, 
  selectedCampeonato, 
  tiposCampeonato 
} = useCampeonatos();

// Estado para el formulario
const campeonato = ref<CampeonatoCreate>({
  nombre: '',
  fecha_inicio: new Date().toISOString().substring(0, 10),
  fecha_fin: new Date().toISOString().substring(0, 10),
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

  if (!campeonato.value.nombre.trim()) {
    formErrors.value.nombre = 'El nombre es obligatorio';
    isValid = false;
  }

  if (!campeonato.value.fecha_inicio) {
    formErrors.value.fecha_inicio = 'La fecha de inicio es obligatoria';
    isValid = false;
  }

  if (!campeonato.value.fecha_fin) {
    formErrors.value.fecha_fin = 'La fecha de fin es obligatoria';
    isValid = false;
  } else {
    const fechaInicio = new Date(campeonato.value.fecha_inicio);
    const fechaFin = new Date(campeonato.value.fecha_fin);
    if (fechaFin < fechaInicio) {
      formErrors.value.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      isValid = false;
    }
  }

  if (!campeonato.value.tipo_campeonato_id) {
    formErrors.value.tipo_campeonato_id = 'El tipo de campeonato es obligatorio';
    isValid = false;
  }

  return isValid;
};

// Enviar formulario
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    const updatedCampeonato = await updateCampeonato(campeonatoId.value, campeonato.value);
    
    // Mostrar mensaje de éxito
    successMessage.value = `Campeonato "${updatedCampeonato.nombre}" actualizado con éxito.`;
    showSuccess.value = true;
    
    // Volver a la lista después de un breve retraso
    setTimeout(() => {
      router.push({ name: 'CampeonatosLista' });
    }, 2000);
  } catch (err) {
    console.error('Error al actualizar campeonato:', err);
  }
};

// Cancelar y volver atrás
const handleCancel = () => {
  router.go(-1);
};

// Opciones para el selector de tipo de campeonato
const tiposCampeonatoOptions = computed(() => {
  return tiposCampeonato.value.map(tipo => ({
    value: tipo.id,
    label: tipo.nombre
  }));
});

// Cargar datos del campeonato cuando cambia el ID
watch(campeonatoId, async (newId) => {
  if (newId) {
    await fetchCampeonatoById(newId);
  }
}, { immediate: true });

// Actualizar el formulario cuando se carga el campeonato seleccionado
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

// Obtener los tipos de campeonato al cargar el componente
onMounted(async () => {
  await fetchTiposCampeonato();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Modificar Campeonato</h1>
    
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
    
    <!-- Loading spinner -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
              v-for="option in tiposCampeonatoOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
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
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Guardando...</span>
          <span v-else>Guardar</span>
        </button>
      </div>
    </form>
  </div>
</template> 