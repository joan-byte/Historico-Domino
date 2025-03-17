<script setup lang="ts">
// Componente para mostrar estadísticas de resultados de partidas
import { ref, computed, onMounted } from 'vue';

// Datos de resultados (simulados)
const resultados = ref([
  {
    id: 1,
    fecha: '2023-05-15',
    campeonato: 'Campeonato Regional 2023',
    club: 'Club Domino A',
    equipoA: 'Equipo Rojo',
    equipoB: 'Equipo Verde',
    puntosEquipoA: 5,
    puntosEquipoB: 3,
    ganador: 'Equipo Rojo',
    estado: 'Finalizado'
  },
  {
    id: 2,
    fecha: '2023-06-20',
    campeonato: 'Torneo Verano 2023',
    club: 'Club Domino B',
    equipoA: 'Equipo Amarillo',
    equipoB: 'Equipo Naranja',
    puntosEquipoA: 4,
    puntosEquipoB: 4,
    ganador: 'Empate',
    estado: 'Finalizado'
  },
  {
    id: 3,
    fecha: '2023-07-10',
    campeonato: 'Campeonato Nacional 2023',
    club: 'Club Domino C',
    equipoA: 'Equipo Morado',
    equipoB: 'Equipo Blanco',
    puntosEquipoA: 2,
    puntosEquipoB: 6,
    ganador: 'Equipo Blanco',
    estado: 'Finalizado'
  },
  {
    id: 4,
    fecha: '2023-08-05',
    campeonato: 'Campeonato Regional 2023',
    club: 'Club Domino D',
    equipoA: 'Equipo Negro',
    equipoB: 'Equipo Gris',
    puntosEquipoA: 7,
    puntosEquipoB: 1,
    ganador: 'Equipo Negro',
    estado: 'Finalizado'
  },
  {
    id: 5,
    fecha: '2023-09-12',
    campeonato: 'Torneo Verano 2023',
    club: 'Club Domino E',
    equipoA: 'Equipo Marrón',
    equipoB: 'Equipo Rojo',
    puntosEquipoA: 3,
    puntosEquipoB: 3,
    ganador: 'Empate',
    estado: 'Finalizado'
  },
  {
    id: 6,
    fecha: '2023-10-20',
    campeonato: 'Campeonato Nacional 2023',
    club: 'Club Domino A',
    equipoA: 'Equipo Azul',
    equipoB: 'Equipo Verde',
    puntosEquipoA: 4,
    puntosEquipoB: 2,
    ganador: 'Equipo Azul',
    estado: 'Finalizado'
  },
  {
    id: 7,
    fecha: '2023-11-15',
    campeonato: 'Campeonato Regional 2023',
    club: 'Club Domino B',
    equipoA: 'Equipo Amarillo',
    equipoB: 'Equipo Morado',
    puntosEquipoA: 5,
    puntosEquipoB: 5,
    ganador: 'Empate',
    estado: 'Finalizado'
  },
  {
    id: 8,
    fecha: '2023-12-05',
    campeonato: 'Torneo Primavera 2024',
    club: 'Club Domino C',
    equipoA: 'Equipo Naranja',
    equipoB: 'Equipo Negro',
    puntosEquipoA: 2,
    puntosEquipoB: 8,
    ganador: 'Equipo Negro',
    estado: 'Finalizado'
  },
  {
    id: 9,
    fecha: '2024-01-10',
    campeonato: 'Torneo Primavera 2024',
    club: 'Club Domino D',
    equipoA: 'Equipo Blanco',
    equipoB: 'Equipo Gris',
    puntosEquipoA: 6,
    puntosEquipoB: 3,
    ganador: 'Equipo Blanco',
    estado: 'Finalizado'
  },
  {
    id: 10,
    fecha: '2024-02-20',
    campeonato: 'Torneo Primavera 2024',
    club: 'Club Domino E',
    equipoA: 'Equipo Marrón',
    equipoB: 'Equipo Azul',
    puntosEquipoA: 4,
    puntosEquipoB: 4,
    ganador: 'Empate',
    estado: 'Programado'
  }
]);

// Filtros
const filtros = ref({
  año: '',
  campeonato: '',
  club: ''
});

// Opciones para los filtros
const años = computed(() => {
  const añosUnicos = new Set(resultados.value.map(r => new Date(r.fecha).getFullYear()));
  return Array.from(añosUnicos).sort();
});

const campeonatos = computed(() => {
  const campeonatosUnicos = new Set(resultados.value.map(r => r.campeonato));
  return Array.from(campeonatosUnicos);
});

const clubes = computed(() => {
  const clubesUnicos = new Set(resultados.value.map(r => r.club));
  return Array.from(clubesUnicos);
});

// Resultados filtrados
const resultadosFiltrados = computed(() => {
  return resultados.value.filter(resultado => {
    // Filtro por año
    if (filtros.value.año && new Date(resultado.fecha).getFullYear() !== parseInt(filtros.value.año)) {
      return false;
    }
    
    // Filtro por campeonato
    if (filtros.value.campeonato && resultado.campeonato !== filtros.value.campeonato) {
      return false;
    }
    
    // Filtro por club
    if (filtros.value.club && resultado.club !== filtros.value.club) {
      return false;
    }
    
    return true;
  });
});

// Estadísticas generales
const estadisticasGenerales = computed(() => {
  const resultados = resultadosFiltrados.value;
  const totalPartidas = resultados.length;
  const partidasFinalizadas = resultados.filter(r => r.estado === 'Finalizado').length;
  const partidasProgramadas = resultados.filter(r => r.estado === 'Programado').length;
  const empates = resultados.filter(r => r.ganador === 'Empate').length;
  
  // Calcular promedio de puntos por partida
  let totalPuntos = 0;
  resultados.forEach(r => {
    totalPuntos += r.puntosEquipoA + r.puntosEquipoB;
  });
  const promedioPuntos = totalPartidas > 0 ? (totalPuntos / totalPartidas).toFixed(1) : '0';
  
  return {
    totalPartidas,
    partidasFinalizadas,
    partidasProgramadas,
    empates,
    promedioPuntos
  };
});

// Estadísticas por equipo
const estadisticasPorEquipo = computed(() => {
  const equipos = new Map();
  
  // Recopilar todos los equipos
  resultadosFiltrados.value.forEach(r => {
    if (!equipos.has(r.equipoA)) {
      equipos.set(r.equipoA, { 
        nombre: r.equipoA, 
        partidas: 0, 
        victorias: 0, 
        empates: 0, 
        derrotas: 0, 
        puntosFavor: 0, 
        puntosContra: 0 
      });
    }
    
    if (!equipos.has(r.equipoB)) {
      equipos.set(r.equipoB, { 
        nombre: r.equipoB, 
        partidas: 0, 
        victorias: 0, 
        empates: 0, 
        derrotas: 0, 
        puntosFavor: 0, 
        puntosContra: 0 
      });
    }
  });
  
  // Calcular estadísticas para cada equipo
  resultadosFiltrados.value.forEach(r => {
    if (r.estado !== 'Finalizado') return;
    
    const equipoA = equipos.get(r.equipoA);
    const equipoB = equipos.get(r.equipoB);
    
    // Actualizar partidas jugadas
    equipoA.partidas++;
    equipoB.partidas++;
    
    // Actualizar puntos a favor y en contra
    equipoA.puntosFavor += r.puntosEquipoA;
    equipoA.puntosContra += r.puntosEquipoB;
    equipoB.puntosFavor += r.puntosEquipoB;
    equipoB.puntosContra += r.puntosEquipoA;
    
    // Actualizar victorias, empates y derrotas
    if (r.ganador === 'Empate') {
      equipoA.empates++;
      equipoB.empates++;
    } else if (r.ganador === r.equipoA) {
      equipoA.victorias++;
      equipoB.derrotas++;
    } else if (r.ganador === r.equipoB) {
      equipoB.victorias++;
      equipoA.derrotas++;
    }
  });
  
  // Convertir a array y ordenar por victorias (descendente)
  return Array.from(equipos.values())
    .filter(equipo => equipo.partidas > 0)
    .sort((a, b) => b.victorias - a.victorias);
});

// Estadísticas por club
const estadisticasPorClub = computed(() => {
  const clubes = new Map();
  
  // Recopilar todos los clubes
  resultadosFiltrados.value.forEach(r => {
    if (!clubes.has(r.club)) {
      clubes.set(r.club, { 
        nombre: r.club, 
        partidas: 0, 
        victorias: 0, 
        empates: 0, 
        derrotas: 0 
      });
    }
  });
  
  // Calcular estadísticas para cada club
  resultadosFiltrados.value.forEach(r => {
    if (r.estado !== 'Finalizado') return;
    
    const club = clubes.get(r.club);
    club.partidas++;
    
    if (r.ganador === 'Empate') {
      club.empates++;
    } else if (r.ganador === r.equipoA || r.ganador === r.equipoB) {
      // Si alguno de los equipos que juega en el club gana, se considera victoria para el club
      club.victorias++;
    } else {
      club.derrotas++;
    }
  });
  
  // Convertir a array y ordenar por victorias (descendente)
  return Array.from(clubes.values())
    .filter(club => club.partidas > 0)
    .sort((a, b) => b.victorias - a.victorias);
});

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    año: '',
    campeonato: '',
    club: ''
  };
};

// Función para formatear fecha
const formatearFecha = (fecha: string) => {
  const opciones: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Estadísticas de Resultados</h1>
      <a 
        href="/resultados" 
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
      >
        Ver Resultados
      </a>
    </div>
    
    <!-- Filtros -->
    <div class="bg-white border rounded-md shadow-sm p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">Filtros</h2>
        <button 
          @click="limpiarFiltros" 
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          Limpiar filtros
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select 
            v-model="filtros.año" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los años</option>
            <option v-for="año in años" :key="año" :value="año">
              {{ año }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Campeonato</label>
          <select 
            v-model="filtros.campeonato" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los campeonatos</option>
            <option v-for="campeonato in campeonatos" :key="campeonato" :value="campeonato">
              {{ campeonato }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Club</label>
          <select 
            v-model="filtros.club" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los clubes</option>
            <option v-for="club in clubes" :key="club" :value="club">
              {{ club }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Estadísticas generales -->
    <div class="mb-6">
      <h2 class="text-lg font-medium mb-4">Estadísticas Generales</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white border rounded-md shadow-sm p-4">
          <div class="text-sm text-gray-500 mb-1">Total de Partidas</div>
          <div class="text-2xl font-bold">{{ estadisticasGenerales.totalPartidas }}</div>
        </div>
        
        <div class="bg-white border rounded-md shadow-sm p-4">
          <div class="text-sm text-gray-500 mb-1">Partidas Finalizadas</div>
          <div class="text-2xl font-bold">{{ estadisticasGenerales.partidasFinalizadas }}</div>
        </div>
        
        <div class="bg-white border rounded-md shadow-sm p-4">
          <div class="text-sm text-gray-500 mb-1">Partidas Programadas</div>
          <div class="text-2xl font-bold">{{ estadisticasGenerales.partidasProgramadas }}</div>
        </div>
        
        <div class="bg-white border rounded-md shadow-sm p-4">
          <div class="text-sm text-gray-500 mb-1">Empates</div>
          <div class="text-2xl font-bold">{{ estadisticasGenerales.empates }}</div>
        </div>
        
        <div class="bg-white border rounded-md shadow-sm p-4">
          <div class="text-sm text-gray-500 mb-1">Promedio de Puntos</div>
          <div class="text-2xl font-bold">{{ estadisticasGenerales.promedioPuntos }}</div>
        </div>
      </div>
    </div>
    
    <!-- Estadísticas por equipo -->
    <div class="mb-6">
      <h2 class="text-lg font-medium mb-4">Rendimiento por Equipo</h2>
      <div class="bg-white border rounded-md shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partidas
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Victorias
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empates
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Derrotas
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos a Favor
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos en Contra
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferencia
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="estadisticasPorEquipo.length === 0">
                <td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500">
                  No hay datos disponibles con los filtros aplicados
                </td>
              </tr>
              <tr v-for="(equipo, index) in estadisticasPorEquipo" :key="equipo.nombre" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center">
                    <span class="text-gray-900">{{ index + 1 }}.</span>
                    <span class="ml-2">{{ equipo.nombre }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ equipo.partidas }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  {{ equipo.victorias }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ equipo.empates }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                  {{ equipo.derrotas }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ equipo.puntosFavor }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ equipo.puntosContra }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" 
                    :class="{ 
                      'text-green-600': equipo.puntosFavor > equipo.puntosContra,
                      'text-red-500': equipo.puntosFavor < equipo.puntosContra,
                      'text-gray-500': equipo.puntosFavor === equipo.puntosContra
                    }">
                  {{ equipo.puntosFavor - equipo.puntosContra }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Estadísticas por club -->
    <div>
      <h2 class="text-lg font-medium mb-4">Rendimiento por Club</h2>
      <div class="bg-white border rounded-md shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partidas
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Victorias
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empates
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Derrotas
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Victoria
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="estadisticasPorClub.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                  No hay datos disponibles con los filtros aplicados
                </td>
              </tr>
              <tr v-for="(club, index) in estadisticasPorClub" :key="club.nombre" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center">
                    <span class="text-gray-900">{{ index + 1 }}.</span>
                    <span class="ml-2">{{ club.nombre }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ club.partidas }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  {{ club.victorias }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ club.empates }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                  {{ club.derrotas }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {{ club.partidas > 0 ? ((club.victorias / club.partidas) * 100).toFixed(1) + '%' : '0%' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 