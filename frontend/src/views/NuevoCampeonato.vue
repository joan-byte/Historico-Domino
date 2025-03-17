<script setup lang="ts">
// Componente para crear y editar campeonatos
import { ref, onMounted } from 'vue';

// Datos del formulario
const campeonato = ref({
  nombre: '',
  fechaInicio: '',
  fechaFin: '',
  tipo: '',
  descripcion: '',
  participantes: []
});

// Lista de tipos de campeonato disponibles
const tiposCampeonato = ref([
  { id: 1, nombre: 'Liga Regular' },
  { id: 2, nombre: 'Eliminación Directa' },
  { id: 3, nombre: 'Grupos + Eliminatorias' },
  { id: 4, nombre: 'Torneo Suizo' }
]);

// Lista de clubes disponibles para seleccionar como participantes
const clubesDisponibles = ref([
  { id: 1, nombre: 'Club Domino A' },
  { id: 2, nombre: 'Club Domino B' },
  { id: 3, nombre: 'Club Domino C' },
  { id: 4, nombre: 'Club Domino D' },
  { id: 5, nombre: 'Club Domino E' }
]);

// Clubes seleccionados como participantes
const participantesSeleccionados = ref<number[]>([]);

// Función para guardar el campeonato
const guardarCampeonato = () => {
  // Validación básica
  if (!campeonato.value.nombre || !campeonato.value.fechaInicio || !campeonato.value.tipo) {
    alert('Por favor, completa los campos obligatorios');
    return;
  }
  
  // Aquí iría la lógica para guardar en la base de datos
  console.log('Guardando campeonato:', {
    ...campeonato.value,
    participantes: participantesSeleccionados.value.map(id => 
      clubesDisponibles.value.find(club => club.id === id)
    )
  });
  
  alert('Campeonato guardado correctamente (simulado)');
  
  // Resetear formulario
  campeonato.value = {
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    tipo: '',
    descripcion: '',
    participantes: []
  };
  participantesSeleccionados.value = [];
};

// Función para alternar la selección de un participante
const toggleParticipante = (id: number) => {
  const index = participantesSeleccionados.value.indexOf(id);
  if (index === -1) {
    participantesSeleccionados.value.push(id);
  } else {
    participantesSeleccionados.value.splice(index, 1);
  }
};

// Verificar si un club está seleccionado
const isParticipanteSeleccionado = (id: number): boolean => {
  return participantesSeleccionados.value.includes(id);
};

// Establecer fecha mínima para el campo de fecha (hoy)
const fechaMinima = new Date().toISOString().split('T')[0];

// Función para actualizar la fecha de fin cuando cambia la fecha de inicio
const actualizarFechaFin = () => {
  if (campeonato.value.fechaInicio && !campeonato.value.fechaFin) {
    // Por defecto, establecer la fecha de fin 3 meses después de la fecha de inicio
    const fechaInicio = new Date(campeonato.value.fechaInicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + 3);
    campeonato.value.fechaFin = fechaFin.toISOString().split('T')[0];
  }
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Crear Nuevo Campeonato</h1>
      <a 
        href="/campeonato" 
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
      >
        Volver
      </a>
    </div>
    
    <div class="bg-white border rounded-md shadow-sm p-6">
      <form @submit.prevent="guardarCampeonato" class="space-y-6">
        <!-- Información básica -->
        <div>
          <h2 class="text-lg font-medium mb-4">Información Básica</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Campeonato *</label>
              <input 
                id="nombre" 
                name="nombre"
                v-model="campeonato.nombre" 
                type="text" 
                required
                autocomplete="off"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Ej: Campeonato Regional 2023"
              />
            </div>
            
            <div class="space-y-1">
              <label for="tipo" class="block text-sm font-medium text-gray-700">Tipo de Campeonato *</label>
              <select 
                id="tipo" 
                name="tipo"
                v-model="campeonato.tipo" 
                required
                autocomplete="off"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Selecciona un tipo</option>
                <option v-for="tipo in tiposCampeonato" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>
            
            <div class="space-y-1">
              <label for="fechaInicio" class="block text-sm font-medium text-gray-700">Fecha de Inicio *</label>
              <input 
                id="fechaInicio" 
                name="fechaInicio"
                v-model="campeonato.fechaInicio" 
                type="date" 
                required
                autocomplete="off"
                :min="fechaMinima"
                @change="actualizarFechaFin"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div class="space-y-1">
              <label for="fechaFin" class="block text-sm font-medium text-gray-700">Fecha de Finalización</label>
              <input 
                id="fechaFin" 
                name="fechaFin"
                v-model="campeonato.fechaFin" 
                type="date" 
                autocomplete="off"
                :min="campeonato.fechaInicio || fechaMinima"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div class="space-y-1 md:col-span-2">
              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea 
                id="descripcion" 
                name="descripcion"
                v-model="campeonato.descripcion" 
                rows="3" 
                autocomplete="off"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Describe el campeonato, sus objetivos y cualquier información relevante"
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- Selección de participantes -->
        <div>
          <h2 class="text-lg font-medium mb-4">Participantes</h2>
          <p class="text-sm text-gray-500 mb-4">Selecciona los clubes que participarán en este campeonato.</p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div 
              v-for="club in clubesDisponibles" 
              :key="club.id"
              @click="toggleParticipante(club.id)"
              class="border rounded-md p-3 cursor-pointer transition-colors"
              :class="isParticipanteSeleccionado(club.id) ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'"
            >
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  :checked="isParticipanteSeleccionado(club.id)" 
                  class="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  @click.stop
                />
                <span class="ml-2 text-sm font-medium">{{ club.nombre }}</span>
              </div>
            </div>
          </div>
          
          <p class="mt-3 text-sm text-gray-500">
            {{ participantesSeleccionados.length }} clubes seleccionados
          </p>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            @click="$router.push('/campeonato')"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Guardar Campeonato
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 