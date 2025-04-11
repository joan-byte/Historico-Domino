// useResultados.ts - Composable para manejar la lógica de negocio de resultados
import { ref, computed } from 'vue';
import {
  getResultados,
  getResultadoById,
  createResultado,
  updateResultado,
  deleteResultado,
  getResultadosByJugador,
  getResultadosByTipoCampeonato,
  getResultadosByCampeonato,
  type ResultadoCreate,
  type ResultadoUpdate,
  type ResultadoResponse,
  type ResultadosListParams
} from '../lib/resultadoService';

// Composable para gestionar la lógica de los resultados
export function useResultados() {
  // Estado reactivo
  const resultados = ref<ResultadoResponse[]>([]);
  const selectedResultado = ref<ResultadoResponse | null>(null);
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

  // Función auxiliar para añadir la clave única
  const addUniqueKey = (resultado: ResultadoResponse): ResultadoResponse & { _uniqueKey: string } => {
    return {
      ...resultado,
      _uniqueKey: `${resultado.nch}-${resultado.fecha_campeonato}-${resultado.idfed_jugador}`
    };
  };

  // Obtener todos los resultados con filtros/paginación
  const fetchResultados = async (params: ResultadosListParams = {}) => {
    clearError();
    isLoading.value = true;
    try {
      const rawResultados = await getResultados(params);
      // Añadir la clave única a cada resultado
      resultados.value = rawResultados.map(addUniqueKey);
    } catch (err) {
      handleError(err, 'Error al cargar los resultados');
      resultados.value = []; // Asegurarse de limpiar en caso de error
    } finally {
      isLoading.value = false;
    }
  };

  // Obtener un resultado por su clave primaria compuesta
  const fetchResultadoById = async (nch: number, fecha_campeonato: string, idfed_jugador: string) => {
    clearError();
    isLoading.value = true;
    selectedResultado.value = null;
    try {
      const rawResultado = await getResultadoById(nch, fecha_campeonato, idfed_jugador);
      // Añadir clave única al resultado seleccionado también
      selectedResultado.value = rawResultado ? addUniqueKey(rawResultado) : null;
    } catch (err) {
      handleError(err, `Error al cargar el resultado ${nch}-${fecha_campeonato}-${idfed_jugador}`);
      selectedResultado.value = null;
    } finally {
      isLoading.value = false;
    }
    return selectedResultado.value;
  };

  // Crear un nuevo resultado
  const addResultado = async (resultadoData: ResultadoCreate) => {
    clearError();
    isLoading.value = true;
    try {
      await createResultado(resultadoData);
      // Recargar la lista (que ya añadirá la clave única)
      await fetchResultados(); 
      // No necesitamos devolver el nuevo resultado aquí si recargamos
    } catch (err) {
      handleError(err, 'Error al crear el resultado');
      throw err; 
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar un resultado existente
  const modifyResultado = async (nch: number, fecha_campeonato: string, idfed_jugador: string, resultadoData: ResultadoUpdate) => {
    clearError();
    isLoading.value = true;
    try {
      await updateResultado(nch, fecha_campeonato, idfed_jugador, resultadoData);
       // Recargar la lista para obtener los datos actualizados con _uniqueKey
      await fetchResultados(); 
      // No necesitamos actualizar localmente si recargamos siempre
      // Opcional: podrías buscar y actualizar localmente si la recarga es lenta
    } catch (err) {
      handleError(err, 'Error al actualizar el resultado');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar un resultado
  const removeResultado = async (nch: number, fecha_campeonato: string, idfed_jugador: string) => {
    clearError();
    isLoading.value = true;
    try {
      await deleteResultado(nch, fecha_campeonato, idfed_jugador);
      // Eliminar de la lista local usando la clave única
      const uniqueKeyToDelete = `${nch}-${fecha_campeonato}-${idfed_jugador}`;
      resultados.value = resultados.value.filter(r => (r as any)._uniqueKey !== uniqueKeyToDelete);
      if (selectedResultado.value && (selectedResultado.value as any)._uniqueKey === uniqueKeyToDelete) {
        selectedResultado.value = null;
      }
    } catch (err) {
      handleError(err, 'Error al eliminar el resultado');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Funciones adicionales para obtener resultados filtrados (pueden ser útiles)
  const fetchResultadosByJugador = async (idfed_jugador: string) => {
    clearError();
    isLoading.value = true;
    try {
      const rawResultados = await getResultadosByJugador(idfed_jugador);
      resultados.value = rawResultados.map(addUniqueKey);
    } catch (err) {
      handleError(err, `Error al cargar resultados del jugador ${idfed_jugador}`);
      resultados.value = [];
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchResultadosByTipoCampeonato = async (tipo_campeonato_id: number) => {
    clearError();
    isLoading.value = true;
    try {
      const rawResultados = await getResultadosByTipoCampeonato(tipo_campeonato_id);
       resultados.value = rawResultados.map(addUniqueKey);
    } catch (err) {
      handleError(err, `Error al cargar resultados del tipo de campeonato ${tipo_campeonato_id}`);
       resultados.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchResultadosByCampeonato = async (tipo_campeonato_id: number, nch: number) => {
    clearError();
    isLoading.value = true;
    try {
      const rawResultados = await getResultadosByCampeonato(tipo_campeonato_id, nch);
      resultados.value = rawResultados.map(addUniqueKey);
    } catch (err) {
      handleError(err, `Error al cargar resultados del campeonato ${tipo_campeonato_id}-${nch}`);
      resultados.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // Devolver el estado y las funciones
  return {
    resultados,         // Lista reactiva de resultados
    selectedResultado, // Resultado seleccionado (para detalle/edición)
    isLoading,          // Estado de carga
    error,              // Mensaje de error
    fetchResultados,    // Obtener lista con filtros/paginación
    fetchResultadoById, // Obtener uno por ID
    addResultado,       // Crear nuevo resultado
    modifyResultado,    // Actualizar resultado
    removeResultado,    // Eliminar resultado
    fetchResultadosByJugador, // Obtener por jugador
    fetchResultadosByTipoCampeonato, // Obtener por tipo camp.
    fetchResultadosByCampeonato // Obtener por camp. específico
  };
} 