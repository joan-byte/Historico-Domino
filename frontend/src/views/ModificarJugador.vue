<script setup lang="ts">
// Componente para modificar un jugador existente
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useJugadores } from '../composables/useJugadores';
import { useClubs } from '../composables/useClubs';
import type { JugadorUpdate } from '../lib/jugadorService';
import StatusMessage from '../components/ui/StatusMessage.vue';

const router = useRouter();
const route = useRoute();
const idfed = ref(route.params.idfed as string);

// Usar los composables
const { 
  fetchJugadorByIdFed, 
  updateJugador, 
  selectedJugador, 
  isLoading, 
  error: jugadorError 
} = useJugadores();

const { 
  clubs, 
  fetchClubs, 
  isLoading: clubsLoading, 
  error: clubsError 
} = useClubs();

// Campos del formulario
const nombre = ref('');
const apellidos = ref('');
const cp = ref('');
const numero_jugador = ref('');
const codigo_club = ref('');
const dni = ref('');
const telefono = ref('');
const email = ref('');

// Estado para errores de validación
const validationErrors = ref<Record<string, string>>({});

// ID FED generado (computado)
const idfedGenerado = computed(() => {
  const clubSeleccionado = clubs.value.find(c => c.codigo_club === codigo_club.value);
  const cp = clubSeleccionado ? clubSeleccionado.cp : ''; // Obtener CP del club seleccionado
  return `${cp}${(numero_jugador.value || '').padStart(4, '0')}`;
});

// Cargar datos del jugador y los clubes
onMounted(async () => {
  fetchClubs();
  
  if (idfed.value) {
    try {
      await fetchJugadorByIdFed(idfed.value);
      
      // Cuando se carga el jugador, rellenar los campos del formulario
      if (selectedJugador.value) {
        nombre.value = selectedJugador.value.nombre;
        apellidos.value = selectedJugador.value.apellidos;
        cp.value = selectedJugador.value.cp;
        numero_jugador.value = selectedJugador.value.numero_jugador;
        codigo_club.value = selectedJugador.value.codigo_club;
        dni.value = selectedJugador.value.dni || '';
        telefono.value = selectedJugador.value.telefono || '';
        email.value = selectedJugador.value.email || '';
      }
    } catch (err) {
      console.error('Error al cargar el jugador:', err);
    }
  }
});

// Validar los campos del formulario
const validarFormulario = (): boolean => {
  validationErrors.value = {};
  
  if (!nombre.value.trim()) {
    validationErrors.value.nombre = 'El nombre es obligatorio';
  }
  
  if (!apellidos.value.trim()) {
    validationErrors.value.apellidos = 'Los apellidos son obligatorios';
  }
  
  if (!codigo_club.value) {
    validationErrors.value.codigo_club = 'Debe seleccionar un club';
  }
  
  if (dni.value && !/^[0-9]{8}[A-Z]$/.test(dni.value)) {
    validationErrors.value.dni = 'El DNI debe tener 8 números seguidos de una letra mayúscula';
  }
  
  return Object.keys(validationErrors.value).length === 0;
};

const actualizarJugador = async () => {
  if (!validarFormulario()) {
    return;
  }

  try {
    const jugadorData: JugadorUpdate = {
      nombre: nombre.value,
      apellidos: apellidos.value,
      codigo_club: codigo_club.value,
      dni: dni.value.trim() || undefined,
      telefono: telefono.value.trim() || undefined,
      email: email.value.trim() || undefined
    };
    
    await updateJugador(idfed.value, jugadorData);
    router.push('/jugadores');
  } catch (err) {
    console.error('Error al actualizar el jugador:', err);
  }
};

const cancelar = () => {
  router.push('/jugadores');
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Modificar Jugador</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          @click="actualizarJugador"
          :disabled="isLoading"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
    
    <!-- Mensajes de estado -->
    <StatusMessage 
      type="error" 
      :show="!!jugadorError" 
      :message="jugadorError || ''" 
      class="mb-4"
    />
    
    <StatusMessage 
      type="error" 
      :show="!!clubsError" 
      :message="clubsError || ''" 
      class="mb-4"
    />
    
    <div class="bg-white border rounded-md shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- IDFED (informativo) -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            IDFED
            <input 
              id="idfed"
              name="idfed"
              type="text" 
              :value="idfed"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 mt-1 cursor-not-allowed"
            />
          </label>
          <p class="text-xs text-gray-500">
            Identificador único del jugador (no editable)
          </p>
        </div>
        
        <!-- Campos CP + Número Jugador (No editables) -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Código Postal (CP)
            <input 
              id="cp"
              name="cp"
              type="text" 
              :value="cp"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 mt-1 cursor-not-allowed"
            />
          </label>
          <p class="text-xs text-gray-500">
            Primeros dos dígitos del código postal (no editable)
          </p>
        </div>
        
        <!-- Campo Número Jugador (solo lectura, estructura normal) -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Número de Jugador
            <input 
              id="numero_jugador"
              name="numero_jugador"
              type="text" 
              :value="numero_jugador"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 mt-1 cursor-not-allowed"
            />
          </label>
          <p class="text-xs text-gray-500">
            Cuatro dígitos numéricos (no editable)
          </p>
        </div>
        
        <!-- NUEVO Campo ID FED (calculado, solo lectura) -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            ID FED (calculado)
            <input 
              name="idfed-calculado"
              type="text" 
              :value="idfedGenerado"
              readonly
              class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1"
            />
          </label>
           <p class="text-xs text-gray-500">Se calcula con el CP + número de jugador.</p>
        </div>
        
        <!-- Datos personales -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Nombre 
            <span class="text-red-500">*</span>
            <input 
              id="nombre"
              name="nombre"
              v-model="nombre" 
              type="text" 
              autocomplete="given-name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{'border-red-500': validationErrors.nombre}"
              placeholder="Nombre del jugador"
            />
          </label>
          <p v-if="validationErrors.nombre" class="text-red-500 text-xs mt-1">
            {{ validationErrors.nombre }}
          </p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Apellidos 
            <span class="text-red-500">*</span>
            <input 
              id="apellidos"
              name="apellidos"
              v-model="apellidos" 
              type="text" 
              autocomplete="family-name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{'border-red-500': validationErrors.apellidos}"
              placeholder="Apellidos del jugador"
            />
          </label>
          <p v-if="validationErrors.apellidos" class="text-red-500 text-xs mt-1">
            {{ validationErrors.apellidos }}
          </p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            DNI
            <input 
              id="dni"
              name="dni"
              v-model="dni" 
              type="text" 
              maxlength="9"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{'border-red-500': validationErrors.dni}"
              placeholder="12345678A"
            />
          </label>
          <p v-if="validationErrors.dni" class="text-red-500 text-xs mt-1">
            {{ validationErrors.dni }}
          </p>
          <p class="text-xs text-gray-500">
            Formato: 8 números + 1 letra mayúscula (opcional)
          </p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Club
            <span class="text-red-500">*</span>
            <select 
              id="codigo_club"
              name="codigo_club"
              v-model="codigo_club"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{'border-red-500': validationErrors.codigo_club}"
              :disabled="clubsLoading"
            >
              <option value="">Seleccione un club</option>
              <option v-for="club in clubs" :key="club.codigo_club" :value="club.codigo_club">
                {{ club.nombre }}
              </option>
            </select>
          </label>
          <p v-if="validationErrors.codigo_club" class="text-red-500 text-xs mt-1">
            {{ validationErrors.codigo_club }}
          </p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Teléfono
            <input 
              id="telefono"
              name="telefono"
              v-model="telefono" 
              type="tel" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Teléfono de contacto (opcional)"
            />
          </label>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Email
            <input 
              id="email"
              name="email"
              v-model="email" 
              type="email" 
              autocomplete="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Correo electrónico (opcional)"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 