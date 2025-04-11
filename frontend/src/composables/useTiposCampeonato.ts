import { ref } from 'vue';
import {
  getTiposCampeonato,
  getTipoCampeonatoById,
  createTipoCampeonato,
  updateTipoCampeonato,
  deleteTipoCampeonato,
  type TipoCampeonatoCreate,
  type TipoCampeonatoUpdate,
  type TipoCampeonatoResponse
} from '../lib/tipoCampeonatoService';

// Composable para gestionar la lógica de los tipos de campeonato
export function useTiposCampeonato() {
  // Estado reactivo
  const tiposCampeonato = ref<TipoCampeonatoResponse[]>([]);
  const selectedTipoCampeonato = ref<TipoCampeonatoResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Función para limpiar el error
  const clearError = () => {
    error.value = null;
  };

  // Función para manejar errores de la API
  const handleError = (err: unknown, context: string) => {
    if (err instanceof Error) {
      error.value = `${context}: ${err.message}`;
    } else {
      error.value = `${context}: Ocurrió un error desconocido`;
    }
    console.error(error.value);
  };

  // Obtener todos los tipos de campeonato
  const fetchTiposCampeonato = async () => {
    clearError();
    isLoading.value = true;
    try {
      tiposCampeonato.value = await getTiposCampeonato();
    } catch (err) {
      handleError(err, 'Error al cargar los tipos de campeonato');
    } finally {
      isLoading.value = false;
    }
  };

  // Obtener un tipo de campeonato por ID
  const fetchTipoCampeonatoById = async (id: number) => {
    clearError();
    isLoading.value = true;
    selectedTipoCampeonato.value = null;
    try {
      selectedTipoCampeonato.value = await getTipoCampeonatoById(id);
    } catch (err) {
      handleError(err, `Error al cargar el tipo de campeonato ${id}`);
      selectedTipoCampeonato.value = null;
    } finally {
      isLoading.value = false;
    }
    return selectedTipoCampeonato.value;
  };

  // Crear un nuevo tipo de campeonato
  const addTipoCampeonato = async (tipoData: TipoCampeonatoCreate) => {
    clearError();
    isLoading.value = true;
    try {
      const nuevoTipo = await createTipoCampeonato(tipoData);
      await fetchTiposCampeonato(); // Recargar la lista
      return nuevoTipo;
    } catch (err) {
      handleError(err, 'Error al crear el tipo de campeonato');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar un tipo de campeonato
  const modifyTipoCampeonato = async (id: number, tipoData: TipoCampeonatoUpdate) => {
    clearError();
    isLoading.value = true;
    try {
      const tipoActualizado = await updateTipoCampeonato(id, tipoData);
      // Actualizar en la lista local
      const index = tiposCampeonato.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tiposCampeonato.value[index] = { ...tiposCampeonato.value[index], ...tipoActualizado };
      }
      if (selectedTipoCampeonato.value?.id === id) {
        selectedTipoCampeonato.value = { ...selectedTipoCampeonato.value, ...tipoActualizado };
      }
      return tipoActualizado;
    } catch (err) {
      handleError(err, 'Error al actualizar el tipo de campeonato');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar un tipo de campeonato
  const removeTipoCampeonato = async (id: number) => {
    clearError();
    isLoading.value = true;
    try {
      await deleteTipoCampeonato(id);
      // Eliminar de la lista local
      tiposCampeonato.value = tiposCampeonato.value.filter(t => t.id !== id);
      if (selectedTipoCampeonato.value?.id === id) {
        selectedTipoCampeonato.value = null;
      }
    } catch (err) {
      handleError(err, 'Error al eliminar el tipo de campeonato');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Devolver el estado y las funciones
  return {
    tiposCampeonato,
    selectedTipoCampeonato,
    isLoading,
    error,
    fetchTiposCampeonato,
    fetchTipoCampeonatoById,
    addTipoCampeonato,
    modifyTipoCampeonato,
    removeTipoCampeonato
  };
} 