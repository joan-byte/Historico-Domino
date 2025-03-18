<script setup lang="ts">
// Componente para mostrar estadísticas de jugadores
import { ref, onMounted } from 'vue';

// Datos de ejemplo para las estadísticas
const jugadoresStats = ref([
  { id: 1, nombre: 'Juan Pérez', apodo: 'El Maestro', partidas: 150, victorias: 98, derrotas: 52, puntuacion: 1850, club: 'Club Domino A' },
  { id: 2, nombre: 'María López', apodo: 'La Estratega', partidas: 130, victorias: 85, derrotas: 45, puntuacion: 1720, club: 'Club Domino B' },
  { id: 3, nombre: 'Carlos Rodríguez', apodo: 'El Rápido', partidas: 120, victorias: 72, derrotas: 48, puntuacion: 1580, club: 'Club Domino A' },
  { id: 4, nombre: 'Ana Martínez', apodo: 'La Táctica', partidas: 140, victorias: 90, derrotas: 50, puntuacion: 1780, club: 'Club Domino C' },
  { id: 5, nombre: 'Pedro Sánchez', apodo: 'El Calculador', partidas: 110, victorias: 65, derrotas: 45, puntuacion: 1450, club: 'Club Domino D' }
]);

// Filtros
const periodoFiltro = ref('todos');
const clubFiltro = ref('todos');
const ordenarPor = ref('victorias');

// Lista de clubes para el filtro
const clubes = [
  { id: 'todos', nombre: 'Todos los clubes' },
  { id: 'Club Domino A', nombre: 'Club Domino A' },
  { id: 'Club Domino B', nombre: 'Club Domino B' },
  { id: 'Club Domino C', nombre: 'Club Domino C' },
  { id: 'Club Domino D', nombre: 'Club Domino D' },
  { id: 'Club Domino E', nombre: 'Club Domino E' }
];

// Jugadores filtrados y ordenados
const jugadoresFiltrados = ref([...jugadoresStats.value]);

const aplicarFiltros = () => {
  // Filtrar por club
  let resultado = [...jugadoresStats.value];
  
  if (clubFiltro.value !== 'todos') {
    resultado = resultado.filter(jugador => jugador.club === clubFiltro.value);
  }
  
  // Ordenar según el criterio seleccionado
  resultado.sort((a, b) => {
    if (ordenarPor.value === 'victorias') {
      return b.victorias - a.victorias;
    } else if (ordenarPor.value === 'partidas') {
      return b.partidas - a.partidas;
    } else if (ordenarPor.value === 'puntuacion') {
      return b.puntuacion - a.puntuacion;
    }
    return 0;
  });
  
  jugadoresFiltrados.value = resultado;
};

onMounted(() => {
  aplicarFiltros();
});

const cambiarOrden = (filtro: string) => {
  ordenarPor.value = filtro;
  aplicarFiltros();
};

const cambiarClubFiltro = () => {
  aplicarFiltros();
};
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Estadísticas de Jugadores</h1>
    
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">
          Periodo
          <select 
            v-model="periodoFiltro" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
          >
            <option value="todos">Todos los tiempos</option>
            <option value="mes">Último mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="anio">Último año</option>
          </select>
        </label>
      </div>
      
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">
          Club
          <select 
            v-model="clubFiltro" 
            @change="cambiarClubFiltro"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
          >
            <option v-for="club in clubes" :key="club.id" :value="club.id">{{ club.nombre }}</option>
          </select>
        </label>
      </div>
      
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">
          Ordenar por
          <div class="flex gap-2 mt-1">
            <button 
              @click="cambiarOrden('victorias')" 
              class="px-3 py-2 border rounded-md text-sm"
              :class="ordenarPor === 'victorias' ? 'bg-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Victorias
            </button>
            <button 
              @click="cambiarOrden('partidas')" 
              class="px-3 py-2 border rounded-md text-sm"
              :class="ordenarPor === 'partidas' ? 'bg-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Partidas
            </button>
            <button 
              @click="cambiarOrden('puntuacion')" 
              class="px-3 py-2 border rounded-md text-sm"
              :class="ordenarPor === 'puntuacion' ? 'bg-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Puntuación
            </button>
          </div>
        </label>
      </div>
    </div>
    
    <!-- Gráfico (simulado) -->
    <div class="bg-white border rounded-md shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Rendimiento de Jugadores</h2>
      <div class="h-64 bg-gray-100 rounded-md flex items-center justify-center">
        <p class="text-gray-500">Aquí se mostraría un gráfico con los datos de rendimiento</p>
      </div>
    </div>
    
    <!-- Tabla de estadísticas -->
    <div class="bg-white border rounded-md shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apodo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partidas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Victorias</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Derrotas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="jugador in jugadoresFiltrados" :key="jugador.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ jugador.nombre }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ jugador.apodo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ jugador.club }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ jugador.partidas }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ jugador.victorias }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ jugador.derrotas }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ jugador.puntuacion }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 