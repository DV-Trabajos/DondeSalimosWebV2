// AuthContext.jsx - Contexto de autenticación global

import { createContext, useState, useEffect, useCallback } from 'react';
import { storeJwtToken, getJwtToken, clearJwtToken } from '../services/api';
import { signInWithGoogle, signUpWithGoogle } from '../services/authService';
import { hasAdminPermissions, hasComercioPermissions } from '../utils/roleHelper';
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    isBarOwner: false,
    isApproved: false,
  });

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Carga el usuario desde localStorage
   */
  const loadUser = async () => {
    try {
      const token = getJwtToken();
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        const user = JSON.parse(userData);
        updateAuthState(user);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Actualiza el estado de autenticación
   */
  const updateAuthState = useCallback((userData) => {
    const isAdmin = hasAdminPermissions(userData);
    const isBarOwner = hasComercioPermissions(userData);

    setState({
      user: userData,
      isAuthenticated: !!userData,
      isLoading: false,
      isAdmin,
      isBarOwner,
      isApproved: userData?.estado || false,
    });

    // Guardar en localStorage
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  }, []);

  /**
   * Login con Google
   */
  const loginWithGoogle = async (idToken) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await signInWithGoogle(idToken);

      if (response.jwtToken) {
        storeJwtToken(response.jwtToken);
      }

      if (response.usuario) {
        updateAuthState(response.usuario);
        return { success: true, user: response.usuario };
      }

      throw new Error('No se recibió información del usuario');
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      setState(prev => ({ ...prev, isLoading: false }));

      // Si el error es porque no existe el usuario, devolver info para registro
      if (error.response?.status === 400) {
        return {
          success: false,
          needsRegistration: true,
          message: error.response.data?.mensaje || 'Usuario no registrado',
        };
      }

      throw error;
    }
  };

  /**
   * Registro con Google
   */
  const registerWithGoogle = async (idToken, rolUsuario = 1) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await signUpWithGoogle(idToken, rolUsuario);

      if (response.jwtToken) {
        storeJwtToken(response.jwtToken);
      }

      if (response.usuario) {
        updateAuthState(response.usuario);
        return { success: true, user: response.usuario };
      }

      throw new Error('No se recibió información del usuario');
    } catch (error) {
      console.error('Error en registerWithGoogle:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  /**
   * Logout
   */
  const logout = useCallback(() => {
    clearJwtToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN);

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
      isBarOwner: false,
      isApproved: false,
    });

    console.log('✅ Sesión cerrada correctamente');
  }, []);

  /**
   * Actualiza los datos del usuario
   */
  const updateUser = useCallback((newUserData) => {
    updateAuthState(newUserData);
  }, [updateAuthState]);

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = useCallback((roleId) => {
    return state.user?.iD_RolUsuario === roleId;
  }, [state.user]);

  /**
   * Verifica si el usuario está autenticado
   */
  const checkAuth = useCallback(() => {
    const token = getJwtToken();
    return !!token && state.isAuthenticated;
  }, [state.isAuthenticated]);

  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    isBarOwner: state.isBarOwner,
    isApproved: state.isApproved,

    // Métodos
    loginWithGoogle,
    registerWithGoogle,
    logout,
    updateUser,
    hasRole,
    checkAuth,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
