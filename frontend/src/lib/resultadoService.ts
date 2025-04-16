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

// --- Servicio --- 
export const resultadoService = {
  // Nueva función para filtrar usando POST
  filter: (conditions: FilterConditionFE[], skip: number = 0, limit: number = 100) => {
    const requestBody = {
      filters: conditions,
      skip: skip,
      limit: limit
    };
    const endpoint = `${RESULTADOS_ENDPOINT}/filtrar`; // Endpoint POST
    console.log("Llamando a apiService.custom POST con endpoint:", endpoint, "y body:", requestBody);
    // Usar apiService.custom para especificar el método POST y el cuerpo
    return apiService.custom<ResultadosPaginados>(endpoint, 'POST', requestBody);
  },

  // Mantener getAll (marcarla como obsoleta o eliminarla eventualmente)
  // @deprecated Usar filter en su lugar
  getAll: (filtros: FiltrosResultados = {}, skip: number = 0, limit: number = 100) => {
     console.warn("La función resultadoService.getAll está obsoleta. Usar resultadoService.filter.");
     // Adaptar filtros antiguos a la nueva estructura si es posible, o lanzar error
     // Por simplicidad, la dejamos funcional pero limitada por ahora
     const params = new URLSearchParams();
     params.append('skip', skip.toString());
     params.append('limit', limit.toString());
     if (filtros.tipo_campeonato_id) params.append('tipo_campeonato_id', filtros.tipo_campeonato_id.toString());
     if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
     if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
     if (filtros.idfed_jugador) params.append('idfed_jugador', filtros.idfed_jugador);
     if (filtros.campeonato_nch) params.append('campeonato_nch', filtros.campeonato_nch);
     if (filtros.codigo_club_jugador) params.append('codigo_club_jugador', filtros.codigo_club_jugador);
     
     const relativeEndpoint = `${RESULTADOS_ENDPOINT}?${params.toString()}`; // Llama a la ruta GET obsoleta
     return apiService.custom<ResultadosPaginados>(relativeEndpoint);
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