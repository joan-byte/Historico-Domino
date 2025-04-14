// useResultados.ts - Composable para manejar la lógica de negocio de resultados
import { ref, computed } from 'vue';
import { resultadoService, type ResultadoResponse, type ResultadoCreate, type ResultadoUpdate, type ResultadosPaginados } from '@/lib/resultadoService';
import type { FiltrosResultados } from '@/types/filtros';

// Composable para gestionar la lógica de los resultados
export function useResultados() {
  // Estado reactivo
  const resultados = ref<(ResultadoResponse & { _uniqueKey: string })[]>([]);
  const totalResultados = ref(0); // Total para paginación
  const selectedResultado = ref<ResultadoResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentFiltros = ref<FiltrosResultados>({}); // Guardar filtros actuales

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
  const addUniqueKey = (resultado: ResultadoResponse, index: number): ResultadoResponse & { _uniqueKey: string } => {
    return {
      ...resultado,
      _uniqueKey: `${resultado.nch}-${resultado.fecha_campeonato}-${resultado.idfed_jugador}-${index}`
    };
  };

  // Obtener todos los resultados con filtros/paginación
  const fetchResultados = async (filtros: FiltrosResultados = {}, skip: number = 0, limit: number = 100) => {
    isLoading.value = true;
    error.value = null;
    currentFiltros.value = filtros; // Actualizar filtros usados
    try {
      const response: ResultadosPaginados = await resultadoService.getAll(filtros, skip, limit);
      resultados.value = response.resultados.map(addUniqueKey);
      totalResultados.value = response.total;
    } catch (err) {
      handleError(err, 'Error al cargar los resultados');
      resultados.value = [];
      totalResultados.value = 0;
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
      const rawResultado = await resultadoService.getById({ nch, fecha_campeonato, idfed_jugador });
      // Añadir clave única al resultado seleccionado también
      selectedResultado.value = rawResultado ? addUniqueKey(rawResultado, 0) : null;
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
    isLoading.value = true;
    error.value = null;
    try {
      const newResultado = await resultadoService.create(resultadoData);
      // Requiere refetch con filtros y paginación actuales
      await fetchResultados(currentFiltros.value);
      return newResultado;
    } catch (err) {
      handleError(err, 'Error al crear el resultado');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar un resultado existente
  const modifyResultado = async (nch: number, fecha_campeonato: string, idfed_jugador: string, resultadoData: ResultadoUpdate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedResultado = await resultadoService.update({ nch, fecha_campeonato, idfed_jugador }, resultadoData);
      // Requiere refetch
      await fetchResultados(currentFiltros.value);
      return updatedResultado;
    } catch (err) {
      handleError(err, 'Error al actualizar el resultado');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar un resultado
  const removeResultado = async (nch: number, fecha_campeonato: string, idfed_jugador: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await resultadoService.delete({ nch, fecha_campeonato, idfed_jugador });
      // Eliminar de la lista local usando la clave única
      const uniqueKeyToDelete = `${nch}-${fecha_campeonato}-${idfed_jugador}`;
      resultados.value = resultados.value.filter(r => (r as any)._uniqueKey !== uniqueKeyToDelete);
      if (selectedResultado.value && (selectedResultado.value as any)._uniqueKey === uniqueKeyToDelete) {
        selectedResultado.value = null;
      }
      // Requiere refetch
      await fetchResultados(currentFiltros.value);
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
      const rawResultados = await resultadoService.getByJugador(idfed_jugador);
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
      const rawResultados = await resultadoService.getByTipoCampeonato(tipo_campeonato_id);
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
      const rawResultados = await resultadoService.getByCampeonato(tipo_campeonato_id, nch);
      resultados.value = rawResultados.map(addUniqueKey);
    } catch (err) {
      handleError(err, `Error al cargar resultados del campeonato ${tipo_campeonato_id}-${nch}`);
      resultados.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // Función para recargar con filtros actuales (útil después de CUD)
  const reloadCurrentPage = (currentPage: number, pageSize: number) => {
    const skip = (currentPage - 1) * pageSize;
    fetchResultados(currentFiltros.value, skip, pageSize);
  };

  // Devolver el estado y las funciones
  return {
    resultados,         // Lista reactiva de resultados
    totalResultados,    // Total para paginación
    selectedResultado,   // Resultado seleccionado (para detalle/edición)
    isLoading,           // Estado de carga
    error,               // Mensaje de error
    currentFiltros,       // Exponer filtros actuales para refetch
    fetchResultados,      // Obtener lista con filtros/paginación
    fetchResultadoById,   // Obtener uno por ID
    addResultado,         // Crear nuevo resultado
    modifyResultado,      // Actualizar resultado
    removeResultado,       // Eliminar resultado
    fetchResultadosByJugador, // Obtener por jugador
    fetchResultadosByTipoCampeonato, // Obtener por tipo camp.
    fetchResultadosByCampeonato, // Obtener por camp. específico
    reloadCurrentPage,     // Exponer para usar después de CUD
  };
} 