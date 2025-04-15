<!-- ModificarCampeonato.vue - Formulario para editar un campeonato existente -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import { useClubs } from '../composables/useClubs';
import type { CampeonatoUpdate, CampeonatoResponse, TipoCampeonatoResponse } from '../lib/campeonatoService';
import StatusMessage from '../components/ui/StatusMessage.vue';

// Router y route para la navegación y acceso a parámetros
const router = useRouter();
const route = useRoute();
const campeonatoNch = computed(() => route.params.nch as string);

// Composable para campeonatos y clubes
const { 
  fetchCampeonatoById,
  fetchTiposCampeonato,
  updateCampeonato, 
  isLoading, 
  error: campeonatoError, 
  selectedCampeonato,
  tiposCampeonato 
} = useCampeonatos();
const { clubs, fetchClubs, error: clubError } = useClubs();

// Estado para el formulario
const campeonato = ref<CampeonatoUpdate>({
  nombre: '',
  fecha_inicio: '',
  dias: 1,
  partidas: 0,
  pm: 0,
  gb: false,
  gbp: null,
  club_codigo: ''
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
  if (campeonato.value.fecha_inicio !== undefined && !campeonato.value.fecha_inicio) {
    formErrors.value.fecha_inicio = 'La fecha de inicio es obligatoria';
    isValid = false;
  }
  if (campeonato.value.dias !== undefined && campeonato.value.dias <= 0) {
    formErrors.value.dias = 'El número de días debe ser positivo';
    isValid = false;
  }
  if (campeonato.value.partidas !== undefined && campeonato.value.partidas < 0) {
    formErrors.value.partidas = 'El número de partidas no puede ser negativo';
    isValid = false;
  }
  if (campeonato.value.pm !== undefined && campeonato.value.pm < 0) {
    formErrors.value.pm = 'Los Puntos Máximos (PM) no pueden ser negativos';
    isValid = false;
  }
  if (campeonato.value.gb && (campeonato.value.gbp === undefined || campeonato.value.gbp === null || campeonato.value.gbp <= 0)) {
    formErrors.value.gbp = 'Si GB está activado, la partida de inicio del Grupo B es obligatoria y debe ser positiva';
    isValid = false;
  }
  if (campeonato.value.club_codigo !== undefined && !campeonato.value.club_codigo) {
    formErrors.value.club_codigo = 'El club organizador es obligatorio';
    isValid = false;
  }

  return isValid;
};

// Manejar el envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  if (!campeonato.value.gb) {
      campeonato.value.gbp = null;
  }

  try {
    const dataToUpdate: CampeonatoUpdate = { ...campeonato.value };
    
    const updatedCampeonato = await updateCampeonato(campeonatoNch.value, dataToUpdate);
    
    successMessage.value = `Campeonato "${updatedCampeonato.nombre}" (NCH: ${updatedCampeonato.nch}) actualizado con éxito.`;
    showSuccess.value = true;
    
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

// Observar cambios en el campeonato seleccionado para llenar el formulario
watch(selectedCampeonato, (newCampeonatoData: CampeonatoResponse | null) => {
  if (newCampeonatoData) {
    // Ya no necesitamos guardar tipoCampeonatoIdOriginal aquí
    // tipoCampeonatoIdOriginal.value = newCampeonatoData.tipo_campeonato_id;
    
    // Llenar el ref del formulario con los datos cargados
    campeonato.value = {
      nombre: newCampeonatoData.nombre,
      fecha_inicio: newCampeonatoData.fecha_inicio,
      dias: newCampeonatoData.dias,
      partidas: newCampeonatoData.partidas,
      pm: newCampeonatoData.pm,
      gb: newCampeonatoData.gb,
      gbp: newCampeonatoData.gbp,
      club_codigo: newCampeonatoData.club_codigo
    };
  }
}, { immediate: true });

// Cargar datos al montar el componente
onMounted(async () => {
  // Log para verificar el valor de NCH antes de la condición
  console.log(`[ModificarCampeonato] onMounted - NCH from route:`, campeonatoNch.value);
  if (campeonatoNch.value) {
    // Log para confirmar que entramos en el if
    console.log(`[ModificarCampeonato] onMounted - Condition met, calling Promise.all...`);
    try { // Añadir try/catch alrededor de Promise.all
      await Promise.all([
        fetchCampeonatoById(campeonatoNch.value),
        fetchTiposCampeonato(),
        fetchClubs()
      ]);
      console.log(`[ModificarCampeonato] onMounted - Promise.all finished.`);
    } catch (err) {
        console.error('[ModificarCampeonato] Error during onMounted Promise.all:', err);
        // Opcionalmente, mostrar un error al usuario aquí
    }
  } else {
      // Log si la condición no se cumple
      console.warn(`[ModificarCampeonato] onMounted - NCH is missing or invalid, skipping data fetch.`);
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Modificar Campeonato</h1>
    
    <!-- Mensajes de estado -->
    <StatusMessage 
      v-if="campeonatoError || clubError" 
      :message="campeonatoError || clubError || 'Error al cargar datos'" 
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
    <div v-if="isLoading" class="flex justify-center my-8"> <!-- Simplificado: Mostrar si isLoading es true -->
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
    
    <!-- Contenido cuando no está cargando -->
    <div v-else>
      <!-- Formulario (si hay datos) -->
      <form v-if="selectedCampeonato" @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Mostrar NCH Original (No editable) -->
          <div class="col-span-2 mb-2">
            <label class="block text-sm font-medium text-gray-500">NCH:</label>
            <div class="mt-1 p-2 h-10 border border-gray-200 rounded-md bg-gray-50 text-lg font-semibold">
              {{ selectedCampeonato.nch }}
            </div>
          </div>
  
          <!-- Campo: Nombre -->
          <div class="col-span-2">
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input 
              type="text" 
              id="nombre" 
              v-model="campeonato.nombre"
              class="w-full px-3 py-2 border rounded-md" 
              :class="{ 'border-red-500': formErrors.nombre }"
              placeholder="Nombre del campeonato"
            />
            <p v-if="formErrors.nombre" class="mt-1 text-sm text-red-600">{{ formErrors.nombre }}</p>
          </div>
          
          <!-- Campo: Fecha inicio -->
          <div>
            <label for="fecha_inicio" class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
            <input 
              type="date" 
              id="fecha_inicio" 
              v-model="campeonato.fecha_inicio"
              class="w-full px-3 py-2 border rounded-md"
              :class="{ 'border-red-500': formErrors.fecha_inicio }"
            />
            <p v-if="formErrors.fecha_inicio" class="mt-1 text-sm text-red-600">{{ formErrors.fecha_inicio }}</p>
          </div>
          
          <!-- Campo: Días -->
          <div>
            <label for="dias" class="block text-sm font-medium text-gray-700 mb-1">Días *</label>
            <input 
              type="number" 
              id="dias" 
              v-model.number="campeonato.dias"
              min="1"
              class="w-full px-3 py-2 border rounded-md"
              :class="{ 'border-red-500': formErrors.dias }"
            />
            <p v-if="formErrors.dias" class="mt-1 text-sm text-red-600">{{ formErrors.dias }}</p>
          </div>
  
          <!-- Campo: Partidas -->
          <div>
            <label for="partidas" class="block text-sm font-medium text-gray-700 mb-1">Partidas *</label>
            <input 
              type="number" 
              id="partidas" 
              v-model.number="campeonato.partidas"
              min="0"
              class="w-full px-3 py-2 border rounded-md"
              :class="{ 'border-red-500': formErrors.partidas }"
            />
            <p v-if="formErrors.partidas" class="mt-1 text-sm text-red-600">{{ formErrors.partidas }}</p>
          </div>
  
          <!-- Campo: Puntos Máximos (PM) -->
          <div>
            <label for="pm" class="block text-sm font-medium text-gray-700 mb-1">Puntos Máximos (PM) *</label>
            <input 
              type="number" 
              id="pm" 
              v-model.number="campeonato.pm"
              min="0"
              class="w-full px-3 py-2 border rounded-md"
              :class="{ 'border-red-500': formErrors.pm }"
            />
            <p v-if="formErrors.pm" class="mt-1 text-sm text-red-600">{{ formErrors.pm }}</p>
          </div>
  
          <!-- Campo: Grupo B (GB) -->
          <div class="col-span-2 flex items-center space-x-4">
             <div class="flex items-center h-5">
               <input 
                 id="gb" 
                 type="checkbox" 
                 v-model="campeonato.gb"
                 class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
               />
             </div>
             <div class="text-sm">
               <label for="gb" class="font-medium text-gray-700">Grupo B</label>
               <p class="text-gray-500">Marcar si el campeonato pertenece al Grupo B (si no, es Grupo A).</p>
             </div>
          </div>
  
          <!-- Campo: Partida Inicio Grupo B (GBP) - Condicional -->
          <div v-if="campeonato.gb">
            <label for="gbp" class="block text-sm font-medium text-gray-700 mb-1">Partida inicio Grupo B *</label>
            <input 
              type="number" 
              id="gbp" 
              v-model.number="campeonato.gbp"
              min="1"
              class="w-full px-3 py-2 border rounded-md"
              :class="{ 'border-red-500': formErrors.gbp }"
              placeholder="Partida tras la cual inicia Grupo B"
            />
            <p v-if="formErrors.gbp" class="mt-1 text-sm text-red-600">{{ formErrors.gbp }}</p>
          </div>
          
          <!-- Campo: Club Organizador (Select) -->
          <div class="col-span-2 md:col-span-1">
            <label for="club_codigo" class="block text-sm font-medium text-gray-700 mb-1">Club Organizador *</label>
            <select 
              id="club_codigo" 
              v-model="campeonato.club_codigo"
              class="w-full px-3 py-2 border rounded-md"
              :class="{ 'border-red-500': formErrors.club_codigo }"
            >
              <option value="" disabled>Seleccione un club</option>
              <option 
                v-for="club in clubs" 
                :key="club.codigo_club" 
                :value="club.codigo_club"
              >
                {{ club.nombre }} ({{ club.codigo_club }})
              </option>
            </select>
            <p v-if="formErrors.club_codigo" class="mt-1 text-sm text-red-600">{{ formErrors.club_codigo }}</p>
          </div>
  
          <!-- Campo Tipo Campeonato (Sólo lectura - Informativo) -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Campeonato</label>
            <div class="mt-1 p-2 h-10 border border-gray-200 rounded-md bg-gray-50">
              {{ tiposCampeonato.find(t => t.id === selectedCampeonato?.tipo_campeonato_id)?.nombre || 'N/A' }}
              ({{ tiposCampeonato.find(t => t.id === selectedCampeonato?.tipo_campeonato_id)?.codigo || 'N/A' }})
            </div>
            <p class="mt-1 text-sm text-gray-500">El tipo no se puede modificar.</p>
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
            <span v-if="isLoading">Actualizando...</span>
            <span v-else>Actualizar</span> 
          </button>
        </div>
      </form>

      <!-- Mensaje si hubo error al cargar -->
      <div v-else-if="campeonatoError"> <!-- Mostrar si hay error (y no está cargando) -->
        <p class="text-center text-red-600 py-4">No se pudo cargar el campeonato: {{ campeonatoError }}</p>
      </div>

      <!-- Mensaje genérico si no carga, no hay error, pero no hay datos -->
      <div v-else>
        <p class="text-center text-gray-500 py-4">No se encontró el campeonato o hubo un problema.</p>
      </div>
    </div>

  </div>
</template> 