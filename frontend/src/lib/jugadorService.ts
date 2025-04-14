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

// Endpoint para jugadores
const JUGADORES_ENDPOINT = '/api/jugadores/';

// Servicio para gestionar jugadores
export const jugadorService = {
  // Obtener todos los jugadores CON PAGINACIÓN
  getAll: (skip: number = 0, limit: number = 100) => {
    // Construir la URL con parámetros de query
    const url = `${JUGADORES_ENDPOINT}?skip=${skip}&limit=${limit}`;
    // Usar apiService.custom o adaptar apiService.getAll si es posible
    // Asumimos que apiService.custom hace un fetch GET por defecto si no se especifica método
    return apiService.custom<JugadoresPaginados>(url);
  },
  
  // Obtener un jugador por su idfed (el backend usa idfed como identificador en las rutas)
  getByIdFed: (idfed: string) => apiService.getById<JugadorResponse>(JUGADORES_ENDPOINT, idfed),
  
  // Crear un nuevo jugador
  create: (jugadorData: JugadorCreate) => apiService.create<JugadorResponse>(JUGADORES_ENDPOINT, jugadorData),
  
  // Actualizar un jugador existente (usando POST ya que PUT no está implementado en el backend)
  update: (idfed: string, jugadorData: JugadorUpdate) => 
    apiService.custom<JugadorResponse>(`${JUGADORES_ENDPOINT}actualizar/${idfed}`, 'POST', jugadorData),
  
  // Eliminar un jugador
  delete: (idfed: string) => apiService.delete<JugadorResponse>(JUGADORES_ENDPOINT, idfed),
  
  // Obtener jugadores por club
  getByClub: (codigoClub: string) => 
    apiService.custom<JugadorResponse[]>(`${JUGADORES_ENDPOINT}club/${codigoClub}`)
}; 