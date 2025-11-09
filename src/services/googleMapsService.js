// googleMapsService.js - Servicio de Google Maps API

import axios from 'axios';
import { GOOGLE_MAPS_API_KEY, SEARCH_CONFIG } from '../utils/constants';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode';

const mapsClient = axios.create({
  baseURL: GOOGLE_BASE_URL,
});

/**
 * Busca lugares cercanos usando Google Places API
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {string} type - Tipo de lugar
 * @param {string} keyword - Palabra clave
 * @param {number} radius - Radio de búsqueda en metros
 * @returns {Promise<Object>} Resultados de la búsqueda
 */
export const nearbySearch = async (
  lat,
  lng,
  type = SEARCH_CONFIG.DEFAULT_TYPE,
  keyword = '',
  radius = SEARCH_CONFIG.DEFAULT_RADIUS
) => {
  try {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius.toString(),
      type,
      key: GOOGLE_MAPS_API_KEY,
    });

    if (keyword) {
      params.append('keyword', keyword);
    }

    const url = `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error en nearbySearch:', error);
    throw error;
  }
};

export const nearByPlace = async (lat, lng, type, keyword, filters = {}) => {
  try {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: 10000,
      type,
      keyword,
      key: GOOGLE_MAPS_API_KEY,
    });

    // Agregar filtros opcionales
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await mapsClient.get(`/nearbysearch/json?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error en nearByPlace:', error);
    throw error;
  }
};

/**
 * Busca un lugar por texto
 * @param {string} query - Texto de búsqueda
 * @returns {Promise<Object>} Resultados de la búsqueda
 */
export const textSearch = async (query) => {
  try {
    const params = new URLSearchParams({
      query,
      key: GOOGLE_MAPS_API_KEY,
    });

    const url = `${GOOGLE_MAPS_BASE_URL}/place/textsearch/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error en textSearch:', error);
    throw error;
  }
};

/**
 * Obtiene detalles de un lugar por place_id
 * @param {string} placeId - ID del lugar
 * @returns {Promise<Object>} Detalles del lugar
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_MAPS_API_KEY,
    });

    const url = `${GOOGLE_MAPS_BASE_URL}/place/details/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.result;
  } catch (error) {
    console.error('Error en getPlaceDetails:', error);
    throw error;
  }
};

/**
 * Convierte una dirección en coordenadas (Geocoding)
 * @param {string} address - Dirección
 * @returns {Promise<Object>} Coordenadas { lat, lng }
 */
/*export const geocodeAddress = async (address) => {
  try {
    const params = new URLSearchParams({
      address,
      key: GOOGLE_MAPS_API_KEY,
    });

    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].geometry.location;
    }

    throw new Error('No se encontraron coordenadas para la dirección');
  } catch (error) {
    console.error('Error en geocodeAddress:', error);
    throw error;
  }
};*/
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`${GEOCODING_URL}/json`, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en geocodeAddress:', error);
    throw error;
  }
};

/**
 * Convierte coordenadas en dirección (Reverse Geocoding)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<string>} Dirección
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      key: GOOGLE_MAPS_API_KEY,
    });

    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    throw new Error('No se encontró dirección para las coordenadas');
  } catch (error) {
    console.error('Error en reverseGeocode:', error);
    throw error;
  }
};

/**
 * Calcula la distancia entre dos puntos
 * @param {Object} origin - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @returns {Promise<Object>} Distancia y duración
 */
export const calculateDistance = async (origin, destination) => {
  try {
    const params = new URLSearchParams({
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      key: GOOGLE_MAPS_API_KEY,
    });

    const url = `${GOOGLE_MAPS_BASE_URL}/distancematrix/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.rows && data.rows.length > 0) {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance,
        duration: element.duration,
      };
    }

    throw new Error('No se pudo calcular la distancia');
  } catch (error) {
    console.error('Error en calculateDistance:', error);
    throw error;
  }
};

/**
 * Obtiene sugerencias de autocompletado
 * @param {string} input - Texto de entrada
 * @returns {Promise<Array>} Lista de sugerencias
 */
export const getAutocompleteSuggestions = async (input) => {
  try {
    const params = new URLSearchParams({
      input,
      key: GOOGLE_MAPS_API_KEY,
    });

    const url = `${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.predictions || [];
  } catch (error) {
    console.error('Error en getAutocompleteSuggestions:', error);
    throw error;
  }
};

export const getDetallesLugar = async (placeId) => {
  try {
    const response = await mapsClient.get('/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_phone_number,website',
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en getDetallesLugar:', error);
    throw error;
  }
};

export default {
  nearbySearch,
  nearByPlace,
  textSearch,
  getPlaceDetails,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  getAutocompleteSuggestions,
  getDetallesLugar
};
