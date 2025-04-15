// config.ts - Configuración global de la aplicación

// URL base de la API
// @ts-ignore - import.meta.env es una característica de Vite
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Histórico Domino',
  version: '1.0.0',
  description: 'Sistema de gestión de campeonatos de dominó'
};

// Configuración de paginación por defecto
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100]
};

// Configuración de fechas
export const DATE_CONFIG = {
  format: 'DD/MM/YYYY',
  locale: 'es-ES'
};

// Configuración de temas
export const THEME_CONFIG = {
  primary: '#4F46E5',
  secondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6'
}; 