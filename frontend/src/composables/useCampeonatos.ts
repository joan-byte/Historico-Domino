// useCampeonatos.ts - Composable para manejar la lógica de negocio de campeonatos
import { ref, computed } from 'vue';
import type { 
  CampeonatoResponse, 
  CampeonatoCreate, 
  CampeonatoUpdate,
  TipoCampeonatoResponse,
  TipoCampeonatoCreate,
  TipoCampeonatoUpdate
} from '../lib/campeonatoService';
import { 
  createTipoCampeonato as createTipoCampeonatoService,
  updateTipoCampeonato as updateTipoCampeonatoService,
  deleteTipoCampeonato as deleteTipoCampeonatoService,
  getTiposCampeonato as getTiposCampeonatoService,
  campeonatoService 
} from '../lib/campeonatoService';

export function useCampeonatos() {
  // Estado
  const campeonatos = ref<CampeonatoResponse[]>([]);
  const selectedCampeonato = ref<CampeonatoResponse | null>(null);
  const tiposCampeonato = ref<TipoCampeonatoResponse[]>([]);
  const selectedTipoCampeonato = ref<TipoCampeonatoResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Campeonatos ordenados por fecha
  const sortedCampeonatos = computed(() => {
    return [...campeonatos.value].sort((a, b) => {
      return new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
    });
  });

  // Cargar todos los campeonatos
  const fetchCampeonatos = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      campeonatos.value = await campeonatoService.getCampeonatos();
    } catch (err) {
      error.value = 'Error al cargar los campeonatos';
      console.error('Error en fetchCampeonatos:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar un campeonato por ID
  const fetchCampeonatoById = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      selectedCampeonato.value = await campeonatoService.getCampeonatoById(id);
    } catch (err) {
      error.value = 'Error al cargar el campeonato';
      console.error('Error en fetchCampeonatoById:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Crear un nuevo campeonato
  const createCampeonato = async (campeonato: CampeonatoCreate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newCampeonato = await campeonatoService.createCampeonato(campeonato);
      campeonatos.value.push(newCampeonato);
      return newCampeonato;
    } catch (err) {
      error.value = 'Error al crear el campeonato';
      console.error('Error en createCampeonato:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar un campeonato existente
  const updateCampeonato = async (id: number, campeonato: CampeonatoUpdate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedCampeonato = await campeonatoService.updateCampeonato(id, campeonato);
      const index = campeonatos.value.findIndex(c => c.id === id);
      if (index !== -1) {
        campeonatos.value[index] = updatedCampeonato;
      }
      return updatedCampeonato;
    } catch (err) {
      error.value = 'Error al actualizar el campeonato';
      console.error('Error en updateCampeonato:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar un campeonato
  const deleteCampeonato = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await campeonatoService.deleteCampeonato(id);
      campeonatos.value = campeonatos.value.filter(c => c.id !== id);
    } catch (err) {
      error.value = 'Error al eliminar el campeonato';
      console.error('Error en deleteCampeonato:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Funciones para tipos de campeonato
  const createTipoCampeonato = async (data: TipoCampeonatoCreate) => {
    try {
      const newTipoCampeonato = await createTipoCampeonatoService(data);
      tiposCampeonato.value.push(newTipoCampeonato);
      return newTipoCampeonato;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear el tipo de campeonato';
      throw err;
    }
  };

  const updateTipoCampeonato = async (id: number, data: TipoCampeonatoUpdate) => {
    try {
      const updatedTipoCampeonato = await updateTipoCampeonatoService(id, data);
      const index = tiposCampeonato.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tiposCampeonato.value[index] = updatedTipoCampeonato;
      }
      return updatedTipoCampeonato;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el tipo de campeonato';
      throw err;
    }
  };

  const deleteTipoCampeonato = async (id: number) => {
    try {
      await deleteTipoCampeonatoService(id);
      tiposCampeonato.value = tiposCampeonato.value.filter(t => t.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el tipo de campeonato';
      throw err;
    }
  };

  const fetchTiposCampeonato = async () => {
    try {
      isLoading.value = true;
      tiposCampeonato.value = await getTiposCampeonatoService();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener los tipos de campeonato';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // Estado
    campeonatos,
    selectedCampeonato,
    tiposCampeonato,
    selectedTipoCampeonato,
    isLoading,
    error,
    
    // Computed
    sortedCampeonatos,
    
    // Métodos
    fetchCampeonatos,
    fetchCampeonatoById,
    createCampeonato,
    updateCampeonato,
    deleteCampeonato,
    createTipoCampeonato,
    updateTipoCampeonato,
    deleteTipoCampeonato,
    fetchTiposCampeonato
  };
} 