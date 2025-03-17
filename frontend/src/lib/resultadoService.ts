// resultadoService.ts - Servicio para gestionar los resultados
import { apiService } from './apiService';

// Tipo para la respuesta de Resultado desde el backend
export interface ResultadoResponse {
  id: number;
  fecha_partido: string;
  campeonato_id: number;
  nombre_campeonato?: string;
  jugador1_id: number;
  nombre_jugador1?: string;
  jugador2_id: number;
  nombre_jugador2?: string;
  puntos_jugador1: number;
  puntos_jugador2: number;
}

// Tipo para los datos para crear un Resultado
export interface ResultadoCreate {
  fecha_partido: string;
  campeonato_id: number;
  jugador1_id: number;
  jugador2_id: number;
  puntos_jugador1: number;
  puntos_jugador2: number;
}

// Endpoint para resultados
const RESULTADOS_ENDPOINT = '/resultados';

// Servicio para gestionar resultados
export const resultadoService = {
  // Obtener todos los resultados
  getAll: () => apiService.getAll<ResultadoResponse[]>(RESULTADOS_ENDPOINT),
  
  // Obtener un resultado por su ID
  getById: (id: number) => apiService.getById<ResultadoResponse>(RESULTADOS_ENDPOINT, id),
  
  // Crear un nuevo resultado
  create: (resultadoData: ResultadoCreate) => 
    apiService.create<ResultadoResponse>(RESULTADOS_ENDPOINT, resultadoData),
  
  // Actualizar un resultado existente
  update: (id: number, resultadoData: Partial<ResultadoCreate>) => 
    apiService.update<ResultadoResponse>(RESULTADOS_ENDPOINT, id, resultadoData),
  
  // Eliminar un resultado
  delete: (id: number) => apiService.delete<any>(RESULTADOS_ENDPOINT, id),
  
  // Obtener resultados por campeonato
  getByCampeonato: (campeonatoId: number) => 
    apiService.custom<ResultadoResponse[]>(`${RESULTADOS_ENDPOINT}/campeonato/${campeonatoId}`),
  
  // Obtener resultados por jugador
  getByJugador: (jugadorId: number) => 
    apiService.custom<ResultadoResponse[]>(`${RESULTADOS_ENDPOINT}/jugador/${jugadorId}`)
}; 