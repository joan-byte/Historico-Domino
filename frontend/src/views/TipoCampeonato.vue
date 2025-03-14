<script setup lang="ts">
// Componente para gestionar tipos de campeonatos
import { ref } from 'vue';

// Datos de ejemplo para los tipos de campeonatos
const tiposCampeonato = ref([
  {
    id: 1,
    nombre: 'Liga Regular',
    descripcion: 'Todos los equipos se enfrentan entre sí en partidos de ida y vuelta.',
    duracionPromedio: '3-4 meses',
    puntuacion: 'Victoria: 3 puntos, Empate: 1 punto, Derrota: 0 puntos',
    activo: true
  },
  {
    id: 2,
    nombre: 'Eliminación Directa',
    descripcion: 'Los equipos se enfrentan en rondas eliminatorias hasta determinar un ganador.',
    duracionPromedio: '2-3 semanas',
    puntuacion: 'Avanza el ganador de cada enfrentamiento',
    activo: true
  },
  {
    id: 3,
    nombre: 'Grupos + Eliminatorias',
    descripcion: 'Primera fase de grupos seguida de rondas eliminatorias entre los mejores clasificados.',
    duracionPromedio: '1-2 meses',
    puntuacion: 'Fase de grupos: Victoria: 3 puntos, Empate: 1 punto, Derrota: 0 puntos. Fase eliminatoria: Avanza el ganador',
    activo: true
  },
  {
    id: 4,
    nombre: 'Torneo Suizo',
    descripcion: 'Sistema de emparejamiento que evita que los participantes jueguen contra los mismos oponentes.',
    duracionPromedio: '2-3 semanas',
    puntuacion: 'Victoria: 1 punto, Derrota: 0 puntos',
    activo: false
  }
]);

// Estado para el formulario de nuevo tipo
const mostrarFormulario = ref(false);
const nuevoTipo = ref({
  nombre: '',
  descripcion: '',
  duracionPromedio: '',
  puntuacion: '',
  activo: true
});

// Función para alternar la visibilidad del formulario
const toggleFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value;
  if (mostrarFormulario.value) {
    // Resetear el formulario
    nuevoTipo.value = {
      nombre: '',
      descripcion: '',
      duracionPromedio: '',
      puntuacion: '',
      activo: true
    };
  }
};

// Función para guardar un nuevo tipo de campeonato
const guardarTipo = () => {
  // Validación básica
  if (!nuevoTipo.value.nombre || !nuevoTipo.value.descripcion) {
    alert('Por favor, completa los campos obligatorios');
    return;
  }
  
  // Añadir el nuevo tipo a la lista
  tiposCampeonato.value.push({
    id: tiposCampeonato.value.length + 1,
    ...nuevoTipo.value
  });
  
  // Cerrar el formulario
  toggleFormulario();
};

// Función para cambiar el estado activo de un tipo
const cambiarEstado = (id: number) => {
  const tipo = tiposCampeonato.value.find(t => t.id === id);
  if (tipo) {
    tipo.activo = !tipo.activo;
  }
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Tipos de Campeonato</h1>
      <button 
        @click="toggleFormulario" 
        class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
      >
        {{ mostrarFormulario ? 'Cancelar' : 'Nuevo Tipo' }}
      </button>
    </div>
    
    <!-- Formulario para nuevo tipo de campeonato -->
    <div v-if="mostrarFormulario" class="bg-white border rounded-md shadow-sm p-6 mb-6">
      <h2 class="text-lg font-medium mb-4">Crear Nuevo Tipo de Campeonato</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-1">
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre *</label>
          <input 
            id="nombre" 
            v-model="nuevoTipo.nombre" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Ej: Liga Regular"
          />
        </div>
        
        <div class="space-y-1">
          <label for="duracion" class="block text-sm font-medium text-gray-700">Duración Promedio</label>
          <input 
            id="duracion" 
            v-model="nuevoTipo.duracionPromedio" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Ej: 3-4 meses"
          />
        </div>
        
        <div class="space-y-1 md:col-span-2">
          <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción *</label>
          <textarea 
            id="descripcion" 
            v-model="nuevoTipo.descripcion" 
            rows="3" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Describe cómo funciona este tipo de campeonato"
          ></textarea>
        </div>
        
        <div class="space-y-1 md:col-span-2">
          <label for="puntuacion" class="block text-sm font-medium text-gray-700">Sistema de Puntuación</label>
          <textarea 
            id="puntuacion" 
            v-model="nuevoTipo.puntuacion" 
            rows="2" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Ej: Victoria: 3 puntos, Empate: 1 punto, Derrota: 0 puntos"
          ></textarea>
        </div>
        
        <div class="space-y-1">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="nuevoTipo.activo" 
              class="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Activo</span>
          </label>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="guardarTipo" 
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Guardar
        </button>
      </div>
    </div>
    
    <!-- Lista de tipos de campeonato -->
    <div class="bg-white border rounded-md shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="tipo in tiposCampeonato" :key="tipo.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ tipo.nombre }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <div class="max-w-md">
                <p>{{ tipo.descripcion }}</p>
                <p v-if="tipo.puntuacion" class="mt-1 text-xs text-gray-500">
                  <span class="font-medium">Puntuación:</span> {{ tipo.puntuacion }}
                </p>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ tipo.duracionPromedio }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full" 
                :class="tipo.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ tipo.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex space-x-2">
                <button 
                  @click="cambiarEstado(tipo.id)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  {{ tipo.activo ? 'Desactivar' : 'Activar' }}
                </button>
                <button class="text-gray-600 hover:text-gray-900">
                  Editar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Información adicional -->
    <div class="mt-6 bg-gray-50 border rounded-md p-4 text-sm text-gray-600">
      <h3 class="font-medium mb-2">¿Qué son los tipos de campeonato?</h3>
      <p>Los tipos de campeonato definen la estructura y reglas básicas para organizar competiciones. Cada tipo tiene sus propias características en cuanto a duración, sistema de puntuación y formato de competición.</p>
      <p class="mt-2">Al crear un nuevo campeonato, podrás seleccionar uno de estos tipos como base para configurar automáticamente sus reglas y estructura.</p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 