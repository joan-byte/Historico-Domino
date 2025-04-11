<script setup lang="ts">
// Componente para modificar un resultado existente
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useResultados } from '../composables/useResultados';
import { useTiposCampeonato } from '../composables/useTiposCampeonato';
import { useJugadores } from '../composables/useJugadores';
import { useClubs } from '../composables/useClubs';
import type { ResultadoUpdate, ResultadoResponse } from '../lib/resultadoService';
import type { TipoCampeonatoResponse } from '../lib/tipoCampeonatoService';
import type { JugadorResponse } from '../lib/jugadorService';
import type { ClubResponse } from '../lib/clubService';
import StatusMessage from '../components/ui/StatusMessage.vue';

const router = useRouter();
const route = useRoute();

// Obtener identificadores del resultado de la ruta
const nchParam = computed(() => parseInt(route.params.nch as string, 10));
const fechaParam = computed(() => route.params.fecha_campeonato as string);
const idfedParam = computed(() => route.params.idfed_jugador as string);

// Usar composables
const { 
  selectedResultado, 
  fetchResultadoById, 
  modifyResultado, 
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

// Datos del formulario (refleja ResultadoUpdate, inicializado vacío)
const form = ref<Partial<ResultadoUpdate>>({}); // Usamos Partial<ResultadoUpdate>

// Campos adicionales que no están en ResultadoUpdate pero son necesarios para la UI
const jugadorPrincipal = ref<JugadorResponse | null>(null);
const pareja = ref<JugadorResponse | null>(null);
const fechaCampeonato = ref<string>('');

// Cargar datos del resultado y datos relacionados al montar
onMounted(async () => {
  if (isNaN(nchParam.value) || !fechaParam.value || !idfedParam.value) {
    // Manejar error si los parámetros no son válidos
    console.error("Parámetros de ruta inválidos para modificar resultado");
    // Redirigir o mostrar error
    router.push('/resultados');
    return;
  }
  
  // Cargar datos relacionados primero (para los selects)
  await Promise.all([
    fetchTiposCampeonato(),
    fetchJugadores(),
    fetchClubs()
  ]);
  
  // Cargar el resultado específico a modificar
  const resultado = await fetchResultadoById(nchParam.value, fechaParam.value, idfedParam.value);
  
  if (resultado) {
    // Llenar el formulario con los datos actuales del resultado
    // Solo incluimos campos que están en ResultadoUpdate
    form.value = {
      tipo_campeonato_id: resultado.tipo_campeonato_id,
      nombre_campeonato: resultado.nombre_campeonato,
      partida: resultado.partida,
      mesa: resultado.mesa,
      gb: resultado.gb,
      pg: resultado.pg,
      dif: resultado.dif,
      pv: resultado.pv,
      pt: resultado.pt,
      mg: resultado.mg,
      pos: resultado.pos,
    };
    // Guardar datos adicionales para la UI
    jugadorPrincipal.value = jugadores.value.find(j => j.idfed === resultado.idfed_jugador) || null;
    pareja.value = jugadores.value.find(j => j.idfed === resultado.idfed_pareja) || null;
    fechaCampeonato.value = resultado.fecha_campeonato;
    
  } else {
    // Manejar el caso en que el resultado no se encuentre
    console.error("Resultado no encontrado para modificar");
    router.push('/resultados');
  }
});

// Autocompletar nombre del campeonato al seleccionar tipo
watch(() => form.value.tipo_campeonato_id, (newId) => {
  const tipo = tiposCampeonato.value.find((t: TipoCampeonatoResponse) => t.id === newId);
  form.value.nombre_campeonato = tipo ? tipo.nombre : '';
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

// Validar formulario (similar a NuevoResultado, adaptado a los campos de Update)
const validarFormulario = (): boolean => {
  validationErrors.value = {};
  const data = form.value;
  
  if (!data.tipo_campeonato_id) validationErrors.value.tipo_campeonato_id = 'Selecciona un tipo de campeonato.';
  if (data.partida === undefined || data.partida <= 0) validationErrors.value.partida = 'El número de partida debe ser positivo.';
  if (data.mesa === undefined || data.mesa <= 0) validationErrors.value.mesa = 'El número de mesa debe ser positivo.';
  if (data.pg === undefined || data.pg < 0) validationErrors.value.pg = 'PG debe ser 0 o positivo.';
  // ... otras validaciones ...
  
  return Object.keys(validationErrors.value).length === 0;
};

// Función para guardar los cambios
const guardarCambios = async () => {
  if (!validarFormulario() || !selectedResultado.value) {
    return;
  }
  
  try {
    // Crear el objeto ResultadoUpdate solo con los campos modificables
    const updateData: ResultadoUpdate = {
      tipo_campeonato_id: form.value.tipo_campeonato_id,
      nombre_campeonato: form.value.nombre_campeonato,
      partida: form.value.partida,
      mesa: form.value.mesa,
      gb: form.value.gb,
      pg: form.value.pg,
      dif: form.value.dif,
      pv: form.value.pv,
      pt: form.value.pt,
      mg: form.value.mg,
      pos: form.value.pos,
    };
    
    await modifyResultado(nchParam.value, fechaParam.value, idfedParam.value, updateData);
    router.push('/resultados'); // Volver a la lista
  } catch (error) {
    console.error("Error al modificar resultado:", error);
    // El error se muestra a través de formError
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
      <h1 class="text-2xl font-bold">Modificar Resultado</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          @click="guardarCambios"
          :disabled="isLoading"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- Mensaje de error general -->
    <StatusMessage type="error" :show="!!formError" :message="formError || ''" class="mb-4" />

    <div v-if="isLoading && !selectedResultado" class="text-center p-6">
      Cargando datos del resultado...
    </div>

    <div v-else-if="!selectedResultado && !isLoading" class="text-center p-6 text-red-600">
      No se pudieron cargar los datos del resultado.
    </div>

    <div v-else class="bg-white border rounded-md shadow-sm p-6">
      <form @submit.prevent="guardarCambios" class="space-y-6">
        <!-- Sección Campeonato y Fecha (Fecha no editable) -->
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
              Fecha Campeonato
              <input
                :value="fechaCampeonato" 
                type="date"
                readonly
                class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1"
              />
            </label>
          </div>
        </div>

        <!-- Sección Jugador Principal (No editable) -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Jugador Principal</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Jugador (IDFED)</label>
              <input :value="jugadorPrincipal?.idfed || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input :value="jugadorPrincipal?.nombre || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">Apellidos</label>
              <input :value="jugadorPrincipal?.apellidos || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Club</label>
              <input :value="jugadorPrincipal?.nombre_club || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
          </div>
        </div>

        <!-- Sección Pareja (No editable) -->
        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Pareja</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Pareja (IDFED)</label>
              <input :value="pareja?.idfed || 'Sin pareja'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">Nombre Pareja</label>
               <input :value="pareja?.nombre || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700">Apellidos Pareja</label>
              <input :value="pareja?.apellidos || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Club Pareja</label>
               <input :value="pareja?.nombre_club || '-'" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
          </div>
        </div>

        <!-- Sección Detalles Partida (Editable) -->
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

        <!-- Sección Puntuación (Editable) -->
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