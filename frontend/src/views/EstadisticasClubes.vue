<script setup lang="ts">
// Componente para mostrar estadísticas de clubes
import { ref, onMounted } from 'vue';

// Datos de ejemplo para las estadísticas
const clubesStats = ref([
  { id: 1, nombre: 'Club Domino A', partidas: 120, victorias: 78, derrotas: 42, puntuacion: 1560 },
  { id: 2, nombre: 'Club Domino B', partidas: 105, victorias: 62, derrotas: 43, puntuacion: 1320 },
  { id: 3, nombre: 'Club Domino C', partidas: 98, victorias: 45, derrotas: 53, puntuacion: 1150 },
  { id: 4, nombre: 'Club Domino D', partidas: 110, victorias: 70, derrotas: 40, puntuacion: 1480 },
  { id: 5, nombre: 'Club Domino E', partidas: 85, victorias: 40, derrotas: 45, puntuacion: 980 }
]);

// Datos para el gráfico
const chartData = {
  labels: clubesStats.value.map(club => club.nombre),
  datasets: [
    {
      label: 'Victorias',
      data: clubesStats.value.map(club => club.victorias),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    },
    {
      label: 'Derrotas',
      data: clubesStats.value.map(club => club.derrotas),
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 1
    }
  ]
};

// Filtros
const periodoFiltro = ref('todos');
const ordenarPor = ref('victorias');

// Ordenar clubes según el filtro seleccionado
const clubesOrdenados = ref([...clubesStats.value]);

const ordenarClubes = () => {
  clubesOrdenados.value = [...clubesStats.value].sort((a, b) => {
    if (ordenarPor.value === 'victorias') {
      return b.victorias - a.victorias;
    } else if (ordenarPor.value === 'partidas') {
      return b.partidas - a.partidas;
    } else if (ordenarPor.value === 'puntuacion') {
      return b.puntuacion - a.puntuacion;
    }
    return 0;
  });
};

onMounted(() => {
  ordenarClubes();
});

const cambiarOrden = (filtro: string) => {
  ordenarPor.value = filtro;
  ordenarClubes();
};
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Estadísticas de Clubes</h1>
    
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="space-y-1">
        <label for="periodo" class="block text-sm font-medium text-gray-700">Periodo</label>
        <select 
          id="periodo" 
          v-model="periodoFiltro" 
          class="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="todos">Todos los tiempos</option>
          <option value="mes">Último mes</option>
          <option value="trimestre">Último trimestre</option>
          <option value="anio">Último año</option>
        </select>
      </div>
      
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Ordenar por</label>
        <div class="flex gap-2">
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
      </div>
    </div>
    
    <!-- Gráfico (simulado) -->
    <div class="bg-white border rounded-md shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Rendimiento de Clubes</h2>
      <div class="h-64 bg-gray-100 rounded-md flex items-center justify-center">
        <p class="text-gray-500">Aquí se mostraría un gráfico con los datos de rendimiento</p>
      </div>
    </div>
    
    <!-- Tabla de estadísticas -->
    <div class="bg-white border rounded-md shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partidas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Victorias</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Derrotas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="club in clubesOrdenados" :key="club.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ club.nombre }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.partidas }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.victorias }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.derrotas }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.puntuacion }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 