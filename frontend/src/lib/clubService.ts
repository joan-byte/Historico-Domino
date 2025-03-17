// clubService.ts - Servicio para gestionar los clubs
import { apiService } from './apiService';

// Tipo para la respuesta de Club desde el backend
export interface ClubResponse {
  id: number;
  cp: string;
  numero_club: string;
  codigo_club: string;
  nombre: string;
}

// Tipo para los datos para crear un Club
export interface ClubCreate {
  cp: string;
  numero_club: string;
  nombre: string;
}

// Endpoint para clubs
const CLUBS_ENDPOINT = '/api/clubs/';

// Servicio para gestionar clubs
export const clubService = {
  // Obtener todos los clubs
  getAll: () => apiService.getAll<ClubResponse[]>(CLUBS_ENDPOINT),
  
  // Obtener un club por su código
  getByCode: (codigo: string) => apiService.getById<ClubResponse>(CLUBS_ENDPOINT, codigo),
  
  // Crear un nuevo club
  create: (clubData: ClubCreate) => apiService.create<ClubResponse>(CLUBS_ENDPOINT, clubData),
  
  // Actualizar un club existente
  update: (codigo: string, clubData: Partial<ClubCreate>) => 
    apiService.update<ClubResponse>(CLUBS_ENDPOINT, codigo, clubData),
  
  // Eliminar un club
  delete: (codigo: string) => apiService.delete<any>(CLUBS_ENDPOINT, codigo)
}; 