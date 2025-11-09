// roleHelper.js - Helpers para manejo de roles de usuario

import { ROLES, ROLE_DESCRIPTIONS } from './constants';

/**
 * Obtiene la descripción de un rol por su ID
 * @param {number} roleId - ID del rol
 * @returns {string} Descripción del rol
 */
export const getRoleDescriptionById = (roleId) => {
  return ROLE_DESCRIPTIONS[roleId] || 'Desconocido';
};

/**
 * Obtiene el ID de un rol por su descripción
 * @param {string} description - Descripción del rol
 * @returns {number|null} ID del rol o null si no existe
 */
export const getRoleIdByDescription = (description) => {
  const entry = Object.entries(ROLE_DESCRIPTIONS).find(
    ([, desc]) => desc.toLowerCase() === description.toLowerCase()
  );
  return entry ? parseInt(entry[0]) : null;
};

/**
 * Verifica si un rol es de Usuario Común
 * @param {number} roleId - ID del rol
 * @returns {boolean}
 */
export const isUsuarioComun = (roleId) => {
  return roleId === ROLES.USUARIO_COMUN;
};

/**
 * Verifica si un rol es de Usuario Comercio
 * @param {number} roleId - ID del rol
 * @returns {boolean}
 */
export const isUsuarioComercio = (roleId) => {
  return roleId === ROLES.USUARIO_COMERCIO;
};

/**
 * Verifica si un rol es de Administrador
 * @param {number} roleId - ID del rol
 * @returns {boolean}
 */
export const isAdministrador = (roleId) => {
  return roleId === ROLES.ADMINISTRADOR;
};

/**
 * Obtiene todos los roles disponibles
 * @returns {Array<{id: number, description: string}>}
 */
export const getAllRoles = () => {
  return Object.entries(ROLE_DESCRIPTIONS).map(([id, description]) => ({
    id: parseInt(id),
    description,
  }));
};

/**
 * Verifica si un usuario tiene permisos de administrador
 * @param {Object} user - Objeto usuario
 * @returns {boolean}
 */
export const hasAdminPermissions = (user) => {
  if (!user) return false;
  return user.iD_RolUsuario === ROLES.ADMINISTRADOR;
};

/**
 * Verifica si un usuario tiene permisos de comercio
 * @param {Object} user - Objeto usuario
 * @returns {boolean}
 */
export const hasComercioPermissions = (user) => {
  if (!user) return false;
  return user.iD_RolUsuario === ROLES.USUARIO_COMERCIO;
};

/**
 * Verifica si un usuario es común
 * @param {Object} user - Objeto usuario
 * @returns {boolean}
 */
export const isCommonUser = (user) => {
  if (!user) return false;
  return user.iD_RolUsuario === ROLES.USUARIO_COMUN;
};

export default {
  getRoleDescriptionById,
  getRoleIdByDescription,
  isUsuarioComun,
  isUsuarioComercio,
  isAdministrador,
  getAllRoles,
  hasAdminPermissions,
  hasComercioPermissions,
  isCommonUser,
};
