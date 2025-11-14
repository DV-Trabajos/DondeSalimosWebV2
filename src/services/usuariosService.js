// usuariosService.js - Servicio completo de usuarios
// Fase 5: Perfiles de Usuario

import { apiGet, apiPost, apiPut, apiDelete } from './api';

// ============================================
// USUARIOS - CRUD OPERATIONS
// ============================================

/**
 * Obtiene todos los usuarios del sistema
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getAllUsuarios = async () => {
  try {
    const response = await apiGet('/api/usuarios/listado');
    return response;
  } catch (error) {
    console.error('❌ Error en getAllUsuarios:', error);
    throw error;
  }
};

/**
 * Alias para getAllUsuarios (compatibilidad)
 */
export const getUsuarios = getAllUsuarios;

/**
 * Obtiene un usuario por ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarIdUsuario/${userId}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getUserById:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserByEmail = async (email) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarEmail/${email}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getUserByEmail:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por UID de Firebase
 * @param {string} uid - UID de Firebase
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserByUid = async (uid) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarUid/${uid}`);
    return response;
  } catch (error) {
    console.error('❌ Error en getUserByUid:', error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export const createUser = async (userData) => {
  try {
    const response = await apiPost('/api/usuarios/crear', userData);
    return response;
  } catch (error) {
    console.error('❌ Error en createUser:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos actualizados
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUser = async (userId, userData) => {
  try {
    const dataToSend = {
      iD_Usuario: userId,
      nombreUsuario: userData.nombreUsuario,
      correo: userData.correo,
      telefono: userData.telefono || null,
      uid: userData.uid,
      estado: userData.estado !== undefined ? userData.estado : true,
      fechaCreacion: userData.fechaCreacion,
      iD_RolUsuario: userData.iD_RolUsuario,
    };

    console.log('📤 Actualizando usuario:', dataToSend);
    const response = await apiPut(`/api/usuarios/modificar/${userId}`, dataToSend);
    console.log('✅ Usuario actualizado:', response);
    return response;
  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
};

/**
 * Elimina un usuario (y todos sus datos relacionados)
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deleteUser = async (userId) => {
  try {
    console.log('🗑️ Eliminando usuario:', userId);
    const response = await apiDelete(`/api/usuarios/eliminar/${userId}`);
    console.log('✅ Usuario eliminado exitosamente');
    return response;
  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
};

/**
 * Desactiva un usuario (cambia estado a false)
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Usuario desactivado
 */
export const deactivateUser = async (userId) => {
  try {
    const response = await apiPost(`/api/usuarios/desactivar/${userId}`);
    return response;
  } catch (error) {
    console.error('❌ Error en deactivateUser:', error);
    throw error;
  }
};

/**
 * Reactiva un usuario (cambia estado a true)
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Usuario reactivado
 */
export const reactivateUser = async (userId) => {
  try {
    const response = await apiPost(`/api/usuarios/reactivar/${userId}`);
    return response;
  } catch (error) {
    console.error('❌ Error en reactivateUser:', error);
    throw error;
  }
};

// ============================================
// USUARIOS - FILTROS Y BÚSQUEDAS
// ============================================

/**
 * Filtra usuarios por estado
 * @param {Array} usuarios - Lista de usuarios
 * @param {boolean} estado - Estado a filtrar (true = activos, false = inactivos)
 * @returns {Array} Usuarios filtrados
 */
export const filterUsuariosByEstado = (usuarios, estado = true) => {
  return usuarios.filter(u => u.estado === estado);
};

/**
 * Filtra usuarios por rol
 * @param {Array} usuarios - Lista de usuarios
 * @param {number} rolId - ID del rol (1: Común, 2: Comercio, 3: Admin)
 * @returns {Array} Usuarios filtrados
 */
export const filterUsuariosByRol = (usuarios, rolId) => {
  return usuarios.filter(u => u.iD_RolUsuario === rolId);
};

/**
 * Busca usuarios por texto (nombre o email)
 * @param {Array} usuarios - Lista de usuarios
 * @param {string} searchText - Texto a buscar
 * @returns {Array} Usuarios que coinciden con la búsqueda
 */
export const searchUsuarios = (usuarios, searchText) => {
  if (!searchText || searchText.trim() === '') return usuarios;
  
  const searchLower = searchText.toLowerCase();
  return usuarios.filter(u => {
    const nombre = (u.nombreUsuario || '').toLowerCase();
    const email = (u.correo || '').toLowerCase();
    return nombre.includes(searchLower) || email.includes(searchLower);
  });
};

// ============================================
// USUARIOS - VALIDACIONES
// ============================================

/**
 * Verifica si un email ya está registrado
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} true si existe
 */
export const checkEmailExists = async (email) => {
  try {
    await getUserByEmail(email);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida el formato de un teléfono (10 dígitos)
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} true si es válido
 */
export const validatePhone = (telefono) => {
  if (!telefono) return true; // Opcional
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(telefono);
};

/**
 * Valida un nombre de usuario
 * @param {string} nombreUsuario - Nombre a validar
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateUsername = (nombreUsuario) => {
  if (!nombreUsuario || nombreUsuario.trim() === '') {
    return { valid: false, error: 'El nombre de usuario es obligatorio' };
  }

  if (nombreUsuario.trim().length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (nombreUsuario.length > 50) {
    return { valid: false, error: 'El nombre no puede superar 50 caracteres' };
  }

  return { valid: true, error: '' };
};

// ============================================
// USUARIOS - ESTADÍSTICAS
// ============================================

/**
 * Obtiene estadísticas generales de usuarios
 * @param {Array} usuarios - Lista de usuarios
 * @returns {Object} Estadísticas calculadas
 */
export const getUsersStats = (usuarios) => {
  if (!usuarios || usuarios.length === 0) {
    return {
      total: 0,
      activos: 0,
      inactivos: 0,
      comunes: 0,
      comercios: 0,
      admins: 0
    };
  }

  return {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === true).length,
    inactivos: usuarios.filter(u => u.estado === false).length,
    comunes: usuarios.filter(u => u.iD_RolUsuario === 1).length,
    comercios: usuarios.filter(u => u.iD_RolUsuario === 2).length,
    admins: usuarios.filter(u => u.iD_RolUsuario === 3).length
  };
};

/**
 * Cuenta usuarios registrados por fecha
 * @param {Array} usuarios - Lista de usuarios
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {number} Cantidad de usuarios registrados en el período
 */
export const countUsersByDateRange = (usuarios, startDate, endDate) => {
  return usuarios.filter(u => {
    const fecha = new Date(u.fechaCreacion);
    return fecha >= startDate && fecha <= endDate;
  }).length;
};

// ============================================
// USUARIOS - UTILIDADES
// ============================================

/**
 * Ordena usuarios por fecha de creación
 * @param {Array} usuarios - Lista de usuarios
 * @param {boolean} ascending - Si es true, ordena de más antiguo a más reciente
 * @returns {Array} Usuarios ordenados
 */
export const sortUsersByDate = (usuarios, ascending = false) => {
  return [...usuarios].sort((a, b) => {
    const dateA = new Date(a.fechaCreacion);
    const dateB = new Date(b.fechaCreacion);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Ordena usuarios por nombre
 * @param {Array} usuarios - Lista de usuarios
 * @param {boolean} ascending - Si es true, ordena A-Z
 * @returns {Array} Usuarios ordenados
 */
export const sortUsersByName = (usuarios, ascending = true) => {
  return [...usuarios].sort((a, b) => {
    const nameA = (a.nombreUsuario || '').toLowerCase();
    const nameB = (b.nombreUsuario || '').toLowerCase();
    if (ascending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
};

/**
 * Obtiene el nombre completo o nombre de usuario
 * @param {Object} usuario - Usuario
 * @returns {string} Nombre a mostrar
 */
export const getUserDisplayName = (usuario) => {
  return usuario?.nombreUsuario || usuario?.displayName || 'Usuario';
};

/**
 * Formatea un teléfono para mostrar (agrega guiones)
 * @param {string} telefono - Teléfono sin formato
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (telefono) => {
  if (!telefono) return '';
  
  // Remover todo lo que no sea número
  const cleaned = telefono.replace(/\D/g, '');
  
  // Formatear: (123) 456-7890
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return telefono;
};

/**
 * Verifica si un usuario es administrador
 * @param {Object} usuario - Usuario a verificar
 * @returns {boolean} true si es admin
 */
export const isAdmin = (usuario) => {
  return usuario?.iD_RolUsuario === 3;
};

/**
 * Verifica si un usuario es dueño de comercio
 * @param {Object} usuario - Usuario a verificar
 * @returns {boolean} true si es comercio
 */
export const isBarOwner = (usuario) => {
  return usuario?.iD_RolUsuario === 2;
};

/**
 * Verifica si un usuario está activo
 * @param {Object} usuario - Usuario a verificar
 * @returns {boolean} true si está activo
 */
export const isUserActive = (usuario) => {
  return usuario?.estado === true;
};

// Export default para compatibilidad con imports antiguos
export default {
  // CRUD
  getAllUsuarios,
  getUsuarios,
  getUserById,
  getUserByEmail,
  getUserByUid,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  reactivateUser,
  
  // Filtros y búsquedas
  filterUsuariosByEstado,
  filterUsuariosByRol,
  searchUsuarios,
  
  // Validaciones
  checkEmailExists,
  validateEmail,
  validatePhone,
  validateUsername,
  
  // Estadísticas
  getUsersStats,
  countUsersByDateRange,
  
  // Utilidades
  sortUsersByDate,
  sortUsersByName,
  getUserDisplayName,
  formatPhone,
  isAdmin,
  isBarOwner,
  isUserActive,
};