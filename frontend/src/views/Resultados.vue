<script setup lang="ts">
// Componente para mostrar resultados de partidas
import { ref, onMounted } from 'vue';

// Datos de ejemplo para los resultados
const partidas = ref([
  { 
    id: 1, 
    fecha: '2023-10-15', 
    club: 'Club Domino A',
    equipoA: { nombre: 'Equipo Rojo', jugadores: ['Juan Pérez', 'María López'] },
    equipoB: { nombre: 'Equipo Azul', jugadores: ['Carlos Rodríguez', 'Ana Martínez'] },
    resultado: { equipoA: 100, equipoB: 85 },
    ganador: 'Equipo Rojo'
  },
  { 
    id: 2, 
    fecha: '2023-10-18', 
    club: 'Club Domino B',
    equipoA: { nombre: 'Equipo Verde', jugadores: ['Pedro Sánchez', 'Laura García'] },
    equipoB: { nombre: 'Equipo Amarillo', jugadores: ['Miguel Fernández', 'Sofía Ruiz'] },
    resultado: { equipoA: 75, equipoB: 100 },
    ganador: 'Equipo Amarillo'
  },
  { 
    id: 3, 
    fecha: '2023-10-20', 
    club: 'Club Domino A',
    equipoA: { nombre: 'Equipo Rojo', jugadores: ['Juan Pérez', 'María López'] },
    equipoB: { nombre: 'Equipo Verde', jugadores: ['Pedro Sánchez', 'Laura García'] },
    resultado: { equipoA: 100, equipoB: 95 },
    ganador: 'Equipo Rojo'
  },
  { 
    id: 4, 
    fecha: '2023-10-22', 
    club: 'Club Domino C',
    equipoA: { nombre: 'Equipo Azul', jugadores: ['Carlos Rodríguez', 'Ana Martínez'] },
    equipoB: { nombre: 'Equipo Amarillo', jugadores: ['Miguel Fernández', 'Sofía Ruiz'] },
    resultado: { equipoA: 90, equipoB: 90 },
    ganador: 'Empate'
  },
  { 
    id: 5, 
    fecha: '2023-10-25', 
    club: 'Club Domino B',
    equipoA: { nombre: 'Equipo Verde', jugadores: ['Pedro Sánchez', 'Laura García'] },
    equipoB: { nombre: 'Equipo Rojo', jugadores: ['Juan Pérez', 'María López'] },
    resultado: { equipoA: 80, equipoB: 100 },
    ganador: 'Equipo Rojo'
  }
]);

// Filtros
const clubFiltro = ref('todos');
const fechaFiltro = ref('');
const ordenarPor = ref('fecha');
const ordenAscendente = ref(false);

// Lista de clubes para el filtro
const clubes = [
  { id: 'todos', nombre: 'Todos los clubes' },
  { id: 'Club Domino A', nombre: 'Club Domino A' },
  { id: 'Club Domino B', nombre: 'Club Domino B' },
  { id: 'Club Domino C', nombre: 'Club Domino C' }
];

// Partidas filtradas y ordenadas
const partidasFiltradas = ref([...partidas.value]);

const aplicarFiltros = () => {
  // Filtrar por club y fecha
  let resultado = [...partidas.value];
  
  if (clubFiltro.value !== 'todos') {
    resultado = resultado.filter(partida => partida.club === clubFiltro.value);
  }
  
  if (fechaFiltro.value) {
    resultado = resultado.filter(partida => partida.fecha >= fechaFiltro.value);
  }
  
  // Ordenar según el criterio seleccionado
  resultado.sort((a, b) => {
    let valorA: string | number = '';
    let valorB: string | number = '';
    
    if (ordenarPor.value === 'fecha') {
      valorA = a.fecha;
      valorB = b.fecha;
    } else if (ordenarPor.value === 'club') {
      valorA = a.club;
      valorB = b.club;
    } else if (ordenarPor.value === 'puntos') {
      valorA = Math.max(a.resultado.equipoA, a.resultado.equipoB);
      valorB = Math.max(b.resultado.equipoA, b.resultado.equipoB);
    }
    
    // Determinar el orden (ascendente o descendente)
    if (ordenAscendente.value) {
      return valorA > valorB ? 1 : -1;
    } else {
      return valorA < valorB ? 1 : -1;
    }
  });
  
  partidasFiltradas.value = resultado;
};

onMounted(() => {
  aplicarFiltros();
});

const cambiarOrden = (filtro: string) => {
  if (ordenarPor.value === filtro) {
    ordenAscendente.value = !ordenAscendente.value;
  } else {
    ordenarPor.value = filtro;
    ordenAscendente.value = false;
  }
  aplicarFiltros();
};

const cambiarFiltros = () => {
  aplicarFiltros();
};
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Resultados de Partidas</h1>
    
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="space-y-1">
        <label for="club" class="block text-sm font-medium text-gray-700">Club</label>
        <select 
          id="club" 
          v-model="clubFiltro" 
          @change="cambiarFiltros"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option v-for="club in clubes" :key="club.id" :value="club.id">{{ club.nombre }}</option>
        </select>
      </div>
      
      <div class="space-y-1">
        <label for="fecha" class="block text-sm font-medium text-gray-700">Desde fecha</label>
        <input 
          id="fecha" 
          v-model="fechaFiltro" 
          type="date" 
          @change="cambiarFiltros"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Ordenar por</label>
        <div class="flex gap-2">
          <button 
            @click="cambiarOrden('fecha')" 
            class="px-3 py-2 border rounded-md text-sm flex items-center gap-1"
            :class="ordenarPor === 'fecha' ? 'bg-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Fecha
            <svg v-if="ordenarPor === 'fecha'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
              <polyline :points="ordenAscendente ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"></polyline>
            </svg>
          </button>
          <button 
            @click="cambiarOrden('club')" 
            class="px-3 py-2 border rounded-md text-sm flex items-center gap-1"
            :class="ordenarPor === 'club' ? 'bg-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Club
            <svg v-if="ordenarPor === 'club'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
              <polyline :points="ordenAscendente ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"></polyline>
            </svg>
          </button>
          <button 
            @click="cambiarOrden('puntos')" 
            class="px-3 py-2 border rounded-md text-sm flex items-center gap-1"
            :class="ordenarPor === 'puntos' ? 'bg-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Puntos
            <svg v-if="ordenarPor === 'puntos'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
              <polyline :points="ordenAscendente ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tabla de resultados -->
    <div class="bg-white border rounded-md shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipos</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganador</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="partida in partidasFiltradas" :key="partida.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ partida.fecha }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ partida.club }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <div>
                <span class="font-medium">{{ partida.equipoA.nombre }}:</span> 
                {{ partida.equipoA.jugadores.join(', ') }}
              </div>
              <div>
                <span class="font-medium">{{ partida.equipoB.nombre }}:</span> 
                {{ partida.equipoB.jugadores.join(', ') }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <span :class="partida.resultado.equipoA > partida.resultado.equipoB ? 'text-green-600' : 'text-gray-500'">
                {{ partida.resultado.equipoA }}
              </span>
              -
              <span :class="partida.resultado.equipoB > partida.resultado.equipoA ? 'text-green-600' : 'text-gray-500'">
                {{ partida.resultado.equipoB }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="partida.ganador === 'Empate' ? 'text-gray-500' : 'text-green-600'">
              {{ partida.ganador }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Botón para registrar nueva partida -->
    <div class="mt-6 flex justify-end">
      <a href="/partidas/nueva" class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">
        Registrar nueva partida
      </a>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 