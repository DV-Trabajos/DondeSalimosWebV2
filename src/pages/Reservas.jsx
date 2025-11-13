// src/pages/Reservas.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ReservaCard from '../components/Reservations/ReservaCard';
import ReservasRecibidas from '../components/Reservations/ReservasRecibidas';
import { 
  getAllReservas,
  cancelReserva 
} from '../services/reservasService';

/**
 * Página de gestión de reservas
 * Muestra diferentes vistas según el rol del usuario
 */
const Reservas = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('mis-reservas');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comercioIdToFilter, setComercioIdToFilter] = useState(null);

  // Determinar si es dueño de comercio
  const isBarOwner = user?.iD_RolUsuario === 2;

  // Detectar si viene de navegación con tab específico
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.comercioId) {
      setComercioIdToFilter(location.state.comercioId);
    }
  }, [location]);

  useEffect(() => {
    if (activeTab === 'mis-reservas') {
      cargarMisReservas();
    }
  }, [activeTab, user]);

  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las reservas y filtrar por usuario
      const allReservas = await getAllReservas();
      const reservasUsuario = allReservas.filter(r => r.iD_Usuario === user.iD_Usuario);
      
      // Ordenar por fecha (más recientes primero)
      const reservasOrdenadas = reservasUsuario.sort((a, b) => 
        new Date(b.fechaReserva) - new Date(a.fechaReserva)
      );

      setReservas(reservasOrdenadas);
    } catch (err) {
      console.error('Error al cargar mis reservas:', err);
      setError('No se pudieron cargar tus reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (reserva) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas cancelar tu reserva para ${
        reserva.comercio?.nombre || 'este lugar'
      }?`
    );

    if (!confirmar) return;

    try {
      const motivo = prompt('¿Deseas agregar un motivo de cancelación? (opcional)');
      await cancelReserva(reserva.iD_Reserva, reserva, motivo || '');
      
      // Actualizar lista local
      setReservas(reservas.map(r => 
        r.iD_Reserva === reserva.iD_Reserva 
          ? { ...r, estado: false }
          : r
      ));

      alert('Reserva cancelada exitosamente');
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
    }
  };

  // Calcular estadísticas de mis reservas
  const estadisticasMisReservas = {
    total: reservas.length,
    pendientes: reservas.filter(r => !r.aprobada && r.estado).length,
    aprobadas: reservas.filter(r => r.aprobada && r.estado).length,
    canceladas: reservas.filter(r => !r.estado).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Reservas
          </h1>
          <p className="text-gray-600">
            {isBarOwner 
              ? 'Gestiona las reservas de tus clientes y tus propias reservas'
              : 'Consulta y gestiona tus reservas'
            }
          </p>
        </div>

        {/* Tabs (solo si es dueño de comercio) */}
        {isBarOwner && (
          <div className="bg-white border border-gray-200 rounded-lg p-1 mb-6 flex">
            <button
              onClick={() => {
                setActiveTab('mis-reservas');
                setComercioIdToFilter(null);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'mis-reservas'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              Mis Reservas
            </button>
            <button
              onClick={() => {
                setActiveTab('reservas-recibidas');
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'reservas-recibidas'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Reservas Recibidas
            </button>
          </div>
        )}

        {/* Contenido según tab activo */}
        {activeTab === 'mis-reservas' ? (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticasMisReservas.total}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estadisticasMisReservas.pendientes}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-1">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticasMisReservas.aprobadas}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-1">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticasMisReservas.canceladas}
                </p>
              </div>
            </div>

            {/* Lista de mis reservas */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Cargando tus reservas...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={cargarMisReservas}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : reservas.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No tienes reservas
                </h3>
                <p className="text-gray-500 mb-6">
                  Explora lugares increíbles y haz tu primera reserva
                </p>
                <a
                  href="/"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  Explorar Lugares
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservas.map(reserva => (
                  <ReservaCard
                    key={reserva.iD_Reserva}
                    reserva={reserva}
                    isOwner={false}
                    comercioNombre={reserva.comercio?.nombre}
                    onCancelar={handleCancelar}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // Tab de Reservas Recibidas (solo para dueños de comercio)
          <ReservasRecibidas 
            userId={user.iD_Usuario} 
            initialComercioFilter={comercioIdToFilter}
          />
        )}
      </div>
    </div>
  );
};

export default Reservas;
