// campeonatoService.ts - Servicio para manejar las llamadas a la API de campeonatos
import axios from 'axios';
import { API_URL } from '../config.js';

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

// Clase para el servicio de campeonatos
class CampeonatoService {
  private baseUrl = `${API_URL}/campeonatos`;

  // Obtener todos los campeonatos
  async getCampeonatos(): Promise<CampeonatoResponse[]> {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }

  // Obtener un campeonato por ID
  async getCampeonatoById(id: number): Promise<CampeonatoResponse> {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Crear un nuevo campeonato
  async createCampeonato(campeonato: CampeonatoCreate): Promise<CampeonatoResponse> {
    const response = await axios.post(this.baseUrl, campeonato);
    return response.data;
  }

  // Actualizar un campeonato
  async updateCampeonato(id: number, campeonato: CampeonatoUpdate): Promise<CampeonatoResponse> {
    const response = await axios.put(`${this.baseUrl}/${id}`, campeonato);
    return response.data;
  }

  // Eliminar un campeonato
  async deleteCampeonato(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  // Obtener todos los tipos de campeonato
  async getTiposCampeonato(): Promise<TipoCampeonato[]> {
    const response = await axios.get(`${this.baseUrl}/tipos`);
    return response.data;
  }

  // Crear un nuevo tipo de campeonato
  async createTipoCampeonato(tipo: { nombre: string; descripcion: string }): Promise<TipoCampeonato> {
    const response = await axios.post(`${this.baseUrl}/tipos`, tipo);
    return response.data;
  }
}

// Exportar una instancia del servicio
export const campeonatoService = new CampeonatoService();

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