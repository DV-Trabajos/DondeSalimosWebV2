// Login.jsx - Página de autenticación (Login y Registro)

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleLoginButton from '../components/Auth/GoogleLoginButton';
import { ROLES } from '../utils/constants';
import { Beer, Users, Store, Shield } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES.USUARIO_COMUN);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta desde donde vino (para redirigir después del login)
  const from = location.state?.from?.pathname || '/';

  /**
   * Maneja el éxito de la autenticación
   */
  const handleSuccess = (user) => {
    setSuccessMessage(`¡Bienvenido, ${user.nombreUsuario}!`);
    setError(null);

    // Redirigir después de un breve delay
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 1500);
  };

  /**
   * Maneja errores en la autenticación
   */
  const handleError = (errorData) => {
    if (errorData.needsRegistration) {
      setError('Usuario no registrado. Por favor, crea una cuenta.');
      setIsRegistering(true);
    } else {
      setError(errorData.message || 'Error en la autenticación');
    }
    setSuccessMessage(null);
  };

  /**
   * Cambia entre modo login y registro
   */
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * Opciones de roles para el registro
   */
  const roleOptions = [
    {
      id: ROLES.USUARIO_COMUN,
      name: 'Usuario Común',
      description: 'Buscar lugares y hacer reservas',
      icon: Users,
      color: 'blue',
    },
    {
      id: ROLES.USUARIO_COMERCIO,
      name: 'Dueño de Comercio',
      description: 'Gestionar tu bar o restaurante',
      icon: Store,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <Beer className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Donde Salimos
          </h1>
          <p className="text-white/90">
            Descubre los mejores lugares para salir
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tabs Login/Registro */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => !isRegistering && toggleMode()}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                !isRegistering
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => isRegistering && toggleMode()}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                isRegistering
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Contenido según el modo */}
          {isRegistering ? (
            <>
              {/* MODO REGISTRO */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Selecciona tu tipo de cuenta
                </h3>
                <div className="space-y-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;

                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`w-full p-4 rounded-lg border-2 transition text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {role.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {role.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="text-primary">
                              <Shield className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón de registro con Google */}
              <GoogleLoginButton
                isRegistering={true}
                selectedRole={selectedRole}
                onSuccess={handleSuccess}
                onError={handleError}
              />

              <p className="text-center text-sm text-gray-600 mt-4">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary font-semibold hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </>
          ) : (
            <>
              {/* MODO LOGIN */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Inicia sesión con Google
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Usa tu cuenta de Google para acceder rápidamente
                </p>
              </div>

              {/* Botón de login con Google */}
              <GoogleLoginButton
                isRegistering={false}
                onSuccess={handleSuccess}
                onError={handleError}
              />

              <p className="text-center text-sm text-gray-600 mt-4">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary font-semibold hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </>
          )}

          {/* Términos y condiciones */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-primary hover:underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-primary hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>

        {/* Botón para explorar sin cuenta */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-white/80 font-semibold transition"
          >
            Explorar sin cuenta →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
