// useCampeonatos.ts - Composable para manejar la lógica de negocio de campeonatos
import { ref, computed } from 'vue';
import { campeonatoService, type CampeonatoResponse, type CampeonatoCreate, type TipoCampeonatoResponse } from '../lib/campeonatoService';

export function useCampeonatos() {
  // Estado
  const campeonatos = ref<CampeonatoResponse[]>([]);
  const tiposCampeonato = ref<TipoCampeonatoResponse[]>([]);
  const selectedCampeonato = ref<CampeonatoResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Acciones
  const fetchCampeonatos = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      campeonatos.value = await campeonatoService.getAll();
    } catch (err) {
      console.error('Error al cargar los campeonatos:', err);
      error.value = 'No se pudieron cargar los campeonatos. Intente nuevamente más tarde.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCampeonatosActivos = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      campeonatos.value = await campeonatoService.getActivos();
    } catch (err) {
      console.error('Error al cargar los campeonatos activos:', err);
      error.value = 'No se pudieron cargar los campeonatos activos. Intente nuevamente más tarde.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCampeonatoById = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      selectedCampeonato.value = await campeonatoService.getById(id);
    } catch (err) {
      console.error(`Error al cargar el campeonato ${id}:`, err);
      error.value = `No se pudo cargar el campeonato ${id}. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchTiposCampeonato = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      tiposCampeonato.value = await campeonatoService.getAllTipos();
    } catch (err) {
      console.error('Error al cargar los tipos de campeonato:', err);
      error.value = 'No se pudieron cargar los tipos de campeonato. Intente nuevamente más tarde.';
    } finally {
      isLoading.value = false;
    }
  };

  const createCampeonato = async (campeonatoData: CampeonatoCreate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newCampeonato = await campeonatoService.create(campeonatoData);
      campeonatos.value.push(newCampeonato);
      return newCampeonato;
    } catch (err) {
      console.error('Error al crear el campeonato:', err);
      error.value = 'No se pudo crear el campeonato. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createTipoCampeonato = async (data: { nombre: string, descripcion?: string }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newTipo = await campeonatoService.createTipo(data);
      tiposCampeonato.value.push(newTipo);
      return newTipo;
    } catch (err) {
      console.error('Error al crear el tipo de campeonato:', err);
      error.value = 'No se pudo crear el tipo de campeonato. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateCampeonato = async (id: number, campeonatoData: Partial<CampeonatoCreate>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedCampeonato = await campeonatoService.update(id, campeonatoData);
      
      // Actualizar el campeonato en la lista si existe
      const index = campeonatos.value.findIndex(c => c.id === id);
      if (index !== -1) {
        campeonatos.value[index] = updatedCampeonato;
      }
      
      // Actualizar el campeonato seleccionado si es el mismo
      if (selectedCampeonato.value?.id === id) {
        selectedCampeonato.value = updatedCampeonato;
      }
      
      return updatedCampeonato;
    } catch (err) {
      console.error(`Error al actualizar el campeonato ${id}:`, err);
      error.value = `No se pudo actualizar el campeonato ${id}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteCampeonato = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await campeonatoService.delete(id);
      
      // Eliminar el campeonato de la lista
      campeonatos.value = campeonatos.value.filter(c => c.id !== id);
      
      // Limpiar el campeonato seleccionado si es el mismo
      if (selectedCampeonato.value?.id === id) {
        selectedCampeonato.value = null;
      }
      
      return true;
    } catch (err) {
      console.error(`Error al eliminar el campeonato ${id}:`, err);
      error.value = `No se pudo eliminar el campeonato ${id}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Getters
  const sortedCampeonatos = computed(() => 
    [...campeonatos.value].sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  const campeonatosActivos = computed(() => 
    campeonatos.value.filter(c => {
      const hoy = new Date();
      const fechaFin = new Date(c.fecha_fin);
      return fechaFin >= hoy;
    })
  );

  const sortedTiposCampeonato = computed(() => 
    [...tiposCampeonato.value].sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  // Retornar estado, acciones y getters
  return {
    // Estado
    campeonatos,
    tiposCampeonato,
    selectedCampeonato,
    isLoading,
    error,
    
    // Acciones
    fetchCampeonatos,
    fetchCampeonatosActivos,
    fetchCampeonatoById,
    fetchTiposCampeonato,
    createCampeonato,
    createTipoCampeonato,
    updateCampeonato,
    deleteCampeonato,
    
    // Getters
    sortedCampeonatos,
    campeonatosActivos,
    sortedTiposCampeonato
  };
} 