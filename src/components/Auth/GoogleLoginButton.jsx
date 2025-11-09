// GoogleLoginButton.jsx - Botón de login/registro con Google

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

/**
 * Componente de botón para autenticación con Google
 * @param {Object} props
 * @param {boolean} props.isRegistering - Si es registro en lugar de login
 * @param {number} props.selectedRole - Rol seleccionado para registro
 * @param {function} props.onSuccess - Callback al completar exitosamente
 * @param {function} props.onError - Callback al fallar
 */
const GoogleLoginButton = ({ 
  isRegistering = false, 
  selectedRole = ROLES.USUARIO_COMUN,
  onSuccess,
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, registerWithGoogle } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja el éxito de la autenticación con Google
   */
  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    
    try {
      const idToken = credentialResponse.credential;
      console.log('✅ Token de Google recibido');

      let result;

      if (isRegistering) {
        // REGISTRO
        console.log('📝 Registrando nuevo usuario con rol:', selectedRole);
        result = await registerWithGoogle(idToken, selectedRole);
      } else {
        // LOGIN
        console.log('🔐 Iniciando sesión...');
        result = await loginWithGoogle(idToken);

        // Si necesita registrarse
        if (result.needsRegistration) {
          if (onError) {
            onError({
              needsRegistration: true,
              message: 'Usuario no registrado. Por favor, regístrate primero.',
            });
          }
          setIsLoading(false);
          return;
        }
      }

      if (result.success) {
        console.log('🎉 Autenticación exitosa');
        
        if (onSuccess) {
          onSuccess(result.user);
        }

        // Redirigir según el rol
        const user = result.user;
        if (user.iD_RolUsuario === ROLES.ADMINISTRADOR) {
          navigate('/admin');
        } else if (user.iD_RolUsuario === ROLES.USUARIO_COMERCIO) {
          navigate('/bar-management');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      
      if (onError) {
        onError({
          message: error.message || 'Error en la autenticación',
          error,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el error de Google OAuth
   */
  const handleError = () => {
    console.error('❌ Error en Google OAuth');
    
    if (onError) {
      onError({
        message: 'Error al conectar con Google. Por favor, intenta nuevamente.',
      });
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-2 px-4 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
          <span className="text-gray-700">
            {isRegistering ? 'Registrando...' : 'Iniciando sesión...'}
          </span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={!isRegistering}
          text={isRegistering ? 'signup_with' : 'signin_with'}
          shape="rectangular"
          size="large"
          theme="outline"
          width="100%"
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;
