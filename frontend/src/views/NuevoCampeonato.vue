<script setup lang="ts">
// Componente para crear y editar campeonatos
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import { useClubs } from '../composables/useClubs';
import type { CampeonatoCreate } from '../lib/campeonatoService';
import StatusMessage from '../components/ui/StatusMessage.vue';

// Router para la navegación
const router = useRouter();

// Composable para campeonatos
const { createCampeonato, fetchTiposCampeonato, tiposCampeonato, error: campeonatoError, isLoading } = useCampeonatos();
// Composable para clubes
const { clubs, fetchClubs, error: clubError } = useClubs();

// Estado para el formulario
const campeonato = ref<CampeonatoCreate>({
  nombre: '',
  fecha_inicio: new Date().toISOString().substring(0, 10),
  dias: 1,
  partidas: 0,
  pm: 300,
  gb: false,
  gbp: null,
  tipo_campeonato_id: 0,
  club_codigo: ''
});

// Estado para mensajes
const successMessage = ref<string>('');
const showSuccess = ref(false);
const formErrors = ref<Record<string, string>>({});

// Propiedad computada para PREVISUALIZAR el NCH
// El NCH final y correcto lo genera el backend al guardar.
const nchCalculado = computed(() => {
  const { tipo_campeonato_id, fecha_inicio, club_codigo } = campeonato.value;
  
  // Encontrar el objeto tipoCampeonato seleccionado para obtener su código
  const tipoSeleccionado = tiposCampeonato.value.find(t => t.id === tipo_campeonato_id);
  
  // Solo calcula si todos los campos necesarios tienen valor
  if (tipoSeleccionado && fecha_inicio && club_codigo) {
    // 1. Código del Tipo de Campeonato (ej: "DP")
    const codigoTipo = tipoSeleccionado.codigo.toUpperCase(); 

    // 2. Código del Club (ej: "430002")
    const codigoClub = club_codigo;

    // 3. Fecha en formato YYYYMMDD
    // Quita guiones de la fecha YYYY-MM-DD -> YYYYMMDD
    const fechaFormateada = fecha_inicio.replace(/-/g, ''); 

    // 4. Autoincremental (Placeholder - el backend lo genera)
    const autoincrementalPlaceholder = '001'; 

    // Combinar partes para formar la previsualización del NCH
    return `${codigoTipo}${codigoClub}${fechaFormateada}${autoincrementalPlaceholder}`;
  }
  // Devuelve cadena vacía si faltan datos
  return '';
});

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

  if (campeonato.value.dias === undefined || campeonato.value.dias <= 0) {
    formErrors.value.dias = 'El número de días debe ser positivo';
    isValid = false;
  }

  if (campeonato.value.partidas === undefined || campeonato.value.partidas < 0) {
    formErrors.value.partidas = 'El número de partidas no puede ser negativo';
    isValid = false;
  }

  if (campeonato.value.pm === undefined || campeonato.value.pm < 0) {
    formErrors.value.pm = 'Los Puntos Máximos (PM) no pueden ser negativos';
    isValid = false;
  }

  if (campeonato.value.gb && (campeonato.value.gbp === undefined || campeonato.value.gbp === null || campeonato.value.gbp <= 0)) {
    formErrors.value.gbp = 'Si GB está activado, la partida de inicio del Grupo B es obligatoria y debe ser positiva';
    isValid = false;
  }

  if (!campeonato.value.tipo_campeonato_id) {
    formErrors.value.tipo_campeonato_id = 'El tipo de campeonato es obligatorio';
    isValid = false;
  }

  if (!campeonato.value.club_codigo) {
    formErrors.value.club_codigo = 'El club organizador es obligatorio';
    isValid = false;
  }

  return isValid;
};

// Enviar formulario
const handleSubmit = async () => {
  if (!campeonato.value.gb) {
    campeonato.value.gbp = null;
  }
  
  if (!validateForm()) return;
  
  try {
    const newCampeonato = await createCampeonato(campeonato.value);
    
    // Mostrar mensaje de éxito incluyendo el NCH
    successMessage.value = `Campeonato "${newCampeonato.nombre}" (NCH: ${newCampeonato.nch}) creado con éxito.`;
    showSuccess.value = true;
    
    // Limpiar formulario
    campeonato.value = {
      nombre: '',
      fecha_inicio: new Date().toISOString().substring(0, 10),
      dias: 1,
      partidas: 0,
      pm: 300,
      gb: false,
      gbp: null,
      tipo_campeonato_id: 0,
      club_codigo: ''
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

// Cargar tipos de campeonato y clubes al montar el componente
onMounted(async () => {
  await fetchTiposCampeonato();
  await fetchClubs();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Crear Nuevo Campeonato</h1>
    
    <!-- Mensajes de estado -->
    <StatusMessage 
      v-if="campeonatoError || clubError" 
      :message="campeonatoError || clubError || 'Error desconocido'" 
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
        <!-- Mostrar NCH Calculado -->
        <div class="col-span-2 mb-2">
          <label class="block text-sm font-medium text-gray-500">NCH (Calculado):</label>
          <div class="mt-1 p-2 h-10 border border-gray-200 rounded-md bg-gray-50 text-lg font-semibold">
            {{ nchCalculado || '...' }}
          </div>
        </div>

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
        
        <!-- Campo: Días -->
        <div>
          <label for="dias" class="block text-sm font-medium text-gray-700 mb-1">
            Días *
          </label>
          <input 
            type="number" 
            id="dias" 
            v-model.number="campeonato.dias"
            min="1"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.dias }"
          />
          <p v-if="formErrors.dias" class="mt-1 text-sm text-red-600">
            {{ formErrors.dias }}
          </p>
        </div>

        <!-- Campo: Partidas -->
        <div>
          <label for="partidas" class="block text-sm font-medium text-gray-700 mb-1">
            Partidas *
          </label>
          <input 
            type="number" 
            id="partidas" 
            v-model.number="campeonato.partidas"
            min="0"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.partidas }"
          />
          <p v-if="formErrors.partidas" class="mt-1 text-sm text-red-600">
            {{ formErrors.partidas }}
          </p>
        </div>

        <!-- Campo: Puntos Máximos (PM) -->
        <div>
          <label for="pm" class="block text-sm font-medium text-gray-700 mb-1">
            Puntos Máximos (PM) *
          </label>
          <input 
            type="number" 
            id="pm" 
            v-model.number="campeonato.pm"
            min="0"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.pm }"
          />
          <p v-if="formErrors.pm" class="mt-1 text-sm text-red-600">
            {{ formErrors.pm }}
          </p>
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

        <!-- Campo: Puntos Grupo B (GB Pts) - Condicional -->
        <div v-if="campeonato.gb">
          <label for="gbp" class="block text-sm font-medium text-gray-700 mb-1">
            Partida inicio Grupo B *
          </label>
          <input 
            type="number" 
            id="gbp" 
            v-model.number="campeonato.gbp"
            min="1"
            class="w-full px-3 py-2 border rounded-md"
            :class="{ 'border-red-500': formErrors.gbp }"
            placeholder="Partida tras la cual inicia Grupo B"
          />
          <p v-if="formErrors.gbp" class="mt-1 text-sm text-red-600">
            {{ formErrors.gbp }}
          </p>
        </div>
        
        <!-- Campo: Tipo de campeonato -->
        <div class="col-span-2 md:col-span-1">
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

        <!-- Campo: Club Organizador -->
        <div class="col-span-2 md:col-span-1">
          <label for="club_codigo" class="block text-sm font-medium text-gray-700 mb-1">
            Club Organizador *
          </label>
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
          <p v-if="formErrors.club_codigo" class="mt-1 text-sm text-red-600">
            {{ formErrors.club_codigo }}
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