<script setup lang="ts">
// Componente para crear un nuevo club
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nombreClub = ref('');
const direccion = ref('');
const telefono = ref('');
const email = ref('');
const descripcion = ref('');

const guardarClub = () => {
  // Aquí iría la lógica para guardar el club en la base de datos
  console.log('Guardando club:', {
    nombre: nombreClub.value,
    direccion: direccion.value,
    telefono: telefono.value,
    email: email.value,
    descripcion: descripcion.value
  });
  
  // Redirigir a la lista de clubes
  router.push('/clubes');
};

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
        >
          Cancelar
        </button>
        <button 
          @click="guardarClub"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Guardar
        </button>
      </div>
    </div>
    
    <div class="bg-white border rounded-md shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Club</label>
          <input 
            id="nombre" 
            v-model="nombreClub" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Nombre del club"
          />
        </div>
        
        <div class="space-y-2">
          <label for="direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
          <input 
            id="direccion" 
            v-model="direccion" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Dirección del club"
          />
        </div>
        
        <div class="space-y-2">
          <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input 
            id="telefono" 
            v-model="telefono" 
            type="tel" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Teléfono de contacto"
          />
        </div>
        
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Email de contacto"
          />
        </div>
        
        <div class="space-y-2 md:col-span-2">
          <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea 
            id="descripcion" 
            v-model="descripcion" 
            rows="4" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Descripción del club"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 