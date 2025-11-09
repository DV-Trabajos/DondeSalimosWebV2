// ReservaCard.jsx - Tarjeta individual de reserva

import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

/**
 * Componente de tarjeta de reserva
 * @param {Object} props
 * @param {Object} props.reserva - Datos de la reserva
 * @param {Function} props.onCancel - Callback para cancelar
 * @param {Function} props.onApprove - Callback para aprobar (solo comercios)
 * @param {Function} props.onReject - Callback para rechazar (solo comercios)
 * @param {boolean} props.isOwner - Si es el dueño del comercio
 */
const ReservaCard = ({ reserva, onCancel, onApprove, onReject, isOwner = false }) => {
  const isPending = reserva.estado === false && !reserva.motivoRechazo;
  const isApproved = reserva.estado === true;
  const isRejected = reserva.estado === false && reserva.motivoRechazo;

  const fechaReserva = new Date(reserva.fechaReserva);
  const isFuture = fechaReserva > new Date();

  // Determinar el estado visual
  const getStatusBadge = () => {
    if (isRejected) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
          <XCircle className="w-4 h-4" />
          Rechazada
        </div>
      );
    }
    if (isApproved) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          Confirmada
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
        <AlertCircle className="w-4 h-4" />
        Pendiente
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all hover:shadow-lg ${
      isPending ? 'border-yellow-300' :
      isApproved ? 'border-green-300' :
      'border-red-300'
    }`}>
      <div className="p-6">
        {/* Header con estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {reserva.comercio?.nombre || 'Comercio'}
            </h3>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {reserva.comercio?.direccion || 'Sin dirección'}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Información de la reserva */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="font-semibold">{formatDate(fechaReserva)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Hora</p>
              <p className="font-semibold">{formatTime(fechaReserva)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Personas</p>
              <p className="font-semibold">{reserva.comenzales || reserva.cantidadPersonas}</p>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        {reserva.comentarios && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Comentarios:</p>
            <p className="text-sm text-gray-700">{reserva.comentarios}</p>
          </div>
        )}

        {/* Motivo de rechazo */}
        {isRejected && reserva.motivoRechazo && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 mb-1 font-semibold">Motivo del rechazo:</p>
            <p className="text-sm text-red-700">{reserva.motivoRechazo}</p>
          </div>
        )}

        {/* Usuario (solo para comercios) */}
        {isOwner && reserva.usuario && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Cliente:</p>
            <p className="text-sm text-blue-800 font-semibold">
              {reserva.usuario.nombreUsuario}
            </p>
            {reserva.usuario.telefono && (
              <p className="text-sm text-blue-700">
                Tel: {reserva.usuario.telefono}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {/* Acciones para usuario común */}
          {!isOwner && isPending && isFuture && (
            <button
              onClick={() => onCancel && onCancel(reserva)}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Cancelar
            </button>
          )}

          {/* Acciones para dueño del comercio */}
          {isOwner && isPending && (
            <>
              <button
                onClick={() => onApprove && onApprove(reserva)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-semibold"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar
              </button>
              <button
                onClick={() => onReject && onReject(reserva)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-semibold"
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </button>
            </>
          )}

          {/* Mensaje si no hay acciones disponibles */}
          {!isPending && !isOwner && (
            <p className="text-sm text-gray-500 italic">
              {isApproved ? 'Reserva confirmada por el comercio' : 'Esta reserva ya no está activa'}
            </p>
          )}
        </div>

        {/* Indicador de fecha pasada */}
        {!isFuture && (
          <div className="mt-3 text-center text-xs text-gray-500 italic">
            Esta reserva ya pasó
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservaCard;