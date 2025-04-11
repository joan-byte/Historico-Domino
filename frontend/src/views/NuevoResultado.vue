<script setup lang="ts">
// Componente para registrar nuevos resultados de campeonatos
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useResultados } from '../composables/useResultados';
import { useTiposCampeonato } from '../composables/useTiposCampeonato';
import { useJugadores } from '../composables/useJugadores';
import { useClubs } from '../composables/useClubs';
import type { ResultadoCreate, ResultadoResponse } from '../lib/resultadoService';
import type { TipoCampeonatoResponse } from '../lib/tipoCampeonatoService';
import type { JugadorResponse } from '../lib/jugadorService';
import type { ClubResponse } from '../lib/clubService';
import StatusMessage from '../components/ui/StatusMessage.vue';

const router = useRouter();

// Usar composables
const { 
  addResultado, 
  isLoading: isLoadingResultado, 
  error: errorResultado 
} = useResultados();

const { 
  tiposCampeonato, 
  fetchTiposCampeonato, 
  isLoading: isLoadingTipos, 
  error: errorTipos 
} = useTiposCampeonato();

const { 
  jugadores, 
  fetchJugadores, 
  isLoading: isLoadingJugadores, 
  error: errorJugadores 
} = useJugadores();

const { 
  clubs, 
  fetchClubs, 
  isLoading: isLoadingClubs, 
  error: errorClubs 
} = useClubs();

// Datos del formulario (refleja ResultadoCreate)
const form = ref<Partial<ResultadoCreate>>({
  tipo_campeonato_id: undefined,
  nombre_campeonato: '', // Se autocompleta al seleccionar tipo
  fecha_campeonato: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  idfed_jugador: undefined,
  nombre_jugador: '', // Se autocompleta al seleccionar jugador
  apellido_jugador: '', // Se autocompleta al seleccionar jugador
  codigo_club_jugador: undefined, // Se autocompleta al seleccionar jugador
  nombre_club_jugador: '', // Se autocompleta al seleccionar jugador
  idfed_pareja: undefined,
  nombre_pareja: '', // Se autocompleta al seleccionar pareja
  apellido_pareja: '', // Se autocompleta al seleccionar pareja
  codigo_club_pareja: undefined, // Se autocompleta al seleccionar pareja
  nombre_club_pareja: '', // Se autocompleta al seleccionar pareja
  partida: 1, // Valor por defecto
  mesa: 1, // Valor por defecto
  gb: true, // Valor por defecto (A)
  pg: 0,
  dif: 0,
  pv: 0,
  pt: 0,
  mg: 0,
  pos: 0,
});

// Cargar datos necesarios al montar
onMounted(() => {
  fetchTiposCampeonato();
  fetchJugadores(); // Cargar todos los jugadores por defecto
  fetchClubs(); // Cargar todos los clubs por defecto
});

// Autocompletar nombre del campeonato al seleccionar tipo
watch(() => form.value.tipo_campeonato_id, (newId) => {
  // Añadir tipo explícito al parámetro del find
  const tipo = tiposCampeonato.value.find((t: TipoCampeonatoResponse) => t.id === newId);
  form.value.nombre_campeonato = tipo ? tipo.nombre : '';
});

// Autocompletar datos del jugador principal al seleccionar IDFED
watch(() => form.value.idfed_jugador, (newIdfed) => {
  const jugador = jugadores.value.find(j => j.idfed === newIdfed);
  if (jugador) {
    form.value.nombre_jugador = jugador.nombre;
    form.value.apellido_jugador = jugador.apellidos;
    form.value.codigo_club_jugador = jugador.codigo_club;
    form.value.nombre_club_jugador = jugador.nombre_club;
  } else {
    form.value.nombre_jugador = '';
    form.value.apellido_jugador = '';
    form.value.codigo_club_jugador = undefined;
    form.value.nombre_club_jugador = '';
  }
});

// Autocompletar datos de la pareja al seleccionar IDFED
watch(() => form.value.idfed_pareja, (newIdfed) => {
  if (!newIdfed) {
    form.value.nombre_pareja = '';
    form.value.apellido_pareja = '';
    form.value.codigo_club_pareja = undefined;
    form.value.nombre_club_pareja = '';
    return;
  }
  const pareja = jugadores.value.find(j => j.idfed === newIdfed);
  if (pareja) {
    form.value.nombre_pareja = pareja.nombre;
    form.value.apellido_pareja = pareja.apellidos;
    form.value.codigo_club_pareja = pareja.codigo_club;
    form.value.nombre_club_pareja = pareja.nombre_club;
  } else {
    form.value.nombre_pareja = '';
    form.value.apellido_pareja = '';
    form.value.codigo_club_pareja = undefined;
    form.value.nombre_club_pareja = '';
  }
});

// Estado de carga general
const isLoading = computed(() => 
  isLoadingResultado.value || isLoadingTipos.value || isLoadingJugadores.value || isLoadingClubs.value
);

// Errores combinados
const formError = computed(() => 
  errorResultado.value || errorTipos.value || errorJugadores.value || errorClubs.value
);

// Estado para errores de validación
const validationErrors = ref<Record<string, string>>({});

// Validar formulario
const validarFormulario = (): boolean => {
  validationErrors.value = {};
  const data = form.value;
  
  if (!data.tipo_campeonato_id) validationErrors.value.tipo_campeonato_id = 'Selecciona un tipo de campeonato.';
  if (!data.fecha_campeonato) validationErrors.value.fecha_campeonato = 'La fecha es obligatoria.';
  if (!data.idfed_jugador) validationErrors.value.idfed_jugador = 'Selecciona un jugador principal.';
  if (data.idfed_jugador && data.idfed_pareja === data.idfed_jugador) validationErrors.value.idfed_pareja = 'La pareja no puede ser el mismo jugador.';
  if (data.partida === undefined || data.partida <= 0) validationErrors.value.partida = 'El número de partida debe ser positivo.';
  if (data.mesa === undefined || data.mesa <= 0) validationErrors.value.mesa = 'El número de mesa debe ser positivo.';
  // Añadir más validaciones según sea necesario (PG, DIF, PV, PT, MG, POS)
  if (data.pg === undefined || data.pg < 0) validationErrors.value.pg = 'PG debe ser 0 o positivo.';
  // ... otras validaciones numéricas ...
  
  return Object.keys(validationErrors.value).length === 0;
};

// Función para guardar
const guardarResultado = async () => {
  if (!validarFormulario()) {
    return;
  }
  
  try {
    // Asegurarse de que todos los campos requeridos por ResultadoCreate estén presentes
    const resultadoData: ResultadoCreate = {
      tipo_campeonato_id: form.value.tipo_campeonato_id!,
      nombre_campeonato: form.value.nombre_campeonato!,
      fecha_campeonato: form.value.fecha_campeonato!,
      idfed_jugador: form.value.idfed_jugador!,
      nombre_jugador: form.value.nombre_jugador!,
      apellido_jugador: form.value.apellido_jugador!,
      codigo_club_jugador: form.value.codigo_club_jugador!,
      nombre_club_jugador: form.value.nombre_club_jugador!,
      idfed_pareja: form.value.idfed_pareja || undefined,
      nombre_pareja: form.value.idfed_pareja ? form.value.nombre_pareja || '' : undefined,
      apellido_pareja: form.value.idfed_pareja ? form.value.apellido_pareja || '' : undefined,
      codigo_club_pareja: form.value.idfed_pareja ? form.value.codigo_club_pareja || undefined : undefined,
      nombre_club_pareja: form.value.idfed_pareja ? form.value.nombre_club_pareja || '' : undefined,
      partida: form.value.partida!,
      mesa: form.value.mesa!,
      gb: form.value.gb!,
      pg: form.value.pg!,
      dif: form.value.dif!,
      pv: form.value.pv!,
      pt: form.value.pt!,
      mg: form.value.mg!,
      pos: form.value.pos!,
    };
    
    await addResultado(resultadoData);
    router.push('/resultados'); // O a la lista de resultados
  } catch (error) {
    // El error se muestra a través de formError
    console.error("Error al guardar resultado:", error);
  }
};

// Función para cancelar
const cancelar = () => {
  router.push('/resultados');
};

</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Registrar Nuevo Resultado</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          @click="guardarResultado"
          :disabled="isLoading"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>

    <!-- Mensaje de error general -->
    <StatusMessage type="error" :show="!!formError" :message="formError || ''" class="mb-4" />

    <div class="bg-white border rounded-md shadow-sm p-6">
      <form @submit.prevent="guardarResultado" class="space-y-6">
        <!-- Sección Campeonato y Fecha -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Tipo de Campeonato <span class="text-red-500">*</span>
              <select
                v-model="form.tipo_campeonato_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                :class="{'border-red-500': validationErrors.tipo_campeonato_id}"
                :disabled="isLoadingTipos"
              >
                <option :value="undefined" disabled>Seleccionar tipo</option>
                <option v-for="tipo in tiposCampeonato" :key="tipo.id" :value="tipo.id">
                  {{ tipo.codigo }} - {{ tipo.nombre }}
                </option>
              </select>
            </label>
            <p v-if="validationErrors.tipo_campeonato_id" class="text-red-500 text-xs mt-1">{{ validationErrors.tipo_campeonato_id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre Campeonato</label>
            <input type="text" :value="form.nombre_campeonato" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha Campeonato <span class="text-red-500">*</span>
              <input
                v-model="form.fecha_campeonato"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                :class="{'border-red-500': validationErrors.fecha_campeonato}"
              />
            </label>
            <p v-if="validationErrors.fecha_campeonato" class="text-red-500 text-xs mt-1">{{ validationErrors.fecha_campeonato }}</p>
          </div>
        </div>

        <!-- Sección Jugador Principal -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Jugador Principal</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Jugador (IDFED) <span class="text-red-500">*</span>
                <select
                  v-model="form.idfed_jugador"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                  :class="{'border-red-500': validationErrors.idfed_jugador}"
                  :disabled="isLoadingJugadores"
                >
                  <option :value="undefined" disabled>Seleccionar jugador</option>
                  <option v-for="jugador in jugadores" :key="jugador.idfed" :value="jugador.idfed">
                    {{ jugador.idfed }} - {{ jugador.apellidos }}, {{ jugador.nombre }}
                  </option>
                </select>
              </label>
              <p v-if="validationErrors.idfed_jugador" class="text-red-500 text-xs mt-1">{{ validationErrors.idfed_jugador }}</p>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" :value="form.nombre_jugador" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">Apellidos</label>
              <input type="text" :value="form.apellido_jugador" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Club</label>
              <input type="text" :value="form.nombre_club_jugador" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
          </div>
        </div>

        <!-- Sección Pareja (Opcional) -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Pareja (Opcional)</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Pareja (IDFED)
                <select
                  v-model="form.idfed_pareja"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                   :class="{'border-red-500': validationErrors.idfed_pareja}"
                  :disabled="isLoadingJugadores"
                >
                  <option :value="undefined">Sin pareja</option>
                  <option v-for="jugador in jugadores" :key="jugador.idfed" :value="jugador.idfed">
                    {{ jugador.idfed }} - {{ jugador.apellidos }}, {{ jugador.nombre }}
                  </option>
                </select>
              </label>
               <p v-if="validationErrors.idfed_pareja" class="text-red-500 text-xs mt-1">{{ validationErrors.idfed_pareja }}</p>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">
                Nombre Pareja
                <input type="text" :value="form.nombre_pareja" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
              </label>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">
                Apellidos Pareja
                <input type="text" :value="form.apellido_pareja" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Club Pareja
                <input type="text" :value="form.nombre_club_pareja" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
              </label>
            </div>
          </div>
        </div>

        <!-- Sección Detalles Partida -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Detalles Partida</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Partida <span class="text-red-500">*</span>
                <input v-model.number="form.partida" type="number" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.partida}"/>
              </label>
              <p v-if="validationErrors.partida" class="text-red-500 text-xs mt-1">{{ validationErrors.partida }}</p>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">
                Mesa <span class="text-red-500">*</span>
                <input v-model.number="form.mesa" type="number" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.mesa}"/>
              </label>
               <p v-if="validationErrors.mesa" class="text-red-500 text-xs mt-1">{{ validationErrors.mesa }}</p>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">
                GB (Grupo/Banda) <span class="text-red-500">*</span>
                <select v-model="form.gb" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1">
                  <option :value="true">A</option>
                  <option :value="false">B</option>
                </select>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                POS (Posición)
                <input v-model.number="form.pos" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"/>
              </label>
            </div>
          </div>
        </div>

        <!-- Sección Puntuación -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Puntuación</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                PG <span class="text-red-500">*</span>
                <input v-model.number="form.pg" type="number" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.pg}"/>
              </label>
              <p v-if="validationErrors.pg" class="text-red-500 text-xs mt-1">{{ validationErrors.pg }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                DIF
                <input v-model.number="form.dif" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"/>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                PV
                <input v-model.number="form.pv" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"/>
              </label>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">
                PT
                <input v-model.number="form.pt" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"/>
              </label>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">
                MG
                <input v-model.number="form.mg" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"/>
              </label>
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 