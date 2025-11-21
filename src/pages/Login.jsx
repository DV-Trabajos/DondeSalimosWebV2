// Login.jsx - Página de autenticación mejorada con logo y mejor navegación

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import GoogleLoginButton from '../components/Auth/GoogleLoginButton';
import { ROLES } from '../utils/constants';
import { Users, Store, Shield, ArrowLeft, Home } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES.USUARIO_COMUN);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta desde donde vino (para redirigir después del login)
  const from = location.state?.from?.pathname || '/';

  // Opciones de roles para registro
  const roleOptions = [
    {
      id: ROLES.USUARIO_COMUN,
      name: 'Usuario',
      description: 'Busca y reserva en bares y restaurantes',
      icon: Users,
    },
    {
      id: ROLES.USUARIO_COMERCIO,
      name: 'Dueño de Comercio',
      description: 'Gestiona tu bar o restaurante',
      icon: Store,
    },
  ];

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
      setError(errorData.message || 'Error en la autenticación. Intenta nuevamente.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Botón de volver al inicio - Visible y destacado */}
      <Link
        to="/"
        className="fixed top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg hover:shadow-xl z-50"
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Volver al Inicio</span>
        <span className="sm:hidden">Inicio</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          {/* Logo y título */}
          <div className="text-center mb-8">
            {/* Logo de Dónde Salimos */}
            <Link to="/" className="inline-block mb-4 hover:opacity-80 transition">
              <img
                src="/logo3color.png"
                alt="Dónde Salimos"
                className="h-24 mx-auto"
                onError={(e) => {
                  // Fallback si no encuentra la imagen
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
                      <svg class="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
                      </svg>
                    </div>
                  `;
                }}
              />
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dónde Salimos
            </h1>
            <p className="text-gray-600">
              Descubre los mejores lugares para salir
            </p>
          </div>

          {/* Tabs de Login/Registro */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                !isRegistering
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-primary text-white hover:bg-purple-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                isRegistering
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-primary text-white hover:bg-purple-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
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
                        className={`w-full p-4 rounded-lg border-2 transition text-left transform hover:scale-105 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
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

        {/* Botón alternativo para explorar sin cuenta - Más visible */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Explorar sin registrarme
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
