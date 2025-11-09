// comerciosService.js - Servicio completo de comercios

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
 * @param {string} nombre - Nombre o parte del nombre
 * @returns {Promise<Array>} Lista de comercios encontrados
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
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de comercios del usuario
 */
export const getComerciosByUsuario = async (userId) => {
  try {
    const response = await apiGet(`/api/comercios/buscarComerciosPorUsuario/${userId}`);
    return response;
  } catch (error) {
    console.error('Error en getComerciosByUsuario:', error);
    throw error;
  }
};

/**
 * Crea un nuevo comercio
 * @param {Object} comercio - Datos del comercio
 * @returns {Promise<Object>} Comercio creado
 */
export const createComercio = async (comercio) => {
  try {
    const response = await apiPost('/api/comercios/crear', comercio);
    return response;
  } catch (error) {
    console.error('Error en createComercio:', error);
    throw error;
  }
};

/**
 * Actualiza un comercio existente
 * @param {number} id - ID del comercio
 * @param {Object} comercio - Datos actualizados
 * @returns {Promise<Object>} Respuesta de la actualización
 */
export const updateComercio = async (id, comercio) => {
  try {
    const response = await apiPut(`/api/comercios/actualizar/${id}`, comercio);
    return response;
  } catch (error) {
    console.error('Error en updateComercio:', error);
    throw error;
  }
};

/**
 * Elimina un comercio
 * @param {number} id - ID del comercio
 * @returns {Promise<Object>} Respuesta de la eliminación
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
 * Filtra comercios aprobados
 * @param {Array} comercios - Lista de comercios
 * @returns {Array} Comercios aprobados
 */
export const filterApprovedComercios = (comercios) => {
  return comercios.filter(c => c.estado === true);
};

/**
 * Filtra comercios por tipo
 * @param {Array} comercios - Lista de comercios
 * @param {number} tipoId - ID del tipo de comercio
 * @returns {Array} Comercios filtrados
 */
export const filterComerciosByType = (comercios, tipoId) => {
  if (!tipoId || tipoId === 'all') return comercios;
  return comercios.filter(c => c.iD_TipoComercio === parseInt(tipoId));
};

/**
 * Calcula la distancia entre dos puntos (en metros)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en metros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Ordena comercios por distancia
 * @param {Array} comercios - Lista de comercios
 * @param {Object} userLocation - Ubicación del usuario { latitude, longitude }
 * @returns {Array} Comercios ordenados por distancia
 */
export const sortComerciosByDistance = (comercios, userLocation) => {
  if (!userLocation) return comercios;

  return [...comercios].sort((a, b) => {
    const distA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.latitud,
      a.longitud
    );
    const distB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.latitud,
      b.longitud
    );
    return distA - distB;
  });
};

export default {
  getAllComercios,
  getComercioById,
  searchComerciosByName,
  getComerciosByUsuario,
  createComercio,
  updateComercio,
  deleteComercio,
  filterApprovedComercios,
  filterComerciosByType,
  calculateDistance,
  sortComerciosByDistance,
};