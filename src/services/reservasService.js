// reservasService.js - Servicio completo de reservas

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
 * Alias para getAllReservas (compatibilidad)
 */
export const getReservas = getAllReservas;

/**
 * Obtiene reservas de un usuario específico
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de reservas del usuario
 */
export const getReservasByUser = async (userId) => {
  try {
    const response = await apiGet(`/api/reservas/buscarReservaUsuario/${userId}`);
    return response;
  } catch (error) {
    console.error('Error en getReservasByUser:', error);
    throw error;
  }
};

/**
 * Crea una nueva reserva
 * @param {Object} reserva - Datos de la reserva
 * @param {number} reserva.iD_Usuario - ID del usuario
 * @param {number} reserva.iD_Comercio - ID del comercio
 * @param {string} reserva.fechaReserva - Fecha de la reserva (ISO format)
 * @param {string} reserva.horaReserva - Hora de la reserva
 * @param {number} reserva.cantidadPersonas - Cantidad de personas
 * @param {string} reserva.comentarios - Comentarios adicionales (opcional)
 * @param {boolean} reserva.estado - Estado de la reserva (default: false - pendiente)
 * @returns {Promise<Object>} Reserva creada
 */
export const createReserva = async (reserva) => {
  try {
    const response = await apiPost('/api/reservas/crear', reserva);
    return response;
  } catch (error) {
    console.error('Error en createReserva:', error);
    throw error;
  }
};

/**
 * Actualiza una reserva existente
 * @param {number} id - ID de la reserva
 * @param {Object} reserva - Datos actualizados de la reserva
 * @returns {Promise<Object>} Respuesta de la actualización
 */
export const updateReserva = async (id, reserva) => {
  try {
    const response = await apiPut(`/api/reservas/actualizar/${id}`, reserva);
    return response;
  } catch (error) {
    console.error('Error en updateReserva:', error);
    throw error;
  }
};

/**
 * Elimina una reserva
 * @param {number} id - ID de la reserva
 * @returns {Promise<Object>} Respuesta de la eliminación
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
 * Aprueba una reserva (cambia estado a true)
 * @param {number} id - ID de la reserva
 * @param {Object} reserva - Datos completos de la reserva
 * @returns {Promise<Object>} Reserva actualizada
 */
export const approveReserva = async (id, reserva) => {
  try {
    const updatedReserva = {
      ...reserva,
      estado: true,
      motivoRechazo: null,
    };
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    console.error('Error en approveReserva:', error);
    throw error;
  }
};

/**
 * Rechaza una reserva (cambia estado a false con motivo)
 * @param {number} id - ID de la reserva
 * @param {Object} reserva - Datos completos de la reserva
 * @param {string} motivo - Motivo del rechazo
 * @returns {Promise<Object>} Reserva actualizada
 */
export const rejectReserva = async (id, reserva, motivo) => {
  try {
    const updatedReserva = {
      ...reserva,
      estado: false,
      motivoRechazo: motivo,
    };
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    console.error('Error en rejectReserva:', error);
    throw error;
  }
};

/**
 * Filtra reservas por estado
 * @param {Array} reservas - Lista de reservas
 * @param {boolean} estado - Estado a filtrar (true = aprobadas, false = rechazadas, null = pendientes)
 * @returns {Array} Reservas filtradas
 */
export const filterReservasByEstado = (reservas, estado) => {
  if (estado === null) {
    // Pendientes: estado false y sin motivo de rechazo
    return reservas.filter(r => r.estado === false && !r.motivoRechazo);
  }
  return reservas.filter(r => r.estado === estado);
};

/**
 * Filtra reservas por comercio
 * @param {Array} reservas - Lista de reservas
 * @param {number} comercioId - ID del comercio
 * @returns {Array} Reservas del comercio
 */
export const filterReservasByComercio = (reservas, comercioId) => {
  return reservas.filter(r => r.iD_Comercio === comercioId);
};

/**
 * Filtra reservas por usuario
 * @param {Array} reservas - Lista de reservas
 * @param {number} userId - ID del usuario
 * @returns {Array} Reservas del usuario
 */
export const filterReservasByUsuario = (reservas, userId) => {
  return reservas.filter(r => r.iD_Usuario === userId);
};

/**
 * Obtiene reservas futuras
 * @param {Array} reservas - Lista de reservas
 * @returns {Array} Reservas futuras
 */
export const getFutureReservas = (reservas) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return reservas.filter(r => {
    const reservaDate = new Date(r.fechaReserva);
    reservaDate.setHours(0, 0, 0, 0);
    return reservaDate >= today;
  });
};

/**
 * Obtiene reservas pasadas
 * @param {Array} reservas - Lista de reservas
 * @returns {Array} Reservas pasadas
 */
export const getPastReservas = (reservas) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return reservas.filter(r => {
    const reservaDate = new Date(r.fechaReserva);
    reservaDate.setHours(0, 0, 0, 0);
    return reservaDate < today;
  });
};

/**
 * Valida si una fecha de reserva es válida (futura)
 * @param {string} fecha - Fecha a validar (ISO format)
 * @returns {boolean} true si es válida
 */
export const isValidReservaDate = (fecha) => {
  const reservaDate = new Date(fecha);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return reservaDate >= today;
};

/**
 * Cuenta reservas pendientes de un comercio
 * @param {Array} reservas - Lista de reservas
 * @param {number} comercioId - ID del comercio
 * @returns {number} Cantidad de reservas pendientes
 */
export const countPendingReservas = (reservas, comercioId) => {
  return filterReservasByEstado(reservas, null)
    .filter(r => r.iD_Comercio === comercioId)
    .length;
};

export default {
  getAllReservas,
  getReservas,
  getReservasByUser,
  createReserva,
  updateReserva,
  deleteReserva,
  approveReserva,
  rejectReserva,
  filterReservasByEstado,
  filterReservasByComercio,
  filterReservasByUsuario,
  getFutureReservas,
  getPastReservas,
  isValidReservaDate,
  countPendingReservas,
};