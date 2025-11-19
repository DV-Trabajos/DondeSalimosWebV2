// InputModal.jsx - Modal con input para confirmaciones que requieren escribir texto
// Ruta: src/components/Modals/InputModal.jsx
// Reemplaza los prompt() nativos de JavaScript

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Modal con campo de input para confirmaciones que requieren escribir texto
 * Se usa para confirmar acciones críticas pidiendo al usuario que escriba algo específico
 * 
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función que se ejecuta al confirmar (recibe el valor del input)
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje principal
 * @param {string} placeholder - Placeholder del input
 * @param {string} expectedValue - Valor esperado (se compara case-sensitive)
 * @param {string} confirmText - Texto del botón de confirmar (default: "Confirmar")
 * @param {string} cancelText - Texto del botón de cancelar (default: "Cancelar")
 */
const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  expectedValue = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError('');
      // Focus en el input cuando se abre
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Validar que el valor coincida
    if (inputValue.trim() !== expectedValue.trim()) {
      setError('El texto ingresado no coincide');
      return;
    }

    // Si coincide, ejecutar la confirmación
    onConfirm(inputValue);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
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
        {/* Header con icono de advertencia */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-red-100 rounded-full p-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 text-center">
            {title}
          </h3>
        </div>

        {/* Mensaje */}
        <div className="mb-4">
          <p className="text-gray-700 text-center mb-4">
            {message}
          </p>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(''); // Limpiar error al escribir
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition ${
              error 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 focus:border-red-500'
            }`}
          />

          {/* Mensaje de error */}
          {error && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <X className="w-4 h-4" />
              {error}
            </p>
          )}

          {/* Hint de lo que debe escribir */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            Escribe exactamente: <span className="font-mono font-semibold text-gray-700">"{expectedValue}"</span>
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
