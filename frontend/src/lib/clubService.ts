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

// Endpoint para clubs (Corregido: sin /api/ y sin barra final si apiService la maneja)
const CLUBS_ENDPOINT = '/clubs';

// Servicio para gestionar clubs
export const clubService = {
  // Obtener todos los clubs CON PAGINACIÓN
  getAll: (skip: number = 0, limit: number = 10, sortBy: string | null = null, sortDir: 'asc' | 'desc' | null = null) => {
    // Construir los parámetros de query
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
    
    // Construir la URL relativa con los parámetros
    const relativeEndpoint = `${CLUBS_ENDPOINT}/?${params.toString()}`;
    
    // Llamar a la API con la URL construida
    return apiService.custom<ClubsPaginados>(relativeEndpoint);
  },
  
  // Obtener un club por su código
  getByCode: (codigo: string) => {
    // Construir endpoint relativo
    const relativeEndpoint = `${CLUBS_ENDPOINT}/${codigo}`;
    // Usar custom para asegurar formato
    return apiService.custom<ClubResponse>(relativeEndpoint);
    // Alternativa si getById funciona con string y añade barra:
    // return apiService.getById<ClubResponse>(CLUBS_ENDPOINT, codigo);
  },
  
  // Crear un nuevo club
  create: (clubData: ClubCreate) => {
     // Pasar solo endpoint base, apiService.create añade método y datos
    return apiService.create<ClubResponse>(CLUBS_ENDPOINT + '/', clubData);
  },
  
  // Actualizar un club existente (usando PUT)
  update: (codigo: string, clubData: ClubUpdate) => { 
     // Usar custom para asegurar formato y método PUT
    const relativeEndpoint = `${CLUBS_ENDPOINT}/${codigo}/`; // Añadir barra si la API la espera
    return apiService.custom<ClubResponse>(relativeEndpoint, 'PUT', clubData);
    // Alternativa si update funciona con string:
    // return apiService.update<ClubResponse>(CLUBS_ENDPOINT, codigo, clubData);
  },
  
  // Eliminar un club
  delete: (codigo: string) => {
    // Usar custom para asegurar formato y método DELETE
     const relativeEndpoint = `${CLUBS_ENDPOINT}/${codigo}/`; // Añadir barra si la API la espera
    return apiService.custom<ClubResponse>(relativeEndpoint, 'DELETE');
     // Alternativa si delete funciona con string:
     // return apiService.delete<ClubResponse>(CLUBS_ENDPOINT, codigo);
  }
}; 