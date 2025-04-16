<script setup lang="ts">
// Componente para registrar nuevos resultados de campeonatos
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useResultados } from '../composables/useResultados';
import { useTiposCampeonato } from '../composables/useTiposCampeonato';
import { useJugadores } from '../composables/useJugadores';
import { useClubs } from '../composables/useClubs';
import { useCampeonatos } from '../composables/useCampeonatos';
import type { ResultadoCreate, ResultadoResponse } from '../lib/resultadoService';
import type { TipoCampeonatoResponse } from '../lib/tipoCampeonatoService';
import type { JugadorResponse } from '../lib/jugadorService';
import type { ClubResponse } from '../lib/clubService';
import type { CampeonatoResponse } from '../lib/campeonatoService';
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

// Usar composable de Campeonatos
const { 
  campeonatos, 
  fetchCampeonatos, 
  isLoading: isLoadingCampeonatos, 
  error: errorCampeonatos 
} = useCampeonatos();

// Datos del formulario (refleja ResultadoCreate)
const form = ref<Partial<ResultadoCreate> & { campeonato_nch?: string; tipo_campeonato_nombre?: string }>({
  tipo_campeonato_id: undefined,
  tipo_campeonato_nombre: '',
  campeonato_nch: undefined,
  nombre_campeonato: '',
  fecha_campeonato: new Date().toISOString().split('T')[0],
  idfed_jugador: undefined,
  nombre_jugador: '',
  apellido_jugador: '',
  codigo_club_jugador: undefined,
  nombre_club_jugador: '',
  idfed_pareja: undefined,
  nombre_pareja: '',
  apellido_pareja: '',
  codigo_club_pareja: undefined,
  nombre_club_pareja: '',
  partida: 1,
  mesa: 1,
  gb: true,
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
  fetchJugadores();
  fetchClubs();
  fetchCampeonatos();
});

// Autocompletar datos del campeonato al seleccionar NCH
watch(() => form.value.campeonato_nch, (newNch) => {
  const camp = campeonatos.value.find((c: CampeonatoResponse) => c.nch === newNch);
  if (camp) {
    form.value.nombre_campeonato = camp.nombre;
    form.value.fecha_campeonato = camp.fecha_inicio;
    form.value.tipo_campeonato_id = camp.tipo_campeonato_id;
    const tipo = tiposCampeonato.value.find(t => t.id === camp.tipo_campeonato_id);
    form.value.tipo_campeonato_nombre = tipo ? `${tipo.codigo} - ${tipo.nombre}` : 'Tipo no encontrado';
  } else {
    form.value.nombre_campeonato = '';
    form.value.fecha_campeonato = new Date().toISOString().split('T')[0];
    form.value.tipo_campeonato_id = undefined;
    form.value.tipo_campeonato_nombre = '';
  }
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
  isLoadingResultado.value || isLoadingTipos.value || isLoadingJugadores.value || isLoadingClubs.value || isLoadingCampeonatos.value
);

// Errores combinados
const formError = computed(() => 
  errorResultado.value || errorTipos.value || errorJugadores.value || errorClubs.value || errorCampeonatos.value
);

// Estado para errores de validación
const validationErrors = ref<Record<string, string>>({});

// Validar formulario
const validarFormulario = (): boolean => {
  validationErrors.value = {};
  const data = form.value;
  
  if (!data.campeonato_nch) validationErrors.value.campeonato_nch = 'Selecciona un campeonato.';
  if (!data.tipo_campeonato_id) validationErrors.value.tipo_campeonato_id = 'El campeonato seleccionado no tiene un tipo válido.';
  if (!data.fecha_campeonato) validationErrors.value.fecha_campeonato = 'La fecha es obligatoria.';
  if (!data.idfed_jugador) validationErrors.value.idfed_jugador = 'Selecciona un jugador principal.';
  if (data.idfed_jugador && data.idfed_pareja === data.idfed_jugador) validationErrors.value.idfed_pareja = 'La pareja no puede ser el mismo jugador.';
  if (data.partida === undefined || data.partida <= 0) validationErrors.value.partida = 'El número de partida debe ser positivo.';
  if (data.mesa === undefined || data.mesa <= 0) validationErrors.value.mesa = 'El número de mesa debe ser positivo.';
  if (data.pg === undefined || data.pg < 0) validationErrors.value.pg = 'PG debe ser 0 o positivo.';
  if (data.dif === undefined || data.dif < 0) validationErrors.value.dif = 'DIF debe ser 0 o positivo.';
  if (data.pv === undefined || data.pv < 0) validationErrors.value.pv = 'PV debe ser 0 o positivo.';
  if (data.pt === undefined || data.pt < 0) validationErrors.value.pt = 'PT debe ser 0 o positivo.';
  if (data.mg === undefined || data.mg < 0) validationErrors.value.mg = 'MG debe ser 0 o positivo.';
  if (data.pos === undefined || data.pos < 0) validationErrors.value.pos = 'POS debe ser 0 o positivo.';
  
  return Object.keys(validationErrors.value).length === 0;
};

// Función para guardar
const guardarResultado = async () => {
  if (!validarFormulario()) {
    // Mostrar un mensaje más general o hacer scroll al primer error si es necesario
    console.warn("Errores de validación:", validationErrors.value);
    // Podrías añadir aquí un mensaje de error global si lo prefieres
    // formError.value = "Por favor, corrige los errores del formulario."; // Esto requiere modificar formError computed
    return;
  }
  
  try {
    // *** Asegurar que los IDFED y códigos de club son strings ***
    // Se eliminó el padStart para IDFED ya que la DB los guarda sin ceros iniciales
    const idfedJugadorStr = form.value.idfed_jugador ? String(form.value.idfed_jugador) : undefined;
    const idfedParejaStr = form.value.idfed_pareja ? String(form.value.idfed_pareja) : undefined;
    // Mantenemos padStart para código de club si es necesario que siempre tenga 6 dígitos
    const codigoClubJugadorStr = form.value.codigo_club_jugador ? String(form.value.codigo_club_jugador).padStart(6, '0') : undefined;
    const codigoClubParejaStr = form.value.codigo_club_pareja ? String(form.value.codigo_club_pareja).padStart(6, '0') : undefined;
    
    // Validar que los IDFED/códigos son correctos antes de enviar (si existen)
    // Ajustar validación de longitud/formato si es necesario según cómo se guarden realmente
    if (!idfedJugadorStr /* || idfedJugadorStr.length !== 7 */ || !/^\d+$/.test(idfedJugadorStr)) { // Se comenta la validación de longitud exacta por ahora
         console.error("Error: IDFED Jugador inválido antes de enviar:", idfedJugadorStr);
         validationErrors.value.idfed_jugador = "El IDFED del jugador principal no es válido.";
         return; // Detener si hay un error crítico aquí
    }
     if (idfedParejaStr && (/*! idfedParejaStr.length !== 7 || */ !/^\d+$/.test(idfedParejaStr))) { // Se comenta la validación de longitud exacta por ahora
         console.error("Error: IDFED Pareja inválido antes de enviar:", idfedParejaStr);
         validationErrors.value.idfed_pareja = "El IDFED de la pareja no es válido.";
         return; // Detener si hay un error crítico aquí
    }
    if (!codigoClubJugadorStr || codigoClubJugadorStr.length !== 6 || !/^\d+$/.test(codigoClubJugadorStr)) {
        console.error("Error: Código Club Jugador inválido antes de enviar:", codigoClubJugadorStr);
        validationErrors.value.idfed_jugador = "El Código Club del jugador principal no es válido."; // Asociar error al campo más relevante
        return;
    }
     if (codigoClubParejaStr && (codigoClubParejaStr.length !== 6 || !/^\d+$/.test(codigoClubParejaStr))) {
        console.error("Error: Código Club Pareja inválido antes de enviar:", codigoClubParejaStr);
         validationErrors.value.idfed_pareja = "El Código Club de la pareja no es válido."; // Asociar error al campo más relevante
        return;
    }


    // Construir el payload asegurando los tipos y campos requeridos por ResultadoCreate
    const resultadoData: ResultadoCreate = {
      // Info Campeonato
      tipo_campeonato_id: form.value.tipo_campeonato_id!, 
      // Incluir el NCH del campeonato seleccionado
      campeonato_nch: form.value.campeonato_nch!,
      nombre_campeonato: form.value.nombre_campeonato!,
      fecha_campeonato: form.value.fecha_campeonato!,

      // Info Jugador Principal
      idfed_jugador: idfedJugadorStr, // Usar el string validado
      nombre_jugador: form.value.nombre_jugador!,
      apellido_jugador: form.value.apellido_jugador!,
      codigo_club_jugador: codigoClubJugadorStr!, // Usar el string validado
      nombre_club_jugador: form.value.nombre_club_jugador!,

      // Info Pareja (opcional, validada y convertida a string si existe)
      idfed_pareja: idfedParejaStr, // Usar el string validado (o undefined)
      nombre_pareja: idfedParejaStr ? form.value.nombre_pareja || undefined : undefined,
      apellido_pareja: idfedParejaStr ? form.value.apellido_pareja || undefined : undefined,
      codigo_club_pareja: codigoClubParejaStr, // Usar el string validado (o undefined)
      nombre_club_pareja: idfedParejaStr ? form.value.nombre_club_pareja || undefined : undefined,

      // Detalles Partida (validados)
      partida: form.value.partida!,
      mesa: form.value.mesa!,
      gb: form.value.gb!, // Es boolean
      pg: form.value.pg!,
      dif: form.value.dif!,
      pv: form.value.pv!,
      pt: form.value.pt!,
      mg: form.value.mg!,
      pos: form.value.pos!,
    };
    
    console.log("Enviando resultado (final):", JSON.stringify(resultadoData, null, 2)); // Log detallado para depuración
    
    await addResultado(resultadoData);
    // Si todo va bien, redirigir
    router.push('/resultados'); 
    
  } catch (error: any) {
    console.error("Error detallado al guardar resultado:", error);
    // Mostrar el error del backend si existe en formError
     const apiError = error?.response?.data?.detail || error?.message || 'Ocurrió un error inesperado al guardar.';
     // Intentar parsear si es un string JSON (común en FastAPI validation errors)
     try {
       const parsedError = JSON.parse(apiError);
       // Formatear errores de validación de Pydantic si existen
       if (Array.isArray(parsedError.detail)) {
         const errorMessages = parsedError.detail.map((e: any) => `${e.loc.join('.')} - ${e.msg}`).join('; ');
         // Asignar al estado de error para mostrarlo
         // Necesitaríamos modificar `formError` para que no sea solo `computed` o usar otro ref
         console.error("Errores de validación del backend:", errorMessages);
         // Aquí podrías actualizar un ref específico para errores de API
       } else {
          console.error("Error API:", apiError);
          // Actualizar el estado de error general
       }
     } catch (parseError) {
       console.error("Error API (no JSON):", apiError);
        // Actualizar el estado de error general
     }
    // Aquí puedes asignar el error a una variable ref para mostrarlo en StatusMessage
    // Ejemplo: apiSubmitError.value = apiError;
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

    <StatusMessage type="error" :show="!!formError" :message="formError || ''" class="mb-4" />

    <div class="bg-white border rounded-md shadow-sm p-6">
      <form @submit.prevent="guardarResultado" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label for="campeonato_nch" class="block text-sm font-medium text-gray-700">
              Campeonato <span class="text-red-500">*</span>
              <select
                id="campeonato_nch" name="campeonato_nch"
                v-model="form.campeonato_nch"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                :class="{'border-red-500': validationErrors.campeonato_nch}"
                :disabled="isLoadingCampeonatos"
              >
                <option :value="undefined" disabled>Seleccionar campeonato</option>
                <option v-for="camp in campeonatos" :key="camp.nch" :value="camp.nch">
                  {{ camp.nch }}
                </option>
              </select>
            </label>
            <p v-if="validationErrors.campeonato_nch" class="text-red-500 text-xs mt-1">{{ validationErrors.campeonato_nch }}</p>
            <label for="tipo_campeonato_nombre" class="block text-sm font-medium text-gray-700 mt-2">Tipo Campeonato</label>
            <input id="tipo_campeonato_nombre" name="tipo_campeonato_nombre" type="text" :value="form.tipo_campeonato_nombre" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            <input type="hidden" :value="form.tipo_campeonato_id" />
            <p v-if="validationErrors.tipo_campeonato_id" class="text-red-500 text-xs mt-1">{{ validationErrors.tipo_campeonato_id }}</p>
          </div>
          <div>
            <label for="nombre_campeonato" class="block text-sm font-medium text-gray-700">Nombre Campeonato</label>
            <input id="nombre_campeonato" name="nombre_campeonato" type="text" :value="form.nombre_campeonato" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
          </div>
          <div>
            <label for="fecha_campeonato" class="block text-sm font-medium text-gray-700">
              Fecha Campeonato 
              <input
                id="fecha_campeonato" name="fecha_campeonato"
                :value="form.fecha_campeonato" 
                type="date"
                readonly 
                class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1"
                :class="{'border-red-500': validationErrors.fecha_campeonato}"
              />
            </label>
            <p v-if="validationErrors.fecha_campeonato" class="text-red-500 text-xs mt-1">{{ validationErrors.fecha_campeonato }}</p>
          </div>
        </div>

        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Jugador Principal</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="idfed_jugador" class="block text-sm font-medium text-gray-700">
                Jugador (IDFED) <span class="text-red-500">*</span>
                <select
                  id="idfed_jugador" name="idfed_jugador"
                  v-model="form.idfed_jugador"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                  :class="{'border-red-500': validationErrors.idfed_jugador}"
                  :disabled="isLoadingJugadores"
                >
                  <option :value="undefined" disabled>Seleccionar jugador</option>
                  <option v-for="jugador in jugadores" :key="jugador.idfed" :value="jugador.idfed">
                    {{ jugador.idfed }}
                  </option>
                </select>
              </label>
              <p v-if="validationErrors.idfed_jugador" class="text-red-500 text-xs mt-1">{{ validationErrors.idfed_jugador }}</p>
            </div>
             <div>
              <label for="nombre_jugador" class="block text-sm font-medium text-gray-700">Nombre</label>
              <input id="nombre_jugador" name="nombre_jugador" type="text" :value="form.nombre_jugador" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
             <div>
              <label for="apellido_jugador" class="block text-sm font-medium text-gray-700">Apellidos</label>
              <input id="apellido_jugador" name="apellido_jugador" type="text" :value="form.apellido_jugador" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
            <div>
              <label for="club_jugador" class="block text-sm font-medium text-gray-700">Club</label>
              <input id="club_jugador" name="club_jugador" type="text" :value="form.nombre_club_jugador" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
            </div>
          </div>
        </div>

        <div class="border-t pt-6">
          <h2 class="text-lg font-medium mb-4">Pareja (Opcional)</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="idfed_pareja" class="block text-sm font-medium text-gray-700">
                Pareja (IDFED)
                <select
                  id="idfed_pareja" name="idfed_pareja"
                  v-model="form.idfed_pareja"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                   :class="{'border-red-500': validationErrors.idfed_pareja}"
                  :disabled="isLoadingJugadores"
                >
                  <option :value="undefined">Sin pareja</option>
                  <option v-for="jugador in jugadores" :key="jugador.idfed" :value="jugador.idfed">
                    {{ jugador.idfed }}
                  </option>
                </select>
              </label>
               <p v-if="validationErrors.idfed_pareja" class="text-red-500 text-xs mt-1">{{ validationErrors.idfed_pareja }}</p>
            </div>
             <div>
              <label for="nombre_pareja" class="block text-sm font-medium text-gray-700">
                Nombre Pareja
                <input id="nombre_pareja" name="nombre_pareja" type="text" :value="form.nombre_pareja" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
              </label>
            </div>
             <div>
              <label for="apellido_pareja" class="block text-sm font-medium text-gray-700">
                Apellidos Pareja
                <input id="apellido_pareja" name="apellido_pareja" type="text" :value="form.apellido_pareja" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
              </label>
            </div>
            <div>
              <label for="club_pareja" class="block text-sm font-medium text-gray-700">
                Club Pareja
                <input id="club_pareja" name="club_pareja" type="text" :value="form.nombre_club_pareja" readonly class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1" />
              </label>
            </div>
          </div>
        </div>

        <fieldset class="border p-4 rounded-md">
          <legend class="text-lg font-medium text-gray-900 px-2">Detalles Partida</legend>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            <div>
              <label for="partida" class="block text-sm font-medium text-gray-700">Partida <span class="text-red-500">*</span></label>
              <input type="number" id="partida" name="partida" v-model.number="form.partida" required min="1" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.partida}">
              <p v-if="validationErrors.partida" class="text-red-500 text-xs mt-1">{{ validationErrors.partida }}</p>
            </div>
            <div>
              <label for="mesa" class="block text-sm font-medium text-gray-700">Mesa <span class="text-red-500">*</span></label>
              <input type="number" id="mesa" name="mesa" v-model.number="form.mesa" required min="1" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.mesa}">
              <p v-if="validationErrors.mesa" class="text-red-500 text-xs mt-1">{{ validationErrors.mesa }}</p>
            </div>
            <div>
              <label for="gb" class="block text-sm font-medium text-gray-700">GB (Grupo/Banda) <span class="text-red-500">*</span></label>
              <select id="gb" name="gb" v-model="form.gb" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1">
                <option :value="true">A</option>
                <option :value="false">B</option>
              </select>
            </div>
            <div>
              <label for="pos" class="block text-sm font-medium text-gray-700">POS (Posición) <span class="text-red-500">*</span></label>
              <input type="number" id="pos" name="pos" v-model.number="form.pos" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.pos}">
               <p v-if="validationErrors.pos" class="text-red-500 text-xs mt-1">{{ validationErrors.pos }}</p>
            </div>
            <div>
              <label for="pg" class="block text-sm font-medium text-gray-700">PG (Ganada) <span class="text-red-500">*</span></label>
              <input type="number" id="pg" name="pg" v-model.number="form.pg" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.pg}">
               <p v-if="validationErrors.pg" class="text-red-500 text-xs mt-1">{{ validationErrors.pg }}</p>
            </div>
            <div>
              <label for="dif" class="block text-sm font-medium text-gray-700">DIF (Diferencia) <span class="text-red-500">*</span></label>
              <input type="number" id="dif" name="dif" v-model.number="form.dif" required class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.dif}">
               <p v-if="validationErrors.dif" class="text-red-500 text-xs mt-1">{{ validationErrors.dif }}</p>
            </div>
            <div>
              <label for="pv" class="block text-sm font-medium text-gray-700">PV (P. Válidos) <span class="text-red-500">*</span></label>
              <input type="number" id="pv" name="pv" v-model.number="form.pv" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.pv}">
              <p v-if="validationErrors.pv" class="text-red-500 text-xs mt-1">{{ validationErrors.pv }}</p>
            </div>
            <div>
              <label for="pt" class="block text-sm font-medium text-gray-700">PT (P. Totales) <span class="text-red-500">*</span></label>
              <input type="number" id="pt" name="pt" v-model.number="form.pt" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.pt}">
               <p v-if="validationErrors.pt" class="text-red-500 text-xs mt-1">{{ validationErrors.pt }}</p>
            </div>
            <div>
              <label for="mg" class="block text-sm font-medium text-gray-700">MG (Manos Ganadas) <span class="text-red-500">*</span></label>
              <input type="number" id="mg" name="mg" v-model.number="form.mg" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" :class="{'border-red-500': validationErrors.mg}">
              <p v-if="validationErrors.mg" class="text-red-500 text-xs mt-1">{{ validationErrors.mg }}</p>
            </div>
          </div>
        </fieldset>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 