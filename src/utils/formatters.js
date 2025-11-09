// formatters.js - Funciones de formateo

/**
 * Convierte Base64 a URL de imagen
 * @param {string} base64 - String en Base64
 * @returns {string} URL de la imagen
 */
export const convertBase64ToImage = (base64) => {
  if (!base64) return null;
  
  // Si ya tiene el prefijo data:image, devolverlo tal cual
  if (base64.startsWith('data:image/')) {
    return base64;
  }
  
  // Agregar el prefijo por defecto (jpeg)
  return `data:image/jpeg;base64,${base64}`;
};

/**
 * Formatea una fecha a formato DD/MM/YYYY
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formatea una hora a formato HH:MM
 * @param {Date|string} date - Fecha con hora
 * @returns {string} Hora formateada
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Formatea una fecha completa con hora
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Convierte una fecha a formato relativo (hace X días)
 * @param {Date|string} date - Fecha a convertir
 * @returns {string} Texto relativo
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Hace un momento';
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } else {
    return formatDate(date);
  }
};

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Eliminar caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato: +54 11 1234-5678
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Formatea un CUIT
 * @param {string} cuit - CUIT a formatear
 * @returns {string} CUIT formateado
 */
export const formatCUIT = (cuit) => {
  if (!cuit) return '';
  
  // Eliminar guiones existentes
  const cleaned = cuit.replace(/-/g, '');
  
  // Formato: XX-XXXXXXXX-X
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
  }
  
  return cuit;
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatea un precio en pesos argentinos
 * @param {number} amount - Monto
 * @returns {string} Precio formateado
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatea un nombre completo
 * @param {string} firstName - Nombre
 * @param {string} lastName - Apellido
 * @returns {string} Nombre completo formateado
 */
export const formatFullName = (firstName, lastName) => {
  const parts = [];
  
  if (firstName) parts.push(capitalize(firstName));
  if (lastName) parts.push(capitalize(lastName));
  
  return parts.join(' ');
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un CUIT argentino
 * @param {string} cuit - CUIT a validar
 * @returns {boolean} true si es válido
 */
export const isValidCUIT = (cuit) => {
  const cleaned = cuit.replace(/-/g, '');
  
  if (cleaned.length !== 11 || !/^\d+$/.test(cleaned)) {
    return false;
  }
  
  // Validar dígito verificador
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * multipliers[i];
  }
  
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 9;
  
  return checkDigit === parseInt(cleaned[10]);
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('es-AR').format(num);
};

/**
 * Calcula los días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Días de diferencia
 */
export const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default {
  convertBase64ToImage,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  formatPhoneNumber,
  formatCUIT,
  truncateText,
  formatPrice,
  capitalize,
  formatFullName,
  isValidEmail,
  isValidCUIT,
  getInitials,
  formatNumber,
  getDaysBetween,
};