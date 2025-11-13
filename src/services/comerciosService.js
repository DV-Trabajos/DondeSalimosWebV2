// src/services/comerciosService.js
// Servicio completo de comercios CON GEOCODING

import { apiGet, apiPost, apiPut, apiDelete } from './api';

// ============================================
// COMERCIOS - CRUD BÁSICO
// ============================================

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

// ============================================
// FILTROS Y UTILIDADES
// ============================================

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
 * Calcula distancia entre dos puntos (Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

/**
 * Ordena comercios por distancia a un punto
 * @param {Array} comercios - Lista de comercios
 * @param {number} userLat - Latitud del usuario
 * @param {number} userLng - Longitud del usuario
 * @returns {Array} Comercios ordenados por distancia
 */
export const sortComerciosByDistance = (comercios, userLat, userLng) => {
  if (!userLat || !userLng) return comercios;
  
  return comercios
    .map(comercio => ({
      ...comercio,
      distance: comercio.latitud && comercio.longitud
        ? calculateDistance(userLat, userLng, comercio.latitud, comercio.longitud)
        : Infinity
    }))
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Geocodifica una dirección usando Google Geocoding API
 * @param {string} address - Dirección a geocodificar
 * @returns {Promise<Object>} Objeto con lat y lng
 */
export const geocodeAddress = async (address) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!address || !GOOGLE_MAPS_API_KEY) {
    throw new Error('Dirección o API Key faltante');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('No se encontraron resultados para esta dirección.');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Error de API Key. Contacta al administrador.');
    } else {
      throw new Error(`Error al geocodificar: ${data.status}`);
    }
  } catch (error) {
    console.error('❌ Error en geocoding:', error);
    throw error;
  }
};

/**
 * Valida si las coordenadas están dentro de un rango válido
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si las coordenadas son válidas
 */
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

// Export default para compatibilidad
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
  geocodeAddress,
  validateCoordinates,
};
