// useCampeonatos.ts - Composable para manejar la lógica de negocio de campeonatos
import { ref, computed } from 'vue';
import type { 
  CampeonatoResponse, 
  CampeonatoCreate, 
  CampeonatoUpdate,
  TipoCampeonatoResponse,
  TipoCampeonatoCreate,
  TipoCampeonatoUpdate,
  CampeonatosPaginados
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
  const totalCampeonatos = ref(0); // Total para paginación
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
  const fetchCampeonatos = async (skip: number = 0, limit: number = 100) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response: CampeonatosPaginados = await campeonatoService.getAll(skip, limit);
      campeonatos.value = response.campeonatos;
      totalCampeonatos.value = response.total;
    } catch (err) {
      console.error('Error fetching campeonatos:', err);
      error.value = 'Failed to load campeonatos';
      campeonatos.value = [];
      totalCampeonatos.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar un campeonato por NCH
  const fetchCampeonatoById = async (nch: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      console.log(`[useCampeonatos] Fetching campeonato with NCH: ${nch}`); // Log inicio
      const campeonatoEncontrado = await campeonatoService.getById(nch);
      // Log detallado de lo que devuelve el servicio
      console.log(`[useCampeonatos] campeonatoService.getById returned:`, campeonatoEncontrado); 
      
      selectedCampeonato.value = campeonatoEncontrado ?? null;
      // Log del estado después de la asignación
      console.log(`[useCampeonatos] selectedCampeonato state after fetch:`, selectedCampeonato.value); 
      
      error.value = null; 
    } catch (err: any) {
      console.error(`Error fetching campeonato ${nch}:`, err);
      // Intentar obtener el mensaje de detalle del error de la API
      const message = err?.response?.data?.detail || err?.message || 'Failed to load campeonato';
      error.value = message;
      // Asegurar que selectedCampeonato se limpia en caso de error
      selectedCampeonato.value = null; 
    } finally {
      isLoading.value = false;
      console.log(`[useCampeonatos] Finished fetching NCH: ${nch}, isLoading: ${isLoading.value}`); // Log fin
    }
  };

  // Crear un nuevo campeonato
  const createCampeonato = async (data: CampeonatoCreate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newCampeonato = await campeonatoService.create(data);
      // Requiere refetch
      return newCampeonato;
    } catch (err) {
      console.error('Error creating campeonato:', err);
      error.value = 'Failed to create campeonato';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar un campeonato existente por NCH
  const updateCampeonato = async (nch: string, data: CampeonatoUpdate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedCampeonato = await campeonatoService.update(nch, data);
      // Requiere refetch
      if (selectedCampeonato.value?.nch === nch) {
        selectedCampeonato.value = updatedCampeonato;
      }
      return updatedCampeonato;
    } catch (err) {
      console.error(`Error updating campeonato ${nch}:`, err);
      error.value = 'Failed to update campeonato';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar un campeonato por NCH
  const deleteCampeonato = async (nch: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await campeonatoService.delete(nch);
      // Requiere refetch
      if (selectedCampeonato.value?.nch === nch) {
        selectedCampeonato.value = null;
      }
      return true;
    } catch (err) {
      console.error(`Error deleting campeonato ${nch}:`, err);
      error.value = 'Failed to delete campeonato';
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
    totalCampeonatos,
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