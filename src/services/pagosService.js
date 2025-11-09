// pagosService.js - Servicio de gestión de pagos

import { apiGet, apiPost } from './api';

export const getAllPagos = async () => {
  const response = await apiGet('/api/pagos/listado');
  return response;
};

export const getPagoById = async (id) => {
  const response = await apiGet(`/api/pagos/buscarIdPago/${id}`);
  return response;
};

export const getPagosByUsuario = async (usuarioId) => {
  const response = await apiGet(`/api/pagos/buscarPagosPorUsuario/${usuarioId}`);
  return response;
};

export const createPago = async (pagoData) => {
  const response = await apiPost('/api/pagos/crear', pagoData);
  return response;
};

export const procesarPago = async (pagoData) => {
  const response = await apiPost('/api/pagos/procesar', pagoData);
  return response;
};

export default {
  getAllPagos,
  getPagoById,
  getPagosByUsuario,
  createPago,
  procesarPago,
};
