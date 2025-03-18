<script setup lang="ts">
// Componente para gestionar campeonatos
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
    participantes: [
      { id: 1, nombre: 'Club Domino A', puntos: 120 },
      { id: 2, nombre: 'Club Domino B', puntos: 95 },
      { id: 3, nombre: 'Club Domino C', puntos: 85 }
    ]
  },
  {
    id: 2,
    nombre: 'Torneo Verano 2023',
    fechaInicio: '2023-07-10',
    fechaFin: '2023-08-20',
    estado: 'Finalizado',
    ganador: 'Club Domino B',
    participantes: [
      { id: 1, nombre: 'Club Domino A', puntos: 75 },
      { id: 2, nombre: 'Club Domino B', puntos: 90 },
      { id: 4, nombre: 'Club Domino D', puntos: 60 }
    ]
  },
  {
    id: 3,
    nombre: 'Campeonato Nacional 2023',
    fechaInicio: '2023-09-05',
    fechaFin: '2023-12-15',
    estado: 'En curso',
    ganador: null,
    participantes: [
      { id: 1, nombre: 'Club Domino A', puntos: 45 },
      { id: 2, nombre: 'Club Domino B', puntos: 40 },
      { id: 3, nombre: 'Club Domino C', puntos: 50 },
      { id: 4, nombre: 'Club Domino D', puntos: 35 },
      { id: 5, nombre: 'Club Domino E', puntos: 30 }
    ]
  },
  {
    id: 4,
    nombre: 'Torneo Primavera 2024',
    fechaInicio: '2024-03-01',
    fechaFin: '2024-05-30',
    estado: 'Planificado',
    ganador: null,
    participantes: []
  }
]);

// Campeonato seleccionado para ver detalles
const campeonatoSeleccionado = ref<number | null>(null);

// Filtros
const estadoFiltro = ref('todos');
const nombreFiltro = ref('');

// Campeonatos filtrados
const campeonatosFiltrados = computed(() => {
  let resultado = [...campeonatos.value];
  
  if (estadoFiltro.value !== 'todos') {
    resultado = resultado.filter(campeonato => campeonato.estado === estadoFiltro.value);
  }
  
  if (nombreFiltro.value) {
    const busqueda = nombreFiltro.value.toLowerCase();
    resultado = resultado.filter(campeonato => 
      campeonato.nombre.toLowerCase().includes(busqueda)
    );
  }
  
  return resultado;
});

// Obtener detalles del campeonato seleccionado
const detallesCampeonato = computed(() => {
  if (campeonatoSeleccionado.value === null) return null;
  return campeonatos.value.find(c => c.id === campeonatoSeleccionado.value) || null;
});

// Seleccionar un campeonato para ver detalles
const seleccionarCampeonato = (id: number) => {
  campeonatoSeleccionado.value = id;
};

// Cerrar detalles
const cerrarDetalles = () => {
  campeonatoSeleccionado.value = null;
};

// Crear nuevo campeonato (función simulada)
const crearCampeonato = () => {
  alert('Funcionalidad para crear nuevo campeonato (pendiente de implementar)');
};
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Gestión de Campeonatos</h1>
    
    <!-- Filtros y botón de nuevo campeonato -->
    <div class="flex flex-wrap justify-between items-end gap-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            Estado
            <select 
              v-model="estadoFiltro" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
            >
              <option value="todos">Todos los estados</option>
              <option value="Planificado">Planificado</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </label>
        </div>
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            Buscar por nombre
            <input 
              v-model="nombreFiltro" 
              type="text" 
              placeholder="Nombre del campeonato" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
            />
          </label>
        </div>
      </div>
      
      <button 
        @click="crearCampeonato" 
        class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
      >
        Nuevo Campeonato
      </button>
    </div>
    
    <!-- Lista de campeonatos -->
    <div v-if="!detallesCampeonato" class="bg-white border rounded-md shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganador</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="campeonato in campeonatosFiltrados" :key="campeonato.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ campeonato.nombre }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ campeonato.fechaInicio }} - {{ campeonato.fechaFin }}
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ campeonato.participantes.length }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ campeonato.ganador || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button 
                @click="seleccionarCampeonato(campeonato.id)" 
                class="text-blue-600 hover:text-blue-900"
              >
                Ver detalles
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Detalles del campeonato -->
    <div v-if="detallesCampeonato" class="bg-white border rounded-md shadow-sm p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-xl font-bold">{{ detallesCampeonato.nombre }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ detallesCampeonato.fechaInicio }} - {{ detallesCampeonato.fechaFin }}
          </p>
        </div>
        <div class="flex gap-2">
          <button 
            class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            @click="cerrarDetalles"
          >
            Volver
          </button>
          <button 
            class="px-3 py-1 bg-black text-white rounded-md text-sm hover:bg-gray-800"
          >
            Editar
          </button>
        </div>
      </div>
      
      <div class="flex gap-6">
        <!-- Información general -->
        <div class="w-1/3">
          <h3 class="text-lg font-medium mb-3">Información general</h3>
          <div class="space-y-3">
            <div>
              <p class="text-sm font-medium text-gray-500">Estado</p>
              <p class="text-sm">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full" 
                  :class="{
                    'bg-green-100 text-green-800': detallesCampeonato.estado === 'Finalizado',
                    'bg-blue-100 text-blue-800': detallesCampeonato.estado === 'En curso',
                    'bg-gray-100 text-gray-800': detallesCampeonato.estado === 'Planificado'
                  }"
                >
                  {{ detallesCampeonato.estado }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Ganador</p>
              <p class="text-sm">{{ detallesCampeonato.ganador || 'No determinado' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Número de participantes</p>
              <p class="text-sm">{{ detallesCampeonato.participantes.length }}</p>
            </div>
          </div>
          
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-3">Acciones</h3>
            <div class="space-y-2">
              <button class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left hover:bg-gray-50">
                Añadir participante
              </button>
              <button class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left hover:bg-gray-50">
                Registrar resultado
              </button>
              <button class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left hover:bg-gray-50">
                Generar calendario
              </button>
              <button class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left hover:bg-gray-50 text-red-600">
                Eliminar campeonato
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tabla de participantes -->
        <div class="w-2/3">
          <h3 class="text-lg font-medium mb-3">Participantes</h3>
          <div class="bg-white border rounded-md shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(participante, index) in [...detallesCampeonato.participantes].sort((a, b) => b.puntos - a.puntos)" :key="participante.id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ participante.nombre }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ participante.puntos }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 class="text-lg font-medium mt-6 mb-3">Próximos partidos</h3>
          <div v-if="detallesCampeonato.estado !== 'Finalizado'" class="bg-white border rounded-md shadow-sm p-4">
            <p v-if="detallesCampeonato.estado === 'Planificado'" class="text-sm text-gray-500">
              El calendario de partidos se generará cuando comience el campeonato.
            </p>
            <div v-else class="space-y-3">
              <div class="p-3 border rounded-md">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-medium">Club Domino A vs Club Domino B</p>
                    <p class="text-xs text-gray-500">15 de noviembre, 2023 - 18:00</p>
                  </div>
                  <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Registrar resultado
                  </button>
                </div>
              </div>
              <div class="p-3 border rounded-md">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-medium">Club Domino C vs Club Domino E</p>
                    <p class="text-xs text-gray-500">17 de noviembre, 2023 - 19:30</p>
                  </div>
                  <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Registrar resultado
                  </button>
                </div>
              </div>
              <div class="p-3 border rounded-md">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-medium">Club Domino D vs Club Domino A</p>
                    <p class="text-xs text-gray-500">20 de noviembre, 2023 - 18:00</p>
                  </div>
                  <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Registrar resultado
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-white border rounded-md shadow-sm p-4">
            <p class="text-sm text-gray-500">
              El campeonato ha finalizado. No hay partidos pendientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 