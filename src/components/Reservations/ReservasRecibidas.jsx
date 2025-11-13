// src/components/Reservations/ReservasRecibidas.jsx
import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Filter, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import ReservaCard from './ReservaCard';
import ApproveRejectModal from './ApproveRejectModal';
import { 
  getAllReservas,
  approveReserva,
  rejectReserva,
  getEstadisticasComercio
} from '../../services/reservasService';
import { getComerciosByUsuario } from '../../services/comerciosService';

/**
 * Componente para que los dueños de comercios vean y gestionen las reservas recibidas
 */
const ReservasRecibidas = ({ userId, initialComercioFilter = null }) => {
  const [reservas, setReservas] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingReserva, setProcessingReserva] = useState(false);
  
  // Estados de filtros - aplicar filtro inicial si viene
  const [filtroComercio, setFiltroComercio] = useState(initialComercioFilter ? initialComercioFilter.toString() : 'all');
  const [filtroEstado, setFiltroEstado] = useState('all'); // all, pendiente, aprobada, rechazada
  const [filtroFecha, setFiltroFecha] = useState('all'); // all, hoy, mañana, proximas
  const [busqueda, setBusqueda] = useState('');

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    hoy: 0
  });

  useEffect(() => {
    cargarDatos();
  }, [userId]);

  useEffect(() => {
    calcularEstadisticas();
  }, [reservas]);

  // Aplicar filtro inicial de comercio si cambia
  useEffect(() => {
    if (initialComercioFilter) {
      setFiltroComercio(initialComercioFilter.toString());
    }
  }, [initialComercioFilter]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar comercios del usuario
      const comerciosData = await getComerciosByUsuario(userId);
      setComercios(comerciosData);

      if (comerciosData.length === 0) {
        setReservas([]);
        setLoading(false);
        return;
      }

      // Cargar todas las reservas y filtrar por los comercios del usuario
      const allReservas = await getAllReservas();
      const comercioIds = comerciosData.map(c => c.iD_Comercio);
      
      const reservasRecibidas = allReservas.filter(
        reserva => comercioIds.includes(reserva.iD_Comercio)
      );
      
      // Ordenar por fecha (más recientes primero)
      const reservasOrdenadas = reservasRecibidas.sort((a, b) => 
        new Date(b.fechaReserva) - new Date(a.fechaReserva)
      );

      setReservas(reservasOrdenadas);
      
      console.log('✅ Reservas recibidas cargadas:', reservasOrdenadas.length);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar las reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const stats = {
      total: reservas.length,
      pendientes: reservas.filter(r => !r.aprobada && r.estado).length,
      aprobadas: reservas.filter(r => r.aprobada && r.estado).length,
      rechazadas: reservas.filter(r => !r.estado).length,
      hoy: reservas.filter(r => isToday(new Date(r.fechaReserva))).length
    };
    setEstadisticas(stats);
  };

  const handleAprobar = async (reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  const handleRechazar = async (reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  const confirmarAprobacion = async (reserva) => {
    try {
      setProcessingReserva(true);
      await approveReserva(reserva.iD_Reserva, reserva);
      
      // Actualizar lista local
      setReservas(reservas.map(r => 
        r.iD_Reserva === reserva.iD_Reserva 
          ? { ...r, aprobada: true, estado: true }
          : r
      ));

      setShowModal(false);
      setSelectedReserva(null);
      alert('✅ Reserva aprobada exitosamente');
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      alert('Error al aprobar la reserva. Por favor, intenta de nuevo.');
    } finally {
      setProcessingReserva(false);
    }
  };

  const confirmarRechazo = async (reserva, motivo) => {
    try {
      setProcessingReserva(true);
      await rejectReserva(reserva.iD_Reserva, reserva, motivo);
      
      // Actualizar lista local
      setReservas(reservas.map(r => 
        r.iD_Reserva === reserva.iD_Reserva 
          ? { ...r, aprobada: false, estado: false, motivoRechazo: motivo }
          : r
      ));

      setShowModal(false);
      setSelectedReserva(null);
      alert('❌ Reserva rechazada');
    } catch (err) {
      console.error('Error al rechazar reserva:', err);
      alert('Error al rechazar la reserva. Por favor, intenta de nuevo.');
    } finally {
      setProcessingReserva(false);
    }
  };

  // Aplicar filtros
  const reservasFiltradas = reservas.filter(reserva => {
    // Filtro por comercio
    if (filtroComercio !== 'all' && reserva.iD_Comercio !== parseInt(filtroComercio)) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado === 'pendiente' && (reserva.aprobada || !reserva.estado)) {
      return false;
    }
    if (filtroEstado === 'aprobada' && (!reserva.aprobada || !reserva.estado)) {
      return false;
    }
    if (filtroEstado === 'rechazada' && reserva.estado) {
      return false;
    }

    // Filtro por fecha
    const fechaReserva = new Date(reserva.fechaReserva);
    if (filtroFecha === 'hoy' && !isToday(fechaReserva)) {
      return false;
    }
    if (filtroFecha === 'mañana' && !isTomorrow(fechaReserva)) {
      return false;
    }
    if (filtroFecha === 'proximas' && isPast(fechaReserva)) {
      return false;
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const nombreUsuario = reserva.usuario?.nombreUsuario?.toLowerCase() || '';
      const nombreComercio = comercios.find(c => c.iD_Comercio === reserva.iD_Comercio)?.nombre?.toLowerCase() || '';
      
      if (!nombreUsuario.includes(searchLower) && !nombreComercio.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-800">{error}</p>
        <button 
          onClick={cargarDatos}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (comercios.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No tienes comercios registrados
        </h3>
        <p className="text-gray-600 mb-4">
          Necesitas registrar un comercio para recibir reservas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner si hay un filtro de comercio aplicado */}
      {filtroComercio !== 'all' && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">
                  Mostrando reservas de: {comercios.find(c => c.iD_Comercio === parseInt(filtroComercio))?.nombre}
                </p>
                <p className="text-sm text-purple-700">
                  Puedes cambiar el filtro abajo para ver otras reservas
                </p>
              </div>
            </div>
            <button
              onClick={() => setFiltroComercio('all')}
              className="text-purple-600 hover:text-purple-800 font-semibold"
            >
              Ver todas
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 mb-1">Aprobadas</p>
          <p className="text-2xl font-bold text-green-600">{estadisticas.aprobadas}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 mb-1">Rechazadas</p>
          <p className="text-2xl font-bold text-red-600">{estadisticas.rechazadas}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-1">Hoy</p>
          <p className="text-2xl font-bold text-blue-600">{estadisticas.hoy}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por comercio */}
          {comercios.length > 1 && (
            <select
              value={filtroComercio}
              onChange={(e) => setFiltroComercio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los comercios</option>
              {comercios.map(comercio => (
                <option key={comercio.iD_Comercio} value={comercio.iD_Comercio}>
                  {comercio.nombre}
                </option>
              ))}
            </select>
          )}

          {/* Filtro por estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>

          {/* Filtro por fecha */}
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="mañana">Mañana</option>
            <option value="proximas">Próximas</option>
          </select>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      {reservasFiltradas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay reservas que coincidan con los filtros
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros para ver más resultados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservasFiltradas.map(reserva => (
            <ReservaCard
              key={reserva.iD_Reserva}
              reserva={reserva}
              isOwner={true}
              comercioNombre={comercios.find(c => c.iD_Comercio === reserva.iD_Comercio)?.nombre}
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
            />
          ))}
        </div>
      )}

      {/* Modal de aprobación/rechazo */}
      {showModal && selectedReserva && (
        <ApproveRejectModal
          reserva={selectedReserva}
          onApprove={confirmarAprobacion}
          onReject={confirmarRechazo}
          onClose={() => {
            setShowModal(false);
            setSelectedReserva(null);
          }}
          isLoading={processingReserva}
        />
      )}
    </div>
  );
};

export default ReservasRecibidas;
