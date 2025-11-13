// src/components/Reservations/Reservas.jsx
// Página de gestión de reservas con tabs

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ReservaCard from './ReservaCard';
import ReservasRecibidas from './ReservasRecibidas';
import { 
  getAllReservas,
  cancelReserva 
} from '../../services/reservasService';

/**
 * Página de gestión de reservas
 * Muestra diferentes vistas según el rol del usuario
 */
const Reservas = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // 🔧 MODIFICACIÓN: Leer el tab inicial desde location.state
  const initialTab = location.state?.activeTab || 'mis-reservas';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determinar si es dueño de comercio
  const isBarOwner = user?.iD_RolUsuario === 2;

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
              onClick={() => setActiveTab('mis-reservas')}
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
              onClick={() => setActiveTab('reservas-recibidas')}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{estadisticasMisReservas.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-800">{estadisticasMisReservas.pendientes}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Confirmadas</p>
                    <p className="text-2xl font-bold text-gray-800">{estadisticasMisReservas.aprobadas}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Canceladas</p>
                    <p className="text-2xl font-bold text-gray-800">{estadisticasMisReservas.canceladas}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Lista de Mis Reservas */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando tus reservas...</p>
                </div>
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
          <ReservasRecibidas userId={user.iD_Usuario} />
        )}
      </div>
    </div>
  );
};

export default Reservas;
