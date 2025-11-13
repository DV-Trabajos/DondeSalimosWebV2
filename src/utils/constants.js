// constants.js - Constantes del proyecto ACTUALIZADO

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Google
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Roles de Usuario
export const ROLES = {
  USUARIO_COMUN: 16,
  USUARIO_COMERCIO: 3,
  ADMINISTRADOR: 2,
};

export const ROLE_DESCRIPTIONS = {
  16: 'Usuario Común',
  3: 'Usuario Comercio',
  2: 'Administrador',
};

// Estados
export const ESTADOS = {
  ACTIVO: true,
  INACTIVO: false,
};

// Estados de Comercio
export const COMERCIO_ESTADOS = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

// Tipos de Comercio
export const TIPOS_COMERCIO = {
  BAR: 1,
  BOLICHE: 2,
  RESTAURANTE: 3,
  CAFE: 4,
  DISCOTECA: 5,
  PUB: 6,
  OTRO: 7,
};

export const TIPOS_COMERCIO_DESCRIPCION = {
  1: 'Bar',
  2: 'Boliche/Club',
  3: 'Restaurante',
  4: 'Café',
  5: 'Discoteca',
  6: 'Pub',
  7: 'Otro',
};

// ✅ NUEVO - Constantes de filtros compartidas entre componentes
export const TIPOS_COMERCIO_FILTER = [
  { id: 'all', label: 'Todos', icon: '🏪' },
  { id: '1', label: 'Bares', icon: '🍺' },
  { id: '2', label: 'Boliches', icon: '🎉' },
  { id: '3', label: 'Restaurantes', icon: '🍽️' },
  { id: '4', label: 'Cafés', icon: '☕' },
  { id: '5', label: 'Discotecas', icon: '💃' },
  { id: '6', label: 'Pubs', icon: '🍻' },
];

// Estados de Reserva
export const RESERVA_ESTADOS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
};

// Storage Keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwtToken',
  USER_DATA: 'userData',
  GOOGLE_TOKEN: 'googleToken',
};

// Mensajes
export const MENSAJES = {
  ERROR_GENERICO: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
  ERROR_CONEXION: 'Error de conexión. Verifica tu internet.',
  ERROR_AUTENTICACION: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  EXITO_GENERICO: 'Operación exitosa.',
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  BAR_MANAGEMENT: '/bar-management',
  ADMIN_PANEL: '/admin',
  RESERVAS: '/reservas',
  NOT_FOUND: '*',
};

// Configuración de búsqueda de lugares
export const SEARCH_CONFIG = {
  DEFAULT_RADIUS: 5000, // 5km
  MAX_RADIUS: 50000, // 50km
  DEFAULT_TYPE: 'bar',
};

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Validaciones
export const VALIDATIONS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  CUIT_LENGTH: 11,
  TELEFONO_MIN_LENGTH: 10,
  TELEFONO_MAX_LENGTH: 15,
};

// Paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export default {
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_MAPS_API_KEY,
  ROLES,
  ROLE_DESCRIPTIONS,
  ESTADOS,
  COMERCIO_ESTADOS,
  TIPOS_COMERCIO,
  TIPOS_COMERCIO_DESCRIPCION,
  TIPOS_COMERCIO_FILTER, // ✅ AGREGADO
  RESERVA_ESTADOS,
  STORAGE_KEYS,
  MENSAJES,
  ROUTES,
  SEARCH_CONFIG,
  DATE_FORMATS,
  VALIDATIONS,
  PAGINATION,
};