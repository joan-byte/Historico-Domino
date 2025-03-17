// campeonatoService.ts - Servicio para gestionar los campeonatos
import { apiService } from './apiService';

// Tipo para la respuesta de Campeonato desde el backend
export interface CampeonatoResponse {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_campeonato_id: number;
  nombre_tipo_campeonato?: string;
}

// Tipo para los datos para crear un Campeonato
export interface CampeonatoCreate {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_campeonato_id: number;
}

// Tipo para la respuesta de TipoCampeonato
export interface TipoCampeonatoResponse {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Endpoints para campeonatos
const CAMPEONATOS_ENDPOINT = '/campeonatos';
const TIPO_CAMPEONATOS_ENDPOINT = '/tipos-campeonato';

// Servicio para gestionar campeonatos
export const campeonatoService = {
  // Obtener todos los campeonatos
  getAll: () => apiService.getAll<CampeonatoResponse[]>(CAMPEONATOS_ENDPOINT),
  
  // Obtener un campeonato por su ID
  getById: (id: number) => apiService.getById<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, id),
  
  // Crear un nuevo campeonato
  create: (campeonatoData: CampeonatoCreate) => 
    apiService.create<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, campeonatoData),
  
  // Actualizar un campeonato existente
  update: (id: number, campeonatoData: Partial<CampeonatoCreate>) => 
    apiService.update<CampeonatoResponse>(CAMPEONATOS_ENDPOINT, id, campeonatoData),
  
  // Eliminar un campeonato
  delete: (id: number) => apiService.delete<any>(CAMPEONATOS_ENDPOINT, id),
  
  // Obtener todos los tipos de campeonato
  getAllTipos: () => apiService.getAll<TipoCampeonatoResponse[]>(TIPO_CAMPEONATOS_ENDPOINT),
  
  // Obtener un tipo de campeonato por su ID
  getTipoById: (id: number) => 
    apiService.getById<TipoCampeonatoResponse>(TIPO_CAMPEONATOS_ENDPOINT, id),
  
  // Crear un nuevo tipo de campeonato
  createTipo: (data: { nombre: string, descripcion?: string }) => 
    apiService.create<TipoCampeonatoResponse>(TIPO_CAMPEONATOS_ENDPOINT, data),
  
  // Obtener campeonatos activos (fecha_fin > hoy)
  getActivos: () => 
    apiService.custom<CampeonatoResponse[]>(`${CAMPEONATOS_ENDPOINT}/activos`)
}; 