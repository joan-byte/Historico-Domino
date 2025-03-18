<script setup lang="ts">
// Componente para crear un nuevo jugador
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useJugadores } from '../composables/useJugadores';
import { useClubs } from '../composables/useClubs';
import type { JugadorCreate } from '../lib/jugadorService';
import StatusMessage from '../components/ui/StatusMessage.vue';

const router = useRouter();
const { createJugador, error: jugadorError, isLoading } = useJugadores();
const { clubs, fetchClubs, isLoading: clubsLoading, error: clubsError } = useClubs();

// Campos del formulario
const nombre = ref('');
const apellidos = ref('');
const cp = ref('');
const numero_jugador = ref('');
const codigo_club = ref('');
const dni = ref('');
const telefono = ref('');
const email = ref('');

// Cargar la lista de clubes al montar el componente
onMounted(() => {
  fetchClubs();
});

// Estado para errores de validación
const validationErrors = ref<Record<string, string>>({});

// Validar los campos del formulario
const validarFormulario = (): boolean => {
  validationErrors.value = {};
  
  if (!nombre.value.trim()) {
    validationErrors.value.nombre = 'El nombre es obligatorio';
  }
  
  if (!apellidos.value.trim()) {
    validationErrors.value.apellidos = 'Los apellidos son obligatorios';
  }
  
  if (!cp.value.trim()) {
    validationErrors.value.cp = 'El CP es obligatorio';
  } else if (!/^\d{2}$/.test(cp.value)) {
    validationErrors.value.cp = 'El CP debe ser exactamente 2 dígitos numéricos';
  }
  
  if (!numero_jugador.value.trim()) {
    validationErrors.value.numero_jugador = 'El número de jugador es obligatorio';
  } else if (!/^\d{5}$/.test(numero_jugador.value)) {
    validationErrors.value.numero_jugador = 'El número debe tener exactamente 5 dígitos numéricos';
  }
  
  if (!codigo_club.value) {
    validationErrors.value.codigo_club = 'Debe seleccionar un club';
  }
  
  if (dni.value && !/^[0-9]{8}[A-Z]$/.test(dni.value)) {
    validationErrors.value.dni = 'El DNI debe tener 8 números seguidos de una letra mayúscula';
  }
  
  return Object.keys(validationErrors.value).length === 0;
};

const guardarJugador = async () => {
  if (!validarFormulario()) {
    return;
  }
  
  const jugadorData: JugadorCreate = {
    nombre: nombre.value,
    apellidos: apellidos.value,
    cp: cp.value,
    numero_jugador: numero_jugador.value,
    codigo_club: codigo_club.value,
    dni: dni.value || undefined,
    telefono: telefono.value || undefined,
    email: email.value || undefined
  };
  
  try {
    await createJugador(jugadorData);
    router.push('/jugadores');
  } catch (error) {
    console.error('Error al crear el jugador:', error);
  }
};

const cancelar = () => {
  router.push('/jugadores');
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Crear Nuevo Jugador</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          @click="guardarJugador"
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
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Nombre <span class="text-red-500">*</span>
            <input 
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
            Apellidos <span class="text-red-500">*</span>
            <input 
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
            Club <span class="text-red-500">*</span>
            <select 
              name="codigo_club"
              v-model="codigo_club" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{'border-red-500': validationErrors.codigo_club}"
              :disabled="clubsLoading"
            >
              <option value="">Seleccionar club</option>
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
            Número de jugador (máx 5 dígitos) <span class="text-red-500">*</span>
            <input 
              name="numero-jugador" 
              v-model="numero_jugador" 
              type="text" 
              maxlength="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{'border-red-500': validationErrors.numero_jugador}"
              placeholder="Ej: 12345"
            />
          </label>
          <p v-if="validationErrors.numero_jugador" class="text-red-500 text-xs mt-1">
            {{ validationErrors.numero_jugador }}
          </p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            DNI
            <input 
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
            Teléfono
            <input 
              name="telefono"
              v-model="telefono" 
              type="tel" 
              autocomplete="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Teléfono de contacto"
            />
          </label>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Email
            <input 
              name="email"
              v-model="email" 
              type="email" 
              autocomplete="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Email de contacto"
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