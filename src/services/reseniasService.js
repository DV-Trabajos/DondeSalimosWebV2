// reseniasService.js - Servicio de gestión de reseñas

import { apiGet, apiPost, apiPut, apiDelete } from './api';

export const getAllResenias = async () => {
  const response = await apiGet('/api/resenias/listado');
  return response;
};

export const getReseniaById = async (id) => {
  const response = await apiGet(`/api/resenias/buscarIdResenia/${id}`);
  return response;
};

export const getReseniasByComercio = async (comercioId) => {
  const response = await apiGet(`/api/resenias/buscarReseniasPorComercio/${comercioId}`);
  return response;
};

export const getReseniasByUsuario = async (usuarioId) => {
  const response = await apiGet(`/api/resenias/buscarReseniasPorUsuario/${usuarioId}`);
  return response;
};

export const createResenia = async (reseniaData) => {
  const response = await apiPost('/api/resenias/crear', reseniaData);
  return response;
};

export const updateResenia = async (id, reseniaData) => {
  const response = await apiPut(`/api/resenias/actualizar/${id}`, reseniaData);
  return response;
};

export const deleteResenia = async (id) => {
  const response = await apiDelete(`/api/resenias/eliminar/${id}`);
  return response;
};

export default {
  getAllResenias,
  getReseniaById,
  getReseniasByComercio,
  getReseniasByUsuario,
  createResenia,
  updateResenia,
  deleteResenia,
};
