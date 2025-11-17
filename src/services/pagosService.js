// pagosService.js - Servicio de pagos con Mercado Pago
// Ruta: src/services/pagosService.js
// Integración con backend de Mercado Pago

import api from './api';

/**
 * Crea una preferencia de pago en Mercado Pago
 * @param {Object} params - Parámetros del pago
 * @param {string} params.titulo - Título del producto/servicio
 * @param {number} params.precio - Precio en ARS
 * @param {number} params.publicidadId - ID de la publicidad a pagar
 * @returns {Promise<Object>} { init_point, id }
 */
export const crearPreferencia = async ({ titulo, precio, publicidadId }) => {
  try {
    console.log('💳 Creando preferencia de pago:', { titulo, precio, publicidadId });
    
    const response = await api.post('/api/Pagos/crear-preferencia', {
      titulo,
      precio,
      publicidadId,
    });
    
    console.log('✅ Preferencia creada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando preferencia:', error);
    throw error;
  }
};

/**
 * Verifica el estado de un pago
 * @param {string} paymentId - ID del pago de Mercado Pago
 * @param {string} preferenceId - ID de la preferencia (opcional)
 * @returns {Promise<Object>} Estado del pago
 */
export const verificarPago = async (paymentId, preferenceId = '') => {
  try {
    console.log('🔍 Verificando pago:', { paymentId, preferenceId });
    
    const response = await api.post('/api/Pagos/verificar-pago', {
      paymentId,
      preferenceId,
    });
    
    console.log('✅ Pago verificado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error verificando pago:', error);
    throw error;
  }
};

/**
 * Calcula el precio de una publicidad según los días
 * @param {number} dias - Duración en días
 * @returns {number} Precio en ARS
 */
export const calcularPrecioPublicidad = (dias) => {
  const precios = {
    7: 1500,   // 7 días
    15: 2500,  // 15 días
    30: 4000,  // 30 días
  };
  return precios[dias] || dias * 200; // Precio por defecto: $200/día
};

/**
 * Abre el checkout de Mercado Pago
 * @param {string} initPoint - URL del checkout
 */
export const abrirCheckout = (initPoint) => {
  window.open(initPoint, '_blank');
};

/**
 * Procesa el retorno de Mercado Pago desde la URL
 * @param {string} url - URL con parámetros de retorno
 * @returns {Object|null} Parámetros del pago
 */
export const procesarRetornoMP = (url) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
      collection_id: params.get('collection_id'),
      collection_status: params.get('collection_status'),
      payment_id: params.get('payment_id'),
      status: params.get('status'),
      external_reference: params.get('external_reference'),
      payment_type: params.get('payment_type'),
      merchant_order_id: params.get('merchant_order_id'),
      preference_id: params.get('preference_id'),
      site_id: params.get('site_id'),
      processing_mode: params.get('processing_mode'),
      merchant_account_id: params.get('merchant_account_id'),
    };
  } catch (error) {
    console.error('Error procesando URL de retorno:', error);
    return null;
  }
};

export default {
  crearPreferencia,
  verificarPago,
  calcularPrecioPublicidad,
  abrirCheckout,
  procesarRetornoMP,
};
