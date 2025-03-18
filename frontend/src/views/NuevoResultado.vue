<script setup lang="ts">
// Componente para registrar nuevos resultados de partidas
import { ref, onMounted, computed } from 'vue';

// Datos del formulario
const resultado = ref({
  fecha: '',
  campeonato: '',
  club: '',
  equipoA: '',
  equipoB: '',
  puntosEquipoA: 0,
  puntosEquipoB: 0,
  notas: ''
});

// Listas de opciones para los selectores
const campeonatos = ref([
  { id: 1, nombre: 'Campeonato Regional 2023' },
  { id: 2, nombre: 'Torneo Verano 2023' },
  { id: 3, nombre: 'Campeonato Nacional 2023' },
  { id: 4, nombre: 'Torneo Primavera 2024' }
]);

const clubes = ref([
  { id: 1, nombre: 'Club Domino A' },
  { id: 2, nombre: 'Club Domino B' },
  { id: 3, nombre: 'Club Domino C' },
  { id: 4, nombre: 'Club Domino D' },
  { id: 5, nombre: 'Club Domino E' }
]);

const equipos = ref([
  { id: 1, nombre: 'Equipo Rojo', clubId: 1 },
  { id: 2, nombre: 'Equipo Azul', clubId: 1 },
  { id: 3, nombre: 'Equipo Verde', clubId: 2 },
  { id: 4, nombre: 'Equipo Amarillo', clubId: 2 },
  { id: 5, nombre: 'Equipo Naranja', clubId: 3 },
  { id: 6, nombre: 'Equipo Morado', clubId: 3 },
  { id: 7, nombre: 'Equipo Blanco', clubId: 4 },
  { id: 8, nombre: 'Equipo Negro', clubId: 4 },
  { id: 9, nombre: 'Equipo Gris', clubId: 5 },
  { id: 10, nombre: 'Equipo Marrón', clubId: 5 }
]);

// Equipos filtrados según el club seleccionado
const equiposFiltrados = computed(() => {
  if (!resultado.value.club) return [];
  return equipos.value.filter(equipo => equipo.clubId === parseInt(resultado.value.club));
});

// Determinar el ganador basado en los puntos
const ganador = computed(() => {
  const puntosA = resultado.value.puntosEquipoA;
  const puntosB = resultado.value.puntosEquipoB;
  
  if (puntosA > puntosB) {
    return 'Equipo A';
  } else if (puntosB > puntosA) {
    return 'Equipo B';
  } else if (puntosA > 0 && puntosB > 0) {
    return 'Empate';
  } else {
    return 'No determinado';
  }
});

// Establecer fecha mínima para el campo de fecha (hoy)
const fechaMinima = new Date().toISOString().split('T')[0];

// Función para guardar el resultado
const guardarResultado = () => {
  // Validación básica
  if (!resultado.value.fecha || !resultado.value.campeonato || !resultado.value.club || 
      !resultado.value.equipoA || !resultado.value.equipoB) {
    alert('Por favor, completa los campos obligatorios');
    return;
  }
  
  if (resultado.value.equipoA === resultado.value.equipoB) {
    alert('Los equipos no pueden ser iguales');
    return;
  }
  
  // Aquí iría la lógica para guardar en la base de datos
  console.log('Guardando resultado:', {
    ...resultado.value,
    ganador: ganador.value
  });
  
  alert('Resultado guardado correctamente (simulado)');
  
  // Resetear formulario
  resultado.value = {
    fecha: '',
    campeonato: '',
    club: '',
    equipoA: '',
    equipoB: '',
    puntosEquipoA: 0,
    puntosEquipoB: 0,
    notas: ''
  };
};

// Función para cambiar el club y resetear los equipos seleccionados
const cambiarClub = () => {
  resultado.value.equipoA = '';
  resultado.value.equipoB = '';
};

// Obtener nombre del equipo por ID
const getNombreEquipo = (id: string) => {
  if (!id) return '';
  const equipo = equipos.value.find(e => e.id === parseInt(id));
  return equipo ? equipo.nombre : '';
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Registrar Nuevo Resultado</h1>
      <a 
        href="/resultados" 
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
      >
        Volver
      </a>
    </div>
    
    <div class="bg-white border rounded-md shadow-sm p-6">
      <form @submit.prevent="guardarResultado" class="space-y-6">
        <!-- Fecha, Campeonato y Club Local -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Fecha -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha *
              <input
                v-model="resultado.fecha"
                type="date"
                required
                :max="fechaMinima"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              />
            </label>
          </div>

          <!-- Campeonato -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Campeonato *
              <select
                v-model="resultado.campeonato"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              >
                <option value="">Seleccionar campeonato</option>
                <option v-for="campeonato in campeonatos" :key="campeonato.id" :value="campeonato.id">
                  {{ campeonato.nombre }}
                </option>
              </select>
            </label>
          </div>

          <!-- Club local -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Club Local *
              <select
                v-model="resultado.club"
                required
                @change="cambiarClub"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              >
                <option value="">Seleccionar club local</option>
                <option v-for="club in clubes" :key="club.id" :value="club.id">
                  {{ club.nombre }}
                </option>
              </select>
            </label>
          </div>
        </div>
        
        <!-- Mensaje cuando no hay club seleccionado -->
        <div v-if="!resultado.club" class="py-4 text-center text-amber-700 bg-amber-50 rounded-md">
          Selecciona un club local para poder elegir los equipos
        </div>
        
        <!-- Equipos y puntuaciones -->
        <div>
          <h2 class="text-lg font-medium mb-4">Equipos y Puntuación</h2>
          
          <div v-if="!resultado.club" class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p class="text-sm text-yellow-700">
              Selecciona primero un club anfitrión para ver los equipos disponibles.
            </p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Equipo A -->
            <div class="border rounded-md p-4">
              <h3 class="text-sm font-medium mb-3">Equipo A</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Seleccionar Equipo *
                    <select 
                      v-model="resultado.equipoA" 
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                    >
                      <option value="">Selecciona un equipo</option>
                      <option v-for="equipo in equiposFiltrados" :key="equipo.id" :value="equipo.id">
                        {{ equipo.nombre }}
                      </option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Puntos
                    <input 
                      v-model.number="resultado.puntosEquipoA" 
                      type="number" 
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Equipo B -->
            <div class="border rounded-md p-4">
              <h3 class="text-sm font-medium mb-3">Equipo B</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Seleccionar Equipo *
                    <select 
                      v-model="resultado.equipoB" 
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                    >
                      <option value="">Selecciona un equipo</option>
                      <option v-for="equipo in equiposFiltrados" :key="equipo.id" :value="equipo.id">
                        {{ equipo.nombre }}
                      </option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Puntos
                    <input 
                      v-model.number="resultado.puntosEquipoB" 
                      type="number" 
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resumen del resultado -->
          <div v-if="resultado.equipoA && resultado.equipoB" class="mt-4 p-4 bg-gray-50 border rounded-md">
            <h3 class="text-sm font-medium mb-2">Resumen del Resultado</h3>
            <div class="flex items-center justify-center text-lg font-medium">
              <span :class="{ 'text-green-600': ganador === 'Equipo A' }">
                {{ getNombreEquipo(resultado.equipoA) }}
              </span>
              <span class="mx-2 text-gray-500">{{ resultado.puntosEquipoA }} - {{ resultado.puntosEquipoB }}</span>
              <span :class="{ 'text-green-600': ganador === 'Equipo B' }">
                {{ getNombreEquipo(resultado.equipoB) }}
              </span>
            </div>
            <p class="text-center text-sm mt-1">
              <span v-if="ganador === 'Empate'" class="text-gray-500">Empate</span>
              <span v-else-if="ganador === 'No determinado'" class="text-gray-500">Resultado no determinado</span>
              <span v-else class="text-green-600">Ganador: {{ ganador === 'Equipo A' ? getNombreEquipo(resultado.equipoA) : getNombreEquipo(resultado.equipoB) }}</span>
            </p>
          </div>
        </div>
        
        <!-- Notas adicionales -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Notas Adicionales
            <textarea 
              v-model="resultado.notas" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              placeholder="Añade cualquier información relevante sobre la partida"
            ></textarea>
          </label>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            @click="$router.push('/resultados')"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Guardar Resultado
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 