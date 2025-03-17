// useResultados.ts - Composable para manejar la lógica de negocio de resultados
import { ref, computed } from 'vue';
import { resultadoService, type ResultadoResponse, type ResultadoCreate } from '../lib/resultadoService';

export function useResultados() {
  // Estado
  const resultados = ref<ResultadoResponse[]>([]);
  const selectedResultado = ref<ResultadoResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Acciones
  const fetchResultados = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      resultados.value = await resultadoService.getAll();
    } catch (err) {
      console.error('Error al cargar los resultados:', err);
      error.value = 'No se pudieron cargar los resultados. Intente nuevamente más tarde.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchResultadoById = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      selectedResultado.value = await resultadoService.getById(id);
    } catch (err) {
      console.error(`Error al cargar el resultado ${id}:`, err);
      error.value = `No se pudo cargar el resultado ${id}. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchResultadosByCampeonato = async (campeonatoId: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      resultados.value = await resultadoService.getByCampeonato(campeonatoId);
    } catch (err) {
      console.error(`Error al cargar resultados del campeonato ${campeonatoId}:`, err);
      error.value = `No se pudieron cargar los resultados del campeonato. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchResultadosByJugador = async (jugadorId: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      resultados.value = await resultadoService.getByJugador(jugadorId);
    } catch (err) {
      console.error(`Error al cargar resultados del jugador ${jugadorId}:`, err);
      error.value = `No se pudieron cargar los resultados del jugador. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const createResultado = async (resultadoData: ResultadoCreate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newResultado = await resultadoService.create(resultadoData);
      resultados.value.push(newResultado);
      return newResultado;
    } catch (err) {
      console.error('Error al crear el resultado:', err);
      error.value = 'No se pudo crear el resultado. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateResultado = async (id: number, resultadoData: Partial<ResultadoCreate>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedResultado = await resultadoService.update(id, resultadoData);
      
      // Actualizar el resultado en la lista si existe
      const index = resultados.value.findIndex(r => r.id === id);
      if (index !== -1) {
        resultados.value[index] = updatedResultado;
      }
      
      // Actualizar el resultado seleccionado si es el mismo
      if (selectedResultado.value?.id === id) {
        selectedResultado.value = updatedResultado;
      }
      
      return updatedResultado;
    } catch (err) {
      console.error(`Error al actualizar el resultado ${id}:`, err);
      error.value = `No se pudo actualizar el resultado ${id}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteResultado = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await resultadoService.delete(id);
      
      // Eliminar el resultado de la lista
      resultados.value = resultados.value.filter(r => r.id !== id);
      
      // Limpiar el resultado seleccionado si es el mismo
      if (selectedResultado.value?.id === id) {
        selectedResultado.value = null;
      }
      
      return true;
    } catch (err) {
      console.error(`Error al eliminar el resultado ${id}:`, err);
      error.value = `No se pudo eliminar el resultado ${id}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Getters
  const resultadosPorFecha = computed(() => 
    [...resultados.value].sort((a, b) => 
      new Date(b.fecha_partido).getTime() - new Date(a.fecha_partido).getTime()
    )
  );

  const estadisticasJugador = computed(() => {
    const stats: Record<number, { jugador_id: number, jugador_nombre?: string, partidos: number, victorias: number, puntos_favor: number, puntos_contra: number }> = {};
    
    resultados.value.forEach(resultado => {
      // Procesar jugador 1
      if (!stats[resultado.jugador1_id]) {
        stats[resultado.jugador1_id] = {
          jugador_id: resultado.jugador1_id,
          jugador_nombre: resultado.nombre_jugador1,
          partidos: 0,
          victorias: 0,
          puntos_favor: 0,
          puntos_contra: 0
        };
      }
      
      stats[resultado.jugador1_id].partidos++;
      stats[resultado.jugador1_id].puntos_favor += resultado.puntos_jugador1;
      stats[resultado.jugador1_id].puntos_contra += resultado.puntos_jugador2;
      
      if (resultado.puntos_jugador1 > resultado.puntos_jugador2) {
        stats[resultado.jugador1_id].victorias++;
      }
      
      // Procesar jugador 2
      if (!stats[resultado.jugador2_id]) {
        stats[resultado.jugador2_id] = {
          jugador_id: resultado.jugador2_id,
          jugador_nombre: resultado.nombre_jugador2,
          partidos: 0,
          victorias: 0,
          puntos_favor: 0,
          puntos_contra: 0
        };
      }
      
      stats[resultado.jugador2_id].partidos++;
      stats[resultado.jugador2_id].puntos_favor += resultado.puntos_jugador2;
      stats[resultado.jugador2_id].puntos_contra += resultado.puntos_jugador1;
      
      if (resultado.puntos_jugador2 > resultado.puntos_jugador1) {
        stats[resultado.jugador2_id].victorias++;
      }
    });
    
    return Object.values(stats);
  });

  const rankingJugadores = computed(() => 
    [...estadisticasJugador.value]
      .filter(stats => stats.partidos > 0)
      .sort((a, b) => {
        // Ordenar por victorias
        if (b.victorias !== a.victorias) {
          return b.victorias - a.victorias;
        }
        
        // Si tienen las mismas victorias, ordenar por diferencia de puntos
        const difA = a.puntos_favor - a.puntos_contra;
        const difB = b.puntos_favor - b.puntos_contra;
        
        return difB - difA;
      })
  );

  // Retornar estado, acciones y getters
  return {
    // Estado
    resultados,
    selectedResultado,
    isLoading,
    error,
    
    // Acciones
    fetchResultados,
    fetchResultadoById,
    fetchResultadosByCampeonato,
    fetchResultadosByJugador,
    createResultado,
    updateResultado,
    deleteResultado,
    
    // Getters
    resultadosPorFecha,
    estadisticasJugador,
    rankingJugadores
  };
} 