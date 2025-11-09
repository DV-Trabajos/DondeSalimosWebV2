// reservasService.js - Servicio de gestión de reservas

import { apiGet, apiPost, apiPut, apiDelete } from './api';

/**
 * Obtiene todas las reservas
 * @returns {Promise<Array>} Lista de reservas
 */
export const getAllReservas = async () => {
  try {
    const response = await apiGet('/api/reservas/listado');
    return response;
  } catch (error) {
    console.error('Error en getAllReservas:', error);
    throw error;
  }
};

/**
 * Obtiene una reserva por ID
 * @param {number} id - ID de la reserva
 * @returns {Promise<Object>} Datos de la reserva
 */
export const getReservaById = async (id) => {
  try {
    const response = await apiGet(`/api/reservas/buscarIdReserva/${id}`);
    return response;
  } catch (error) {
    console.error('Error en getReservaById:', error);
    throw error;
  }
};

/**
 * Obtiene reservas de un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de reservas del usuario
 */
export const getReservasByUsuario = async (usuarioId) => {
  try {
    const response = await apiGet(`/api/reservas/buscarReservasPorUsuario/${usuarioId}`);
    return response;
  } catch (error) {
    console.error('Error en getReservasByUsuario:', error);
    throw error;
  }
};

/**
 * Obtiene reservas de un comercio
 * @param {number} comercioId - ID del comercio
 * @returns {Promise<Array>} Lista de reservas del comercio
 */
export const getReservasByComercio = async (comercioId) => {
  try {
    const response = await apiGet(`/api/reservas/buscarReservasPorComercio/${comercioId}`);
    return response;
  } catch (error) {
    console.error('Error en getReservasByComercio:', error);
    throw error;
  }
};

/**
 * Crea una nueva reserva
 * @param {Object} reservaData - Datos de la reserva
 * @returns {Promise<Object>} Reserva creada
 */
export const createReserva = async (reservaData) => {
  try {
    const response = await apiPost('/api/reservas/crear', reservaData);
    return response;
  } catch (error) {
    console.error('Error en createReserva:', error);
    throw error;
  }
};

/**
 * Actualiza una reserva
 * @param {number} id - ID de la reserva
 * @param {Object} reservaData - Datos actualizados
 * @returns {Promise<Object>} Reserva actualizada
 */
export const updateReserva = async (id, reservaData) => {
  try {
    const response = await apiPut(`/api/reservas/actualizar/${id}`, reservaData);
    return response;
  } catch (error) {
    console.error('Error en updateReserva:', error);
    throw error;
  }
};

/**
 * Cancela una reserva
 * @param {number} id - ID de la reserva
 * @returns {Promise<void>}
 */
export const cancelReserva = async (id) => {
  try {
    const response = await apiPost(`/api/reservas/cancelar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en cancelReserva:', error);
    throw error;
  }
};

/**
 * Confirma una reserva
 * @param {number} id - ID de la reserva
 * @returns {Promise<void>}
 */
export const confirmarReserva = async (id) => {
  try {
    const response = await apiPost(`/api/reservas/confirmar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en confirmarReserva:', error);
    throw error;
  }
};

/**
 * Elimina una reserva
 * @param {number} id - ID de la reserva
 * @returns {Promise<void>}
 */
export const deleteReserva = async (id) => {
  try {
    const response = await apiDelete(`/api/reservas/eliminar/${id}`);
    return response;
  } catch (error) {
    console.error('Error en deleteReserva:', error);
    throw error;
  }
};

/**
 * Obtiene reservas por estado
 * @param {string} estado - Estado de la reserva
 * @returns {Promise<Array>} Lista de reservas filtradas
 */
export const getReservasByEstado = async (estado) => {
  try {
    const reservas = await getAllReservas();
    return reservas.filter(r => r.estado === estado);
  } catch (error) {
    console.error('Error en getReservasByEstado:', error);
    throw error;
  }
};

/**
 * Obtiene reservas pendientes de un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de reservas pendientes
 */
export const getReservasPendientes = async (usuarioId) => {
  try {
    const reservas = await getReservasByUsuario(usuarioId);
    return reservas.filter(r => r.estado === 'Pendiente');
  } catch (error) {
    console.error('Error en getReservasPendientes:', error);
    throw error;
  }
};

/**
 * Obtiene reservas confirmadas de un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de reservas confirmadas
 */
export const getReservasConfirmadas = async (usuarioId) => {
  try {
    const reservas = await getReservasByUsuario(usuarioId);
    return reservas.filter(r => r.estado === 'Confirmada');
  } catch (error) {
    console.error('Error en getReservasConfirmadas:', error);
    throw error;
  }
};

/**
 * Obtiene próximas reservas de un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de próximas reservas
 */
export const getProximasReservas = async (usuarioId) => {
  try {
    const reservas = await getReservasByUsuario(usuarioId);
    const now = new Date();
    return reservas.filter(r => {
      const fechaReserva = new Date(r.fechaReserva);
      return fechaReserva > now && r.estado !== 'Cancelada';
    });
  } catch (error) {
    console.error('Error en getProximasReservas:', error);
    throw error;
  }
};

export default {
  getAllReservas,
  getReservaById,
  getReservasByUsuario,
  getReservasByComercio,
  createReserva,
  updateReserva,
  cancelReserva,
  confirmarReserva,
  deleteReserva,
  getReservasByEstado,
  getReservasPendientes,
  getReservasConfirmadas,
  getProximasReservas,
};
