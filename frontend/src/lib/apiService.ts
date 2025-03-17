// apiService.ts - Servicio centralizado para gestionar llamadas a la API

// URL base de la API
const API_URL = 'http://localhost:8000'; // Ajustar según la configuración del entorno

/**
 * Función para realizar peticiones HTTP con fetch
 * @param endpoint - Ruta del endpoint
 * @param method - Método HTTP (GET, POST, PUT, DELETE)
 * @param data - Datos a enviar en la petición (para POST, PUT)
 * @returns - Promesa con la respuesta
 */
export const fetchApi = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
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
  } catch (error) {
    console.error('Error en la petición API:', error);
    throw error;
  }
};

// Funciones auxiliares para operaciones CRUD comunes
export const apiService = {
  // Obtener todos los recursos de un endpoint
  getAll: <T>(endpoint: string) => fetchApi<T>(endpoint),
  
  // Obtener un recurso específico por su ID
  getById: <T>(endpoint: string, id: string | number) => fetchApi<T>(`${endpoint}/${id}`),
  
  // Crear un nuevo recurso
  create: <T>(endpoint: string, data: any) => fetchApi<T>(endpoint, 'POST', data),
  
  // Actualizar un recurso existente
  update: <T>(endpoint: string, id: string | number, data: any) => 
    fetchApi<T>(`${endpoint}/${id}`, 'PUT', data),
  
  // Eliminar un recurso
  delete: <T>(endpoint: string, id: string | number) => 
    fetchApi<T>(`${endpoint}/${id}`, 'DELETE'),

  // Método personalizado para endpoint específico
  custom: <T>(endpoint: string, method: string = 'GET', data: any = null) => 
    fetchApi<T>(endpoint, method, data)
}; 