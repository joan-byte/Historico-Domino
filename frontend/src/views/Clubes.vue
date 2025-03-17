<script setup>
// Vista de Clubes - Muestra la lista de clubs y permite operaciones CRUD
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { clubService } from '../lib/clubService';

const router = useRouter();
const clubs = ref([]);
const isLoading = ref(false);
const error = ref(null);
const showDeleteModal = ref(false);
const clubToDelete = ref(null);

// Cargar la lista de clubs al montar el componente
onMounted(() => {
  fetchClubs();
});

// Obtener todos los clubs desde el backend
const fetchClubs = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    clubs.value = await clubService.getAll();
  } catch (err) {
    console.error('Error al cargar los clubs:', err);
    error.value = 'No se pudieron cargar los clubs. Por favor, intente de nuevo más tarde.';
  } finally {
    isLoading.value = false;
  }
};

// Navegar a la página de creación de club
const navigateToCreate = () => {
  router.push('/nuevo-club');
};

// Abrir el modal de confirmación para eliminar un club
const confirmDelete = (club) => {
  clubToDelete.value = club;
  showDeleteModal.value = true;
};

// Eliminar un club
const deleteClub = async () => {
  isLoading.value = true;
  
  try {
    await clubService.delete(clubToDelete.value.codigo_club);
    clubs.value = clubs.value.filter(club => club.codigo_club !== clubToDelete.value.codigo_club);
    showDeleteModal.value = false;
    clubToDelete.value = null;
  } catch (err) {
    console.error('Error al eliminar el club:', err);
    error.value = 'No se pudo eliminar el club. Por favor, intente de nuevo más tarde.';
  } finally {
    isLoading.value = false;
  }
};

// Cancelar la eliminación
const cancelDelete = () => {
  showDeleteModal.value = false;
  clubToDelete.value = null;
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Clubes</h1>
      <button 
        @click="navigateToCreate"
        class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
      >
        Nuevo Club
      </button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <!-- Tabla de Clubs -->
    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div v-if="clubs.length === 0" class="p-8 text-center text-gray-500">
        No hay clubes registrados. Haga clic en "Nuevo Club" para agregar uno.
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CP
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="club in clubs" :key="club.codigo_club" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ club.codigo_club }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ club.nombre }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ club.cp }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ club.numero_club }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="confirmDelete(club)"
                class="text-red-600 hover:text-red-900 ml-2"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="text-gray-600 mb-6">
          ¿Está seguro de que desea eliminar el club "{{ clubToDelete?.nombre }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDelete"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            @click="deleteClub"
            class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 