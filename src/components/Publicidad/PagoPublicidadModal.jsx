// PagoPublicidadModal.jsx - Modal para pagar publicidades
// Ruta: src/components/Publicidad/PagoPublicidadModal.jsx
// Integración con Mercado Pago

import { useState } from 'react';
import { X, CreditCard, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { crearPreferencia, calcularPrecioPublicidad, abrirCheckout } from '../../services/pagosService';

const PagoPublicidadModal = ({ isOpen, onClose, publicidad, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  if (!isOpen || !publicidad) return null;

  const precio = calcularPrecioPublicidad(publicidad.tiempo || 7);

  const handlePagar = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await crearPreferencia({
        titulo: `Publicidad ${publicidad.tiempo} días - ${publicidad.comercio?.nombre || 'Comercio'}`,
        precio: precio,
        publicidadId: publicidad.iD_Publicidad,
      });

      if (result.init_point) {
        setPaymentUrl(result.init_point);
        // Abrir checkout en nueva pestaña
        abrirCheckout(result.init_point);
        
        // Informar al usuario
        alert('Se abrió la ventana de pago de Mercado Pago.\n\nUna vez completado el pago, la publicidad será activada automáticamente.');
        
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al crear preferencia:', error);
      setError('No se pudo iniciar el proceso de pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Pagar Publicidad
              </h3>
              <p className="text-white/80 text-sm mt-1">Activa tu publicidad con Mercado Pago</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Resumen del pedido</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Comercio:</span>
                <span className="font-medium">{publicidad.comercio?.nombre || 'Mi Comercio'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {publicidad.tiempo} días
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descripción:</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {publicidad.descripcion?.substring(0, 50)}...
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total a pagar:</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(precio)}</span>
              </div>
            </div>
          </div>

          {/* Información de precios */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-blue-900 mb-2">Planes disponibles</h5>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>7 días</span>
                <span className="font-medium">{formatPrice(1500)}</span>
              </div>
              <div className="flex justify-between">
                <span>15 días</span>
                <span className="font-medium">{formatPrice(2500)}</span>
              </div>
              <div className="flex justify-between">
                <span>30 días</span>
                <span className="font-medium">{formatPrice(4000)}</span>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="mb-6">
            <h5 className="font-semibold text-gray-900 mb-2">¿Qué incluye?</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Publicidad visible en el carrusel principal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Estadísticas de visualizaciones
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Mayor alcance a clientes potenciales
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Activación inmediata tras el pago
              </li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handlePagar}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#009EE3] text-white rounded-lg hover:bg-[#007eb5] transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pagar con Mercado Pago
                </>
              )}
            </button>
          </div>

          {/* Seguridad */}
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Pago seguro procesado por Mercado Pago. No almacenamos datos de tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PagoPublicidadModal;
