// src/services/reservasService.js
// Servicio completo de reservas

import { apiGet, apiPost, apiPut, apiDelete } from './api';

// ============================================
// RESERVAS - CRUD BÁSICO
// ============================================

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
 * CORREGIDO: Ahora usa /listado y filtra en el cliente
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de reservas del usuario
 */
export const getReservasByUser = async (userId) => {
  try {
    console.log('🔍 Obteniendo reservas del usuario:', userId);
    const allReservas = await apiGet('/api/reservas/listado');
    console.log('📦 Total de reservas obtenidas:', allReservas.length);
    
    // Filtrar por usuario en el cliente
    const reservasUsuario = allReservas.filter(r => r.iD_Usuario === userId);
    console.log('✅ Reservas del usuario filtradas:', reservasUsuario.length);
    
    return reservasUsuario;
  } catch (error) {
    console.error('Error en getReservasByUser:', error);
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
 * Obtiene reservas por nombre de comercio
 * @param {string} nombreComercio - Nombre del comercio
 * @returns {Promise<Array>} Lista de reservas
 */
export const getReservasByComercio = async (nombreComercio) => {
  try {
    const response = await apiGet(`/api/reservas/buscarNombreComercio/${nombreComercio}`);
    return response;
  } catch (error) {
    console.error('Error en getReservasByComercio:', error);
    throw error;
  }
};

/**
 * Crea una nueva reserva
 * @param {Object} reserva - Datos de la reserva
 * @param {number} reserva.iD_Usuario - ID del usuario
 * @param {number} reserva.iD_Comercio - ID del comercio
 * @param {string} reserva.fechaReserva - Fecha de la reserva (ISO format)
 * @param {number} reserva.cantidadPersonas - Cantidad de personas
 * @param {string} reserva.comentarios - Comentarios adicionales (opcional)
 * @param {boolean} reserva.estado - Estado de la reserva (default: true)
 * @param {boolean} reserva.aprobada - Si está aprobada (default: false - pendiente)
 * @returns {Promise<Object>} Reserva creada
 */
export const createReserva = async (reserva) => {
  try {
    console.log('📤 Creando reserva:', reserva);
    const response = await apiPost('/api/reservas/crear', reserva);
    console.log('✅ Reserva creada:', response);
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
    console.log('📝 Actualizando reserva:', id, reserva);
    const response = await apiPut(`/api/reservas/actualizar/${id}`, reserva);
    console.log('✅ Reserva actualizada');
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

// ============================================
// RESERVAS - APROBACIÓN Y RECHAZO
// ============================================

/**
 * Aprueba una reserva (cambia aprobada a true)
 * @param {number} id - ID de la reserva (iD_Reserva)
 * @param {Object} reserva - Datos completos de la reserva
 * @returns {Promise<Object>} Reserva actualizada
 */
export const approveReserva = async (id, reserva) => {
  try {
    console.log('✅ Aprobando reserva:', id);
    
    const updatedReserva = {
      iD_Reserva: reserva.iD_Reserva,
      iD_Usuario: reserva.iD_Usuario,
      iD_Comercio: reserva.iD_Comercio,
      fechaReserva: reserva.fechaReserva,
      cantidadPersonas: reserva.cantidadPersonas,
      comentarios: reserva.comentarios || '',
      estado: true,
      aprobada: true
    };
    
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    console.error('Error en approveReserva:', error);
    throw error;
  }
};

/**
 * Rechaza una reserva (cambia aprobada a false con motivo)
 * @param {number} id - ID de la reserva (iD_Reserva)
 * @param {Object} reserva - Datos completos de la reserva
 * @param {string} motivo - Motivo del rechazo
 * @returns {Promise<Object>} Reserva actualizada
 */
export const rejectReserva = async (id, reserva, motivo = '') => {
  try {
    console.log('❌ Rechazando reserva:', id, 'Motivo:', motivo);
    
    const updatedReserva = {
      iD_Reserva: reserva.iD_Reserva,
      iD_Usuario: reserva.iD_Usuario,
      iD_Comercio: reserva.iD_Comercio,
      fechaReserva: reserva.fechaReserva,
      cantidadPersonas: reserva.cantidadPersonas,
      comentarios: motivo 
        ? `${reserva.comentarios || ''}\n[RECHAZADA]: ${motivo}` 
        : reserva.comentarios || '',
      estado: false,
      aprobada: false
    };
    
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    console.error('Error en rejectReserva:', error);
    throw error;
  }
};

/**
 * Cancela una reserva (por el usuario)
 * @param {number} id - ID de la reserva (iD_Reserva)
 * @param {Object} reserva - Datos completos de la reserva
 * @param {string} motivo - Motivo de cancelación (opcional)
 * @returns {Promise<Object>} Reserva actualizada
 */
export const cancelReserva = async (id, reserva, motivo = '') => {
  try {
    console.log('🚫 Cancelando reserva:', id);
    
    const updatedReserva = {
      iD_Reserva: reserva.iD_Reserva,
      iD_Usuario: reserva.iD_Usuario,
      iD_Comercio: reserva.iD_Comercio,
      fechaReserva: reserva.fechaReserva,
      cantidadPersonas: reserva.cantidadPersonas,
      comentarios: motivo 
        ? `${reserva.comentarios || ''}\n[CANCELADA POR USUARIO]: ${motivo}` 
        : reserva.comentarios || '',
      estado: false,
      aprobada: false
    };
    
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    console.error('Error en cancelReserva:', error);
    throw error;
  }
};

// ============================================
// RESERVAS - FILTROS Y BÚSQUEDAS (CLIENT-SIDE)
// ============================================

/**
 * Filtra reservas por estado
 * @param {Array} reservas - Lista de reservas
 * @param {boolean} estado - Estado a filtrar (true: aprobadas, false: rechazadas, null: pendientes)
 * @returns {Array} Reservas filtradas
 */
export const filterReservasByEstado = (reservas, estado) => {
  if (estado === null) {
    // Pendientes: no aprobadas y estado true
    return reservas.filter(r => !r.aprobada && r.estado);
  }
  return reservas.filter(r => r.estado === estado);
};

/**
 * Filtra reservas por comercio (client-side)
 * @param {Array} reservas - Lista de reservas
 * @param {number} comercioId - ID del comercio
 * @returns {Array} Reservas del comercio
 */
export const filterReservasByComercio = (reservas, comercioId) => {
  return reservas.filter(r => r.iD_Comercio === comercioId);
};

/**
 * Filtra reservas por usuario (client-side)
 * @param {Array} reservas - Lista de reservas
 * @param {number} userId - ID del usuario
 * @returns {Array} Reservas del usuario
 */
export const filterReservasByUsuario = (reservas, userId) => {
  return reservas.filter(r => r.iD_Usuario === userId);
};

/**
 * Obtiene reservas futuras (incluyendo hoy)
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
 * Obtiene reservas recibidas por un usuario (dueño de comercios)
 * Usa getAllReservas y filtra por los comercios del usuario
 * @param {number} userId - ID del usuario (no se usa, se filtran por comercios)
 * @param {Array} comercios - Lista de comercios del usuario
 * @returns {Promise<Array>} Reservas recibidas
 */
export const getReservasRecibidasByUser = async (userId, comercios) => {
  try {
    const allReservas = await getAllReservas();
    const comercioIds = comercios.map(c => c.iD_Comercio);
    
    const reservasRecibidas = allReservas.filter(
      reserva => comercioIds.includes(reserva.iD_Comercio)
    );
    
    console.log('📊 Reservas recibidas:', reservasRecibidas.length);
    return reservasRecibidas;
  } catch (error) {
    console.error('Error en getReservasRecibidasByUser:', error);
    throw error;
  }
};

/**
 * Obtiene reservas del día para un comercio
 * @param {number} comercioId - ID del comercio
 * @returns {Promise<Array>} Reservas del día
 */
export const getReservasDelDia = async (comercioId) => {
  try {
    const allReservas = await getAllReservas();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return allReservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fechaReserva);
      return (
        reserva.iD_Comercio === comercioId &&
        fechaReserva >= today &&
        fechaReserva < tomorrow
      );
    });
  } catch (error) {
    console.error('Error en getReservasDelDia:', error);
    throw error;
  }
};

// ============================================
// RESERVAS - ESTADÍSTICAS
// ============================================

/**
 * Obtiene estadísticas de reservas para un comercio
 * @param {number} comercioId - ID del comercio
 * @returns {Promise<Object>} Estadísticas
 */
export const getEstadisticasComercio = async (comercioId) => {
  try {
    const allReservas = await getAllReservas();
    const reservasComercio = allReservas.filter(r => r.iD_Comercio === comercioId);
    
    return {
      total: reservasComercio.length,
      pendientes: reservasComercio.filter(r => !r.aprobada && r.estado).length,
      aprobadas: reservasComercio.filter(r => r.aprobada && r.estado).length,
      rechazadas: reservasComercio.filter(r => !r.estado).length,
      totalPersonas: reservasComercio.reduce((sum, r) => sum + (r.cantidadPersonas || 0), 0)
    };
  } catch (error) {
    console.error('Error en getEstadisticasComercio:', error);
    throw error;
  }
};

// ============================================
// RESERVAS - VALIDACIONES
// ============================================

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

// Export default para compatibilidad
export default {
  // CRUD
  getAllReservas,
  getReservas,
  getReservasByUser,
  getReservaById,
  getReservasByComercio,
  createReserva,
  updateReserva,
  deleteReserva,
  
  // Aprobación y rechazo
  approveReserva,
  rejectReserva,
  cancelReserva,
  
  // Filtros y búsquedas
  filterReservasByEstado,
  filterReservasByComercio,
  filterReservasByUsuario,
  getFutureReservas,
  getPastReservas,
  getReservasRecibidasByUser,
  getReservasDelDia,
  
  // Estadísticas
  getEstadisticasComercio,
  
  // Validaciones
  isValidReservaDate,
  countPendingReservas,
};
