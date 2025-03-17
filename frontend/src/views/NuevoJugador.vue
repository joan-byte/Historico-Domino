<script setup lang="ts">
// Componente para crear un nuevo jugador
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nombre = ref('');
const apellidos = ref('');
const apodo = ref('');
const fechaNacimiento = ref('');
const club = ref('');
const telefono = ref('');
const email = ref('');
const nivel = ref('intermedio');

const clubesDisponibles = [
  { id: 1, nombre: 'Club Domino A' },
  { id: 2, nombre: 'Club Domino B' },
  { id: 3, nombre: 'Club Domino C' },
  { id: 4, nombre: 'Club Domino D' },
  { id: 5, nombre: 'Club Domino E' }
];

const guardarJugador = () => {
  // Aquí iría la lógica para guardar el jugador en la base de datos
  console.log('Guardando jugador:', {
    nombre: nombre.value,
    apellidos: apellidos.value,
    apodo: apodo.value,
    fechaNacimiento: fechaNacimiento.value,
    club: club.value,
    telefono: telefono.value,
    email: email.value,
    nivel: nivel.value
  });
  
  // Redirigir a la lista de jugadores
  router.push('/jugadores');
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
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Guardar
        </button>
      </div>
    </div>
    
    <div class="bg-white border rounded-md shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
          <input 
            id="nombre" 
            name="nombre"
            v-model="nombre" 
            type="text" 
            autocomplete="given-name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Nombre del jugador"
          />
        </div>
        
        <div class="space-y-2">
          <label for="apellidos" class="block text-sm font-medium text-gray-700">Apellidos</label>
          <input 
            id="apellidos" 
            name="apellidos"
            v-model="apellidos" 
            type="text" 
            autocomplete="family-name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Apellidos del jugador"
          />
        </div>
        
        <div class="space-y-2">
          <label for="apodo" class="block text-sm font-medium text-gray-700">Apodo</label>
          <input 
            id="apodo" 
            name="apodo"
            v-model="apodo" 
            type="text" 
            autocomplete="nickname"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Apodo o alias"
          />
        </div>
        
        <div class="space-y-2">
          <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
          <input 
            id="fechaNacimiento" 
            name="fechaNacimiento"
            v-model="fechaNacimiento" 
            type="date" 
            autocomplete="bday"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        
        <div class="space-y-2">
          <label for="club" class="block text-sm font-medium text-gray-700">Club</label>
          <select 
            id="club" 
            name="club"
            v-model="club" 
            autocomplete="organization"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Seleccionar club</option>
            <option v-for="clubItem in clubesDisponibles" :key="clubItem.id" :value="clubItem.id">
              {{ clubItem.nombre }}
            </option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label for="nivel" class="block text-sm font-medium text-gray-700">Nivel</label>
          <select 
            id="nivel" 
            name="nivel"
            v-model="nivel" 
            autocomplete="off"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
            <option value="experto">Experto</option>
          </select>
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
            placeholder="Teléfono de contacto"
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
            placeholder="Email de contacto"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 