<script setup lang="ts">
// Componente para modificar un club existente
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { clubService, type ClubResponse, type ClubCreate } from '../lib/clubService';
import provinciasData from '../data/provincias_cp.json' with { type: 'json' }; // Importar datos JSON

const router = useRouter();
const route = useRoute();
const nombre = ref('');
const cp = ref('');
const numeroClub = ref('');
const personaContacto = ref('');
const telefono = ref('');
const direccion = ref('');
const email = ref('');
const clubId = ref('');
const isLoading = ref(false);
const isLoadingData = ref(true);
const generalError = ref('');
const provinciaDetectada = ref(''); // <-- Añadir ref para provincia

// Referencias para manejar errores de validación
const errores = ref({
  nombre: '',
  telefono: '',
  email: '',
  general: ''
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
    personaContacto.value = club.persona_contacto || '';
    telefono.value = club.telefono || '';
    direccion.value = club.direccion || '';
    email.value = club.email || '';
    
    // Buscar provincia una vez que tenemos el CP
    const provinciaInfo = provinciasData.find(p => p.cp === cp.value);
    if (provinciaInfo) {
      provinciaDetectada.value = provinciaInfo.provincia;
    }
    
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
    telefono: '',
    email: '',
    general: ''
  };
  
  // Validar nombre (requerido)
  if (!nombre.value.trim()) {
    errores.value.nombre = 'El nombre es obligatorio';
    esValido = false;
  }
  
  // Validar teléfono (opcional pero con formato válido si se proporciona)
  if (telefono.value && !/^\d{9,15}$/.test(telefono.value)) {
    errores.value.telefono = 'El teléfono debe tener entre 9 y 15 dígitos';
    esValido = false;
  }
  
  // Validar email (opcional pero con formato válido si se proporciona)
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errores.value.email = 'El formato del email no es válido';
    esValido = false;
  }
  
  return esValido;
};

// Actualizar el club
const actualizarClub = async () => {
  try {
    if (!validarFormulario()) {
      return;
    }

    const clubData = {
      nombre: nombre.value,
      cp: cp.value,
      numero_club: numeroClub.value,
      persona_contacto: personaContacto.value || undefined,
      telefono: telefono.value || undefined,
      direccion: direccion.value || undefined,
      email: email.value || undefined
    };

    await clubService.update(clubId.value, clubData);
    router.push('/clubes');
  } catch (error) {
    console.error('Error al actualizar el club:', error);
    // Mostrar el mensaje de error en la interfaz
    errores.value.general = error instanceof Error ? error.message : 'Error al actualizar el club';
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
        <!-- Primera columna: Información no modificable del club -->
        <div class="space-y-4">
          <div class="space-y-2">
            <div class="block text-sm font-medium text-gray-700">
              Código Postal
              <div class="flex items-center w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1">
                <span class="w-10 px-1">{{ cp }}</span>
                <span v-if="provinciaDetectada" class="ml-2 truncate">{{ provinciaDetectada }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Número de Club
              <input 
                id="numero-club-readonly"
                name="numero-club-readonly"
                type="text"
                :value="(numeroClub || '').padStart(4, '0')"
                readonly
                class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1"
              />
            </label>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Código Club
              <input 
                id="codigo-club-readonly"
                name="codigo-club-readonly"
                type="text"
                :value="(cp || '') + (numeroClub || '').padStart(4, '0')"
                readonly
                class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 cursor-not-allowed mt-1"
              />
            </label>
            <p class="text-xs text-gray-500">Estos campos no son modificables una vez creado el club</p>
          </div>
        </div>

        <!-- Segunda columna: Campos editables -->
        <div class="space-y-4">
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

    <!-- Mensaje de error general -->
    <div v-if="errores.general" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <p class="whitespace-pre-line">{{ errores.general }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 