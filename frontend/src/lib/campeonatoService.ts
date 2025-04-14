// campeonatoService.ts - Servicio para manejar las llamadas a la API de campeonatos
import { apiService } from './apiService';
import { API_URL } from '../config';

// Tipos para campeonatos
export interface TipoCampeonato {
  id: number;
  codigo: string;  // DP, DI, RP, RI, LI
  nombre: string;
  descripcion?: string;
}

export interface CampeonatoBase {
  nombre: string;
  fecha_inicio: string;  // formato YYYY-MM-DD
  fecha_fin: string;     // formato YYYY-MM-DD
  tipo_campeonato_id: number;
}

export interface CampeonatoCreate extends CampeonatoBase {}

export interface CampeonatoUpdate extends Partial<CampeonatoBase> {}

export interface CampeonatoResponse extends CampeonatoBase {
  id: number;
  tipo_campeonato?: TipoCampeonato;
}

// Tipos para TipoCampeonato
export interface TipoCampeonatoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface TipoCampeonatoCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface TipoCampeonatoUpdate {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
}

// --- Añadir Interfaz Paginada ---
export interface CampeonatosPaginados {
    total: number;
    campeonatos: CampeonatoResponse[];
}
// --- Fin Interfaz ---

// Endpoint base
const CAMPEONATOS_ENDPOINT = '/api/campeonatos'; // Asumiendo prefijo /api desde main.py
const TIPOS_ENDPOINT = '/api/tipos-campeonato'; // Asumiendo prefijo /api desde main.py

// Servicio usando apiService
export const campeonatoService = {
  // --- Funciones CRUD para Campeonatos ---
  getAll: (skip: number = 0, limit: number = 100) => {
    const url = `${CAMPEONATOS_ENDPOINT}/?skip=${skip}&limit=${limit}`;
    return apiService.custom<CampeonatosPaginados>(url);
  },
  
  getById: (id: number) => apiService.getById<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, id.toString()),
  
  create: (data: CampeonatoCreate) => apiService.create<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, data),
  
  update: (id: number, data: CampeonatoUpdate) => 
    apiService.update<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, id.toString(), data),
  
  // Asegurarse que la respuesta de delete sea consistente (puede ser void o el objeto eliminado)
  delete: (id: number) => apiService.delete<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, id.toString()),
  
  // --- Funciones CRUD para Tipos de Campeonato ---
  // (Mover las funciones sueltas a este objeto para consistencia)
  getAllTipos: () => apiService.getAll<TipoCampeonatoResponse[]>(TIPOS_ENDPOINT),
  
  getTipoById: (id: number) => apiService.getById<TipoCampeonatoResponse>(TIPOS_ENDPOINT, id.toString()),
  
  createTipo: (data: TipoCampeonatoCreate) => apiService.create<TipoCampeonatoResponse>(TIPOS_ENDPOINT, data),
  
  updateTipo: (id: number, data: TipoCampeonatoUpdate) => 
    apiService.update<TipoCampeonatoResponse>(TIPOS_ENDPOINT, id.toString(), data),
    
  deleteTipo: (id: number) => apiService.delete<void>(TIPOS_ENDPOINT, id.toString())
};

// Funciones para TipoCampeonato
export const createTipoCampeonato = async (data: TipoCampeonatoCreate): Promise<TipoCampeonatoResponse> => {
  const response = await fetch(`${API_URL}/tipos-campeonato`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al crear el tipo de campeonato');
  }

  return response.json();
};

export const updateTipoCampeonato = async (id: number, data: TipoCampeonatoUpdate): Promise<TipoCampeonatoResponse> => {
  const response = await fetch(`${API_URL}/tipos-campeonato/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el tipo de campeonato');
  }

  return response.json();
};

export const deleteTipoCampeonato = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/tipos-campeonato/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el tipo de campeonato');
  }
};

export const getTiposCampeonato = async (): Promise<TipoCampeonatoResponse[]> => {
  const response = await fetch(`${API_URL}/tipos-campeonato`);

  if (!response.ok) {
    throw new Error('Error al obtener los tipos de campeonato');
  }

  return response.json();
}; 