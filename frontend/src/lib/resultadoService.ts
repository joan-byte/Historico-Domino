// resultadoService.ts - Servicio para gestionar los resultados
import { API_URL } from '../config';
import { apiService } from './apiService';
import type { FiltrosResultados } from '@/types/filtros'; // Asegurarse de que esta ruta es correcta

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

export interface ResultadoCreate {
  nch: number;
  fecha_campeonato: string; // Formato YYYY-MM-DD
  idfed_jugador: string;
  tipo_campeonato_id: number;
  nombre_campeonato?: string;
  nombre_jugador?: string;
  apellido_jugador?: string;
  codigo_club_jugador?: string;
  nombre_club_jugador?: string;
  idfed_pareja?: string;
  nombre_pareja?: string;
  apellido_pareja?: string;
  codigo_club_pareja?: string;
  nombre_club_pareja?: string;
  partida?: number;
  mesa?: number;
  gb?: number;
  pg?: number;
  dif?: number;
  pv?: number;
  pt?: number;
  mg?: number;
  pos?: number;
}

export interface ResultadoUpdate extends Partial<Omit<ResultadoCreate, 'nch' | 'fecha_campeonato' | 'idfed_jugador'>> {}

export interface ResultadoResponse {
    nch: number;
    fecha_campeonato: string; // Podría ser Date si se transforma
    idfed_jugador: string;
    tipo_campeonato_id: number;
    nombre_campeonato?: string;
    nombre_jugador?: string;
    apellido_jugador?: string;
    codigo_club_jugador?: string;
    nombre_club_jugador?: string;
    idfed_pareja?: string;
    nombre_pareja?: string;
    apellido_pareja?: string;
    codigo_club_pareja?: string;
    nombre_club_pareja?: string;
    partida?: number;
    mesa?: number;
    gb?: number;
    pg?: number;
    dif?: number;
    pv?: number;
    pt?: number;
    mg?: number;
    pos?: number;
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

// --- Añadir Interfaz Paginada y Exportarla --- 
export interface ResultadosPaginados {
    total: number;
    resultados: ResultadoResponse[];
}
// --- Fin Interfaz --- 

const RESULTADOS_ENDPOINT = '/api/resultados/';

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

// Servicio con paginación y filtros para getAll
export const resultadoService = {
  getAll: (filtros: FiltrosResultados = {}, skip: number = 0, limit: number = 100) => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    // Añadir filtros a los parámetros si existen
    if (filtros.tipo_campeonato_id) {
        params.append('tipo_campeonato_id', filtros.tipo_campeonato_id.toString());
    }
    if (filtros.fecha_desde) {
        params.append('fecha_desde', filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
        params.append('fecha_hasta', filtros.fecha_hasta);
    }
    if (filtros.idfed_jugador) {
        params.append('idfed_jugador', filtros.idfed_jugador);
    }
    
    const url = `${RESULTADOS_ENDPOINT}?${params.toString()}`;
    return apiService.custom<ResultadosPaginados>(url);
  },

  // getById necesita la clave primaria compuesta
  getById: (pk: { nch: number; fecha_campeonato: string; idfed_jugador: string }) => {
    const { nch, fecha_campeonato, idfed_jugador } = pk;
    const url = `${RESULTADOS_ENDPOINT}${nch}/${fecha_campeonato}/${idfed_jugador}`;
    return apiService.custom<ResultadoResponse>(url);
  },

  create: (data: ResultadoCreate) => apiService.create<ResultadoResponse>(RESULTADOS_ENDPOINT, data),

  // update necesita la clave primaria compuesta
  update: (pk: { nch: number; fecha_campeonato: string; idfed_jugador: string }, data: ResultadoUpdate) => {
    const { nch, fecha_campeonato, idfed_jugador } = pk;
    const url = `${RESULTADOS_ENDPOINT}${nch}/${fecha_campeonato}/${idfed_jugador}`;
    // Usar PUT para update según la API del backend
    return apiService.custom<ResultadoResponse>(url, 'PUT', data);
  },

  // delete necesita la clave primaria compuesta
  delete: (pk: { nch: number; fecha_campeonato: string; idfed_jugador: string }) => {
    const { nch, fecha_campeonato, idfed_jugador } = pk;
    const url = `${RESULTADOS_ENDPOINT}${nch}/${fecha_campeonato}/${idfed_jugador}`;
    // Pasar un segundo argumento (aunque sea vacío) si apiService.delete lo requiere
    return apiService.delete<ResultadoResponse>(url, ''); 
  },
  
  // Funciones específicas existentes (pueden o no necesitar paginación)
  getByJugador: (idfed_jugador: string) => {
      const url = `${RESULTADOS_ENDPOINT}jugador/${idfed_jugador}`;
      return apiService.custom<ResultadoResponse[]>(url);
  },
  getByTipoCampeonato: (tipo_campeonato_id: number) => {
      const url = `${RESULTADOS_ENDPOINT}tipo-campeonato/${tipo_campeonato_id}`;
      return apiService.custom<ResultadoResponse[]>(url);
  },
  getByCampeonato: (tipo_campeonato_id: number, nch: number) => {
      const url = `${RESULTADOS_ENDPOINT}campeonato/${tipo_campeonato_id}/${nch}`;
      return apiService.custom<ResultadoResponse[]>(url);
  }
}; 