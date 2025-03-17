// jugadorService.ts - Servicio para gestionar los jugadores
import { apiService } from './apiService';

// Tipo para la respuesta de Jugador desde el backend
export interface JugadorResponse {
  id: number;
  numero_licencia: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento?: string;
  club_id?: number;
  codigo_club?: string;
  nombre_club?: string;
}

// Tipo para los datos para crear un Jugador
export interface JugadorCreate {
  numero_licencia: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento?: string;
  club_id?: number;
}

// Endpoint para jugadores
const JUGADORES_ENDPOINT = '/jugadores';

// Servicio para gestionar jugadores
export const jugadorService = {
  // Obtener todos los jugadores
  getAll: () => apiService.getAll<JugadorResponse[]>(JUGADORES_ENDPOINT),
  
  // Obtener un jugador por su número de licencia
  getByLicencia: (licencia: string) => apiService.getById<JugadorResponse>(JUGADORES_ENDPOINT, licencia),
  
  // Crear un nuevo jugador
  create: (jugadorData: JugadorCreate) => apiService.create<JugadorResponse>(JUGADORES_ENDPOINT, jugadorData),
  
  // Actualizar un jugador existente
  update: (licencia: string, jugadorData: Partial<JugadorCreate>) => 
    apiService.update<JugadorResponse>(JUGADORES_ENDPOINT, licencia, jugadorData),
  
  // Eliminar un jugador
  delete: (licencia: string) => apiService.delete<any>(JUGADORES_ENDPOINT, licencia),
  
  // Obtener jugadores por club
  getByClub: (clubId: number) => 
    apiService.custom<JugadorResponse[]>(`${JUGADORES_ENDPOINT}/club/${clubId}`)
}; 