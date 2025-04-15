<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCampeonatos } from '../composables/useCampeonatos';
import StatusMessage from '../components/ui/StatusMessage.vue';
import type { CampeonatoResponse } from '../lib/campeonatoService'; // Importar si es necesario

// Router y route
const router = useRouter();
const route = useRoute();
const campeonatoNch = computed(() => route.params.nch as string);

// Composable
const {
  fetchCampeonatoById,
  deleteCampeonato,
  isLoading,
  error,
  selectedCampeonato
} = useCampeonatos();

// Estado para mensajes
const successMessage = ref<string>('');
const showSuccess = ref(false);
const deleteError = ref<string | null>(null); // Error específico para el borrado

// Manejar el borrado
const handleDelete = async () => {
  if (!selectedCampeonato.value) return;

  // Guardar los datos ANTES de que selectedCampeonato pueda volverse null
  const nombreCampeonato = selectedCampeonato.value.nombre;
  const nchCampeonato = selectedCampeonato.value.nch;

  const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar el campeonato "${nombreCampeonato}" (NCH: ${nchCampeonato})? Esta acción no se puede deshacer.`);

  if (confirmDelete) {
    deleteError.value = null; // Limpiar error previo
    try {
      await deleteCampeonato(campeonatoNch.value); // nch viene de la ruta
      
      // Usar las variables guardadas para el mensaje
      successMessage.value = `Campeonato "${nombreCampeonato}" eliminado con éxito.`; 
      showSuccess.value = true;
      
      // Volver a la lista después de un breve retraso
      setTimeout(() => {
        router.push('/campeonatos/lista');
      }, 2000);
    } catch (err: any) {
      console.error('Error al eliminar campeonato:', err);
      // Capturar mensaje de error específico si es posible
      deleteError.value = err?.response?.data?.detail || err?.message || 'Error al eliminar el campeonato.';
      showSuccess.value = false; // Ocultar mensaje de éxito si lo hubo antes
    }
  }
};

// Cancelar y volver atrás
const handleCancel = () => {
  router.push('/campeonatos/lista'); // Ir directamente a la lista
};

// Cargar datos al montar
onMounted(() => {
  if (campeonatoNch.value) {
    console.log(`[EliminarCampeonato] Fetching data for NCH: ${campeonatoNch.value}`);
    fetchCampeonatoById(campeonatoNch.value);
  } else {
      console.warn('[EliminarCampeonato] NCH no encontrado en la ruta.');
      error.value = "No se especificó ningún campeonato para eliminar."; // Asignar error
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6 text-red-700">Eliminar Campeonato</h1>

    <!-- Mensaje de éxito -->
    <StatusMessage
      v-if="showSuccess"
      :message="successMessage"
      type="success"
      :show="true"
      class="mb-4"
    />

    <!-- Mensaje de error (carga o borrado) -->
     <StatusMessage
      v-if="error || deleteError"
      :message="error || deleteError || 'Ha ocurrido un error'"
      type="error"
      :show="true"
      class="mb-4"
    />

    <!-- Loading spinner -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
    </div>

    <!-- Contenido cuando no está cargando -->
    <div v-else>
      <!-- Detalles del campeonato (si se encontró) -->
      <div v-if="selectedCampeonato" class="bg-white p-6 rounded-lg shadow-md border border-red-300">
        <h2 class="text-xl font-semibold mb-4">Detalles del Campeonato</h2>
        <div class="space-y-2 mb-4">
          <p><strong>NCH:</strong> {{ selectedCampeonato.nch }}</p>
          <p><strong>Nombre:</strong> {{ selectedCampeonato.nombre }}</p>
          <p><strong>Fecha Inicio:</strong> {{ selectedCampeonato.fecha_inicio }}</p>
           <!-- Añadir más campos si se desea para confirmar -->
           <p><strong>Días:</strong> {{ selectedCampeonato.dias }}</p>
           <p><strong>Club:</strong> {{ selectedCampeonato.club_codigo }}</p>
        </div>

        <p class="mt-6 text-red-600 font-medium">
          ¿Estás seguro de que quieres eliminar permanentemente este campeonato? Esta acción no se puede deshacer.
        </p>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Eliminando...</span>
            <span v-else>Eliminar Definitivamente</span>
          </button>
        </div>
      </div>

       <!-- Mensaje si no se encontró el campeonato al cargar -->
      <div v-else-if="!isLoading && error">
         <p class="text-center text-red-600 py-4">{{ error }}</p>
      </div>

      <!-- Mensaje genérico si no carga y no hay error explícito -->
       <div v-else>
        <p class="text-center text-gray-500 py-4">No se encontró el campeonato especificado.</p>
      </div>
    </div>
  </div>
</template> 