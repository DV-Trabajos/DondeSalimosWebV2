// ConfirmationModal.jsx - Modal de confirmación reutilizable
// Ruta: src/components/Modals/ConfirmationModal.jsx
// Reemplaza los alerts/confirms de JavaScript con un modal personalizado

import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Modal de confirmación personalizado
 * 
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función que se ejecuta al confirmar
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje principal
 * @param {string} confirmText - Texto del botón de confirmar (default: "Confirmar")
 * @param {string} cancelText - Texto del botón de cancelar (default: "Cancelar")
 * @param {string} type - Tipo de modal: 'warning', 'danger', 'success', 'info' (default: 'warning')
 * @param {string} description - Descripción adicional opcional
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  description = null,
}) => {
  if (!isOpen) return null;

  // Configuración de estilos según el tipo
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con icono */}
        <div className="flex flex-col items-center mb-4">
          <div className={`${config.iconBg} rounded-full p-3 mb-4`}>
            <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 text-center">
            {title}
          </h3>
        </div>

        {/* Contenido */}
        <div className="mb-6">
          <p className="text-gray-700 text-center mb-2">
            {message}
          </p>
          
          {description && (
            <p className="text-sm text-gray-600 text-center mt-3">
              {description}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 ${config.buttonBg} text-white rounded-lg transition font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
