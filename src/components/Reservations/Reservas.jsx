// Reservas.jsx - Componente unificado mejorado con filtros
// Ruta: src/components/Reservations/Reservas.jsx
// ✅ PARTE 2: Con filtros avanzados, búsqueda y mejor performance

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Header from '../Shared/Header';
import ReservaCard from './ReservaCard';
import ReservasRecibidas from './ReservasRecibidas';
import ReservasFilters from './ReservasFilters';
import { 
  getAllReservas,
  cancelReserva 
} from '../../services/reservasService';

/**
 * Componente unificado mejorado de gestión de reservas
 * ✅ MEJORAS PARTE 2:
 * - Filtros avanzados con búsqueda
 * - Mejor performance con useMemo
 * - Exportación de datos (opcional)
 * - Animaciones mejoradas
 */
const Reservas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Leer el tab inicial desde location.state
  const initialTab = location.state?.activeTab || 'mis-reservas';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ NUEVO: Estado de filtros
  const [filters, setFilters] = useState({
    search: '',
    estado: 'todos',
    periodo: 'todos',
    comercio: 'todos'
  });

  // Determinar rol
  const isBarOwner = user?.iD_RolUsuario === 3;
  const isAdmin = user?.iD_RolUsuario === 2;

  // Cargar reservas
  useEffect(() => {
    if (activeTab === 'mis-reservas') {
      cargarMisReservas();
    }
  }, [activeTab, user]);

  /**
   * Carga las reservas del usuario como cliente
   */
  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando reservas para usuario:', user.iD_Usuario);
      
      const allReservas = await getAllReservas();
      const reservasUsuario = allReservas.filter(r => r.iD_Usuario === user.iD_Usuario);
      
      console.log('✅ Reservas encontradas:', reservasUsuario.length);
      
      // Ordenar por fecha (más recientes primero)
      const reservasOrdenadas = reservasUsuario.sort((a, b) => 
        new Date(b.fechaReserva) - new Date(a.fechaReserva)
      );

      setReservas(reservasOrdenadas);
    } catch (err) {
      console.error('❌ Error al cargar mis reservas:', err);
      setError('No se pudieron cargar tus reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ NUEVO: Filtrado inteligente de reservas con useMemo para performance
   */
  const reservasFiltradas = useMemo(() => {
    let filtered = [...reservas];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.comercio?.nombre?.toLowerCase().includes(searchLower) ||
        r.usuario?.nombreUsuario?.toLowerCase().includes(searchLower) ||
        r.comentarios?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado !== 'todos') {
      switch (filters.estado) {
        case 'pendientes':
          filtered = filtered.filter(r => !r.aprobada && r.estado && !r.motivoRechazo);
          break;
        case 'aprobadas':
          filtered = filtered.filter(r => r.aprobada && r.estado);
          break;
        case 'rechazadas':
          filtered = filtered.filter(r => r.aprobada === false && r.motivoRechazo);
          break;
        case 'canceladas':
          filtered = filtered.filter(r => !r.estado);
          break;
      }
    }

    // Filtro por período
    if (filters.periodo !== 'todos') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const next7Days = new Date(today);
      next7Days.setDate(next7Days.getDate() + 7);

      switch (filters.periodo) {
        case 'hoy':
          filtered = filtered.filter(r => {
            const reservaDate = new Date(r.fechaReserva);
            const reservaDay = new Date(reservaDate.getFullYear(), reservaDate.getMonth(), reservaDate.getDate());
            return reservaDay.getTime() === today.getTime();
          });
          break;
        case 'proximos':
          filtered = filtered.filter(r => {
            const reservaDate = new Date(r.fechaReserva);
            return reservaDate >= today && reservaDate <= next7Days;
          });
          break;
        case 'pasados':
          filtered = filtered.filter(r => new Date(r.fechaReserva) < today);
          break;
      }
    }

    return filtered;
  }, [reservas, filters]);

  /**
   * Maneja cambios en filtros
   */
  const handleFilterChange = (newFilters) => {
    console.log('🔍 Filtros actualizados:', newFilters);
    setFilters(newFilters);
  };

  /**
   * Maneja la cancelación de una reserva
   */
  const handleCancelar = async (reserva) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas cancelar tu reserva para ${
        reserva.comercio?.nombre || 'este lugar'
      }?`
    );

    if (!confirmar) return;

    try {
      console.log('🚫 Cancelando reserva:', reserva.iD_Reserva);
      
      const motivo = prompt('¿Deseas agregar un motivo de cancelación? (opcional)');
      await cancelReserva(reserva.iD_Reserva, reserva, motivo || 'Cancelado por el usuario');
      
      // Actualizar lista local
      setReservas(reservas.map(r => 
        r.iD_Reserva === reserva.iD_Reserva 
          ? { ...r, estado: false }
          : r
      ));

      console.log('✅ Reserva cancelada exitosamente');
      alert('Reserva cancelada exitosamente');
    } catch (err) {
      console.error('❌ Error al cancelar reserva:', err);
      alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
    }
  };

  /**
   * ✅ NUEVO: Exportar reservas a CSV (opcional)
   */
  const exportarReservas = () => {
    try {
      const csv = [
        ['Comercio', 'Fecha', 'Hora', 'Personas', 'Estado', 'Comentarios'].join(','),
        ...reservasFiltradas.map(r => [
          r.comercio?.nombre || 'N/A',
          new Date(r.fechaReserva).toLocaleDateString('es-AR'),
          new Date(r.fechaReserva).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          r.cantidadPersonas || 1,
          r.estado ? (r.aprobada ? 'Confirmada' : 'Pendiente') : 'Cancelada',
          (r.comentarios || '').replace(/,/g, ';')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mis-reservas-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      console.log('📥 Reservas exportadas exitosamente');
    } catch (err) {
      console.error('❌ Error al exportar reservas:', err);
      alert('Error al exportar reservas');
    }
  };

  // Calcular estadísticas
  const estadisticasMisReservas = useMemo(() => ({
    total: reservas.length,
    pendientes: reservas.filter(r => !r.aprobada && r.estado).length,
    aprobadas: reservas.filter(r => r.aprobada && r.estado).length,
    canceladas: reservas.filter(r => !r.estado).length
  }), [reservas]);

  console.log('📊 Estadísticas:', estadisticasMisReservas);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header consistente */}
      <Header />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de la página */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mis Reservas
              </h1>
              <p className="text-gray-600">
                {isBarOwner || isAdmin
                  ? 'Gestiona las reservas de tus clientes y tus propias reservas'
                  : 'Consulta y gestiona tus reservas'
                }
              </p>
            </div>

            {/* ✅ NUEVO: Botón exportar (solo si hay reservas) */}
            {activeTab === 'mis-reservas' && reservasFiltradas.length > 0 && (
              <button
                onClick={exportarReservas}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
          </div>

          {/* Tabs (solo para dueños de comercio y admins) */}
          {(isBarOwner || isAdmin) && (
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
              {/* ✅ NUEVO: Filtros avanzados */}
              {reservas.length > 0 && (
                <ReservasFilters
                  onFilterChange={handleFilterChange}
                  activeFilters={filters}
                />
              )}

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
              ) : reservasFiltradas.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {reservas.length === 0 ? 'No tienes reservas' : 'No se encontraron reservas'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {reservas.length === 0 
                      ? 'Explora lugares increíbles y haz tu primera reserva'
                      : 'Intenta ajustar los filtros para ver más resultados'
                    }
                  </p>
                  {reservas.length === 0 && (
                    <button
                      onClick={() => navigate('/')}
                      className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Explorar Lugares
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* ✅ NUEVO: Contador de resultados */}
                  {filters.search || filters.estado !== 'todos' || filters.periodo !== 'todos' ? (
                    <div className="mb-4 text-sm text-gray-600">
                      Mostrando <span className="font-semibold">{reservasFiltradas.length}</span> de{' '}
                      <span className="font-semibold">{reservas.length}</span> reservas
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservasFiltradas.map(reserva => (
                      <ReservaCard
                        key={reserva.iD_Reserva}
                        reserva={reserva}
                        isOwner={false}
                        comercioNombre={reserva.comercio?.nombre}
                        onCancelar={handleCancelar}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            // Tab de Reservas Recibidas
            <ReservasRecibidas userId={user.iD_Usuario} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservas;
