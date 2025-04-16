// resultadoService.ts - Servicio para gestionar los resultados
// import { API_URL } from '../config'; // Ya no se usa directamente aquí
import { apiService } from './apiService';
import type { FiltrosResultados } from '@/types/filtros'; // Tipo antiguo, se reemplazará o adaptará

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

// Endpoint base
const RESULTADOS_ENDPOINT = '/resultados'; 

// --- Definir nueva interfaz para condiciones de filtro --- 
export interface FilterConditionFE {
  field: string;
  operator: string;
  value: any;
}

export interface ResultadosPaginadosResponse {
    total: number;
    resultados: ResultadoResponse[];
}

// --- Servicio --- 
export const resultadoService = {
  // Modificar filtrar para incluir ordenación en el payload
  filtrar: (
      conditions: FilterConditionFE[], 
      skip: number = 0, 
      limit: number = 10, 
      sortBy: string | null = null, 
      sortDir: 'asc' | 'desc' | null = null
  ): Promise<ResultadosPaginadosResponse> => {
      const payload = {
          conditions: conditions,
          skip: skip,
          limit: limit,
          // Añadir parámetros de ordenación al payload
          sort_by: sortBy,
          sort_dir: sortDir
      };
      // Llamar al endpoint de filtrado con POST y el payload
      const relativeEndpoint = `${RESULTADOS_ENDPOINT}/filtrar`; // Endpoint POST para filtros
      return apiService.custom<ResultadosPaginadosResponse>(relativeEndpoint, 'POST', payload);
  },

  // Mantener getAll (marcarla como obsoleta o eliminarla eventualmente)
  // @deprecated Usar filter en su lugar
  getAll: (skip: number = 0, limit: number = 100) => {
      const relativeEndpoint = `${RESULTADOS_ENDPOINT}/?skip=${skip}&limit=${limit}`;
      return apiService.custom<ResultadosPaginadosResponse>(relativeEndpoint); 
  },

  // getById necesita la clave primaria compuesta
  getById: (pk: { nch: number; fecha_campeonato: string; idfed_jugador: string }) => {
    const { nch, fecha_campeonato, idfed_jugador } = pk;
    // Pasar solo el endpoint relativo
    const relativeEndpoint = `${RESULTADOS_ENDPOINT}/${nch}/${fecha_campeonato}/${idfed_jugador}`;
    return apiService.custom<ResultadoResponse>(relativeEndpoint);
  },

  create: (data: ResultadoCreate) => {
    // Pasar solo el endpoint relativo
    return apiService.create<ResultadoResponse>(RESULTADOS_ENDPOINT, data);
  },
  
  // update necesita la clave primaria compuesta
  update: (pk: { nch: number; fecha_campeonato: string; idfed_jugador: string }, data: ResultadoUpdate) => {
    const { nch, fecha_campeonato, idfed_jugador } = pk;
    // Pasar solo el endpoint relativo
    const relativeEndpoint = `${RESULTADOS_ENDPOINT}/${nch}/${fecha_campeonato}/${idfed_jugador}`;
    return apiService.custom<ResultadoResponse>(relativeEndpoint, 'PUT', data);
  },

  // delete necesita la clave primaria compuesta
  delete: (pk: { nch: number; fecha_campeonato: string; idfed_jugador: string }) => {
    const { nch, fecha_campeonato, idfed_jugador } = pk;
    // Pasar solo el endpoint relativo
    const relativeEndpoint = `${RESULTADOS_ENDPOINT}/${nch}/${fecha_campeonato}/${idfed_jugador}`;
    // apiService.delete puede necesitar adaptación si no usa custom internamente
    // Asumiendo que apiService.delete llama a fetchApi:
    return apiService.delete<ResultadoResponse>(relativeEndpoint, ''); 
  },
  
  // Funciones específicas existentes (pueden o no necesitar paginación)
  getByJugador: (idfed_jugador: string) => {
      const relativeEndpoint = `${RESULTADOS_ENDPOINT}/jugador/${idfed_jugador}`;
      return apiService.custom<ResultadoResponse[]>(relativeEndpoint);
  },
  getByTipoCampeonato: (tipo_campeonato_id: number) => {
      const relativeEndpoint = `${RESULTADOS_ENDPOINT}/tipo-campeonato/${tipo_campeonato_id}`;
      return apiService.custom<ResultadoResponse[]>(relativeEndpoint);
  },
  getByCampeonato: (tipo_campeonato_id: number, nch: number) => {
      const relativeEndpoint = `${RESULTADOS_ENDPOINT}/campeonato/${tipo_campeonato_id}/${nch}`;
      return apiService.custom<ResultadoResponse[]>(relativeEndpoint);
  }
}; 