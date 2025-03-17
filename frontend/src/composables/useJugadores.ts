// useJugadores.ts - Composable para manejar la lógica de negocio de jugadores
import { ref, computed } from 'vue';
import { jugadorService, type JugadorResponse, type JugadorCreate } from '../lib/jugadorService';

export function useJugadores() {
  // Estado
  const jugadores = ref<JugadorResponse[]>([]);
  const selectedJugador = ref<JugadorResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Acciones
  const fetchJugadores = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      jugadores.value = await jugadorService.getAll();
    } catch (err) {
      console.error('Error al cargar los jugadores:', err);
      error.value = 'No se pudieron cargar los jugadores. Intente nuevamente más tarde.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchJugadorByLicencia = async (licencia: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      selectedJugador.value = await jugadorService.getByLicencia(licencia);
    } catch (err) {
      console.error(`Error al cargar el jugador ${licencia}:`, err);
      error.value = `No se pudo cargar el jugador ${licencia}. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchJugadoresByClub = async (clubId: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      jugadores.value = await jugadorService.getByClub(clubId);
    } catch (err) {
      console.error(`Error al cargar jugadores del club ${clubId}:`, err);
      error.value = `No se pudieron cargar los jugadores del club. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const createJugador = async (jugadorData: JugadorCreate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newJugador = await jugadorService.create(jugadorData);
      jugadores.value.push(newJugador);
      return newJugador;
    } catch (err) {
      console.error('Error al crear el jugador:', err);
      error.value = 'No se pudo crear el jugador. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateJugador = async (licencia: string, jugadorData: Partial<JugadorCreate>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedJugador = await jugadorService.update(licencia, jugadorData);
      
      // Actualizar el jugador en la lista si existe
      const index = jugadores.value.findIndex(j => j.numero_licencia === licencia);
      if (index !== -1) {
        jugadores.value[index] = updatedJugador;
      }
      
      // Actualizar el jugador seleccionado si es el mismo
      if (selectedJugador.value?.numero_licencia === licencia) {
        selectedJugador.value = updatedJugador;
      }
      
      return updatedJugador;
    } catch (err) {
      console.error(`Error al actualizar el jugador ${licencia}:`, err);
      error.value = `No se pudo actualizar el jugador ${licencia}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteJugador = async (licencia: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await jugadorService.delete(licencia);
      
      // Eliminar el jugador de la lista
      jugadores.value = jugadores.value.filter(j => j.numero_licencia !== licencia);
      
      // Limpiar el jugador seleccionado si es el mismo
      if (selectedJugador.value?.numero_licencia === licencia) {
        selectedJugador.value = null;
      }
      
      return true;
    } catch (err) {
      console.error(`Error al eliminar el jugador ${licencia}:`, err);
      error.value = `No se pudo eliminar el jugador ${licencia}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Getters
  const sortedJugadores = computed(() => 
    [...jugadores.value].sort((a, b) => 
      a.apellidos.localeCompare(b.apellidos) || a.nombre.localeCompare(b.nombre)
    )
  );

  const jugadoresByClub = computed(() => {
    const jugadoresPorClub: { [key: string]: JugadorResponse[] } = {};
    
    jugadores.value.forEach(jugador => {
      if (jugador.codigo_club) {
        if (!jugadoresPorClub[jugador.codigo_club]) {
          jugadoresPorClub[jugador.codigo_club] = [];
        }
        jugadoresPorClub[jugador.codigo_club].push(jugador);
      }
    });
    
    return jugadoresPorClub;
  });

  // Retornar estado, acciones y getters
  return {
    // Estado
    jugadores,
    selectedJugador,
    isLoading,
    error,
    
    // Acciones
    fetchJugadores,
    fetchJugadorByLicencia,
    fetchJugadoresByClub,
    createJugador,
    updateJugador,
    deleteJugador,
    
    // Getters
    sortedJugadores,
    jugadoresByClub
  };
} 