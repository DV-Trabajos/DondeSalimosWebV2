// authService.js - Servicio de autenticación

import { apiPost, apiGet, storeJwtToken, clearJwtToken } from './api';

/**
 * Inicia sesión con Google
 * @param {string} idToken - Token de Google OAuth
 * @returns {Promise<Object>} { usuario, jwtToken }
 */
export const signInWithGoogle = async (idToken) => {
  try {
    console.log('🔐 Iniciando sesión con Google...');
    const response = await apiPost('/api/usuarios/iniciarSesionConGoogle', {
      idToken,
    });
    
    console.log('📥 Respuesta del backend:', response);
    
    // ✅ CRÍTICO: Guardar el JWT en localStorage
    if (response.jwtToken) {
      storeJwtToken(response.jwtToken);
      console.log('✅ JWT guardado correctamente en localStorage');
    } else {
      console.warn('⚠️ No se recibió JWT del backend');
    }
    
    // También guardar datos del usuario si es necesario
    if (response.usuario) {
      localStorage.setItem('userData', JSON.stringify(response.usuario));
      console.log('✅ Datos de usuario guardados');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en signInWithGoogle:', error);
    throw error;
  }
};

/**
 * Registra un nuevo usuario con Google
 * @param {string} idToken - Token de Google OAuth
 * @param {number} rolUsuario - ID del rol (16: Común, 3: Comercio, 2: Admin)
 * @returns {Promise<Object>} { usuario, jwtToken }
 */
export const signUpWithGoogle = async (idToken, rolUsuario = 16) => {
  try {
    console.log('📝 Registrando usuario con Google...');
    const response = await apiPost('/api/usuarios/registrarseConGoogle', {
      idToken,
      rolUsuario,
    });
    
    console.log('📥 Respuesta del backend:', response);
    
    // ✅ CRÍTICO: Guardar el JWT en localStorage
    if (response.jwtToken) {
      storeJwtToken(response.jwtToken);
      console.log('✅ JWT guardado correctamente en localStorage');
    } else {
      console.warn('⚠️ No se recibió JWT del backend');
    }
    
    // También guardar datos del usuario
    if (response.usuario) {
      localStorage.setItem('userData', JSON.stringify(response.usuario));
      console.log('✅ Datos de usuario guardados');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en signUpWithGoogle:', error);
    throw error;
  }
};

/**
 * Cierra sesión del usuario
 */
export const signOut = () => {
  try {
    clearJwtToken();
    localStorage.removeItem('userData');
    console.log('✅ Sesión cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
  }
};

/**
 * Obtiene el perfil del usuario actual
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarIdUsuario/${userId}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getUserProfile:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserByEmail = async (email) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarEmail/${email}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getUserByEmail:', error);
    throw error;
  }
};

/**
 * Login de testing (solo para desarrollo)
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} { token, usuario }
 */
export const loginTest = async (email) => {
  try {
    const response = await apiPost('/api/usuarios/login-test', { email });
    
    // Guardar JWT si viene en la respuesta
    if (response.token) {
      storeJwtToken(response.token);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en loginTest:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario existe
 * @param {string} email - Email del usuario
 * @returns {Promise<boolean>} true si existe
 */
export const checkUserExists = async (email) => {
  try {
    await getUserByEmail(email);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {Object|null} Datos del usuario o null
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario actual:', error);
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si está autenticado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('jwtToken');
  return !!token;
};

export default {
  signInWithGoogle,
  signUpWithGoogle,
  signOut,
  getUserProfile,
  getUserByEmail,
  loginTest,
  checkUserExists,
  getCurrentUser,
  isAuthenticated,
};