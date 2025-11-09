// api.js - Cliente Axios con interceptores para JWT

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, MENSAJES } from '../utils/constants';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Funciones de manejo de JWT en localStorage
export const storeJwtToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
    console.log('✅ JWT token almacenado correctamente');
  } catch (error) {
    console.error('❌ Error almacenando JWT token:', error);
  }
};

export const getJwtToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  } catch (error) {
    console.error('❌ Error obteniendo JWT token:', error);
    return null;
  }
};

export const clearJwtToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    console.log('✅ JWT token eliminado correctamente');
  } catch (error) {
    console.error('❌ Error eliminando JWT token:', error);
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✅ Storage limpiado correctamente');
  } catch (error) {
    console.error('❌ Error limpiando storage:', error);
  }
};

// Interceptor de Request - Agregar JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getJwtToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 JWT agregado a la petición:', config.url);
    } else {
      console.log('⚠️ No hay JWT token disponible para:', config.url);
    }
    
    // Log de la petición (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('📤 REQUEST:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejo de errores
api.interceptors.response.use(
  (response) => {
    // Log de la respuesta (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('📥 RESPONSE:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Manejo de errores según el código de estado
    if (error.response) {
      const { status, data } = error.response;
      
      console.error('❌ ERROR RESPONSE:', {
        status,
        url: error.config?.url,
        data,
      });
      
      switch (status) {
        case 401:
          // Token expirado o inválido
          console.log('🔒 Token expirado o inválido, limpiando sesión...');
          clearJwtToken();
          
          // Redirigir al login (puedes usar window.location o tu router)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          error.message = MENSAJES.ERROR_AUTENTICACION;
          break;
          
        case 403:
          error.message = 'No tienes permisos para realizar esta acción';
          break;
          
        case 404:
          error.message = 'Recurso no encontrado';
          break;
          
        case 400:
          error.message = data?.mensaje || data?.message || 'Datos inválidos';
          break;
          
        case 500:
          error.message = 'Error en el servidor. Intenta nuevamente.';
          break;
          
        default:
          error.message = data?.mensaje || data?.message || MENSAJES.ERROR_GENERICO;
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('❌ No hay respuesta del servidor:', error.request);
      error.message = MENSAJES.ERROR_CONEXION;
    } else {
      // Error al configurar la petición
      console.error('❌ Error configurando petición:', error.message);
      error.message = MENSAJES.ERROR_GENERICO;
    }
    
    return Promise.reject(error);
  }
);

// Funciones auxiliares para hacer peticiones

/**
 * GET request
 */
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST request
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT request
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE request
 */
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH request
 */
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Exportar instancia de axios y funciones
export default api;

export {
  api,
  get as apiGet,
  post as apiPost,
  put as apiPut,
  del as apiDelete,
  patch as apiPatch,
};
