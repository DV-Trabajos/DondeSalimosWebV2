// usuariosService.js - Servicio de gestión de usuarios

import { apiGet, apiPost, apiPut, apiDelete } from './api';

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getAllUsuarios = async () => {
  try {
    const response = await apiGet('/api/usuarios/listado');
    return response;
  } catch (error) {
    console.error('Error en getAllUsuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUsuarioById = async (id) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarIdUsuario/${id}`);
    return response;
  } catch (error) {
    console.error('Error en getUsuarioById:', error);
    throw error;
  }
};

/**
 * Busca usuarios por nombre
 * @param {string} nombre - Nombre a buscar
 * @returns {Promise<Array>} Lista de usuarios
 */
export const searchUsuariosByName = async (nombre) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarNombreUsuario/${nombre}`);
    return response;
  } catch (error) {
    console.error('Error en searchUsuariosByName:', error);
    throw error;
  }
};

/**
 * Busca un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUsuarioByEmail = async (email) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarEmail/${email}`);
    return response;
  } catch (error) {
    console.error('Error en getUsuarioByEmail:', error);
    throw error;
  }
};

/**
 * Actualiza un usuario
 * @param {number} id - ID del usuario
 * @param {Object} usuarioData - Datos actualizados
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUsuario = async (id, usuarioData) => {
  try {
    const response = await apiPut(`/api/usuarios/actualizar/${id}`, usuarioData);
    return response;
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    throw error;
  }
};

/**
 * Desactiva un usuario
 * @param {number} id - ID del usuario
 * @returns {Promise<void>}
 */
export const desactivarUsuario = async (id) => {
  try {
    const response = await apiPost(`/api/usuarios/desactivar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en desactivarUsuario:', error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {number} id - ID del usuario
 * @returns {Promise<void>}
 */
export const deleteUsuario = async (id) => {
  try {
    const response = await apiDelete(`/api/usuarios/eliminar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    throw error;
  }
};

/**
 * Obtiene usuarios por rol
 * @param {number} rolId - ID del rol
 * @returns {Promise<Array>} Lista de usuarios con ese rol
 */
export const getUsuariosByRol = async (rolId) => {
  try {
    const usuarios = await getAllUsuarios();
    return usuarios.filter(u => u.iD_RolUsuario === rolId);
  } catch (error) {
    console.error('Error en getUsuariosByRol:', error);
    throw error;
  }
};

/**
 * Obtiene usuarios activos
 * @returns {Promise<Array>} Lista de usuarios activos
 */
export const getUsuariosActivos = async () => {
  try {
    const usuarios = await getAllUsuarios();
    return usuarios.filter(u => u.estado === true);
  } catch (error) {
    console.error('Error en getUsuariosActivos:', error);
    throw error;
  }
};

/**
 * Obtiene usuarios inactivos
 * @returns {Promise<Array>} Lista de usuarios inactivos
 */
export const getUsuariosInactivos = async () => {
  try {
    const usuarios = await getAllUsuarios();
    return usuarios.filter(u => u.estado === false);
  } catch (error) {
    console.error('Error en getUsuariosInactivos:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario actual
 * @param {Object} profileData - Datos del perfil
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async (userId, profileData) => {
  try {
    const response = await updateUsuario(userId, profileData);
    return response;
  } catch (error) {
    console.error('Error en updateProfile:', error);
    throw error;
  }
};

export default {
  getAllUsuarios,
  getUsuarioById,
  searchUsuariosByName,
  getUsuarioByEmail,
  updateUsuario,
  desactivarUsuario,
  deleteUsuario,
  getUsuariosByRol,
  getUsuariosActivos,
  getUsuariosInactivos,
  updateProfile,
};
