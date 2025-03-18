<script setup lang="ts">
// Componente para mostrar estadísticas de campeonatos
import { ref, computed } from 'vue';

// Datos de ejemplo para los campeonatos
const campeonatos = ref([
  {
    id: 1,
    nombre: 'Campeonato Regional 2023',
    fechaInicio: '2023-03-15',
    fechaFin: '2023-06-30',
    estado: 'Finalizado',
    ganador: 'Club Domino A',
    participantes: 8,
    partidas: 28,
    promedioPuntos: 87.5
  },
  {
    id: 2,
    nombre: 'Torneo Verano 2023',
    fechaInicio: '2023-07-10',
    fechaFin: '2023-08-20',
    estado: 'Finalizado',
    ganador: 'Club Domino B',
    participantes: 6,
    partidas: 15,
    promedioPuntos: 92.3
  },
  {
    id: 3,
    nombre: 'Campeonato Nacional 2023',
    fechaInicio: '2023-09-05',
    fechaFin: '2023-12-15',
    estado: 'En curso',
    ganador: null,
    participantes: 12,
    partidas: 36,
    promedioPuntos: 85.7
  },
  {
    id: 4,
    nombre: 'Torneo Primavera 2024',
    fechaInicio: '2024-03-01',
    fechaFin: '2024-05-30',
    estado: 'Planificado',
    ganador: null,
    participantes: 10,
    partidas: 0,
    promedioPuntos: 0
  }
]);

// Datos para gráficos
const clubesRanking = ref([
  { nombre: 'Club Domino A', campeonatosGanados: 5, participaciones: 8, puntosTotales: 720 },
  { nombre: 'Club Domino B', campeonatosGanados: 3, participaciones: 7, puntosTotales: 650 },
  { nombre: 'Club Domino C', campeonatosGanados: 2, participaciones: 8, puntosTotales: 580 },
  { nombre: 'Club Domino D', campeonatosGanados: 1, participaciones: 6, puntosTotales: 420 },
  { nombre: 'Club Domino E', campeonatosGanados: 0, participaciones: 5, puntosTotales: 350 }
]);

// Estadísticas generales
const estadisticasGenerales = computed(() => {
  const totalCampeonatos = campeonatos.value.length;
  const campeonatosFinalizados = campeonatos.value.filter(c => c.estado === 'Finalizado').length;
  const campeonatosEnCurso = campeonatos.value.filter(c => c.estado === 'En curso').length;
  const campeonatosPlanificados = campeonatos.value.filter(c => c.estado === 'Planificado').length;
  
  const totalPartidas = campeonatos.value.reduce((sum, c) => sum + c.partidas, 0);
  const promedioParticipantes = campeonatos.value.reduce((sum, c) => sum + c.participantes, 0) / totalCampeonatos;
  
  return {
    totalCampeonatos,
    campeonatosFinalizados,
    campeonatosEnCurso,
    campeonatosPlanificados,
    totalPartidas,
    promedioParticipantes: promedioParticipantes.toFixed(1)
  };
});

// Filtros
const anioFiltro = ref('todos');
const estadoFiltro = ref('todos');

// Años disponibles para filtrar
const aniosDisponibles = computed(() => {
  const anios = new Set<string>();
  campeonatos.value.forEach(c => {
    anios.add(c.fechaInicio.split('-')[0]);
    if (c.fechaFin) {
      anios.add(c.fechaFin.split('-')[0]);
    }
  });
  return ['todos', ...Array.from(anios).sort()];
});

// Campeonatos filtrados
const campeonatosFiltrados = computed(() => {
  let resultado = [...campeonatos.value];
  
  if (anioFiltro.value !== 'todos') {
    resultado = resultado.filter(c => 
      c.fechaInicio.startsWith(anioFiltro.value) || 
      (c.fechaFin && c.fechaFin.startsWith(anioFiltro.value))
    );
  }
  
  if (estadoFiltro.value !== 'todos') {
    resultado = resultado.filter(c => c.estado === estadoFiltro.value);
  }
  
  return resultado;
});
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Estadísticas de Campeonatos</h1>
    
    <!-- Tarjetas de estadísticas generales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white border rounded-md shadow-sm p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Total de Campeonatos</h3>
        <div class="flex items-end">
          <span class="text-2xl font-bold">{{ estadisticasGenerales.totalCampeonatos }}</span>
          <div class="ml-2 text-xs">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              <span>{{ estadisticasGenerales.campeonatosFinalizados }} finalizados</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
              <span>{{ estadisticasGenerales.campeonatosEnCurso }} en curso</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
              <span>{{ estadisticasGenerales.campeonatosPlanificados }} planificados</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white border rounded-md shadow-sm p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Total de Partidas</h3>
        <div class="flex items-end">
          <span class="text-2xl font-bold">{{ estadisticasGenerales.totalPartidas }}</span>
          <span class="ml-2 text-xs text-gray-500">en todos los campeonatos</span>
        </div>
      </div>
      
      <div class="bg-white border rounded-md shadow-sm p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Promedio de Participantes</h3>
        <div class="flex items-end">
          <span class="text-2xl font-bold">{{ estadisticasGenerales.promedioParticipantes }}</span>
          <span class="ml-2 text-xs text-gray-500">clubes por campeonato</span>
        </div>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 mb-6">
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">
          Año
          <select 
            id="anio" 
            v-model="anioFiltro" 
            class="px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
          >
            <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
              {{ anio === 'todos' ? 'Todos los años' : anio }}
            </option>
          </select>
        </label>
      </div>
      
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">
          Estado
          <select 
            id="estado" 
            v-model="estadoFiltro" 
            class="px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
          >
            <option value="todos">Todos los estados</option>
            <option value="Planificado">Planificado</option>
            <option value="En curso">En curso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </label>
      </div>
    </div>
    
    <!-- Tabla de campeonatos -->
    <div class="bg-white border rounded-md shadow-sm overflow-hidden mb-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partidas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio Puntos</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganador</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="campeonato in campeonatosFiltrados" :key="campeonato.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ campeonato.nombre }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ campeonato.fechaInicio }} - {{ campeonato.fechaFin || 'En progreso' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full" 
                :class="{
                  'bg-green-100 text-green-800': campeonato.estado === 'Finalizado',
                  'bg-blue-100 text-blue-800': campeonato.estado === 'En curso',
                  'bg-gray-100 text-gray-800': campeonato.estado === 'Planificado'
                }"
              >
                {{ campeonato.estado }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ campeonato.participantes }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ campeonato.partidas }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ campeonato.promedioPuntos > 0 ? campeonato.promedioPuntos : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ campeonato.ganador || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Ranking de clubes -->
    <h2 class="text-xl font-bold mb-4">Ranking de Clubes</h2>
    <div class="bg-white border rounded-md shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campeonatos Ganados</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participaciones</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos Totales</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(club, index) in clubesRanking" :key="club.nombre">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <span 
                class="inline-flex items-center justify-center h-6 w-6 rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-800': index === 0,
                  'bg-gray-200 text-gray-800': index === 1,
                  'bg-orange-100 text-orange-800': index === 2,
                  'bg-gray-50 text-gray-600': index > 2
                }"
              >
                {{ index + 1 }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ club.nombre }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.campeonatosGanados }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.participaciones }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ club.puntosTotales }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 