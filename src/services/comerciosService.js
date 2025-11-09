// comerciosService.js - Servicio de comercios/bares

import { apiGet, apiPost, apiPut, apiDelete } from './api';

/**
 * Obtiene todos los comercios
 * @returns {Promise<Array>} Lista de comercios
 */
export const getAllComercios = async () => {
  try {
    const response = await apiGet('/api/comercios/listado');
    return response;
  } catch (error) {
    console.error('Error en getAllComercios:', error);
    throw error;
  }
};

/**
 * Obtiene un comercio por ID
 * @param {number} id - ID del comercio
 * @returns {Promise<Object>} Datos del comercio
 */
export const getComercioById = async (id) => {
  try {
    const response = await apiGet(`/api/comercios/buscarIdComercio/${id}`);
    return response;
  } catch (error) {
    console.error('Error en getComercioById:', error);
    throw error;
  }
};

/**
 * Busca comercios por nombre
 * @param {string} nombre - Nombre a buscar
 * @returns {Promise<Array>} Lista de comercios
 */
export const searchComerciosByName = async (nombre) => {
  try {
    const response = await apiGet(`/api/comercios/buscarNombreComercio/${nombre}`);
    return response;
  } catch (error) {
    console.error('Error en searchComerciosByName:', error);
    throw error;
  }
};

/**
 * Obtiene comercios de un usuario específico
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de comercios del usuario
 */
export const getComerciosByUsuario = async (usuarioId) => {
  try {
    const response = await apiGet(`/api/comercios/buscarComerciosPorUsuario/${usuarioId}`);
    return response;
  } catch (error) {
    console.error('Error en getComerciosByUsuario:', error);
    throw error;
  }
};

/**
 * Crea un nuevo comercio
 * @param {Object} comercioData - Datos del comercio
 * @returns {Promise<Object>} Comercio creado
 */
export const createComercio = async (comercioData) => {
  try {
    const response = await apiPost('/api/comercios/crear', comercioData);
    return response;
  } catch (error) {
    console.error('Error en createComercio:', error);
    throw error;
  }
};

/**
 * Actualiza un comercio existente
 * @param {number} id - ID del comercio
 * @param {Object} comercioData - Datos actualizados
 * @returns {Promise<Object>} Comercio actualizado
 */
export const updateComercio = async (id, comercioData) => {
  try {
    const response = await apiPut(`/api/comercios/actualizar/${id}`, comercioData);
    return response;
  } catch (error) {
    console.error('Error en updateComercio:', error);
    throw error;
  }
};

/**
 * Elimina un comercio
 * @param {number} id - ID del comercio
 * @returns {Promise<void>}
 */
export const deleteComercio = async (id) => {
  try {
    const response = await apiDelete(`/api/comercios/eliminar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en deleteComercio:', error);
    throw error;
  }
};

/**
 * Obtiene comercios filtrados por tipo
 * @param {number} tipoId - ID del tipo de comercio
 * @returns {Promise<Array>} Lista de comercios filtrados
 */
export const getComerciosByTipo = async (tipoId) => {
  try {
    const comercios = await getAllComercios();
    return comercios.filter(c => c.iD_TipoComercio === tipoId);
  } catch (error) {
    console.error('Error en getComerciosByTipo:', error);
    throw error;
  }
};

/**
 * Obtiene comercios aprobados
 * @returns {Promise<Array>} Lista de comercios aprobados
 */
export const getComerciosAprobados = async () => {
  try {
    const comercios = await getAllComercios();
    return comercios.filter(c => c.estado === true);
  } catch (error) {
    console.error('Error en getComerciosAprobados:', error);
    throw error;
  }
};

/**
 * Obtiene comercios pendientes de aprobación
 * @returns {Promise<Array>} Lista de comercios pendientes
 */
export const getComerciosPendientes = async () => {
  try {
    const comercios = await getAllComercios();
    return comercios.filter(c => c.estado === false);
  } catch (error) {
    console.error('Error en getComerciosPendientes:', error);
    throw error;
  }
};

export default {
  getAllComercios,
  getComercioById,
  searchComerciosByName,
  getComerciosByUsuario,
  createComercio,
  updateComercio,
  deleteComercio,
  getComerciosByTipo,
  getComerciosAprobados,
  getComerciosPendientes,
};
