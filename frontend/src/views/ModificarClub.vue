<script setup lang="ts">
// Componente para modificar un club existente
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { clubService, type ClubResponse, type ClubCreate } from '../lib/clubService';

const router = useRouter();
const route = useRoute();
const nombre = ref('');
const cp = ref('');
const numeroClub = ref('');
const clubId = ref('');
const isLoading = ref(false);
const isLoadingData = ref(true);
const generalError = ref('');

// Referencias para manejar errores de validación
const errores = ref({
  nombre: '',
  cp: '',
  numeroClub: ''
});

// Cargar datos del club a modificar
onMounted(async () => {
  isLoadingData.value = true;
  generalError.value = '';
  
  try {
    // Intentar obtener el código del club de la ruta
    let codigoClub = route.params.codigoClub as string;
    
    // Si no hay código en la ruta, mostrar selector de clubes
    if (!codigoClub) {
      isLoadingData.value = false;
      return;
    }
    
    // Cargar los datos del club
    clubId.value = codigoClub;
    const club = await clubService.getByCode(codigoClub);
    
    // Establecer los valores de los campos
    nombre.value = club.nombre;
    cp.value = club.cp;
    numeroClub.value = club.numero_club;
  } catch (err: any) {
    console.error('Error al cargar el club:', err);
    generalError.value = err.message || 'No se pudo cargar la información del club';
  } finally {
    isLoadingData.value = false;
  }
});

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

// Actualizar el club
const actualizarClub = async () => {
  // Validar primero
  if (!validarFormulario()) {
    return;
  }

  if (!clubId.value) {
    generalError.value = 'No se pudo identificar el club a modificar';
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
    // Enviar datos actualizados al backend
    await clubService.update(clubId.value, clubData);
    // Redirigir a la lista de clubes
    router.push('/clubes');
  } catch (err: any) {
    console.error('Error al actualizar el club:', err);
    generalError.value = err.message || 'Ocurrió un error al actualizar el club';
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
      <h1 class="text-2xl font-bold">Modificar Club</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelar"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button 
          @click="actualizarClub"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          :disabled="isLoading || isLoadingData"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
    
    <!-- Mensaje de error general -->
    <div v-if="generalError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ generalError }}
    </div>
    
    <!-- Estado de carga inicial -->
    <div v-if="isLoadingData" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
      Cargando información del club...
    </div>
    
    <!-- Si no hay ID, mostrar selector de clubes -->
    <div v-else-if="!clubId" class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
      Para modificar un club, primero debe seleccionarlo desde la 
      <router-link to="/clubes" class="underline font-medium">lista de clubes</router-link>.
    </div>
    
    <!-- Formulario -->
    <div v-else class="bg-white border rounded-md shadow-sm p-6">
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