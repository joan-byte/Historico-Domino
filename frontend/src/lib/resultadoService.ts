// resultadoService.ts - Servicio para gestionar los resultados
import { API_URL } from '../config';

// Interfaces basadas en los schemas del backend
export interface ResultadoBase {
  tipo_campeonato_id: number;
  nombre_campeonato: string;
  fecha_campeonato: string; // ISO date string (YYYY-MM-DD)
  idfed_jugador: string;
  nombre_jugador: string;
  apellido_jugador: string;
  codigo_club_jugador: string;
  nombre_club_jugador: string;
  idfed_pareja?: string;
  nombre_pareja?: string;
  apellido_pareja?: string;
  codigo_club_pareja?: string;
  nombre_club_pareja?: string;
  partida: number;
  mesa: number;
  gb: boolean;
  pg: number;
  dif: number;
  pv: number;
  pt: number;
  mg: number;
  pos: number;
}

export interface ResultadoCreate extends ResultadoBase {}

export interface ResultadoUpdate {
  tipo_campeonato_id?: number;
  nombre_campeonato?: string;
  partida?: number;
  mesa?: number;
  gb?: boolean;
  pg?: number;
  dif?: number;
  pv?: number;
  pt?: number;
  mg?: number;
  pos?: number;
}

export interface ResultadoResponse extends ResultadoBase {
  nch: number; // Número de campeonato (parte de la PK)
  codigo_tipo_campeonato: string;
}

// Parámetros de filtro para listar resultados
export interface ResultadosListParams {
  skip?: number;
  limit?: number;
  tipo_campeonato_id?: number;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  idfed_jugador?: string;
}

// Función para construir la URL con query params
const buildUrl = (baseUrl: string, params: Record<string, any>): string => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Función genérica para manejar las respuestas de la API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: response.statusText || 'Error desconocido en la API' };
    }
    const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
    console.error('Error en API:', errorMessage, errorData);
    throw new Error(errorMessage);
  }
  // Si la respuesta es 204 No Content, devolver null o un objeto vacío
  if (response.status === 204) {
    return null;
  }
  return response.json();
};


// --- Funciones del Servicio ---

/**
 * Obtener una lista de resultados con filtros y paginación.
 * @param params - Parámetros de filtro y paginación
 * @returns Lista de resultados
 */
export const getResultados = async (params: ResultadosListParams = {}): Promise<ResultadoResponse[]> => {
  const url = buildUrl(`${API_URL}/resultados/`, params);
  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al obtener resultados:", error);
    throw error; // Relanzar para que el composable lo maneje
  }
};

/**
 * Obtener un resultado específico por su clave primaria compuesta.
 * @param nch - Número de campeonato
 * @param fecha_campeonato - Fecha del campeonato (YYYY-MM-DD)
 * @param idfed_jugador - IDFED del jugador
 * @returns El resultado encontrado
 */
export const getResultadoById = async (nch: number, fecha_campeonato: string, idfed_jugador: string): Promise<ResultadoResponse> => {
  const url = `${API_URL}/resultados/${nch}/${fecha_campeonato}/${idfed_jugador}`;
  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al obtener el resultado por ID:", error);
    throw error;
  }
};

/**
 * Crear un nuevo resultado.
 * @param resultadoData - Datos del resultado a crear
 * @returns El resultado creado
 */
export const createResultado = async (resultadoData: ResultadoCreate): Promise<ResultadoResponse> => {
  try {
    const response = await fetch(`${API_URL}/resultados/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultadoData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al crear el resultado:", error);
    throw error;
  }
};

/**
 * Actualizar un resultado existente.
 * @param nch - Número de campeonato
 * @param fecha_campeonato - Fecha del campeonato (YYYY-MM-DD)
 * @param idfed_jugador - IDFED del jugador
 * @param resultadoData - Datos a actualizar
 * @returns El resultado actualizado
 */
export const updateResultado = async (nch: number, fecha_campeonato: string, idfed_jugador: string, resultadoData: ResultadoUpdate): Promise<ResultadoResponse> => {
  try {
    const response = await fetch(`${API_URL}/resultados/${nch}/${fecha_campeonato}/${idfed_jugador}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultadoData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al actualizar el resultado:", error);
    throw error;
  }
};

/**
 * Eliminar un resultado.
 * @param nch - Número de campeonato
 * @param fecha_campeonato - Fecha del campeonato (YYYY-MM-DD)
 * @param idfed_jugador - IDFED del jugador
 * @returns El resultado eliminado (según la API actual) o null si la respuesta es 204
 */
export const deleteResultado = async (nch: number, fecha_campeonato: string, idfed_jugador: string): Promise<ResultadoResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/resultados/${nch}/${fecha_campeonato}/${idfed_jugador}`, {
      method: 'DELETE',
    });
    // La API actual devuelve el resultado eliminado, pero podría devolver 204 No Content
    if (response.status === 204) {
      return null;
    }
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al eliminar el resultado:", error);
    throw error;
  }
};

/**
 * Obtener todos los resultados de un jugador específico.
 * @param idfed_jugador - IDFED del jugador
 * @returns Lista de resultados del jugador
 */
export const getResultadosByJugador = async (idfed_jugador: string): Promise<ResultadoResponse[]> => {
  const url = `${API_URL}/resultados/jugador/${idfed_jugador}`;
  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al obtener resultados por jugador:", error);
    throw error;
  }
};

/**
 * Obtener todos los resultados de un tipo de campeonato específico.
 * @param tipo_campeonato_id - ID del tipo de campeonato
 * @returns Lista de resultados del tipo de campeonato
 */
export const getResultadosByTipoCampeonato = async (tipo_campeonato_id: number): Promise<ResultadoResponse[]> => {
  const url = `${API_URL}/resultados/tipo-campeonato/${tipo_campeonato_id}`;
  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al obtener resultados por tipo de campeonato:", error);
    throw error;
  }
};

/**
 * Obtener todos los resultados de un campeonato específico.
 * @param tipo_campeonato_id - ID del tipo de campeonato
 * @param nch - Número de campeonato
 * @returns Lista de resultados del campeonato
 */
export const getResultadosByCampeonato = async (tipo_campeonato_id: number, nch: number): Promise<ResultadoResponse[]> => {
  const url = `${API_URL}/resultados/campeonato/${tipo_campeonato_id}/${nch}`;
  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al obtener resultados por campeonato:", error);
    throw error;
  }
}; 