// publicidadesService.js - Servicio de publicidades
// Ruta: src/services/publicidadesService.js
// Fase 7: Sistema de Publicidad

import api from './api';

// ============================================
// CRUD OPERATIONS - Rutas del backend
// ============================================

/**
 * Obtiene todas las publicidades
 * GET: api/publicidades/listado
 */
export const getAllPublicidades = async () => {
  const response = await api.get('/api/Publicidades/listado');
  return response.data;
};

/**
 * Obtiene una publicidad por ID
 * GET: api/publicidades/buscarIdPublicidad/{id}
 */
export const getPublicidadById = async (id) => {
  const response = await api.get(`/api/Publicidades/buscarIdPublicidad/${id}`);
  return response.data;
};

/**
 * Busca publicidades por nombre de comercio
 * GET: api/publicidades/buscarNombreComercio/{comercio}
 */
export const searchPublicidadesByComercio = async (nombreComercio) => {
  const response = await api.get(`/api/Publicidades/buscarNombreComercio/${nombreComercio}`);
  return response.data;
};

/**
 * Crea una nueva publicidad
 * POST: api/publicidades/crear
 */
export const createPublicidad = async (publicidadData) => {
  const dataToSend = {
    iD_Comercio: publicidadData.iD_Comercio,
    descripcion: publicidadData.descripcion,
    imagen: publicidadData.imagen || '',
    tiempo: publicidadData.tiempo || 7,
    estado: false, // El backend lo setea en false
    pago: false,   // El backend lo setea en false
    visualizaciones: 0,
    fechaCreacion: new Date().toISOString(),
    motivoRechazo: null,
  };

  const response = await api.post('/api/Publicidades/crear', dataToSend);
  return response.data;
};

/**
 * Actualiza una publicidad
 * PUT: api/publicidades/actualizar/{id}
 */
export const updatePublicidad = async (id, publicidadData) => {
  const response = await api.put(`/api/Publicidades/actualizar/${id}`, publicidadData);
  return response.data;
};

/**
 * Elimina una publicidad
 * DELETE: api/publicidades/eliminar/{id}
 */
export const deletePublicidad = async (id) => {
  const response = await api.delete(`/api/Publicidades/eliminar/${id}`);
  return response.data;
};

/**
 * Incrementa las visualizaciones (endpoint específico del backend)
 * PUT: api/publicidades/incrementar-visualizacion/{id}
 */
export const incrementarVisualizacion = async (id) => {
  const response = await api.put(`/api/Publicidades/incrementar-visualizacion/${id}`);
  return response.data;
};

// ============================================
// FILTROS
// ============================================

export const filterPublicidadesActivas = (publicidades) => {
  const now = new Date();
  return publicidades.filter(pub => {
    if (!pub.estado) return false;
    const fechaExp = calcularFechaExpiracion(pub);
    return fechaExp > now;
  });
};

export const filterPublicidadesPendientes = (publicidades) => {
  return publicidades.filter(pub => !pub.estado && !pub.motivoRechazo);
};

export const filterPublicidadesRechazadas = (publicidades) => {
  return publicidades.filter(pub => !pub.estado && pub.motivoRechazo);
};

// ============================================
// UTILIDADES
// ============================================

export const calcularFechaExpiracion = (publicidad) => {
  const fechaCreacion = new Date(publicidad.fechaCreacion);
  const dias = publicidad.tiempo || 7;
  fechaCreacion.setDate(fechaCreacion.getDate() + dias);
  return fechaCreacion;
};

export const calcularDiasRestantes = (publicidad) => {
  const fechaExp = calcularFechaExpiracion(publicidad);
  const diffTime = fechaExp - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getPublicidadEstado = (publicidad) => {
  if (!publicidad.estado && publicidad.motivoRechazo) {
    return { estado: 'rechazada', color: 'red', texto: 'Rechazada' };
  }
  if (!publicidad.estado) {
    return { estado: 'pendiente', color: 'yellow', texto: 'Pendiente' };
  }
  const dias = calcularDiasRestantes(publicidad);
  if (dias <= 0) {
    return { estado: 'expirada', color: 'gray', texto: 'Expirada' };
  }
  if (dias <= 2) {
    return { estado: 'porExpirar', color: 'orange', texto: `${dias} día(s)` };
  }
  return { estado: 'activa', color: 'green', texto: `${dias} días` };
};

export const getPublicidadesStats = (publicidades) => {
  const activas = filterPublicidadesActivas(publicidades);
  const pendientes = filterPublicidadesPendientes(publicidades);
  const rechazadas = filterPublicidadesRechazadas(publicidades);
  const totalVistas = publicidades.reduce((sum, p) => sum + (p.visualizaciones || 0), 0);
  
  return {
    total: publicidades.length,
    activas: activas.length,
    pendientes: pendientes.length,
    rechazadas: rechazadas.length,
    totalVisualizaciones: totalVistas,
  };
};

export default {
  getAllPublicidades,
  getPublicidadById,
  searchPublicidadesByComercio,
  createPublicidad,
  updatePublicidad,
  deletePublicidad,
  incrementarVisualizacion,
  filterPublicidadesActivas,
  filterPublicidadesPendientes,
  filterPublicidadesRechazadas,
  calcularFechaExpiracion,
  calcularDiasRestantes,
  getPublicidadEstado,
  getPublicidadesStats,
};