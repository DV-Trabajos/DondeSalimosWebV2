// reseniasService.js - Servicio completo de reseñas

import { apiGet, apiPost, apiDelete } from './api';

/**
 * Obtiene todas las reseñas
 * @returns {Promise<Array>} Lista de reseñas
 */
export const getAllResenias = async () => {
  try {
    const response = await apiGet('/api/resenias/listado');
    return response;
  } catch (error) {
    console.error('Error en getAllResenias:', error);
    throw error;
  }
};

/**
 * Alias para getAllResenias (compatibilidad)
 */
export const getResenias = getAllResenias;

/**
 * Obtiene reseñas de un comercio específico por nombre
 * @param {string} nombreComercio - Nombre del comercio
 * @returns {Promise<Array>} Lista de reseñas del comercio
 */
export const getReseniasByComercio = async (nombreComercio) => {
  try {
    const response = await apiGet(`/api/resenias/buscarReseniasPorComercio/${nombreComercio}`);
    return response;
  } catch (error) {
    console.error('Error en getReseniasByComercio:', error);
    throw error;
  }
};

/**
 * Crea una nueva reseña
 * @param {Object} resenia - Datos de la reseña
 * @param {number} resenia.iD_Usuario - ID del usuario
 * @param {number} resenia.iD_Comercio - ID del comercio
 * @param {string} resenia.comentario - Comentario de la reseña
 * @param {boolean} resenia.estado - Estado de la reseña (default: true)
 * @returns {Promise<Object>} Reseña creada
 */
export const createResenia = async (resenia) => {
  try {
    const response = await apiPost('/api/resenias/crear', resenia);
    return response;
  } catch (error) {
    console.error('Error en createResenia:', error);
    throw error;
  }
};

/**
 * Elimina una reseña
 * @param {number} id - ID de la reseña
 * @returns {Promise<Object>} Respuesta de la eliminación
 */
export const deleteResena = async (id) => {
  try {
    const response = await apiDelete(`/api/resenias/eliminar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en deleteResena:', error);
    throw error;
  }
};

/**
 * Alias para deleteResena (compatibilidad)
 */
export const deleteResenia = deleteResena;

/**
 * Verifica si un usuario puede dejar una reseña en un comercio
 * @param {Array} reservas - Lista de reservas
 * @param {number} userId - ID del usuario
 * @param {number} comercioId - ID del comercio
 * @returns {boolean} true si tiene al menos una reserva aprobada
 */
export const canUserReview = (reservas, userId, comercioId) => {
  return reservas.some(
    r => r.iD_Usuario === userId && 
         r.iD_Comercio === comercioId && 
         r.estado === true
  );
};

/**
 * Verifica el cooldown de reseñas (7 días)
 * @param {Array} resenias - Lista de reseñas
 * @param {number} userId - ID del usuario
 * @param {number} comercioId - ID del comercio
 * @returns {Object} { canReview: boolean, daysRemaining: number }
 */
export const checkReviewCooldown = (resenias, userId, comercioId) => {
  const userReviews = resenias.filter(
    r => r.iD_Usuario === userId && r.iD_Comercio === comercioId
  );

  if (userReviews.length === 0) {
    return { canReview: true, daysRemaining: 0 };
  }

  // Obtener la reseña más reciente
  const lastReview = userReviews.sort(
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
 * Cuenta el total de reseñas de un comercio
 * @param {Array} resenias - Lista de reseñas
 * @param {number} comercioId - ID del comercio
 * @returns {number} Total de reseñas
 */
export const countReseniasByComercio = (resenias, comercioId) => {
  return resenias.filter(
    r => r.iD_Comercio === comercioId && r.estado === true
  ).length;
};

export default {
  getAllResenias,
  getResenias,
  getReseniasByComercio,
  createResenia,
  deleteResena,
  deleteResenia,
  canUserReview,
  checkReviewCooldown,
  filterReseniasByEstado,
  getReseniasByUser,
  countReseniasByComercio,
};