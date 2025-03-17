// clubService.ts - Servicio para gestionar los clubs

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

// URL base de la API
const API_URL = 'http://localhost:8000'; // Ajusta según la configuración de tu backend

/**
 * Función para realizar peticiones HTTP con fetch
 * @param endpoint - Ruta del endpoint
 * @param method - Método HTTP (GET, POST, PUT, DELETE)
 * @param data - Datos a enviar en la petición (para POST, PUT)
 * @returns - Promesa con la respuesta
 */
export const fetchApi = async <T>(endpoint: string, method: string = 'GET', data: any = null): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  // Si la respuesta no es exitosa, lanzamos un error
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error en la petición' }));
    throw new Error(error.detail || 'Error en la petición');
  }
  
  // Para peticiones DELETE que no devuelven contenido
  if (response.status === 204) {
    return { success: true } as unknown as T;
  }
  
  return response.json();
};

// Servicio para gestionar clubs
export const clubService = {
  // Obtener todos los clubs
  getAll: () => fetchApi<ClubResponse[]>('/clubs'),
  
  // Obtener un club por su código
  getByCode: (codigo: string) => fetchApi<ClubResponse>(`/clubs/${codigo}`),
  
  // Crear un nuevo club
  create: (clubData: ClubCreate) => fetchApi<ClubResponse>('/clubs', 'POST', clubData),
  
  // Eliminar un club
  delete: (codigo: string) => fetchApi<any>(`/clubs/${codigo}`, 'DELETE')
}; 