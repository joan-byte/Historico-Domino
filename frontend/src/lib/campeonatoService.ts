// campeonatoService.ts - Servicio para manejar las llamadas a la API de campeonatos
import axios from 'axios';
import { API_URL } from '../config.js';

// Tipos de datos
export interface CampeonatoResponse {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_campeonato_id: number;
  nombre_tipo_campeonato?: string;
}

export interface CampeonatoCreate {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_campeonato_id: number;
}

export interface TipoCampeonatoResponse {
  id: number;
  nombre: string;
  descripcion: string;
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
  async updateCampeonato(id: number, campeonato: CampeonatoCreate): Promise<CampeonatoResponse> {
    const response = await axios.put(`${this.baseUrl}/${id}`, campeonato);
    return response.data;
  }

  // Eliminar un campeonato
  async deleteCampeonato(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  // Obtener todos los tipos de campeonato
  async getTiposCampeonato(): Promise<TipoCampeonatoResponse[]> {
    const response = await axios.get(`${this.baseUrl}/tipos`);
    return response.data;
  }

  // Crear un nuevo tipo de campeonato
  async createTipoCampeonato(tipo: { nombre: string; descripcion: string }): Promise<TipoCampeonatoResponse> {
    const response = await axios.post(`${this.baseUrl}/tipos`, tipo);
    return response.data;
  }
}

// Exportar una instancia del servicio
export const campeonatoService = new CampeonatoService(); 