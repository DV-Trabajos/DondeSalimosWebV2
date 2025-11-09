// usuariosService.js - Servicio completo de usuarios

import { apiGet, apiPut, apiDelete } from './api';

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
 * Alias para getAllUsuarios (compatibilidad)
 */
export const getUsuarios = getAllUsuarios;

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
 * Obtiene un usuario por email
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
 * Busca usuarios por nombre
 * @param {string} nombre - Nombre o parte del nombre
 * @returns {Promise<Array>} Lista de usuarios encontrados
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
 * Actualiza un usuario
 * @param {number} id - ID del usuario
 * @param {Object} usuario - Datos actualizados del usuario
 * @param {string} usuario.nombreUsuario - Nombre de usuario
 * @param {string} usuario.correo - Email
 * @param {string} usuario.telefono - Teléfono (opcional)
 * @param {boolean} usuario.estado - Estado activo/inactivo
 * @param {number} usuario.iD_RolUsuario - ID del rol
 * @returns {Promise<Object>} Respuesta de la actualización
 */
export const updateUsuario = async (id, usuario) => {
  try {
    const response = await apiPut(`/api/usuarios/actualizar/${id}`, usuario);
    return response;
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    throw error;
  }
};

/**
 * Desactiva un usuario (cambia estado a false)
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Respuesta de la desactivación
 */
export const desactivarUsuario = async (id) => {
  try {
    const response = await apiPut(`/api/usuarios/desactivar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en desactivarUsuario:', error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Respuesta de la eliminación
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
 * Filtra usuarios por rol
 * @param {Array} usuarios - Lista de usuarios
 * @param {number} rolId - ID del rol (1: Común, 2: Comercio, 3: Admin)
 * @returns {Array} Usuarios filtrados
 */
export const filterUsuariosByRole = (usuarios, rolId) => {
  return usuarios.filter(u => u.iD_RolUsuario === rolId);
};

/**
 * Filtra usuarios por estado
 * @param {Array} usuarios - Lista de usuarios
 * @param {boolean} estado - Estado a filtrar (true = activos, false = inactivos)
 * @returns {Array} Usuarios filtrados
 */
export const filterUsuariosByEstado = (usuarios, estado) => {
  return usuarios.filter(u => u.estado === estado);
};

/**
 * Obtiene usuarios activos
 * @param {Array} usuarios - Lista de usuarios
 * @returns {Array} Usuarios activos
 */
export const getActiveUsuarios = (usuarios) => {
  return filterUsuariosByEstado(usuarios, true);
};

/**
 * Obtiene usuarios inactivos
 * @param {Array} usuarios - Lista de usuarios
 * @returns {Array} Usuarios inactivos
 */
export const getInactiveUsuarios = (usuarios) => {
  return filterUsuariosByEstado(usuarios, false);
};

/**
 * Cuenta usuarios por rol
 * @param {Array} usuarios - Lista de usuarios
 * @param {number} rolId - ID del rol
 * @returns {number} Cantidad de usuarios con ese rol
 */
export const countUsuariosByRole = (usuarios, rolId) => {
  return filterUsuariosByRole(usuarios, rolId).length;
};

/**
 * Verifica si un email ya está en uso
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} true si ya existe
 */
export const checkEmailExists = async (email) => {
  try {
    await getUsuarioByEmail(email);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Obtiene el nombre del rol
 * @param {number} rolId - ID del rol
 * @returns {string} Nombre del rol
 */
export const getRoleName = (rolId) => {
  const roles = {
    1: 'Usuario Común',
    2: 'Usuario Comercio',
    3: 'Administrador',
  };
  return roles[rolId] || 'Desconocido';
};

export default {
  getAllUsuarios,
  getUsuarios,
  getUsuarioById,
  getUsuarioByEmail,
  searchUsuariosByName,
  updateUsuario,
  desactivarUsuario,
  deleteUsuario,
  filterUsuariosByRole,
  filterUsuariosByEstado,
  getActiveUsuarios,
  getInactiveUsuarios,
  countUsuariosByRole,
  checkEmailExists,
  getRoleName,
};