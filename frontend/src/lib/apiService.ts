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
    
    // Si la respuesta no es exitosa, procesamos el error
    if (!response.ok) {
      const errorData = await response.json();
      
      // Para errores 422, el backend devuelve un objeto con detalles de validación
      if (response.status === 422) {
        const validationErrors = errorData.detail || [];
        const errorMessages = validationErrors.map((error: any) => {
          return `${error.loc.join('.')}: ${error.msg}`;
        });
        throw new Error(errorMessages.join('\n'));
      }
      
      // Para otros errores, usamos el mensaje general
      throw new Error(errorData.detail || 'Error en la petición');
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
  getById: <T>(endpoint: string, id: string | number) => {
    // Eliminar la barra final del endpoint si existe
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    return fetchApi<T>(`${cleanEndpoint}/${id}`);
  },
  
  // Crear un nuevo recurso
  create: <T>(endpoint: string, data: any) => fetchApi<T>(endpoint, 'POST', data),
  
  // Actualizar un recurso existente
  update: <T>(endpoint: string, id: string | number, data: any) => {
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    return fetchApi<T>(`${cleanEndpoint}/${id}`, 'PUT', data);
  },
  
  // Eliminar un recurso
  delete: <T>(endpoint: string, id: string | number) => {
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    return fetchApi<T>(`${cleanEndpoint}/${id}`, 'DELETE');
  },

  // Método personalizado para endpoint específico
  custom: <T>(endpoint: string, method: string = 'GET', data: any = null) => 
    fetchApi<T>(endpoint, method, data)
}; 