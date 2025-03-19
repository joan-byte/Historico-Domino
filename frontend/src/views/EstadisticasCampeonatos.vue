<!-- EstadisticasCampeonatos.vue - Vista de estadísticas de campeonatos -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCampeonatos } from '../composables/useCampeonatos';
import StatusMessage from '../components/ui/StatusMessage.vue';

// Composable para campeonatos
const { fetchCampeonatos, campeonatos, isLoading, error } = useCampeonatos();

// Estado para el campeonato seleccionado
const selectedCampeonatoId = ref<number | null>(null);

// Estadísticas calculadas
const estadisticas = computed(() => {
  // Total de campeonatos
  const totalCampeonatos = campeonatos.value.length;
  
  // Campeonatos activos (donde fecha_fin >= hoy)
  const hoy = new Date();
  const campeonatosActivos = campeonatos.value.filter(c => {
    const fechaFin = new Date(c.fecha_fin);
    return fechaFin >= hoy;
  });
  
  // Estadísticas por tipo de campeonato
  const campeonatosPorTipo: Record<string, number> = {};
  campeonatos.value.forEach(c => {
    const tipo = c.tipo_campeonato?.nombre || 'Sin tipo';
    campeonatosPorTipo[tipo] = (campeonatosPorTipo[tipo] || 0) + 1;
  });
  
  // Calcular campeonato más largo (en días)
  let campeonatoMasLargo = { id: 0, nombre: '', duracion: 0 };
  campeonatos.value.forEach(c => {
    const fechaInicio = new Date(c.fecha_inicio);
    const fechaFin = new Date(c.fecha_fin);
    const duracion = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    
    if (duracion > campeonatoMasLargo.duracion) {
      campeonatoMasLargo = { 
        id: c.id, 
        nombre: c.nombre, 
        duracion 
      };
    }
  });
  
  return {
    totalCampeonatos,
    campeonatosActivos: campeonatosActivos.length,
    campeonatosPorTipo,
    campeonatoMasLargo
  };
});

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchCampeonatos();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Estadísticas de Campeonatos</h1>
    
    <!-- Mensajes de error -->
    <StatusMessage v-if="error" 
                 :message="error" 
                 :type="'error'" 
                 :show="true"
                 class="mb-4" />
    
    <!-- Loading spinner -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <!-- Estadísticas generales -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Tarjeta de resumen -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Resumen General</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-600">Total de campeonatos:</span>
            <span class="font-medium text-lg">{{ estadisticas.totalCampeonatos }}</span>
          </div>
          
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-600">Campeonatos activos:</span>
            <span class="font-medium text-lg">{{ estadisticas.campeonatosActivos }}</span>
          </div>
          
          <div v-if="estadisticas.campeonatoMasLargo.id" class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-600">Campeonato más largo:</span>
            <div class="text-right">
              <div class="font-medium">{{ estadisticas.campeonatoMasLargo.nombre }}</div>
              <div class="text-sm text-gray-500">{{ estadisticas.campeonatoMasLargo.duracion }} días</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Distribución por tipo -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Distribución por Tipo</h2>
        
        <div v-if="Object.keys(estadisticas.campeonatosPorTipo).length > 0" class="space-y-3">
          <div 
            v-for="(cantidad, tipo) in estadisticas.campeonatosPorTipo" 
            :key="tipo"
            class="flex justify-between items-center border-b pb-2"
          >
            <span class="text-gray-600">{{ tipo }}:</span>
            <span class="font-medium">{{ cantidad }} campeonatos</span>
          </div>
        </div>
        
        <div v-else class="text-center py-4 text-gray-500">
          No hay datos suficientes para mostrar estadísticas por tipo.
        </div>
      </div>
    </div>
    
    <!-- Nota informativa -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
      <h3 class="font-medium mb-1">Nota</h3>
      <p>Esta vista muestra estadísticas básicas de los campeonatos. A medida que se agreguen más datos, las estadísticas se volverán más completas.</p>
    </div>
  </div>
</template> 