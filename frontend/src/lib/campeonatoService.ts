// campeonatoService.ts - Servicio para manejar las llamadas a la API de campeonatos
import { apiService } from './apiService';
// Eliminar importación de API_URL si no se usa
// import { API_URL } from '../config';

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

// --- Endpoints (Corregidos: sin /api/) --- 
const CAMPEONATOS_ENDPOINT = '/campeonatos';
const TIPOS_ENDPOINT = '/tipos-campeonato';

// --- Objeto de Servicio --- 
export const campeonatoService = {
  // --- Funciones CRUD para Campeonatos (Usando endpoints relativos) ---
  getAll: (skip: number = 0, limit: number = 100) => {
    const relativeEndpoint = `${CAMPEONATOS_ENDPOINT}/?skip=${skip}&limit=${limit}`;
    return apiService.custom<CampeonatosPaginados>(relativeEndpoint); 
  },
  
  getById: (nch: string) => {
    const relativeEndpoint = `${CAMPEONATOS_ENDPOINT}/${nch}/`;
    return apiService.custom<CampeonatoResponse>(relativeEndpoint);
  },
  
  create: (data: CampeonatoCreate) => {
      // apiService.create maneja la URL base y el método POST
      return apiService.create<CampeonatoResponse>(CAMPEONATOS_ENDPOINT + '/', data);
  },
  
  update: (nch: string, data: CampeonatoUpdate) => {
     // apiService.update maneja la URL base, ID y método PUT
     // Asegurarse que apiService.update funcione con NCH string o adaptar
     // Si no funciona, usar custom:
     // const relativeEndpoint = `${CAMPEONATOS_ENDPOINT}/${nch}/`;
     // return apiService.custom<CampeonatoResponse>(relativeEndpoint, 'PUT', data);
     return apiService.update<CampeonatoResponse>(CAMPEONATOS_ENDPOINT + '/', nch, data);
  },
  
  delete: (nch: string): Promise<void> => {
    // apiService.delete maneja la URL base, ID y método DELETE
    // Asegurarse que apiService.delete funcione con NCH string o adaptar
    // Si no funciona, usar custom:
    // const relativeEndpoint = `${CAMPEONATOS_ENDPOINT}/${nch}/`;
    // return apiService.custom<void>(relativeEndpoint, 'DELETE');
    return apiService.delete<void>(CAMPEONATOS_ENDPOINT + '/', nch);
  },
  
  // --- Funciones CRUD para Tipos de Campeonato (Usando endpoints relativos) --- 
  getAllTipos: () => {
     const relativeEndpoint = `${TIPOS_ENDPOINT}/`;
     // apiService.getAll espera solo el endpoint relativo
     return apiService.getAll<TipoCampeonatoResponse[]>(relativeEndpoint);
  },
  
  getTipoById: (id: number) => {
     const relativeEndpoint = `${TIPOS_ENDPOINT}/${id}/`;
     // Usar custom porque getById podría no añadir la barra final
     return apiService.custom<TipoCampeonatoResponse>(relativeEndpoint);
     // Alternativa si getById funciona: return apiService.getById<TipoCampeonatoResponse>(TIPOS_ENDPOINT, id);
  },
  
  createTipo: (data: TipoCampeonatoCreate) => {
     return apiService.create<TipoCampeonatoResponse>(TIPOS_ENDPOINT + '/', data);
  },
  
  updateTipo: (id: number, data: TipoCampeonatoUpdate) => {
     // Usar custom para asegurar la barra final y el método PATCH
     const relativeEndpoint = `${TIPOS_ENDPOINT}/${id}/`;
     return apiService.custom<TipoCampeonatoResponse>(relativeEndpoint, 'PATCH', data);
     // Alternativa si update funciona: return apiService.update<TipoCampeonatoResponse>(TIPOS_ENDPOINT, id, data);
  },
    
  deleteTipo: (id: number) => {
    // Usar custom para asegurar la barra final y el método DELETE
    const relativeEndpoint = `${TIPOS_ENDPOINT}/${id}/`;
    return apiService.custom<void>(relativeEndpoint, 'DELETE');
    // Alternativa si delete funciona: return apiService.delete<void>(TIPOS_ENDPOINT, id);
  }
};

// Eliminar funciones exportadas individualmente si ya no se necesitan
/*
export const createTipoCampeonato = ... 
export const updateTipoCampeonato = ... 
export const deleteTipoCampeonato = ... 
export const getTiposCampeonato = ... 
*/ 