// Profile.jsx - Página de perfil de usuario

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { getRoleDescriptionById } from '../utils/roleHelper';

const Profile = () => {
  const { user, logout, isAdmin, isBarOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.nombreUsuario}</h1>
                <p className="text-white/90">{user?.correo}</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Información del usuario */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user?.correo}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  <p className="font-semibold">
                    {getRoleDescriptionById(user?.iD_RolUsuario)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-semibold">
                    {user?.estado ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges de roles */}
            <div className="flex gap-2 mb-6">
              {isAdmin && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  Administrador
                </span>
              )}
              {isBarOwner && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Dueño de Comercio
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Volver al Inicio
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Panel de Administración
                </button>
              )}

              {isBarOwner && (
                <button
                  onClick={() => navigate('/bar-management')}
                  className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Gestionar mis Comercios
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
