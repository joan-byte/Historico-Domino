<script setup lang="ts">
// Componente para mostrar el listado de resultados de partidas
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
  campeonato: '',
  club: '',
  equipo: '',
  estado: '',
  fechaDesde: '',
  fechaHasta: ''
});

// Opciones para los filtros
const campeonatos = computed(() => {
  const campeonatosUnicos = new Set(resultados.value.map(r => r.campeonato));
  return Array.from(campeonatosUnicos);
});

const clubes = computed(() => {
  const clubesUnicos = new Set(resultados.value.map(r => r.club));
  return Array.from(clubesUnicos);
});

const equipos = computed(() => {
  const equiposSet = new Set<string>();
  resultados.value.forEach(r => {
    equiposSet.add(r.equipoA);
    equiposSet.add(r.equipoB);
  });
  return Array.from(equiposSet);
});

const estados = computed(() => {
  const estadosUnicos = new Set(resultados.value.map(r => r.estado));
  return Array.from(estadosUnicos);
});

// Resultados filtrados
const resultadosFiltrados = computed(() => {
  return resultados.value.filter(resultado => {
    // Filtro por campeonato
    if (filtros.value.campeonato && resultado.campeonato !== filtros.value.campeonato) {
      return false;
    }
    
    // Filtro por club
    if (filtros.value.club && resultado.club !== filtros.value.club) {
      return false;
    }
    
    // Filtro por equipo
    if (filtros.value.equipo && resultado.equipoA !== filtros.value.equipo && resultado.equipoB !== filtros.value.equipo) {
      return false;
    }
    
    // Filtro por estado
    if (filtros.value.estado && resultado.estado !== filtros.value.estado) {
      return false;
    }
    
    // Filtro por fecha desde
    if (filtros.value.fechaDesde && resultado.fecha < filtros.value.fechaDesde) {
      return false;
    }
    
    // Filtro por fecha hasta
    if (filtros.value.fechaHasta && resultado.fecha > filtros.value.fechaHasta) {
      return false;
    }
    
    return true;
  });
});

// Función para limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    campeonato: '',
    club: '',
    equipo: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  };
};

// Función para eliminar un resultado (simulada)
const eliminarResultado = (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar este resultado?')) {
    const index = resultados.value.findIndex(r => r.id === id);
    if (index !== -1) {
      resultados.value.splice(index, 1);
      alert('Resultado eliminado correctamente');
    }
  }
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
      <h1 class="text-2xl font-bold">Resultados de Partidas</h1>
      <a 
        href="/resultados/nuevo" 
        class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
      >
        Nuevo Resultado
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
          <label for="campeonato-filtro" class="block text-sm font-medium text-gray-700 mb-1">Campeonato</label>
          <select 
            id="campeonato-filtro"
            name="campeonato-filtro"
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
          <label for="club-filtro" class="block text-sm font-medium text-gray-700 mb-1">Club</label>
          <select 
            id="club-filtro"
            name="club-filtro"
            v-model="filtros.club" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los clubes</option>
            <option v-for="club in clubes" :key="club" :value="club">
              {{ club }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="equipo-filtro" class="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
          <select 
            id="equipo-filtro"
            name="equipo-filtro"
            v-model="filtros.equipo" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los equipos</option>
            <option v-for="equipo in equipos" :key="equipo" :value="equipo">
              {{ equipo }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="estado-filtro" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select 
            id="estado-filtro"
            name="estado-filtro"
            v-model="filtros.estado" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los estados</option>
            <option v-for="estado in estados" :key="estado" :value="estado">
              {{ estado }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="fecha-desde" class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
          <input 
            id="fecha-desde"
            name="fecha-desde"
            type="date" 
            v-model="filtros.fechaDesde" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        
        <div>
          <label for="fecha-hasta" class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
          <input 
            id="fecha-hasta"
            name="fecha-hasta"
            type="date" 
            v-model="filtros.fechaHasta" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
    </div>
    
    <!-- Tabla de resultados -->
    <div class="bg-white border rounded-md shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campeonato
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipos
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resultado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="resultadosFiltrados.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                No se encontraron resultados con los filtros aplicados
              </td>
            </tr>
            <tr v-for="resultado in resultadosFiltrados" :key="resultado.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatearFecha(resultado.fecha) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ resultado.campeonato }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ resultado.club }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span>{{ resultado.equipoA }}</span>
                  <span>{{ resultado.equipoB }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                  <span :class="{ 'font-medium': resultado.ganador === resultado.equipoA }">
                    {{ resultado.puntosEquipoA }}
                  </span>
                  <span>-</span>
                  <span :class="{ 'font-medium': resultado.ganador === resultado.equipoB }">
                    {{ resultado.puntosEquipoB }}
                  </span>
                  <span v-if="resultado.ganador !== 'Empate'" class="ml-2 text-xs text-green-600">
                    {{ resultado.ganador }}
                  </span>
                  <span v-else class="ml-2 text-xs text-gray-500">
                    Empate
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': resultado.estado === 'Finalizado',
                    'bg-yellow-100 text-yellow-800': resultado.estado === 'Programado'
                  }"
                >
                  {{ resultado.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <a href="#" class="text-indigo-600 hover:text-indigo-900">Editar</a>
                  <button 
                    @click="eliminarResultado(resultado.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 