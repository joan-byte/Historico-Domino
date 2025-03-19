// useCampeonatos.ts - Composable para manejar la lógica de negocio de campeonatos
import { ref, computed } from 'vue';
import { campeonatoService, type CampeonatoResponse, type CampeonatoCreate, type TipoCampeonatoResponse } from '../lib/campeonatoService';

// Estado global para campeonatos
const campeonatos = ref<CampeonatoResponse[]>([]);
const tiposCampeonato = ref<TipoCampeonatoResponse[]>([]);
const selectedCampeonato = ref<CampeonatoResponse | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Función para obtener todos los campeonatos
const fetchCampeonatos = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await campeonatoService.getCampeonatos();
    campeonatos.value = response;
  } catch (err) {
    error.value = 'Error al cargar los campeonatos';
    console.error('Error en fetchCampeonatos:', err);
  } finally {
    isLoading.value = false;
  }
};

// Función para obtener un campeonato por ID
const fetchCampeonatoById = async (id: number) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await campeonatoService.getCampeonatoById(id);
    selectedCampeonato.value = response;
  } catch (err) {
    error.value = 'Error al cargar el campeonato';
    console.error('Error en fetchCampeonatoById:', err);
  } finally {
    isLoading.value = false;
  }
};

// Función para crear un nuevo campeonato
const createCampeonato = async (campeonato: CampeonatoCreate) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await campeonatoService.createCampeonato(campeonato);
    await fetchCampeonatos(); // Recargar la lista
    return response;
  } catch (err) {
    error.value = 'Error al crear el campeonato';
    console.error('Error en createCampeonato:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Función para actualizar un campeonato
const updateCampeonato = async (id: number, campeonato: CampeonatoCreate) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await campeonatoService.updateCampeonato(id, campeonato);
    await fetchCampeonatos(); // Recargar la lista
    return response;
  } catch (err) {
    error.value = 'Error al actualizar el campeonato';
    console.error('Error en updateCampeonato:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Función para eliminar un campeonato
const deleteCampeonato = async (id: number) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    await campeonatoService.deleteCampeonato(id);
    await fetchCampeonatos(); // Recargar la lista
  } catch (err) {
    error.value = 'Error al eliminar el campeonato';
    console.error('Error en deleteCampeonato:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Función para obtener todos los tipos de campeonato
const fetchTiposCampeonato = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await campeonatoService.getTiposCampeonato();
    tiposCampeonato.value = response;
  } catch (err) {
    error.value = 'Error al cargar los tipos de campeonato';
    console.error('Error en fetchTiposCampeonato:', err);
  } finally {
    isLoading.value = false;
  }
};

// Función para crear un nuevo tipo de campeonato
const createTipoCampeonato = async (tipo: { nombre: string; descripcion: string }) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await campeonatoService.createTipoCampeonato(tipo);
    await fetchTiposCampeonato(); // Recargar la lista
    return response;
  } catch (err) {
    error.value = 'Error al crear el tipo de campeonato';
    console.error('Error en createTipoCampeonato:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Computed property para ordenar campeonatos por fecha de inicio
const sortedCampeonatos = computed(() => {
  return [...campeonatos.value].sort((a, b) => {
    const fechaA = new Date(a.fecha_inicio);
    const fechaB = new Date(b.fecha_inicio);
    return fechaB.getTime() - fechaA.getTime(); // Ordenar de más reciente a más antiguo
  });
});

// Exportar el composable
export function useCampeonatos() {
  return {
    // Estado
    campeonatos,
    tiposCampeonato,
    selectedCampeonato,
    isLoading,
    error,
    sortedCampeonatos,
    
    // Métodos
    fetchCampeonatos,
    fetchCampeonatoById,
    createCampeonato,
    updateCampeonato,
    deleteCampeonato,
    fetchTiposCampeonato,
    createTipoCampeonato
  };
} 