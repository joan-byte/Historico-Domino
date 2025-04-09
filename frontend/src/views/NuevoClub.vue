<script setup lang="ts">
// Componente para crear un nuevo club
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { clubService, type ClubCreate } from '../lib/clubService';
import provinciasData from '../data/provincias_cp.json' with { type: 'json' };

const router = useRouter();
const nombre = ref('');
const cp = ref('');
const numeroClub = ref('');
const personaContacto = ref('');
const telefono = ref('');
const direccion = ref('');
const email = ref('');
const provinciaDetectada = ref('');

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

// Watcher para detectar cambios en cp y buscar provincia
watch(cp, (newCp) => {
  provinciaDetectada.value = '';
  if (newCp && newCp.length === 2) {
    const provinciaInfo = provinciasData.find(p => p.cp === newCp);
    if (provinciaInfo) {
      provinciaDetectada.value = provinciaInfo.provincia;
    }
  }
});

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

// NUEVA Función para aplicar padding al numeroClub en blur
const formatearNumeroClub = () => {
  if (numeroClub.value && numeroClub.value.length > 0 && /^[0-9]+$/.test(numeroClub.value)) {
    // Solo formatear si es numérico
    numeroClub.value = numeroClub.value.padStart(4, '0');
  }
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
          <label class="block text-sm font-medium text-gray-700">
            Nombre del Club <span class="text-red-500">*</span>
            <input 
              name="nombre-club"
              v-model="nombre" 
              type="text" 
              autocomplete="organization"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{ 'border-red-500': errores.nombre }"
              placeholder="Nombre del club"
            />
          </label>
          <p v-if="errores.nombre" class="text-red-500 text-xs mt-1">{{ errores.nombre }}</p>
        </div>
        
        <div class="space-y-2">
          <label 
            for="cp-club"
            class="block text-sm font-medium text-gray-700">
            Código Postal (2 dígitos) <span class="text-red-500">*</span>
          </label>
          <!-- Contenedor Flex para CP y Provincia -->
          <div class="flex items-center w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1" 
               :class="{ 'border-red-500': errores.cp }">
            <input 
              id="cp-club"
              name="cp-club"
              v-model="cp" 
              type="text" 
              autocomplete="postal-code"
              maxlength="2"
              class="w-12 border-none p-0 px-1 focus:ring-0 text-sm" 
              placeholder="CP">
            <!-- Mostrar provincia si se detecta -->
            <span v-if="provinciaDetectada" class="ml-2 text-gray-600 text-sm truncate">
              {{ provinciaDetectada }}
            </span>
          </div>
          <p v-if="errores.cp" class="text-red-500 text-xs mt-1">{{ errores.cp }}</p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Número de Club (máx 4 dígitos) <span class="text-red-500">*</span>
            <input 
              name="numero-club"
              v-model="numeroClub" 
              type="text" 
              autocomplete="off"
              maxlength="4"
              @blur="formatearNumeroClub"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              :class="{ 'border-red-500': errores.numeroClub }"
              placeholder="Ej: 1234"
            />
          </label>
          <p v-if="errores.numeroClub" class="text-red-500 text-xs mt-1">{{ errores.numeroClub }}</p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Código Club (generado automáticamente)
            <input 
              id="codigo-club-generado"
              name="codigo-club-generado"
              type="text"
              :value="((cp || '').padStart(2, '0') || '') + ((numeroClub || '').padStart(4, '0') || '')"
              readonly
              aria-readonly="true"
              class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1"
            />
          </label>
          <p class="text-xs text-gray-500">El código se generará automáticamente a partir del CP y el número de club</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Persona de Contacto
            <input 
              name="persona-contacto"
              v-model="personaContacto" 
              type="text" 
              autocomplete="name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Nombre de la persona de contacto"
            />
          </label>
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
              :class="{ 'border-red-500': errores.telefono }"
              placeholder="Ej: 912345678"
            />
          </label>
          <p v-if="errores.telefono" class="text-red-500 text-xs mt-1">{{ errores.telefono }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Dirección
            <input 
              name="direccion"
              v-model="direccion" 
              type="text" 
              autocomplete="street-address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Dirección del club"
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
              :class="{ 'border-red-500': errores.email }"
              placeholder="ejemplo@dominio.com"
            />
          </label>
          <p v-if="errores.email" class="text-red-500 text-xs mt-1">{{ errores.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 