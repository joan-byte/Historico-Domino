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

// Importar ClubResponse si existe y se va a usar
// import type { ClubResponse } from './clubService'; // Asumiendo que existe
// Placeholder si no se importa ClubResponse
export interface ClubResponse { 
  codigo_club: string;
  nombre: string;
  // otros campos relevantes del club...
}

export interface CampeonatoBase {
  nombre: string;
  fecha_inicio: string;  // formato YYYY-MM-DD
  dias: number;
  partidas: number;
  pm: number;
  gb: boolean;
  gbp?: number | null; // opcional y puede ser null
  tipo_campeonato_id: number;
  club_codigo: string;
}

export interface CampeonatoCreate extends CampeonatoBase {}

export interface CampeonatoUpdate extends Partial<Omit<CampeonatoBase, 'tipo_campeonato_id'>> { 
  // Incluir explícitamente los campos que sí se pueden actualizar desde el form
  nombre?: string;
  fecha_inicio?: string;
  dias?: number;
  partidas?: number;
  pm?: number;
  gb?: boolean;
  gbp?: number | null; // Asegurar que se puede poner a null
  club_codigo?: string; // Permitir club_codigo aunque sea FK, necesario para NCH calc
}

export interface CampeonatoResponse extends CampeonatoBase {
  nch: string; // Usar NCH como identificador
  // Añadir objetos anidados si la API los devuelve (ajustar según la respuesta real)
  tipo_campeonato?: TipoCampeonato; 
  club?: ClubResponse; 
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

// --- Endpoints --- 
const CAMPEONATOS_ENDPOINT = '/api/campeonatos';
const TIPOS_ENDPOINT = '/api/tipos-campeonato';

// --- Objeto de Servicio --- 
export const campeonatoService = {
  // --- Funciones CRUD para Campeonatos (Actualizadas) ---
  getAll: (skip: number = 0, limit: number = 100) => {
    // CORRECTO: Construye solo el endpoint relativo con parámetros
    const relativeEndpoint = `${CAMPEONATOS_ENDPOINT}/?skip=${skip}&limit=${limit}`;
    // Pasa solo el endpoint relativo a apiService.custom
    return apiService.custom<CampeonatosPaginados>(relativeEndpoint); 
  },
  
  // Usar NCH (string) como ID
  getById: (nch: string) => {
    // CORRECTO: Construye solo el endpoint relativo con el ID
    const relativeEndpoint = `${CAMPEONATOS_ENDPOINT}/${nch}/`;
    // Pasa solo el endpoint relativo a apiService.custom
    return apiService.custom<CampeonatoResponse>(relativeEndpoint);
  },
  
  // Usar apiService.create (asume que internamente añade API_URL)
  create: (data: CampeonatoCreate) => {
      // Pasar solo el endpoint relativo, apiService debería añadir API_URL y la barra final?
      // Si apiService.create NO añade la barra final, debe ser CAMPEONATOS_ENDPOINT + '/'
      return apiService.create<CampeonatoResponse>(CAMPEONATOS_ENDPOINT + '/', data);
  },
  
  // Usar NCH (string) como ID y apiService.update
  update: (nch: string, data: CampeonatoUpdate) => {
    // Pasar endpoint relativo y nch. apiService debería añadir API_URL y la barra final?
    // Si apiService.update NO añade la barra final, debe ser CAMPEONATOS_ENDPOINT + '/'
    return apiService.update<CampeonatoResponse>(CAMPEONATOS_ENDPOINT + '/', nch, data);
  },
  
  // Usar NCH (string) como ID y apiService.delete
  delete: (nch: string): Promise<void> => {
    // Pasar endpoint relativo y nch.
    // Si apiService.delete NO añade la barra final, debe ser CAMPEONATOS_ENDPOINT + '/'
    return apiService.delete<void>(CAMPEONATOS_ENDPOINT + '/', nch);
  },
  
  // --- Funciones CRUD para Tipos de Campeonato (Ajustadas a apiService) --- 
  getAllTipos: () => apiService.getAll<TipoCampeonatoResponse[]>(TIPOS_ENDPOINT + '/'), // Asumiendo que getAll sí necesita la URL completa o el endpoint relativo con barra
  
  getTipoById: (id: number) => apiService.getById<TipoCampeonatoResponse>(TIPOS_ENDPOINT + '/', id.toString()), // Asumiendo que getById maneja el id
  
  createTipo: (data: TipoCampeonatoCreate) => apiService.create<TipoCampeonatoResponse>(TIPOS_ENDPOINT + '/', data),
  
  updateTipo: (id: number, data: TipoCampeonatoUpdate) => 
    apiService.update<TipoCampeonatoResponse>(TIPOS_ENDPOINT + '/', id.toString(), data),
    
  deleteTipo: (id: number) => apiService.delete<void>(TIPOS_ENDPOINT + '/', id.toString())
};

// Funciones para TipoCampeonato (Restaurando el código original)
export const createTipoCampeonato = async (data: TipoCampeonatoCreate): Promise<TipoCampeonatoResponse> => {
  const response = await fetch(`${API_URL}${TIPOS_ENDPOINT}/`, {
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
  const response = await fetch(`${API_URL}${TIPOS_ENDPOINT}/${id}/`, {
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
  const response = await fetch(`${API_URL}${TIPOS_ENDPOINT}/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el tipo de campeonato');
  }
};

export const getTiposCampeonato = async (): Promise<TipoCampeonatoResponse[]> => {
  const response = await fetch(`${API_URL}${TIPOS_ENDPOINT}/`); // Restaurado

  if (!response.ok) { // Restaurado
    throw new Error('Error al obtener los tipos de campeonato'); // Restaurado
  }

  return response.json(); // Restaurado
}; 