// MisReservas.jsx - Página unificada de Reservas
// Ruta: src/pages/MisReservas.jsx
// ✅ ACTUALIZADO: Ahora usa el componente Reservas.jsx unificado
// 
// Este componente se adapta automáticamente según el rol:
// - Usuario común (rol 1): Solo ve "Mis Reservas" (como cliente)
// - Dueño de comercio (rol 3): Ve tabs "Mis Reservas" y "Reservas Recibidas"
// - Administrador (rol 2): Acceso completo a ambos tabs

import Reservas from '../components/Reservations/Reservas';

/**
 * Página de Mis Reservas - Wrapper del componente unificado
 * 
 * FUNCIONALIDAD:
 * - Header consistente en toda la aplicación
 * - Navegación correcta (no más 404)
 * - Se adapta automáticamente al rol del usuario
 * - Soporte para múltiples comercios
 */
const MisReservas = () => {
  return <Reservas />;
};

export default MisReservas;
