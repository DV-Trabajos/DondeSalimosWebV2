// NotificationModal.jsx - Modal de notificación (éxito/error/info)
// Ruta: src/components/Modals/NotificationModal.jsx
// Reemplaza los alerts de notificación con un modal personalizado

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Modal de notificación personalizado
 * Se usa para mostrar mensajes de éxito, error, advertencia o información
 * 
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje principal
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {string} buttonText - Texto del botón (default: "OK")
 * @param {boolean} autoClose - Si debe cerrarse automáticamente (default: false)
 * @param {number} autoCloseDelay - Tiempo en ms para auto-cerrar (default: 3000)
 */
const NotificationModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  // Auto-cerrar si está habilitado
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  // Configuración de estilos según el tipo
  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-xl max-w-md w-full p-6 border-2 ${config.borderColor} animate-fade-in relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header con icono */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`${config.iconBg} rounded-full p-3 flex-shrink-0`}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-gray-700 text-sm">
              {message}
            </p>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 ${config.buttonBg} text-white rounded-lg transition font-medium min-w-[100px]`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
