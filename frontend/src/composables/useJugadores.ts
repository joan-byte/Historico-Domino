// useJugadores.ts - Composable para manejar la lógica de negocio de jugadores
import { ref, computed } from 'vue';
import { jugadorService, type JugadorResponse, type JugadorCreate, type JugadorUpdate, type JugadoresPaginados } from '../lib/jugadorService';

export function useJugadores() {
  // Estado
  const jugadores = ref<JugadorResponse[]>([]);
  const totalJugadores = ref(0);
  const selectedJugador = ref<JugadorResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Acciones
  const fetchJugadores = async (skip: number = 0, limit: number = 100) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response: JugadoresPaginados = await jugadorService.getAll(skip, limit);
      jugadores.value = response.jugadores;
      totalJugadores.value = response.total;
    } catch (err) {
      error.value = 'No se pudieron cargar los jugadores. Intente nuevamente más tarde.';
      jugadores.value = [];
      totalJugadores.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchJugadorByIdFed = async (idfed: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      selectedJugador.value = await jugadorService.getByIdFed(idfed);
    } catch (err) {
      error.value = `No se pudo cargar el jugador. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchJugadoresByClub = async (codigoClub: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      jugadores.value = await jugadorService.getByClub(codigoClub);
      totalJugadores.value = jugadores.value.length;
    } catch (err) {
      error.value = `No se pudieron cargar los jugadores del club. Intente nuevamente más tarde.`;
      jugadores.value = [];
      totalJugadores.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const createJugador = async (jugadorData: JugadorCreate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newJugador = await jugadorService.create(jugadorData);
      return newJugador;
    } catch (err) {
      error.value = 'No se pudo crear el jugador. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateJugador = async (idfed: string, jugadorData: JugadorUpdate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedJugador = await jugadorService.update(idfed, jugadorData);
      
      if (selectedJugador.value?.idfed === idfed) {
        selectedJugador.value = updatedJugador;
      }
      
      return updatedJugador;
    } catch (err) {
      error.value = `No se pudo actualizar el jugador. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteJugador = async (idfed: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await jugadorService.delete(idfed);
      
      if (selectedJugador.value?.idfed === idfed) {
        selectedJugador.value = null;
      }
      
      return true;
    } catch (err) {
      error.value = `No se pudo eliminar el jugador. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Getters

  // Retornar estado, acciones y getters
  return {
    // Estado
    jugadores,
    totalJugadores,
    selectedJugador,
    isLoading,
    error,
    
    // Acciones
    fetchJugadores,
    fetchJugadorByIdFed,
    fetchJugadoresByClub,
    createJugador,
    updateJugador,
    deleteJugador,
    
    // Getters
  };
} 