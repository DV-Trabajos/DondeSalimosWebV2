// src/components/Reservations/ReservaCard.jsx
import { Calendar, Users, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de tarjeta de reserva
 * Muestra diferente información dependiendo si es el usuario o el dueño del comercio
 */
const ReservaCard = ({ 
  reserva, 
  isOwner = false, 
  comercioNombre = null,
  onAprobar = null,
  onRechazar = null,
  onCancelar = null 
}) => {
  
  // Determinar el estado de la reserva
  const isPending = !reserva.aprobada && reserva.estado;
  const isApproved = reserva.aprobada && reserva.estado;
  const isRejected = !reserva.estado;
  const isPastReservation = isPast(new Date(reserva.fechaReserva));

  // Formatear fecha
  const formatearFecha = (fecha) => {
    try {
      const fechaObj = new Date(fecha);
      
      if (isToday(fechaObj)) {
        return `Hoy a las ${format(fechaObj, 'HH:mm')}`;
      }
      if (isTomorrow(fechaObj)) {
        return `Mañana a las ${format(fechaObj, 'HH:mm')}`;
      }
      return format(fechaObj, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // Determinar el color del badge según el estado
  const getBadgeClasses = () => {
    if (isPending) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    if (isApproved) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (isRejected) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getEstadoTexto = () => {
    if (isPending) return 'Pendiente';
    if (isApproved) return 'Aprobada';
    if (isRejected) return 'Rechazada';
    return 'Desconocido';
  };

  const getIconoEstado = () => {
    if (isPending) return <Clock className="w-4 h-4" />;
    if (isApproved) return <CheckCircle className="w-4 h-4" />;
    if (isRejected) return <XCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className={`bg-white border-2 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
      isPending ? 'border-yellow-300' : 
      isApproved ? 'border-green-300' : 
      isRejected ? 'border-red-300' : 
      'border-gray-200'
    }`}>
      {/* Header con estado */}
      <div className={`px-4 py-3 border-b ${
        isPending ? 'bg-yellow-50 border-yellow-200' : 
        isApproved ? 'bg-green-50 border-green-200' : 
        isRejected ? 'bg-red-50 border-red-200' : 
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIconoEstado()}
            <span className="font-semibold text-gray-900">
              {isOwner && reserva.usuario?.nombreUsuario 
                ? reserva.usuario.nombreUsuario 
                : comercioNombre || reserva.comercio?.nombre || 'Comercio'}
            </span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getBadgeClasses()}`}>
            {getEstadoTexto()}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Nombre del comercio (solo para usuarios) */}
        {!isOwner && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Lugar</p>
              <p className="font-semibold text-gray-900">
                {comercioNombre || reserva.comercio?.nombre || 'Comercio'}
              </p>
            </div>
          </div>
        )}

        {/* Información de contacto del usuario (solo para comercios) */}
        {isOwner && reserva.usuario && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-1">Cliente</p>
            <p className="text-sm text-blue-900 font-semibold">
              {reserva.usuario.nombreUsuario}
            </p>
            {reserva.usuario.telefono && (
              <p className="text-sm text-blue-700">
                Tel: {reserva.usuario.telefono}
              </p>
            )}
            {reserva.usuario.correo && (
              <p className="text-xs text-blue-600 truncate">
                {reserva.usuario.correo}
              </p>
            )}
          </div>
        )}

        {/* Fecha y hora */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">Fecha y hora</p>
            <p className="font-semibold text-gray-900">
              {formatearFecha(reserva.fechaReserva)}
            </p>
            {isPastReservation && (
              <span className="text-xs text-gray-500 italic">(Pasada)</span>
            )}
          </div>
        </div>

        {/* Cantidad de personas */}
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">Personas</p>
            <p className="font-semibold text-gray-900">
              {reserva.cantidadPersonas || reserva.comenzales || 1}
            </p>
          </div>
        </div>

        {/* Comentarios */}
        {reserva.comentarios && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Comentarios:</p>
            <p className="text-sm text-gray-700">{reserva.comentarios}</p>
          </div>
        )}

        {/* Motivo de rechazo */}
        {isRejected && reserva.motivoRechazo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 mb-1 font-semibold">Motivo del rechazo:</p>
            <p className="text-sm text-red-700">{reserva.motivoRechazo}</p>
          </div>
        )}
      </div>

      {/* Acciones (solo para comercios con reservas pendientes) */}
      {isOwner && isPending && !isPastReservation && onAprobar && onRechazar && (
        <div className="px-4 pb-4 pt-2 flex gap-2">
          <button
            onClick={() => onAprobar(reserva)}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Aprobar</span>
          </button>
          <button
            onClick={() => onRechazar(reserva)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Rechazar</span>
          </button>
        </div>
      )}

      {/* Acción de cancelar (para usuarios con reservas pendientes o aprobadas) */}
      {!isOwner && (isPending || isApproved) && !isPastReservation && onCancelar && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={() => onCancelar(reserva)}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancelar Reserva</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservaCard;
