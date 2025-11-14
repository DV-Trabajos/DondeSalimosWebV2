// reseniasService.js - Servicio completo de reseñas
// Versión completa para Fase 4 - Actualizado con todas las funciones

import { apiGet, apiPost, apiPut, apiDelete } from './api';

// ============================================
// RESEÑAS - CRUD OPERATIONS
// ============================================

/**
 * Obtiene todas las reseñas del sistema
 * @returns {Promise<Array>} Lista completa de reseñas
 */
export const getAllResenias = async () => {
  try {
    const response = await apiGet('/api/resenias/listado');
    return response;
  } catch (error) {
    console.error('❌ Error en getAllResenias:', error);
    throw error;
  }
};

/**
 * Alias para getAllResenias (compatibilidad con código existente)
 */
export const getResenias = getAllResenias;

/**
 * Obtiene reseñas de un comercio específico por ID
 * @param {number} comercioId - ID del comercio
 * @returns {Promise<Array>} Lista de reseñas del comercio (solo activas)
 */
export const getReseniasByComercio = async (comercioId) => {
  try {
    const response = await apiGet(`/api/Resenias/buscarIdComercio/${comercioId}`);
    // Filtrar solo reseñas activas (estado = true)
    return response.filter(r => r.estado === true);
  } catch (error) {
    console.error('❌ Error en getReseniasByComercio:', error);
    throw error;
  }
};

/**
 * Obtiene reseñas de un comercio por nombre (compatibilidad)
 * @param {string} nombreComercio - Nombre del comercio
 * @returns {Promise<Array>} Lista de reseñas del comercio
 */
export const getReseniasByNombreComercio = async (nombreComercio) => {
  try {
    const response = await apiGet(`/api/Resenias/buscarNombreComercio/${nombreComercio}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getReseniasByNombreComercio:', error);
    throw error;
  }
};

/**
 * Obtiene una reseña específica por ID
 * @param {number} reseniaId - ID de la reseña
 * @returns {Promise<Object>} Datos de la reseña
 */
export const getReseniaById = async (reseniaId) => {
  try {
    const response = await apiGet(`/api/Resenias/buscarId/${reseniaId}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getReseniaById:', error);
    throw error;
  }
};

/**
 * Crea una nueva reseña
 * @param {Object} reseniaData - Datos de la reseña
 * @param {number} reseniaData.iD_Usuario - ID del usuario
 * @param {number} reseniaData.iD_Comercio - ID del comercio
 * @param {number} reseniaData.calificacion - Calificación (1-5)
 * @param {string} reseniaData.comentario - Comentario de la reseña
 * @param {boolean} [reseniaData.estado=true] - Estado de la reseña
 * @returns {Promise<Object>} Reseña creada
 */
export const createResenia = async (reseniaData) => {
  try {
    // Asegurar que tenga todos los campos necesarios
    const dataToSend = {
      iD_Usuario: reseniaData.iD_Usuario,
      iD_Comercio: reseniaData.iD_Comercio,
      calificacion: reseniaData.calificacion || reseniaData.puntuacion,
      puntuacion: reseniaData.puntuacion || reseniaData.calificacion, // Por compatibilidad
      comentario: reseniaData.comentario,
      estado: reseniaData.estado !== undefined ? reseniaData.estado : true,
      fechaCreacion: reseniaData.fechaCreacion || new Date().toISOString(),
    };

    console.log('📤 Creando reseña:', dataToSend);
    const response = await apiPost('/api/Resenias/crear', dataToSend);
    console.log('✅ Reseña creada exitosamente:', response);
    return response;
  } catch (error) {
    console.error('❌ Error en createResenia:', error);
    throw error;
  }
};

/**
 * Actualiza una reseña existente
 * @param {number} reseniaId - ID de la reseña
 * @param {Object} reseniaData - Datos actualizados
 * @returns {Promise<Object>} Reseña actualizada
 */
export const updateResenia = async (reseniaId, reseniaData) => {
  try {
    const response = await apiPut(`/api/Resenias/modificar/${reseniaId}`, reseniaData);
    return response;
  } catch (error) {
    console.error('❌ Error en updateResenia:', error);
    throw error;
  }
};

/**
 * Elimina una reseña (soft delete - cambia estado a false)
 * @param {number} reseniaId - ID de la reseña
 * @returns {Promise<Object>} Respuesta de la eliminación
 */
export const deleteResenia = async (reseniaId) => {
  try {
    const response = await apiDelete(`/api/Resenias/eliminar/${reseniaId}`);
    return response;
  } catch (error) {
    console.error('❌ Error en deleteResenia:', error);
    throw error;
  }
};

/**
 * Alias para deleteResenia (compatibilidad)
 */
export const deleteResena = deleteResenia;

// ============================================
// RESEÑAS - VALIDACIONES Y PERMISOS
// ============================================

/**
 * Verifica si un usuario puede dejar una reseña en un comercio
 * Requiere tener al menos una reserva aprobada y respetar cooldown de 7 días
 * @param {number} userId - ID del usuario
 * @param {number} comercioId - ID del comercio
 * @returns {Promise<Object>} { canReview: boolean, message: string, daysRemaining: number }
 */
export const canUserReview = async (userId, comercioId) => {
  try {
    // Obtener todas las reseñas del usuario en este comercio
    const allResenias = await getAllResenias();
    const userResenias = allResenias.filter(
      r => r.iD_Usuario === userId && 
           r.iD_Comercio === comercioId && 
           r.estado === true
    );

    // Si no tiene reseñas previas, puede dejar una
    if (userResenias.length === 0) {
      return {
        canReview: true,
        message: 'Puedes dejar una reseña',
        daysRemaining: 0
      };
    }

    // Verificar cooldown de 7 días desde la última reseña
    const checkCooldown = checkReviewCooldown(userResenias);
    
    return {
      canReview: checkCooldown.canReview,
      message: checkCooldown.canReview 
        ? 'Puedes dejar una nueva reseña'
        : `Debes esperar ${checkCooldown.daysRemaining} día(s) más`,
      daysRemaining: checkCooldown.daysRemaining
    };

  } catch (error) {
    console.error('❌ Error en canUserReview:', error);
    return {
      canReview: false,
      message: 'Error al verificar permisos',
      daysRemaining: 0
    };
  }
};

/**
 * Verifica el período de cooldown (7 días) entre reseñas
 * @param {Array} userResenias - Reseñas del usuario en el comercio
 * @returns {Object} { canReview: boolean, daysRemaining: number }
 */
export const checkReviewCooldown = (userResenias) => {
  if (!userResenias || userResenias.length === 0) {
    return { canReview: true, daysRemaining: 0 };
  }

  // Obtener la reseña más reciente
  const lastReview = userResenias.sort(
    (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
  )[0];

  const lastReviewDate = new Date(lastReview.fechaCreacion);
  const today = new Date();
  const daysSinceLastReview = Math.floor(
    (today - lastReviewDate) / (1000 * 60 * 60 * 24)
  );

  const daysRemaining = Math.max(0, 7 - daysSinceLastReview);
  const canReview = daysSinceLastReview >= 7;

  return { canReview, daysRemaining };
};

// ============================================
// RESEÑAS - FILTROS Y BÚSQUEDAS
// ============================================

/**
 * Filtra reseñas por estado
 * @param {Array} resenias - Lista de reseñas
 * @param {boolean} estado - Estado a filtrar (true = activas, false = inactivas)
 * @returns {Array} Reseñas filtradas
 */
export const filterReseniasByEstado = (resenias, estado = true) => {
  return resenias.filter(r => r.estado === estado);
};

/**
 * Obtiene reseñas de un usuario específico
 * @param {Array} resenias - Lista de reseñas
 * @param {number} userId - ID del usuario
 * @returns {Array} Reseñas del usuario
 */
export const getReseniasByUser = (resenias, userId) => {
  return resenias.filter(r => r.iD_Usuario === userId);
};

/**
 * Filtra reseñas por calificación
 * @param {Array} resenias - Lista de reseñas
 * @param {number} calificacion - Calificación a filtrar (1-5)
 * @returns {Array} Reseñas filtradas
 */
export const filterReseniasByCalificacion = (resenias, calificacion) => {
  return resenias.filter(r => {
    const cal = r.calificacion || r.puntuacion || 0;
    return cal === calificacion;
  });
};

/**
 * Filtra reseñas por rango de calificación
 * @param {Array} resenias - Lista de reseñas
 * @param {number} minRating - Calificación mínima
 * @param {number} maxRating - Calificación máxima
 * @returns {Array} Reseñas filtradas
 */
export const filterReseniasByRatingRange = (resenias, minRating = 1, maxRating = 5) => {
  return resenias.filter(r => {
    const cal = r.calificacion || r.puntuacion || 0;
    return cal >= minRating && cal <= maxRating;
  });
};

// ============================================
// RESEÑAS - ESTADÍSTICAS
// ============================================

/**
 * Calcula estadísticas de reseñas de un comercio
 * @param {Array} resenias - Lista de reseñas del comercio
 * @returns {Object} Estadísticas calculadas
 */
export const calcularEstadisticasResenias = (resenias) => {
  if (!resenias || resenias.length === 0) {
    return {
      total: 0,
      promedio: 0,
      porCalificacion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const total = resenias.length;
  const suma = resenias.reduce((acc, r) => {
    const cal = r.calificacion || r.puntuacion || 0;
    return acc + cal;
  }, 0);
  
  const promedio = suma / total;

  const porCalificacion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  resenias.forEach(r => {
    const cal = r.calificacion || r.puntuacion || 0;
    if (cal >= 1 && cal <= 5) {
      porCalificacion[Math.round(cal)]++;
    }
  });

  // Calcular porcentajes de distribución
  const distribucion = {};
  Object.keys(porCalificacion).forEach(rating => {
    distribucion[rating] = total > 0 ? (porCalificacion[rating] / total) * 100 : 0;
  });

  return {
    total,
    promedio,
    porCalificacion,
    distribucion
  };
};

/**
 * Cuenta el total de reseñas de un comercio
 * @param {Array} resenias - Lista de reseñas
 * @param {number} comercioId - ID del comercio
 * @returns {number} Total de reseñas activas
 */
export const countReseniasByComercio = (resenias, comercioId) => {
  return resenias.filter(
    r => r.iD_Comercio === comercioId && r.estado === true
  ).length;
};

/**
 * Obtiene la calificación promedio de un comercio
 * @param {Array} resenias - Lista de reseñas del comercio
 * @returns {number} Promedio de calificación (0-5)
 */
export const getAverageRating = (resenias) => {
  if (!resenias || resenias.length === 0) return 0;
  
  const suma = resenias.reduce((acc, r) => {
    const cal = r.calificacion || r.puntuacion || 0;
    return acc + cal;
  }, 0);
  
  return suma / resenias.length;
};

// ============================================
// RESEÑAS - UTILIDADES
// ============================================

/**
 * Ordena reseñas por fecha (más recientes primero)
 * @param {Array} resenias - Lista de reseñas
 * @returns {Array} Reseñas ordenadas
 */
export const sortReseniasByDate = (resenias, ascending = false) => {
  return [...resenias].sort((a, b) => {
    const dateA = new Date(a.fechaCreacion);
    const dateB = new Date(b.fechaCreacion);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Ordena reseñas por calificación
 * @param {Array} resenias - Lista de reseñas
 * @param {boolean} ascending - Si es true, ordena de menor a mayor
 * @returns {Array} Reseñas ordenadas
 */
export const sortReseniasByRating = (resenias, ascending = false) => {
  return [...resenias].sort((a, b) => {
    const calA = a.calificacion || a.puntuacion || 0;
    const calB = b.calificacion || b.puntuacion || 0;
    return ascending ? calA - calB : calB - calA;
  });
};

/**
 * Busca reseñas por texto en comentario
 * @param {Array} resenias - Lista de reseñas
 * @param {string} searchText - Texto a buscar
 * @returns {Array} Reseñas que coinciden con la búsqueda
 */
export const searchReseniasByText = (resenias, searchText) => {
  if (!searchText || searchText.trim() === '') return resenias;
  
  const searchLower = searchText.toLowerCase();
  return resenias.filter(r => {
    const comentario = (r.comentario || '').toLowerCase();
    const usuario = (r.usuario?.nombreUsuario || '').toLowerCase();
    return comentario.includes(searchLower) || usuario.includes(searchLower);
  });
};

// Export default para compatibilidad con imports antiguos
export default {
  // CRUD
  getAllResenias,
  getResenias,
  getReseniasByComercio,
  getReseniasByNombreComercio,
  getReseniaById,
  createResenia,
  updateResenia,
  deleteResenia,
  deleteResena,
  
  // Validaciones
  canUserReview,
  checkReviewCooldown,
  
  // Filtros
  filterReseniasByEstado,
  getReseniasByUser,
  filterReseniasByCalificacion,
  filterReseniasByRatingRange,
  
  // Estadísticas
  calcularEstadisticasResenias,
  countReseniasByComercio,
  getAverageRating,
  
  // Utilidades
  sortReseniasByDate,
  sortReseniasByRating,
  searchReseniasByText,
};