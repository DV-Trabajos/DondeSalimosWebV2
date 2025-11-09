// formatters.js - Funciones de formateo de datos

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  if (includeTime) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  
  return `${day}/${month}/${year}`;
};

/**
 * Formatea un número como moneda (pesos argentinos)
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea un número con separador de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '-';
  
  return new Intl.NumberFormat('es-AR').format(number);
};

/**
 * Formatea un número de teléfono
 * @param {string} phone - Teléfono a formatear
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  // Eliminar todo lo que no sea número
  const numeros = phone.replace(/\D/g, '');
  
  // Formato argentino: +54 9 11 1234-5678 o similar
  if (numeros.length === 10) {
    return `(${numeros.slice(0, 3)}) ${numeros.slice(3, 7)}-${numeros.slice(7)}`;
  }
  
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 4)}) ${numeros.slice(4, 8)}-${numeros.slice(8)}`;
  }
  
  return phone;
};

/**
 * Trunca un texto largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea una dirección completa
 * @param {Object} address - Objeto con datos de dirección
 * @returns {string} Dirección formateada
 */
export const formatAddress = (address) => {
  if (!address) return '-';
  
  const parts = [];
  
  if (address.calle) parts.push(address.calle);
  if (address.numero) parts.push(address.numero);
  if (address.ciudad) parts.push(address.ciudad);
  if (address.provincia) parts.push(address.provincia);
  
  return parts.join(', ') || '-';
};

/**
 * Convierte Base64 a URL de imagen
 * @param {string} base64 - String base64
 * @returns {string} URL de imagen
 */
export const convertBase64ToImage = (base64) => {
  if (!base64) return null;
  
  // Si ya tiene el prefijo data:image, devolverlo tal cual
  if (base64.startsWith('data:image')) {
    return base64;
  }
  
  // Si no tiene el prefijo, agregarlo
  return `data:image/jpeg;base64,${base64}`;
};

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {string|Date} date - Fecha
 * @returns {string} Tiempo transcurrido
 */
export const timeAgo = (date) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - dateObj) / 1000);
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
  };
  
  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    
    if (interval >= 1) {
      const plural = interval > 1 ? 's' : '';
      return `Hace ${interval} ${name}${plural}`;
    }
  }
  
  return 'Hace un momento';
};

/**
 * Extrae las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
  if (!name) return '??';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (
    parts[0].charAt(0).toUpperCase() + 
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
};

/**
 * Valida y formatea un email
 * @param {string} email - Email
 * @returns {string} Email en minúsculas
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor decimal (0-1)
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-';
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatea una distancia en metros o kilómetros
 * @param {number} meters - Distancia en metros
 * @returns {string} Distancia formateada
 */
export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '-';
  
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)} km`;
};

export default {
  formatDate,
  formatCurrency,
  formatNumber,
  formatPhone,
  truncateText,
  capitalizeWords,
  formatAddress,
  convertBase64ToImage,
  timeAgo,
  getInitials,
  formatEmail,
  formatPercentage,
  formatDistance,
};
