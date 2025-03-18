<script setup lang="ts">
// Componente para eliminar un jugador
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const licencia = ref(route.params.licencia as string);

// Estado del componente
const jugador = ref<any>(null);
const isLoading = ref(true);
const error = ref('');
const confirmacion = ref(false);

// Cargar datos del jugador
onMounted(async () => {
  if (licencia.value) {
    try {
      // Aquí iría la llamada al API para obtener los datos del jugador
      // En este ejemplo usamos datos de prueba
      setTimeout(() => {
        jugador.value = {
          licencia: licencia.value,
          nombre: 'Juan Pérez',
          apodo: 'El Maestro',
          club: 'Club Domino A',
          nivel: 'Avanzado',
          partidas: 150,
          victorias: 98
        };
        isLoading.value = false;
      }, 500);
    } catch (err) {
      console.error('Error al cargar el jugador:', err);
      error.value = 'No se pudo cargar la información del jugador';
      isLoading.value = false;
    }
  } else {
    error.value = 'No se especificó un jugador válido';
    isLoading.value = false;
  }
});

const confirmarEliminacion = () => {
  confirmacion.value = true;
};

const cancelarEliminacion = () => {
  router.push('/jugadores');
};

const eliminarJugador = async () => {
  if (!confirmacion.value) {
    confirmarEliminacion();
    return;
  }
  
  try {
    // Aquí iría la lógica para eliminar el jugador en la base de datos
    console.log('Eliminando jugador:', licencia.value);
    
    // Redirigir a la lista de jugadores
    router.push('/jugadores');
  } catch (err) {
    console.error('Error al eliminar el jugador:', err);
    error.value = 'No se pudo eliminar el jugador';
  }
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Eliminar Jugador</h1>
      <div class="flex gap-2">
        <button 
          @click="cancelarEliminacion"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          @click="eliminarJugador"
          class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          :disabled="isLoading"
        >
          {{ confirmacion ? 'Confirmar eliminación' : 'Eliminar' }}
        </button>
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
      {{ error }}
    </div>
    
    <!-- Contenido -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
    </div>
    
    <div v-else-if="jugador" class="bg-white border rounded-md shadow-sm p-6">
      <div v-if="confirmacion" class="mb-6 p-4 bg-red-50 border border-red-300 rounded-md">
        <p class="text-red-800 font-medium">¿Estás seguro de que deseas eliminar este jugador?</p>
        <p class="text-red-700 text-sm mt-1">Esta acción no se puede deshacer.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-lg font-medium mb-4">Información del jugador</h2>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Licencia</p>
              <p class="font-medium">{{ jugador.licencia }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Nombre</p>
              <p class="font-medium">{{ jugador.nombre }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Apodo</p>
              <p class="font-medium">{{ jugador.apodo }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Club</p>
              <p class="font-medium">{{ jugador.club }}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 class="text-lg font-medium mb-4">Estadísticas</h2>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Nivel</p>
              <p class="font-medium">{{ jugador.nivel }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Partidas jugadas</p>
              <p class="font-medium">{{ jugador.partidas }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Victorias</p>
              <p class="font-medium">{{ jugador.victorias }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Porcentaje de victorias</p>
              <p class="font-medium">{{ Math.round((jugador.victorias / jugador.partidas) * 100) }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 