// authService.js - Servicio de autenticación

import { apiPost, apiGet } from './api';

/**
 * Inicia sesión con Google
 * @param {string} idToken - Token de Google OAuth
 * @returns {Promise<Object>} { usuario, jwtToken }
 */
export const signInWithGoogle = async (idToken) => {
  try {
    const response = await apiPost('/api/usuarios/iniciarSesionConGoogle', {
      idToken,
    });
    
    return response;
  } catch (error) {
    console.error('Error en signInWithGoogle:', error);
    throw error;
  }
};

/**
 * Registra un nuevo usuario con Google
 * @param {string} idToken - Token de Google OAuth
 * @param {number} rolUsuario - ID del rol (1: Común, 2: Comercio)
 * @returns {Promise<Object>} { usuario, jwtToken }
 */
export const signUpWithGoogle = async (idToken, rolUsuario = 1) => {
  try {
    const response = await apiPost('/api/usuarios/registrarseConGoogle', {
      idToken,
      rolUsuario,
    });
    
    return response;
  } catch (error) {
    console.error('Error en signUpWithGoogle:', error);
    throw error;
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
    console.error('Error en getUserProfile:', error);
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
    console.error('Error en getUserByEmail:', error);
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
    return response;
  } catch (error) {
    console.error('Error en loginTest:', error);
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

export default {
  signInWithGoogle,
  signUpWithGoogle,
  getUserProfile,
  getUserByEmail,
  loginTest,
  checkUserExists,
};
