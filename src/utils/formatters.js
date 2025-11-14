// formatters.js - Utilidades para formatear datos
// Incluye conversión de imágenes a base64

/**
 * Convierte un archivo de imagen a base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} String base64 de la imagen
 */
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // Obtener solo el base64 sin el prefijo data:image/...;base64,
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte un string base64 a una URL de imagen para mostrar
 * @param {string} base64String - String base64
 * @param {string} mimeType - Tipo MIME (default: image/jpeg)
 * @returns {string} URL de la imagen
 */
export const convertBase64ToImage = (base64String, mimeType = 'image/jpeg') => {
  if (!base64String) return null;
  
  // Si ya tiene el prefijo data:, retornarlo tal cual
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // Si no, agregar el prefijo
  return `data:${mimeType};base64,${base64String}`;
};

/**
 * Formatea un número como moneda argentina
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Si incluir la hora
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, includeTime = false) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Date(date).toLocaleDateString('es-AR', options);
};

/**
 * Formatea un teléfono argentino
 * @param {string} phone - Teléfono sin formato
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remover todo lo que no sea número
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según longitud
  if (cleaned.length === 10) {
    // (011) 1234-5678
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatea un horario (HH:MM:SS a HH:MM)
 * @param {string} time - Horario con segundos
 * @returns {string} Horario sin segundos
 */
export const formatTime = (time) => {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {string|Date} date - Fecha
 * @returns {string} Tiempo transcurrido
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 604800)} semanas`;
  if (diffInSeconds < 31536000) return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`;
  return `Hace ${Math.floor(diffInSeconds / 31536000)} años`;
};

export default {
  convertImageToBase64,
  convertBase64ToImage,
  formatCurrency,
  formatDate,
  formatPhone,
  truncateText,
  formatTime,
  getInitials,
  getTimeAgo,
};
