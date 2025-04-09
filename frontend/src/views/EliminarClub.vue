<script setup lang="ts">
// Componente para eliminar clubes
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClubs } from '../composables/useClubs';
import { clubService, type ClubResponse } from '../lib/clubService';
import StatusMessage from '../components/ui/StatusMessage.vue';

const router = useRouter();
const { clubs, fetchClubs, deleteClub, isLoading, error: generalError, sortedClubs } = useClubs();
const selectedClub = ref<ClubResponse | null>(null);
const showConfirmation = ref(false);
const showModal = ref(false);
const clubAEliminar = ref<ClubResponse | null>(null);
const errorEliminacion = ref('');

// Cargar la lista de clubes
onMounted(() => {
  fetchClubs();
});

// Seleccionar un club
const selectClub = (club: ClubResponse) => {
  selectedClub.value = club;
};

// Mostrar la confirmación de eliminación
const confirmarEliminacion = () => {
  if (!selectedClub.value) {
    generalError.value = 'Debe seleccionar un club para eliminar';
    return;
  }
  
  showConfirmation.value = true;
};

// Cancelar la eliminación
const cancelarEliminacion = () => {
  showConfirmation.value = false;
};

// Eliminar el club seleccionado
const eliminarClub = async () => {
  if (!selectedClub.value) {
    return;
  }
  
  isLoading.value = true;
  generalError.value = '';
  
  try {
    await clubService.delete(selectedClub.value.codigo_club);
    showConfirmation.value = false;
    
    // Actualizar la lista de clubes
    clubs.value = clubs.value.filter(club => club.codigo_club !== selectedClub.value?.codigo_club);
    
    // Limpiar la selección
    selectedClub.value = null;
  } catch (err: any) {
    console.error('Error al eliminar el club:', err);
    generalError.value = err.message || 'Ocurrió un error al eliminar el club';
  } finally {
    isLoading.value = false;
  }
};

// Iniciar proceso de eliminación
const intentarEliminarClub = (club: ClubResponse) => {
  errorEliminacion.value = ''; // Limpiar error anterior
  if (club.jugadores_count > 0) {
    // Mostrar error directamente si hay jugadores
    errorEliminacion.value = `No se puede eliminar el club ${club.nombre} (${club.codigo_club}) porque tiene ${club.jugadores_count} jugador(es) asociado(s). Elimine o reasigne los jugadores primero.`;
    showModal.value = false; // Asegurarse de que el modal no se muestre
    clubAEliminar.value = null; // Desseleccionar
  } else {
    // No hay jugadores, mostrar modal de confirmación
    clubAEliminar.value = club;
    showModal.value = true;
  }
};

// Confirmar y ejecutar la eliminación (desde el modal)
const confirmarEliminarClub = async () => {
  if (!clubAEliminar.value) return;
  
  errorEliminacion.value = ''; // Limpiar errores específicos
  
  try {
    await deleteClub(clubAEliminar.value.codigo_club);
    showModal.value = false;
    clubAEliminar.value = null;
  } catch (err: any) {
    console.error('Error al eliminar el club:', err);
    errorEliminacion.value = err.message || 'Ocurrió un error inesperado al intentar eliminar el club.';
    showModal.value = false; // Ocultar modal si hubo error
  }
};

// Cancelar eliminación (desde el modal)
const cancelarEliminar = () => {
  showModal.value = false;
  clubAEliminar.value = null;
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Eliminar Club</h1>
      <button 
        @click="volver"
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Volver
      </button>
    </div>
    
    <!-- Mensaje de error general/eliminación -->
    <div v-if="generalError || errorEliminacion" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ generalError || errorEliminacion }}
    </div>
    
    <!-- Estado de carga inicial -->
    <div v-if="isLoading" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
      Cargando clubes...
    </div>
    
    <!-- Lista de clubes vacía -->
    <div v-else-if="clubs.length === 0" class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
      No hay clubes disponibles para eliminar. 
      <router-link to="/clubes/crear" class="underline font-medium">Crear un nuevo club</router-link>.
    </div>
    
    <!-- Lista de clubes para seleccionar -->
    <div v-else class="bg-white border rounded-md shadow-sm p-6">
      <p class="text-gray-700 mb-4">Seleccione el club que desea eliminar:</p>
      
      <div class="border rounded-md overflow-hidden mb-6">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CP
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seleccionar
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="club in clubs" :key="club.codigo_club" 
                :class="{ 'bg-red-50': clubAEliminar?.codigo_club === club.codigo_club && showModal }">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ club.codigo_club }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ club.nombre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ club.cp }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ club.numero_club }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="intentarEliminarClub(club)" 
                        class="px-3 py-1 text-sm rounded-md" 
                        :class="clubAEliminar?.codigo_club === club.codigo_club && !showModal && errorEliminacion ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'"
                        :disabled="clubAEliminar?.codigo_club === club.codigo_club && !showModal && errorEliminacion">
                  {{ clubAEliminar?.codigo_club === club.codigo_club && !showModal && errorEliminacion ? 'Bloqueado' : 'Eliminar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de Confirmación -->
    <transition name="fade">
      <div v-if="showModal && clubAEliminar" 
           class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-2">Confirmar eliminación</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              ¿Está seguro que desea eliminar el siguiente club?
              <strong class="block mt-1">{{ clubAEliminar.nombre }} ({{ clubAEliminar.codigo_club }})</strong>
            </p>
            <p class="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div class="mt-4 flex justify-end space-x-3">
            <button @click="cancelarEliminar" 
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button @click="confirmarEliminarClub" 
                    :disabled="isLoading"
                    class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {{ isLoading ? 'Eliminando...' : 'Confirmar Eliminación' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 