// RoleGuard.jsx - Componente para controlar acceso basado en roles

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_DESCRIPTIONS } from '../../utils/constants';

/**
 * Componente que controla el acceso basado en roles de usuario
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si tiene el rol correcto
 * @param {number|number[]} props.allowedRoles - Rol(es) permitido(s) para acceder
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene permisos (default: '/')
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene permisos (alternativa a redirect)
 */
const RoleGuard = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/',
  fallback = null 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Convertir allowedRoles a array si es un número
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Verificar si el usuario tiene uno de los roles permitidos
  const hasPermission = rolesArray.includes(user?.iD_RolUsuario);

  // Si no tiene permisos
  if (!hasPermission) {
    console.warn(
      `⚠️ Acceso denegado. Usuario con rol ${ROLE_DESCRIPTIONS[user?.iD_RolUsuario]} intentó acceder a recurso que requiere: ${rolesArray.map(r => ROLE_DESCRIPTIONS[r]).join(' o ')}`
    );

    // Si hay un componente fallback, mostrarlo
    if (fallback) {
      return fallback;
    }

    // Si no, redirigir
    return <Navigate to={redirectTo} replace />;
  }

  // Si tiene permisos, mostrar el contenido
  return children;
};

/**
 * Componente específico para rutas de administrador
 */
export const AdminGuard = ({ children, redirectTo = '/', fallback = null }) => {
  return (
    <RoleGuard 
      allowedRoles={ROLES.ADMINISTRADOR} 
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Componente específico para rutas de dueños de comercio
 */
export const BarOwnerGuard = ({ children, redirectTo = '/', fallback = null }) => {
  return (
    <RoleGuard 
      allowedRoles={ROLES.USUARIO_COMERCIO} 
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Componente específico para rutas de usuarios comunes
 */
export const UserGuard = ({ children, redirectTo = '/', fallback = null }) => {
  return (
    <RoleGuard 
      allowedRoles={ROLES.USUARIO_COMUN} 
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Componente que permite múltiples roles
 */
export const MultiRoleGuard = ({ children, allowedRoles, redirectTo = '/', fallback = null }) => {
  return (
    <RoleGuard 
      allowedRoles={allowedRoles} 
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
};

export default RoleGuard;
