// Profile.jsx - Página de Perfil de Usuario Completa
// Fase 5: Perfiles de Usuario

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  LogOut, 
  Edit2, 
  Save, 
  X,
  Calendar,
  Star,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import { getRoleDescriptionById } from '../utils/roleHelper';
import { updateUser, deleteUser } from '../services/usuariosService';
import { getReservasByUser } from '../services/reservasService';
import { getAllResenias } from '../services/reseniasService';
import { getComerciosByUsuario } from '../services/comerciosService';

/**
 * Página de perfil de usuario con edición, historial y estadísticas
 */
const Profile = () => {
  const { user, logout, isAdmin, isBarOwner, updateUserData } = useAuth();
  const navigate = useNavigate();

  // Estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    nombreUsuario: '',
    telefono: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Estados de actividad
  const [reservas, setReservas] = useState([]);
  const [resenias, setResenias] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasAprobadas: 0,
    totalResenias: 0,
    promedioCalificaciones: 0,
    comerciosActivos: 0
  });

  useEffect(() => {
    if (user) {
      setEditedData({
        nombreUsuario: user.nombreUsuario || '',
        telefono: user.telefono || ''
      });
      loadUserActivity();
    }
  }, [user]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);

      // Cargar reservas del usuario
      const userReservas = await getReservasByUser(user.iD_Usuario);
      setReservas(userReservas.slice(0, 5)); // Últimas 5

      // Cargar reseñas del usuario
      const allResenias = await getAllResenias();
      const userResenias = allResenias.filter(r => r.iD_Usuario === user.iD_Usuario);
      setResenias(userResenias.slice(0, 5)); // Últimas 5

      // Si es dueño, cargar comercios
      if (isBarOwner) {
        const userComercios = await getComerciosByUsuario(user.iD_Usuario);
        setComercios(userComercios);
      }

      // Calcular estadísticas
      calculateStats(userReservas, userResenias);

    } catch (err) {
      console.error('Error cargando actividad:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservasList, reseniasList) => {
    const comerciosActivos = comercios.filter(c => c.estado).length;
    
    const promedioCalif = reseniasList.length > 0
      ? reseniasList.reduce((sum, r) => sum + (r.calificacion || r.puntuacion || 0), 0) / reseniasList.length
      : 0;

    setStats({
      totalReservas: reservasList.length,
      reservasAprobadas: reservasList.filter(r => r.aprobada).length,
      totalResenias: reseniasList.length,
      promedioCalificaciones: promedioCalif,
      comerciosActivos: comerciosActivos
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      nombreUsuario: user.nombreUsuario || '',
      telefono: user.telefono || ''
    });
    setError('');
  };

  const handleSave = async () => {
    // Validaciones
    if (!editedData.nombreUsuario.trim()) {
      setError('El nombre de usuario es obligatorio');
      return;
    }

    if (editedData.telefono && editedData.telefono.length !== 10) {
      setError('El teléfono debe tener 10 dígitos');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const updatedUser = {
        ...user,
        nombreUsuario: editedData.nombreUsuario.trim(),
        telefono: editedData.telefono || null,
      };

      await updateUser(user.iD_Usuario, updatedUser);
      
      // Actualizar contexto
      if (updateUserData) {
        updateUserData(updatedUser);
      }

      setIsEditing(false);
      alert('Perfil actualizado correctamente');

    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError('No se pudo actualizar el perfil. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción NO se puede deshacer.\n\n' +
      'Se eliminarán:\n' +
      '- Tu perfil\n' +
      '- Todas tus reservas\n' +
      '- Todas tus reseñas\n' +
      (isBarOwner ? '- Todos tus comercios y sus datos asociados\n' : '')
    );

    if (!confirmacion) return;

    const confirmacionFinal = window.confirm(
      '¿REALMENTE deseas eliminar tu cuenta? Esta es tu última oportunidad para cancelar.'
    );

    if (!confirmacionFinal) return;

    try {
      await deleteUser(user.iD_Usuario);
      alert('Tu cuenta ha sido eliminada exitosamente.');
      logout();
      navigate('/');
    } catch (err) {
      console.error('Error eliminando cuenta:', err);
      alert('No se pudo eliminar la cuenta. Por favor contacta a soporte.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header del perfil */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            <div className="bg-gradient-to-r from-primary to-purple-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{user?.nombreUsuario}</h1>
                    <p className="text-white/90 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {getRoleDescriptionById(user?.iD_RolUsuario)}
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="p-8">
              {/* Modo edición */}
              {isEditing ? (
                <div className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Nombre de usuario */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre de usuario *
                    </label>
                    <input
                      type="text"
                      value={editedData.nombreUsuario}
                      onChange={(e) => setEditedData({ ...editedData, nombreUsuario: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tu nombre de usuario"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      value={editedData.telefono}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setEditedData({ ...editedData, telefono: value });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="1234567890"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      10 dígitos sin espacios ni guiones
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>Guardando...</>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo visualización */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{user?.correo}</p>
                    </div>
                  </div>

                  {user?.telefono && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-semibold">{user.telefono}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Miembro desde</p>
                      <p className="font-semibold">
                        {formatFecha(user?.fechaCreacion)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Reservas</h3>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReservas}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.reservasAprobadas} confirmadas
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Reseñas</h3>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalResenias}</p>
              <p className="text-xs text-gray-500 mt-1">
                Promedio: {stats.promedioCalificaciones.toFixed(1)} ⭐
              </p>
            </div>

            {isBarOwner && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">Comercios</h3>
                  <MapPin className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.comerciosActivos}</p>
                <p className="text-xs text-gray-500 mt-1">Activos</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Estado</h3>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Activo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimas reservas */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Últimas Reservas
              </h3>

              {loading ? (
                <p className="text-gray-500 text-center py-8">Cargando...</p>
              ) : reservas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tienes reservas aún
                </p>
              ) : (
                <div className="space-y-3">
                  {reservas.map((reserva) => (
                    <div
                      key={reserva.iD_Reserva}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {reserva.comercio?.nombre || 'Comercio'}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reserva.aprobada 
                            ? 'bg-green-100 text-green-800'
                            : reserva.estado
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reserva.aprobada ? 'Confirmada' : reserva.estado ? 'Pendiente' : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatFecha(reserva.fechaReserva)} · {reserva.cantidadPersonas} personas
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Últimas reseñas */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Últimas Reseñas
              </h3>

              {loading ? (
                <p className="text-gray-500 text-center py-8">Cargando...</p>
              ) : resenias.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No has dejado reseñas aún
                </p>
              ) : (
                <div className="space-y-3">
                  {resenias.map((resenia) => (
                    <div
                      key={resenia.iD_Resenia}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">
                          {resenia.comercio?.nombre || 'Comercio'}
                        </p>
                        {renderStars(resenia.calificacion || resenia.puntuacion || 0)}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {resenia.comentario}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatFecha(resenia.fechaCreacion)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Acciones de cuenta */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Acciones de Cuenta
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>

              <button
                onClick={handleDeleteAccount}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold border border-red-200"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar Cuenta
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              ⚠️ La eliminación de cuenta es permanente y no se puede deshacer. 
              Se eliminarán todos tus datos incluyendo reservas, reseñas y comercios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;