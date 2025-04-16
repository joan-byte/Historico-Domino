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
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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

// Datos del formulario (refleja SOLO los campos editables de ResultadoUpdate)
const form = ref<Partial<Omit<ResultadoUpdate, 'tipo_campeonato_id' | 'nombre_campeonato'>>>({});

// Campos adicionales que no están en ResultadoUpdate pero son necesarios para la UI
const campeonatoNch = ref<string | null>(null); // Para mostrar el NCH del campeonato
const nombreCampeonato = ref<string>('');   // Para mostrar el nombre del campeonato
const fechaCampeonato = ref<string>('');      // Para mostrar la fecha
const jugadorPrincipal = ref<JugadorResponse | null>(null);
const pareja = ref<JugadorResponse | null>(null);

// Cargar datos del resultado y datos relacionados al montar
onMounted(async () => {
  if (isNaN(nchParam.value) || !fechaParam.value || !idfedParam.value) {
    console.error("Parámetros de ruta inválidos para modificar resultado");
    router.push('/resultados');
    return;
  }
  
  // Cargar datos relacionados para mostrar info jugador/pareja (Tipos ya no es necesario aquí)
  await Promise.all([
    // fetchTiposCampeonato(), // Ya no se necesita para el select
    fetchJugadores(),
    fetchClubs()
  ]);
  
  // Cargar el resultado específico a modificar
  // fetchResultadoById debería devolver el objeto ResultadoResponse completo
  const resultado = await fetchResultadoById(nchParam.value, fechaParam.value, idfedParam.value);
  
  if (resultado) {
    // Llenar el formulario solo con los campos editables (detalles partida)
    form.value = {
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
    // Guardar datos adicionales para la UI (no editables)
    campeonatoNch.value = resultado.campeonato_nch; // Guardar NCH del campeonato
    nombreCampeonato.value = resultado.nombre_campeonato; // Guardar nombre del campeonato
    fechaCampeonato.value = resultado.fecha_campeonato;
    jugadorPrincipal.value = jugadores.value.find(j => j.idfed === resultado.idfed_jugador) || null;
    pareja.value = jugadores.value.find(j => j.idfed === resultado.idfed_pareja) || null;
    
  } else {
    console.error("Resultado no encontrado para modificar");
    router.push('/resultados');
  }
});

// Ya no se necesita el watch para tipo_campeonato_id
// watch(() => form.value.tipo_campeonato_id, (newId) => { ... });

// Estado de carga general (quitar isLoadingTipos)
const isLoading = computed(() => 
  isLoadingResultado.value /* || isLoadingTipos.value */ || isLoadingJugadores.value || isLoadingClubs.value
);

// Errores combinados (quitar errorTipos)
const formError = computed(() => 
  errorResultado.value /* || errorTipos.value */ || errorJugadores.value || errorClubs.value
);

// Estado para errores de validación
const validationErrors = ref<Record<string, string>>({});

// Validar formulario (quitar validación de tipo_campeonato_id)
const validarFormulario = (): boolean => {
  validationErrors.value = {};
  const data = form.value;
  
  // if (!data.tipo_campeonato_id) validationErrors.value.tipo_campeonato_id = 'Selecciona un tipo de campeonato.';
  if (data.partida === undefined || data.partida <= 0) validationErrors.value.partida = 'El número de partida debe ser positivo.';
  // ... resto de validaciones ...
  
  return Object.keys(validationErrors.value).length === 0;
};

// Función para guardar los cambios (asegurarse de que el payload es correcto)
const guardarCambios = async () => {
  // selectedResultado no se usa aquí, usamos los params directamente
  if (!validarFormulario() || isNaN(nchParam.value) || !fechaParam.value || !idfedParam.value) {
    console.error("Validación fallida o parámetros inválidos al guardar cambios.");
    return;
  }
  
  try {
    // Crear el objeto ResultadoUpdate solo con los campos modificables del form
    const updateData: Partial<ResultadoUpdate> = { ...form.value }; // Copia los campos actuales del form
    
    // Asegurarse de no enviar campos no deseados (aunque no deberían estar en form.value)
    // delete updateData.tipo_campeonato_id; 
    // delete updateData.nombre_campeonato;
    
    console.log("Enviando actualización con datos:", updateData);
    await modifyResultado(nchParam.value, fechaParam.value, idfedParam.value, updateData as ResultadoUpdate);
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
        
        <!-- Sección Campeonato (No editable) -->
        <div class="border-b pb-6">
          <h2 class="text-lg font-medium mb-4 text-gray-900">Campeonato (No editable)</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <span class="block text-sm font-medium text-gray-500">NCH</span>
              <span class="mt-1 block text-sm text-gray-900">{{ campeonatoNch || '-' }}</span>
            </div>
             <div>
              <span class="block text-sm font-medium text-gray-500">Nombre Campeonato</span>
              <span class="mt-1 block text-sm text-gray-900">{{ nombreCampeonato || '-' }}</span>
            </div>
             <div>
              <span class="block text-sm font-medium text-gray-500">Fecha Campeonato</span>
               <span class="mt-1 block text-sm text-gray-900">{{ fechaCampeonato ? format(parseISO(fechaCampeonato), 'dd/MM/yyyy', { locale: es }) : '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Sección Jugador Principal (No editable) -->
        <div class="border-t pt-6 mt-6">
          <h2 class="text-lg font-medium mb-4 text-gray-900">Jugador Principal (No editable)</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4"> 
            <div>
              <span class="block text-sm font-medium text-gray-500">Jugador (IDFED)</span>
              <span class="mt-1 block text-sm text-gray-900">{{ jugadorPrincipal?.idfed || '-' }}</span>
            </div>
             <div>
              <span class="block text-sm font-medium text-gray-500">Nombre</span>
              <span class="mt-1 block text-sm text-gray-900">{{ jugadorPrincipal?.nombre || '-' }}</span>
            </div>
             <div>
              <span class="block text-sm font-medium text-gray-500">Apellidos</span>
               <span class="mt-1 block text-sm text-gray-900">{{ jugadorPrincipal?.apellidos || '-' }}</span>
            </div>
            <div>
              <span class="block text-sm font-medium text-gray-500">Club</span>
               <span class="mt-1 block text-sm text-gray-900">{{ jugadorPrincipal?.nombre_club || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Sección Pareja (No editable) -->
        <div class="border-t pt-6 mt-6">
          <h2 class="text-lg font-medium mb-4 text-gray-900">Pareja (No editable)</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <span class="block text-sm font-medium text-gray-500">Pareja (IDFED)</span>
               <span class="mt-1 block text-sm text-gray-900">{{ pareja?.idfed || 'Sin pareja' }}</span>
            </div>
             <div>
              <span class="block text-sm font-medium text-gray-500">Nombre Pareja</span>
              <span class="mt-1 block text-sm text-gray-900">{{ pareja?.nombre || '-' }}</span>
            </div>
             <div>
              <span class="block text-sm font-medium text-gray-500">Apellidos Pareja</span>
              <span class="mt-1 block text-sm text-gray-900">{{ pareja?.apellidos || '-' }}</span>
            </div>
            <div>
              <span class="block text-sm font-medium text-gray-500">Club Pareja</span>
               <span class="mt-1 block text-sm text-gray-900">{{ pareja?.nombre_club || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Detalles Partida (Editable) -->
        <fieldset class="border p-4 rounded-md mt-6">
          <legend class="text-lg font-medium text-gray-900 px-2">Detalles Partida (Editable)</legend>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            <!-- Campo Partida -->
            <div>
              <label for="partida" class="block text-sm font-medium text-gray-700 mb-1">Partida <span class="text-red-500">*</span></label>
              <input type="number" id="partida" name="partida" v-model.number="form.partida" required min="1" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.partida, 'border-gray-300': !validationErrors.partida}">
              <p v-if="validationErrors.partida" class="text-red-500 text-xs mt-1">{{ validationErrors.partida }}</p>
            </div>
            <!-- Campo Mesa -->
            <div>
              <label for="mesa" class="block text-sm font-medium text-gray-700 mb-1">Mesa <span class="text-red-500">*</span></label>
              <input type="number" id="mesa" name="mesa" v-model.number="form.mesa" required min="1" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.mesa, 'border-gray-300': !validationErrors.mesa}">
              <p v-if="validationErrors.mesa" class="text-red-500 text-xs mt-1">{{ validationErrors.mesa }}</p>
            </div>
            <!-- Campo GB -->
            <div>
              <label for="gb" class="block text-sm font-medium text-gray-700 mb-1">GB (Grupo) <span class="text-red-500">*</span></label>
              <select id="gb" name="gb" v-model="form.gb" required 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option :value="true">A</option>
                <option :value="false">B</option>
              </select>
              <!-- No suele haber error de validación para un select con valor por defecto -->
            </div>
            <!-- Campo Posición -->
            <div>
              <label for="pos" class="block text-sm font-medium text-gray-700 mb-1">POS <span class="text-red-500">*</span></label>
              <input type="number" id="pos" name="pos" v-model.number="form.pos" required min="0" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.pos, 'border-gray-300': !validationErrors.pos}">
               <p v-if="validationErrors.pos" class="text-red-500 text-xs mt-1">{{ validationErrors.pos }}</p>
            </div>
             <!-- Campo PG -->
            <div>
              <label for="pg" class="block text-sm font-medium text-gray-700 mb-1">PG <span class="text-red-500">*</span></label>
              <input type="number" id="pg" name="pg" v-model.number="form.pg" required min="0" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.pg, 'border-gray-300': !validationErrors.pg}">
               <p v-if="validationErrors.pg" class="text-red-500 text-xs mt-1">{{ validationErrors.pg }}</p>
            </div>
            <!-- Campo DIF -->
            <div>
              <label for="dif" class="block text-sm font-medium text-gray-700 mb-1">DIF <span class="text-red-500">*</span></label>
              <input type="number" id="dif" name="dif" v-model.number="form.dif" required 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.dif, 'border-gray-300': !validationErrors.dif}">
               <p v-if="validationErrors.dif" class="text-red-500 text-xs mt-1">{{ validationErrors.dif }}</p>
            </div>
            <!-- Campo PV -->
            <div>
              <label for="pv" class="block text-sm font-medium text-gray-700 mb-1">PV <span class="text-red-500">*</span></label>
              <input type="number" id="pv" name="pv" v-model.number="form.pv" required min="0" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.pv, 'border-gray-300': !validationErrors.pv}">
              <p v-if="validationErrors.pv" class="text-red-500 text-xs mt-1">{{ validationErrors.pv }}</p>
            </div>
            <!-- Campo PT -->
            <div>
              <label for="pt" class="block text-sm font-medium text-gray-700 mb-1">PT <span class="text-red-500">*</span></label>
              <input type="number" id="pt" name="pt" v-model.number="form.pt" required min="0" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.pt, 'border-gray-300': !validationErrors.pt}">
               <p v-if="validationErrors.pt" class="text-red-500 text-xs mt-1">{{ validationErrors.pt }}</p>
            </div>
            <!-- Campo MG -->
            <div>
              <label for="mg" class="block text-sm font-medium text-gray-700 mb-1">MG <span class="text-red-500">*</span></label>
              <input type="number" id="mg" name="mg" v-model.number="form.mg" required min="0" 
                     class="w-full px-3 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     :class="{'border-red-500': validationErrors.mg, 'border-gray-300': !validationErrors.mg}">
              <p v-if="validationErrors.mg" class="text-red-500 text-xs mt-1">{{ validationErrors.mg }}</p>
            </div>
          </div>
        </fieldset>

        <!-- Botones de acción al final -->
         <div class="flex justify-end gap-3 mt-8">
            <button 
              type="button" @click="cancelar"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="isLoading || Object.keys(validationErrors).length > 0" 
              class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
         </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
.border-red-500 {
  border-color: #f56565; /* Tailwind red-500 */
}
input:read-only {
  background-color: #f7fafc; /* Tailwind gray-100 */
  cursor: not-allowed;
}
/* Estilo para párrafos que muestran datos no editables */
.read-only-data {
  margin-top: 0.25rem; /* Ajusta según sea necesario */
  padding: 0.5rem 0.75rem; /* Simular padding de input */
  border: 1px solid #e2e8f0; /* Tailwind gray-300 */
  background-color: #f7fafc; /* Tailwind gray-100 */
  border-radius: 0.375rem; /* Tailwind rounded-md */
  font-size: 0.875rem; /* Tailwind text-sm */
  color: #4a5568; /* Tailwind gray-700 */
}
</style> 