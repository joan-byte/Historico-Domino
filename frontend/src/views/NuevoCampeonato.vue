<script setup lang="ts">
// Componente para crear y editar campeonatos
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import type { CampeonatoCreate } from '../lib/campeonatoService';
import StatusMessage from '../components/ui/StatusMessage.vue';

// Router para la navegación
const router = useRouter();

// Composable para campeonatos
const { createCampeonato, fetchTiposCampeonato, tiposCampeonato, error: campeonatoError, isLoading } = useCampeonatos();

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
  }

  if (campeonato.value.fecha_inicio > campeonato.value.fecha_fin) {
    formErrors.value.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    isValid = false;
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
    const newCampeonato = await createCampeonato(campeonato.value);
    
    // Mostrar mensaje de éxito
    successMessage.value = `Campeonato "${newCampeonato.nombre}" creado con éxito.`;
    showSuccess.value = true;
    
    // Limpiar formulario
    campeonato.value = {
      nombre: '',
      fecha_inicio: new Date().toISOString().substring(0, 10),
      fecha_fin: new Date().toISOString().substring(0, 10),
      tipo_campeonato_id: 0
    };
    
    // Volver a la lista después de un breve retraso
    setTimeout(() => {
      router.push('/campeonatos/lista');
    }, 2000);
  } catch (err) {
    console.error('Error al crear campeonato:', err);
  }
};

// Cancelar y volver atrás
const handleCancel = () => {
  router.go(-1);
};

// Cargar tipos de campeonato al montar el componente
onMounted(async () => {
  await fetchTiposCampeonato();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Crear Nuevo Campeonato</h1>
    
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
    
    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md">
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

<style scoped>
/* Estilos específicos para este componente */
</style> 