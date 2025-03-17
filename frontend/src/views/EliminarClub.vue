<script setup lang="ts">
// Componente para eliminar clubes
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { clubService, type ClubResponse } from '../lib/clubService';

const router = useRouter();
const clubs = ref<ClubResponse[]>([]);
const isLoading = ref(false);
const isLoadingData = ref(true);
const generalError = ref('');
const selectedClub = ref<ClubResponse | null>(null);
const showConfirmation = ref(false);

// Cargar la lista de clubes
onMounted(async () => {
  isLoadingData.value = true;
  generalError.value = '';
  
  try {
    clubs.value = await clubService.getAll();
  } catch (err: any) {
    console.error('Error al cargar los clubes:', err);
    generalError.value = err.message || 'No se pudieron cargar los clubes';
  } finally {
    isLoadingData.value = false;
  }
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

// Volver a la lista de clubes
const volver = () => {
  router.push('/clubes');
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
    
    <!-- Mensaje de error general -->
    <div v-if="generalError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ generalError }}
    </div>
    
    <!-- Estado de carga inicial -->
    <div v-if="isLoadingData" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
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
            <tr v-for="club in clubs" :key="club.codigo_club" :class="{'bg-red-50': selectedClub?.codigo_club === club.codigo_club}">
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
                <button
                  @click="selectClub(club)"
                  class="text-blue-600 hover:text-blue-900"
                  :class="{'text-red-600 hover:text-red-900': selectedClub?.codigo_club === club.codigo_club}"
                >
                  {{ selectedClub?.codigo_club === club.codigo_club ? 'Seleccionado' : 'Seleccionar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Botón de eliminar -->
      <div class="flex justify-end">
        <button 
          @click="confirmarEliminacion"
          class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          :disabled="!selectedClub || isLoading"
        >
          {{ isLoading ? 'Procesando...' : 'Eliminar Club Seleccionado' }}
        </button>
      </div>
    </div>
    
    <!-- Modal de confirmación -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Confirmar eliminación</h3>
        <p class="text-gray-700 mb-1">¿Está seguro que desea eliminar el siguiente club?</p>
        <p class="text-gray-900 font-medium mb-4" v-if="selectedClub">
          {{ selectedClub.nombre }} ({{ selectedClub.codigo_club }})
        </p>
        <p class="text-red-600 text-sm mb-6">Esta acción no se puede deshacer.</p>
        
        <div class="flex justify-end gap-2">
          <button 
            @click="cancelarEliminacion"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button 
            @click="eliminarClub"
            class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Eliminando...' : 'Confirmar Eliminación' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style> 