<script setup lang="ts">
// Componente para crear un nuevo club
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { clubService, type ClubCreate } from '../lib/clubService';

const router = useRouter();
const nombre = ref('');
const cp = ref('');
const numeroClub = ref('');
const personaContacto = ref('');
const telefono = ref('');
const direccion = ref('');
const email = ref('');

// Referencias para manejar errores de validación
const errores = ref({
  nombre: '',
  cp: '',
  numeroClub: '',
  email: '',
  telefono: ''
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
    numeroClub: '',
    email: '',
    telefono: ''
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

  // Validar email (opcional pero con formato válido si se proporciona)
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errores.value.email = 'El formato del email no es válido';
    esValido = false;
  }

  // Validar teléfono (opcional pero con formato válido si se proporciona)
  if (telefono.value) {
    const telefonoLimpio = telefono.value.replace(/\D/g, '');
    if (telefonoLimpio.length < 9 || telefonoLimpio.length > 15) {
      errores.value.telefono = 'El teléfono debe tener entre 9 y 15 dígitos';
      esValido = false;
    }
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
    nombre: nombre.value,
    persona_contacto: personaContacto.value || undefined,
    telefono: telefono.value || undefined,
    direccion: direccion.value || undefined,
    email: email.value || undefined
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
            name="nombre-club"
            v-model="nombre" 
            type="text" 
            autocomplete="organization"
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
            name="cp-club"
            v-model="cp" 
            type="text" 
            autocomplete="postal-code"
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
            name="numero-club"
            v-model="numeroClub" 
            type="text" 
            autocomplete="off"
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

        <div class="space-y-2">
          <label for="persona-contacto" class="block text-sm font-medium text-gray-700">Persona de Contacto</label>
          <input 
            id="persona-contacto" 
            name="persona-contacto"
            v-model="personaContacto" 
            type="text" 
            autocomplete="name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Nombre de la persona de contacto"
          />
        </div>

        <div class="space-y-2">
          <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input 
            id="telefono" 
            name="telefono"
            v-model="telefono" 
            type="tel" 
            autocomplete="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            :class="{ 'border-red-500': errores.telefono }"
            placeholder="Ej: 912345678"
          />
          <p v-if="errores.telefono" class="text-red-500 text-xs mt-1">{{ errores.telefono }}</p>
        </div>

        <div class="space-y-2">
          <label for="direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
          <input 
            id="direccion" 
            name="direccion"
            v-model="direccion" 
            type="text" 
            autocomplete="street-address"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Dirección del club"
          />
        </div>

        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            id="email" 
            name="email"
            v-model="email" 
            type="email" 
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            :class="{ 'border-red-500': errores.email }"
            placeholder="ejemplo@dominio.com"
          />
          <p v-if="errores.email" class="text-red-500 text-xs mt-1">{{ errores.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 