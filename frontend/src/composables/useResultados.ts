// useResultados.ts - Composable para manejar la lógica de negocio de resultados
import { ref, computed } from 'vue';
import { resultadoService, type ResultadoResponse, type ResultadoCreate, type ResultadoUpdate, type ResultadosPaginados, type FilterConditionFE } from '@/lib/resultadoService';

// Composable para gestionar la lógica de los resultados
export function useResultados() {
  // Estado reactivo
  const resultados = ref<(ResultadoResponse & { _uniqueKey: string })[]>([]);
  const totalResultados = ref(0); // Total para paginación
  const selectedResultado = ref<ResultadoResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentFilterConditions = ref<FilterConditionFE[]>([]); // Guardar filtros actuales como la lista de condiciones

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
  const fetchResultados = async (
    filters: FilterConditionFE[], 
    skip: number = 0, 
    limit: number = 10, 
    sortBy: string | null = null, 
    sortDir: 'asc' | 'desc' | null = null
  ) => {
    isLoading.value = true;
    error.value = null;
    currentFilterConditions.value = filters; // Guardar filtros actuales
    try {
      // Pasar filtros Y ordenación al método filtrar del servicio
      const response = await resultadoService.filtrar(filters, skip, limit, sortBy, sortDir);
      resultados.value = response.resultados.map(addUniqueKey);
      totalResultados.value = response.total;
    } catch (err: any) {
      console.error('Error fetching resultados:', err);
      error.value = err.message || 'Failed to load resultados';
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
      await fetchResultados(currentFilterConditions.value);
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
      await fetchResultados(currentFilterConditions.value);
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
      // Optimización: Eliminar de la lista local si se desea
      // const keyToDelete = `${nch}-${fecha_campeonato}-${idfed_jugador}`;
      // resultados.value = resultados.value.filter(r => (r as any)._uniqueKey !== keyToDelete);
      // Requiere refetch para actualizar paginación y total
      await fetchResultados(currentFilterConditions.value);
    } catch (err) {
      handleError(err, 'Error al eliminar el resultado');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Función para recargar la página actual con los filtros actuales
  const reloadCurrentPage = async (currentPage: number, pageSize: number, sortBy: string | null, sortDir: 'asc' | 'desc' | null) => {
      const skip = (currentPage - 1) * pageSize;
      await fetchResultados(currentFilterConditions.value, skip, pageSize, sortBy, sortDir);
  };

  // Devolver el estado y las funciones
  return {
    resultados,         // Lista reactiva de resultados
    totalResultados,    // Total para paginación
    selectedResultado,   // Resultado seleccionado (para detalle/edición)
    isLoading,           // Estado de carga
    error,               // Mensaje de error
    currentFilterConditions, // Exponer las condiciones actuales si es útil
    fetchResultados,      // Obtener lista con filtros/paginación
    fetchResultadoById,   // Obtener uno por ID
    addResultado,         // Crear nuevo resultado
    modifyResultado,      // Actualizar resultado
    removeResultado,       // Eliminar resultado
    reloadCurrentPage,     // Exponer para usar después de CUD
  };
} 