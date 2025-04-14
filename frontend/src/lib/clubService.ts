// clubService.ts - Servicio para gestionar los clubs
import { apiService } from './apiService';
import type { JugadorResponse } from './jugadorService'; // Necesario si ClubResponse incluye jugadores

// Tipo para la respuesta de Club desde el backend
export interface ClubResponse {
  id: number;
  cp: string;
  numero_club: string;
  codigo_club: string;
  nombre: string;
  persona_contacto?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  jugadores?: JugadorResponse[]; // Asumiendo que la respuesta puede incluir jugadores
  jugadores_count?: number; // Para el computed field si existe
}

// Tipo para los datos para crear un Club
export interface ClubCreate {
  cp: string;
  numero_club: string;
  nombre: string;
  persona_contacto?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}

// Tipo para los datos para actualizar un Club
export interface ClubUpdate {
  nombre?: string;
  persona_contacto?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}

// --- Nueva interfaz para la respuesta paginada ---
export interface ClubsPaginados {
    total: number;
    clubs: ClubResponse[];
}
// --- Fin interfaz ---

// Endpoint para clubs
const CLUBS_ENDPOINT = '/api/clubs/';

// Servicio para gestionar clubs
export const clubService = {
  // Obtener todos los clubs CON PAGINACIÓN
  getAll: (skip: number = 0, limit: number = 100) => {
    const url = `${CLUBS_ENDPOINT}?skip=${skip}&limit=${limit}`;
    return apiService.custom<ClubsPaginados>(url);
  },
  
  // Obtener un club por su código
  getByCode: (codigo: string) => apiService.getById<ClubResponse>(CLUBS_ENDPOINT, codigo),
  
  // Crear un nuevo club
  create: (clubData: ClubCreate) => apiService.create<ClubResponse>(CLUBS_ENDPOINT, clubData),
  
  // Actualizar un club existente (usando PUT)
  update: (codigo: string, clubData: ClubUpdate) => 
    apiService.update<ClubResponse>(CLUBS_ENDPOINT, codigo, clubData),
  
  // Eliminar un club
  delete: (codigo: string) => apiService.delete<ClubResponse>(CLUBS_ENDPOINT, codigo)
}; 