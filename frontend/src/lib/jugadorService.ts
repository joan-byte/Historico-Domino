// jugadorService.ts - Servicio para gestionar los jugadores
import { apiService } from './apiService';

// Tipo para la respuesta de Jugador desde el backend
export interface JugadorResponse {
  id: number;
  cp: string;
  numero_jugador: string;
  idfed: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
  email?: string;
  codigo_club: string;
  nombre_club: string;
}

// Tipo para los datos para crear un Jugador
export interface JugadorCreate {
  cp: string;
  numero_jugador: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
  email?: string;
  codigo_club: string;
}

// Tipo para los datos para actualizar un Jugador
export interface JugadorUpdate {
  nombre: string;
  apellidos: string;
  codigo_club: string;
  dni?: string;
  telefono?: string;
  email?: string;
}

// --- Nueva interfaz para la respuesta paginada ---
export interface JugadoresPaginados {
    total: number;
    jugadores: JugadorResponse[];
}
// --- Fin interfaz ---

// Endpoint para jugadores (Corregido: sin /api/ inicial)
const JUGADORES_ENDPOINT = '/jugadores';

// Servicio para gestionar jugadores
export const jugadorService = {
  // Obtener todos los jugadores CON PAGINACIÓN
  getAll: async (skip: number = 0, limit: number = 10, sortBy: string | null = null, sortDir: 'asc' | 'desc' | null = null): Promise<JugadoresPaginados> => {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    if (sortBy) {
      params.append('sort_by', sortBy);
    }
    if (sortDir) {
      params.append('sort_dir', sortDir);
    }
    
    const relativeEndpoint = `${JUGADORES_ENDPOINT}/?${params.toString()}`;
    return apiService.custom<JugadoresPaginados>(relativeEndpoint);
  },
  
  // Obtener un jugador por su idfed
  getByIdFed: (idfed: string) => {
    // Construir endpoint relativo
    const relativeEndpoint = `${JUGADORES_ENDPOINT}${idfed}`;
    // apiService.getById espera id como segundo arg, pero aquí usamos idfed y necesitamos la barra final?
    // Usar custom para asegurar el formato correcto si la API espera /jugadores/IDFED/
    return apiService.custom<JugadorResponse>(relativeEndpoint + '/');
    // Si la API espera /jugadores/IDFED (sin barra) y getById funciona:
    // return apiService.getById<JugadorResponse>(JUGADORES_ENDPOINT, idfed);
  },
  
  // Crear un nuevo jugador
  create: (jugadorData: JugadorCreate) => {
    // Pasar solo endpoint relativo
    return apiService.create<JugadorResponse>(JUGADORES_ENDPOINT, jugadorData);
  },
  
  // Actualizar un jugador existente (usando POST)
  update: (idfed: string, jugadorData: JugadorUpdate) => {
    // Construir endpoint relativo
    const relativeEndpoint = `${JUGADORES_ENDPOINT}actualizar/${idfed}`;
    return apiService.custom<JugadorResponse>(relativeEndpoint, 'POST', jugadorData);
  },
  
  // Eliminar un jugador
  delete: (idfed: string) => {
    // Construir endpoint relativo
    const relativeEndpoint = `${JUGADORES_ENDPOINT}${idfed}`;
    // Usar custom para asegurar formato y método DELETE
    return apiService.custom<JugadorResponse>(relativeEndpoint + '/', 'DELETE');
     // Alternativa si delete funciona con idfed:
     // return apiService.delete<JugadorResponse>(JUGADORES_ENDPOINT, idfed);
  },
  
  // Obtener jugadores por club
  getByClub: (codigoClub: string) => {
     // Construir endpoint relativo
    const relativeEndpoint = `${JUGADORES_ENDPOINT}club/${codigoClub}`;
    return apiService.custom<JugadorResponse[]>(relativeEndpoint);
  }
}; 