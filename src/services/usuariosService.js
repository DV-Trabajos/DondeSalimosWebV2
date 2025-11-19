// usuariosService.js - Servicio completo de usuarios con desactivación
// Ruta: src/services/usuariosService.js
// ACTUALIZADO: Agregado endpoint para desactivar usuarios

import api from './api';

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Obtiene todos los usuarios del sistema
 * GET: /api/usuarios/listado
 */
export const getAllUsuarios = async () => {
  const response = await api.get('/api/Usuarios/listado');
  return response.data;
};

/**
 * Obtiene un usuario por ID
 * GET: /api/usuarios/buscarIdUsuario/{id}
 */
export const getUsuarioById = async (id) => {
  const response = await api.get(`/api/Usuarios/buscarIdUsuario/${id}`);
  return response.data;
};

/**
 * Busca usuarios por nombre
 * GET: /api/usuarios/buscarNombreUsuario/{usuario}
 */
export const searchUsuariosByName = async (nombreUsuario) => {
  const response = await api.get(`/api/Usuarios/buscarNombreUsuario/${nombreUsuario}`);
  return response.data;
};

/**
 * Busca un usuario por email
 * GET: /api/usuarios/buscarEmail/{email}
 */
export const getUsuarioByEmail = async (email) => {
  const response = await api.get(`/api/Usuarios/buscarEmail/${email}`);
  return response.data;
};

/**
 * Actualiza un usuario
 * PUT: /api/usuarios/actualizar/{id}
 */
export const actualizarUsuario = async (id, usuarioData) => {
  const response = await api.put(`/api/Usuarios/actualizar/${id}`, usuarioData);
  return response.data;
};

/**
 * ⭐ NUEVO: Desactiva un usuario (cambia estado a false, NO lo elimina)
 * PUT: /api/usuarios/desactivar/{id}
 * 
 * Diferencia con eliminar:
 * - Desactivar: El usuario permanece en la BD pero con estado = false
 *               No puede iniciar sesión, pero sus datos se mantienen
 * - Eliminar: Se borra completamente el usuario y todas sus relaciones
 * 
 * @param {number} id - ID del usuario a desactivar
 * @returns {Promise} Respuesta de la API
 */
export const desactivarUsuario = async (id) => {
  try {
    console.log('🔒 Desactivando usuario:', id);
    const response = await api.put(`/api/Usuarios/desactivar/${id}`);
    console.log('✅ Usuario desactivado correctamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error desactivando usuario:', error);
    throw error;
  }
};

/**
 * Cambia el estado de un usuario (activar o desactivar)
 * PUT: /api/usuarios/cambiarEstado/{id}
 * 
 * @param {number} id - ID del usuario
 * @param {boolean} estado - true para activar, false para desactivar
 * @returns {Promise} Respuesta de la API
 */
export const cambiarEstadoUsuario = async (id, estado) => {
  try {
    console.log(`🔄 Cambiando estado de usuario ${id} a: ${estado}`);
    const response = await api.put(`/api/Usuarios/cambiarEstado/${id}`, { 
      estado: estado 
    });
    console.log('✅ Estado cambiado correctamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error cambiando estado:', error);
    throw error;
  }
};

/**
 * Elimina permanentemente un usuario y todas sus relaciones
 * DELETE: /api/usuarios/eliminar/{id}
 * 
 * ⚠️ PRECAUCIÓN: Esta acción es irreversible
 * Elimina:
 * - Reseñas del usuario
 * - Reservas del usuario
 * - Comercios del usuario (y sus publicidades, reservas y reseñas)
 * - Usuario de Firebase
 * - Usuario de la BD
 */
export const eliminarUsuario = async (id) => {
  try {
    console.log('🗑️ Eliminando usuario permanentemente:', id);
    const response = await api.delete(`/api/Usuarios/eliminar/${id}`);
    console.log('✅ Usuario eliminado permanentemente');
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Inicia sesión con Google
 * POST: /api/usuarios/iniciarSesionConGoogle
 */
export const signInWithGoogle = async (idToken) => {
  const response = await api.post('/api/Usuarios/iniciarSesionConGoogle', { idToken });
  return response.data;
};

/**
 * Registra un usuario con Google
 * POST: /api/usuarios/registrarConGoogle
 */
export const signUpWithGoogle = async (idToken, rolUsuario = 16) => {
  const response = await api.post('/api/Usuarios/registrarConGoogle', { 
    idToken, 
    rolUsuario 
  });
  return response.data;
};

/**
 * Login de prueba (sin Firebase)
 * POST: /api/usuarios/login-test
 */
export const loginTest = async (email) => {
  const response = await api.post('/api/Usuarios/login-test', { email });
  return response.data;
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene estadísticas de usuarios
 */
export const getUsersStats = (usuarios) => {
  const total = usuarios.length;
  const activos = usuarios.filter(u => u.estado === true).length;
  const inactivos = usuarios.filter(u => u.estado === false).length;
  
  const porRol = usuarios.reduce((acc, u) => {
    const rolId = u.iD_RolUsuario;
    acc[rolId] = (acc[rolId] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    activos,
    inactivos,
    porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : 0,
    porRol,
  };
};

/**
 * Valida si un usuario puede ser desactivado
 */
export const canDesactivarUsuario = (usuario) => {
  // No se puede desactivar si ya está inactivo
  if (usuario.estado === false) {
    return { 
      puede: false, 
      razon: 'El usuario ya está desactivado' 
    };
  }
  
  // No se puede desactivar a sí mismo (esto se valida con el user actual en el componente)
  return { 
    puede: true, 
    razon: null 
  };
};

/**
 * Valida si un usuario puede ser eliminado
 */
export const canEliminarUsuario = (usuario, currentUserId) => {
  // No se puede eliminar a sí mismo
  if (usuario.iD_Usuario === currentUserId) {
    return { 
      puede: false, 
      razon: 'No puedes eliminar tu propia cuenta desde el panel de admin' 
    };
  }
  
  return { 
    puede: true, 
    razon: null 
  };
};

export default {
  getAllUsuarios,
  getUsuarioById,
  searchUsuariosByName,
  getUsuarioByEmail,
  actualizarUsuario,
  desactivarUsuario, // ⭐ NUEVO
  eliminarUsuario,
  signInWithGoogle,
  signUpWithGoogle,
  loginTest,
  getUsersStats,
  canDesactivarUsuario,
  canEliminarUsuario,
};