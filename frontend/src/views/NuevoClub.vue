<script setup lang="ts">
// Componente para crear un nuevo club
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { clubService, type ClubCreate } from '../lib/clubService';

const router = useRouter();
const nombre = ref('');
const cp = ref('');
const numeroClub = ref('');

// Referencias para manejar errores de validación
const errores = ref({
  nombre: '',
  cp: '',
  numeroClub: ''
});

// Estado de carga
const isLoading = ref(false);
const generalError = ref('');

// Validar campos del formulario
const validarFormulario = () => {
  let esValido = true;
  
  // Restablecer errores
  errores.value = {
    nombre: '',
    cp: '',
    numeroClub: ''
  };
  
  // Validar nombre (requerido)
  if (!nombre.value.trim()) {
    errores.value.nombre = 'El nombre es obligatorio';
    esValido = false;
  }
  
  // Validar CP (2 dígitos numéricos)
  if (!cp.value.trim()) {
    errores.value.cp = 'El CP es obligatorio';
    esValido = false;
  } else if (!/^\d{2}$/.test(cp.value)) {
    errores.value.cp = 'El CP debe ser exactamente 2 dígitos numéricos';
    esValido = false;
  }
  
  // Validar número de club (máximo 4 dígitos numéricos)
  if (!numeroClub.value.trim()) {
    errores.value.numeroClub = 'El número de club es obligatorio';
    esValido = false;
  } else if (!/^\d{1,4}$/.test(numeroClub.value)) {
    errores.value.numeroClub = 'El número debe ser numérico y tener máximo 4 dígitos';
    esValido = false;
  }
  
  return esValido;
};

// Guardar el club
const guardarClub = async () => {
  // Validar primero
  if (!validarFormulario()) {
    return;
  }

  isLoading.value = true;
  generalError.value = '';
  
  // Preparar datos según el modelo del backend
  const clubData = {
    cp: cp.value,
    numero_club: numeroClub.value,
    nombre: nombre.value
  };
  
  try {
    // Enviar datos al backend
    await clubService.create(clubData);
    // Redirigir a la lista de clubes
    router.push('/clubes');
  } catch (err: any) {
    console.error('Error al crear el club:', err);
    generalError.value = err.message || 'Ocurrió un error al guardar el club';
  } finally {
    isLoading.value = false;
  }
};

// Cancelar y volver a la lista
const cancelar = () => {
  router.push('/clubes');
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Crear Nuevo Club</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button 
          @click="guardarClub"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
    
    <!-- Mensaje de error general -->
    <div v-if="generalError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ generalError }}
    </div>
    
    <div class="bg-white border rounded-md shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="nombre-club" class="block text-sm font-medium text-gray-700">Nombre del Club <span class="text-red-500">*</span></label>
          <input 
            id="nombre-club" 
            v-model="nombre" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            :class="{ 'border-red-500': errores.nombre }"
            placeholder="Nombre del club"
          />
          <p v-if="errores.nombre" class="text-red-500 text-xs mt-1">{{ errores.nombre }}</p>
        </div>
        
        <div class="space-y-2">
          <label for="cp-club" class="block text-sm font-medium text-gray-700">Código Postal (2 dígitos) <span class="text-red-500">*</span></label>
          <input 
            id="cp-club" 
            v-model="cp" 
            type="text" 
            maxlength="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            :class="{ 'border-red-500': errores.cp }"
            placeholder="Ej: 28"
          />
          <p v-if="errores.cp" class="text-red-500 text-xs mt-1">{{ errores.cp }}</p>
        </div>
        
        <div class="space-y-2">
          <label for="numero-club" class="block text-sm font-medium text-gray-700">Número de Club (máx 4 dígitos) <span class="text-red-500">*</span></label>
          <input 
            id="numero-club" 
            v-model="numeroClub" 
            type="text" 
            maxlength="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            :class="{ 'border-red-500': errores.numeroClub }"
            placeholder="Ej: 1234"
          />
          <p v-if="errores.numeroClub" class="text-red-500 text-xs mt-1">{{ errores.numeroClub }}</p>
        </div>
        
        <div class="space-y-2">
          <label for="codigo-club-preview" class="block text-sm font-medium text-gray-700">Código Club (generado automáticamente)</label>
          <input 
            id="codigo-club-preview"
            type="text"
            :value="(cp || '00') + (numeroClub || '0000')"
            readonly
            aria-readonly="true"
            class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed"
          />
          <p class="text-xs text-gray-500">El código se generará automáticamente a partir del CP y el número de club</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 