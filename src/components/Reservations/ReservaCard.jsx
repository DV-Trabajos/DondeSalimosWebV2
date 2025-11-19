// ReservaCard.jsx - Tarjeta de reserva mejorada
// Ruta: src/components/Reservations/ReservaCard.jsx
// ✅ PARTE 2: Con animaciones, mejor UX y diseño mejorado

import { 
  Calendar, Users, Clock, MapPin, CheckCircle, 
  XCircle, AlertCircle, MessageCircle 
} from 'lucide-react';
import { formatearFecha, formatearHora } from '../../utils/formatters';

/**
 * Tarjeta de reserva con diseño mejorado y animaciones
 * Muestra información completa de la reserva con estados visuales claros
 */
const ReservaCard = ({ 
  reserva, 
  isOwner = false, 
  comercioNombre, 
  onCancelar,
  onAprobar,
  onRechazar 
}) => {
  // Determinar estados
  const isApproved = reserva.aprobada === true;
  const isRejected = reserva.aprobada === false && reserva.motivoRechazo;
  const isPending = !reserva.aprobada && reserva.estado && !reserva.motivoRechazo;
  const isCancelled = !reserva.estado;
  
  // Verificar si la reserva es pasada
  const reservaDate = new Date(reserva.fechaReserva);
  const now = new Date();
  const isPastReservation = reservaDate < now;

  // Funciones auxiliares
  const getEstadoTexto = () => {
    if (isCancelled) return 'Cancelada';
    if (isApproved) return 'Confirmada';
    if (isRejected) return 'Rechazada';
    if (isPending) return 'Pendiente';
    return 'Desconocido';
  };

  const getBadgeClasses = () => {
    if (isCancelled) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (isApproved) return 'bg-green-100 text-green-700 border-green-300';
    if (isRejected) return 'bg-red-100 text-red-700 border-red-300';
    if (isPending) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getIconoEstado = () => {
    if (isCancelled) return <XCircle className="w-5 h-5 text-gray-500" />;
    if (isApproved) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (isRejected) return <XCircle className="w-5 h-5 text-red-500" />;
    if (isPending) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Header con estado */}
      <div className={`p-4 ${
        isCancelled ? 'bg-gray-50 border-gray-200' : 
        isApproved ? 'bg-green-50 border-green-200' : 
        isRejected ? 'bg-red-50 border-red-200' : 
        'bg-yellow-50 border-yellow-200'
      } border-b-2`}>
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
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Lugar</p>
              <p className="font-semibold text-gray-900">
                {comercioNombre || reserva.comercio?.nombre || 'Comercio'}
              </p>
              {reserva.comercio?.direccion && (
                <p className="text-xs text-gray-500 mt-1">
                  {reserva.comercio.direccion}
                </p>
              )}
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
                📞 {reserva.usuario.telefono}
              </p>
            )}
            {reserva.usuario.correo && (
              <p className="text-xs text-blue-600 truncate">
                ✉️ {reserva.usuario.correo}
              </p>
            )}
          </div>
        )}

        {/* Fecha y hora */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-600 font-medium">Fecha y hora</p>
            <p className="font-semibold text-gray-900">
              {formatearFecha(reserva.fechaReserva)}
            </p>
            <p className="text-sm text-gray-600">
              {formatearHora(reserva.fechaReserva)}
            </p>
            {isPastReservation && (
              <span className="text-xs text-gray-500 italic">(Pasada)</span>
            )}
          </div>
        </div>

        {/* Cantidad de personas */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-600 font-medium">Personas</p>
            <p className="font-semibold text-gray-900">
              {reserva.cantidadPersonas || reserva.comenzales || 1} {
                (reserva.cantidadPersonas || reserva.comenzales || 1) === 1 ? 'persona' : 'personas'
              }
            </p>
          </div>
        </div>

        {/* Comentarios */}
        {reserva.comentarios && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 font-semibold">Comentarios:</p>
            </div>
            <p className="text-sm text-gray-700 ml-6">{reserva.comentarios}</p>
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

      {/* Footer con acciones */}
      {!isPastReservation && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            {/* Botón cancelar (para usuarios) */}
            {!isOwner && isPending && onCancelar && (
              <button
                onClick={() => onCancelar(reserva)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
              >
                Cancelar Reserva
              </button>
            )}

            {/* Botones aprobar/rechazar (para dueños) */}
            {isOwner && isPending && (
              <>
                {onAprobar && (
                  <button
                    onClick={() => onAprobar(reserva)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                  >
                    Aprobar
                  </button>
                )}
                {onRechazar && (
                  <button
                    onClick={() => onRechazar(reserva)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                  >
                    Rechazar
                  </button>
                )}
              </>
            )}

            {/* Mensaje de estado para reservas aprobadas/canceladas */}
            {(isApproved || isCancelled || isRejected) && (
              <div className="flex-1 text-center py-2">
                <p className="text-sm text-gray-600 italic">
                  {isApproved && 'Reserva confirmada'}
                  {isCancelled && 'Reserva cancelada'}
                  {isRejected && 'Reserva rechazada'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de reserva pasada */}
      {isPastReservation && (
        <div className="p-3 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 italic">
            Esta reserva ya pasó
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservaCard;
