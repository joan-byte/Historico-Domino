import { API_URL } from '../config';

// Interfaces basadas en los schemas del backend
export interface TipoCampeonatoBase {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface TipoCampeonatoCreate extends TipoCampeonatoBase {}

export interface TipoCampeonatoUpdate extends Partial<TipoCampeonatoBase> {}

export interface TipoCampeonatoResponse extends TipoCampeonatoBase {
  id: number;
}

// Función genérica para manejar las respuestas de la API (reutilizable)
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: response.statusText || 'Error desconocido en la API' };
    }
    const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
    console.error('Error en API:', errorMessage, errorData);
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// --- Funciones del Servicio ---
const BASE_URL = `${API_URL}/tipos-campeonato`;

/**
 * Obtener todos los tipos de campeonato.
 * @returns Lista de tipos de campeonato
 */
export const getTiposCampeonato = async (): Promise<TipoCampeonatoResponse[]> => {
  try {
    const response = await fetch(BASE_URL);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al obtener tipos de campeonato:", error);
    throw error;
  }
};

/**
 * Obtener un tipo de campeonato por su ID.
 * @param id - ID del tipo de campeonato
 * @returns El tipo de campeonato encontrado
 */
export const getTipoCampeonatoById = async (id: number): Promise<TipoCampeonatoResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error al obtener el tipo de campeonato ${id}:`, error);
    throw error;
  }
};

/**
 * Crear un nuevo tipo de campeonato.
 * @param tipoData - Datos del tipo a crear
 * @returns El tipo de campeonato creado
 */
export const createTipoCampeonato = async (tipoData: TipoCampeonatoCreate): Promise<TipoCampeonatoResponse> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tipoData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error al crear el tipo de campeonato:", error);
    throw error;
  }
};

/**
 * Actualizar un tipo de campeonato existente.
 * @param id - ID del tipo a actualizar
 * @param tipoData - Datos a actualizar
 * @returns El tipo de campeonato actualizado
 */
export const updateTipoCampeonato = async (id: number, tipoData: TipoCampeonatoUpdate): Promise<TipoCampeonatoResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tipoData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error al actualizar el tipo de campeonato ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un tipo de campeonato.
 * @param id - ID del tipo a eliminar
 * @returns Null si la operación fue exitosa (204 No Content)
 */
export const deleteTipoCampeonato = async (id: number): Promise<null> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return await handleResponse(response); // handleResponse devuelve null para 204
  } catch (error) {
    console.error(`Error al eliminar el tipo de campeonato ${id}:`, error);
    throw error;
  }
}; 