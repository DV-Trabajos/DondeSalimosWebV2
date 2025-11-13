// src/components/BarManagement/ComercioCard.jsx
// Tarjeta de comercio con acceso rápido a reservas

import { useState, useEffect } from 'react';
import { Edit, Trash2, Calendar, MapPin, Users, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { convertBase64ToImage } from '../../utils/formatters';
import { deleteComercio } from '../../services/comerciosService';
import { getAllReservas } from '../../services/reservasService';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';

const ComercioCard = ({ comercio, onEdit, onReload }) => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    hoy: 0
  });
  const [loading, setLoading] = useState(true);

  const imageUrl = comercio.foto 
    ? convertBase64ToImage(comercio.foto)
    : 'https://via.placeholder.com/400x200?text=No+Image';

  useEffect(() => {
    cargarEstadisticas();
  }, [comercio.iD_Comercio]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const allReservas = await getAllReservas();
      
      // Filtrar reservas de este comercio
      const reservasComercio = allReservas.filter(r => r.iD_Comercio === comercio.iD_Comercio);
      
      // Calcular estadísticas
      const pendientes = reservasComercio.filter(r => !r.aprobada && r.estado).length;
      
      // Reservas de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      
      const reservasHoy = reservasComercio.filter(r => {
        const fechaReserva = new Date(r.fechaReserva);
        return fechaReserva >= hoy && fechaReserva < mañana;
      }).length;
      
      setEstadisticas({
        total: reservasComercio.length,
        pendientes: pendientes,
        hoy: reservasHoy
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este comercio?')) return;

    try {
      await deleteComercio(comercio.iD_Comercio);
      alert('Comercio eliminado exitosamente');
      onReload();
    } catch (error) {
      console.error('Error eliminando comercio:', error);
      alert('Error al eliminar el comercio');
    }
  };

  const handleVerReservas = () => {
    // Navegar a la página de reservas con el tab de "Reservas Recibidas"
    navigate('/reservas', { state: { activeTab: 'reservas-recibidas', comercioId: comercio.iD_Comercio } });
  };

  const getEstadoBadge = () => {
    if (comercio.estado === true) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Aprobado
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendiente
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
      {/* Imagen */}
      <div className="h-48 bg-gray-200 relative">
        <img
          src={imageUrl}
          alt={comercio.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
        <div className="absolute top-2 right-2">
          {getEstadoBadge()}
        </div>
        
        {/* Badge de reservas pendientes */}
        {estadisticas.pendientes > 0 && (
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
              {estadisticas.pendientes} {estadisticas.pendientes === 1 ? 'pendiente' : 'pendientes'}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {comercio.nombre}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{comercio.direccion}</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">Tipo:</span>{' '}
            {TIPOS_COMERCIO_DESCRIPCION[comercio.iD_TipoComercio] || 'No especificado'}
          </div>

          {comercio.telefono && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Tel:</span> {comercio.telefono}
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        {!loading && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{estadisticas.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center border-x border-purple-200">
              <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{estadisticas.hoy}</p>
              <p className="text-xs text-gray-600">Hoy</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-2">
          {/* Botón Ver Reservas - Destacado */}
          <button
            onClick={handleVerReservas}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Ver Reservas
            {estadisticas.pendientes > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white text-purple-600 rounded-full text-xs font-bold">
                {estadisticas.pendientes}
              </span>
            )}
          </button>

          {/* Botones secundarios */}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-white border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition font-semibold flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComercioCard;
