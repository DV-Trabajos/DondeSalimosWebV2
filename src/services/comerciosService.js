// comerciosService.js - Servicio completo de comercios CON GEOCODING

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
  return comercios.filter(c => c.iD_TipoComercio === tipoId);
};

/**
 * Calcula la distancia entre dos puntos (en km)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
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
  
  return comercios.sort((a, b) => {
    const distA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.latitud || 0,
      a.longitud || 0
    );
    const distB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.latitud || 0,
      b.longitud || 0
    );
    return distA - distB;
  });
};

/**
 * 🆕 GEOCODING: Convierte una dirección en coordenadas (lat, lng)
 * @param {string} address - Dirección completa (ej: "Av. Corrientes 1234, Buenos Aires")
 * @returns {Promise<{lat: number, lng: number}>} Coordenadas
 */
export const geocodeAddress = async (address) => {
  try {
    // Obtener API KEY desde las variables de entorno
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API Key no configurada');
      throw new Error('API Key no configurada');
    }

    // Codificar la dirección para URL
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

    console.log('🗺️ Geocodificando dirección:', address);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`✅ Coordenadas obtenidas: ${location.lat}, ${location.lng}`);
      
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`⚠️ No se encontraron resultados para: "${address}"`);
      throw new Error('No se encontró la dirección. Verifica que esté correcta.');
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('❌ API Key inválida o sin permisos');
      throw new Error('Error de API Key. Contacta al administrador.');
    } else {
      console.warn(`❌ Geocoding falló - Status: ${data.status}`);
      throw new Error(`Error al geocodificar: ${data.status}`);
    }
  } catch (error) {
    console.error('❌ Error en geocoding:', error);
    throw error;
  }
};

/**
 * 🆕 Valida si las coordenadas están dentro de un rango válido
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
