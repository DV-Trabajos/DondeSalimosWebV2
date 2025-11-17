// MisPublicidades.jsx - Gestión de publicidades con sistema de pagos
// Ruta: src/pages/MisPublicidades.jsx
// Fase 7: Sistema de Publicidad + Integración Mercado Pago

import { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Eye, Clock, CheckCircle, XCircle, 
  AlertCircle, Trash2, Calendar, CreditCard, DollarSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import PagoPublicidadModal from '../components/Publicidad/PagoPublicidadModal';
import { getComerciosByUsuario } from '../services/comerciosService';
import { 
  getAllPublicidades,
  createPublicidad,
  deletePublicidad,
} from '../services/publicidadesService';
import { convertImageToBase64, convertBase64ToImage } from '../utils/formatters';
import { calcularPrecioPublicidad } from '../services/pagosService';

const MisPublicidades = () => {
  const { user } = useAuth();
  
  // Estados principales
  const [comercios, setComercios] = useState([]);
  const [publicidades, setPublicidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({});
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    iD_Comercio: '',
    descripcion: '',
    imagen: null,
    tiempo: 7,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Estados del modal de pago
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [publicidadToPay, setPublicidadToPay] = useState(null);

  useEffect(() => {
    if (user?.iD_Usuario) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar comercios del usuario
      const userComercios = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(userComercios);
      
      if (userComercios.length === 0) {
        setPublicidades([]);
        setLoading(false);
        return;
      }
      
      // Cargar todas las publicidades y filtrar por comercios del usuario
      const allPublicidades = await getAllPublicidades();
      const comercioIds = userComercios.map(c => c.iD_Comercio);
      
      const userPublicidades = allPublicidades.filter(
        pub => comercioIds.includes(pub.iD_Comercio)
      ).sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      
      setPublicidades(userPublicidades);
      setStats(getPublicidadesStats(userPublicidades));
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas localmente
  const getPublicidadesStats = (pubs) => {
    const activas = pubs.filter(p => p.estado && calcularDiasRestantes(p) > 0);
    const pendientes = pubs.filter(p => !p.estado && !p.motivoRechazo);
    const rechazadas = pubs.filter(p => !p.estado && p.motivoRechazo);
    const sinPagar = pubs.filter(p => p.estado && !p.pago);
    const totalVistas = pubs.reduce((sum, p) => sum + (p.visualizaciones || 0), 0);
    
    return {
      total: pubs.length,
      activas: activas.length,
      pendientes: pendientes.length,
      rechazadas: rechazadas.length,
      sinPagar: sinPagar.length,
      totalVisualizaciones: totalVistas,
    };
  };

  const calcularDiasRestantes = (pub) => {
    const fechaCreacion = new Date(pub.fechaCreacion);
    const dias = pub.tiempo || 7;
    fechaCreacion.setDate(fechaCreacion.getDate() + dias);
    const diffTime = fechaCreacion - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setFormError('Solo se permiten archivos de imagen');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setFormError('La imagen no debe superar 5MB');
      return;
    }
    
    try {
      const base64 = await convertImageToBase64(file);
      setFormData(prev => ({ ...prev, imagen: base64 }));
      setImagePreview(base64);
      setFormError('');
    } catch (error) {
      setFormError('Error al procesar la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.iD_Comercio) {
      setFormError('Selecciona un comercio');
      return;
    }
    
    if (!formData.descripcion.trim()) {
      setFormError('La descripción es obligatoria');
      return;
    }
    
    if (formData.descripcion.length < 10) {
      setFormError('La descripción debe tener al menos 10 caracteres');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      await createPublicidad({
        iD_Comercio: parseInt(formData.iD_Comercio),
        descripcion: formData.descripcion.trim(),
        imagen: formData.imagen || '',
        tiempo: parseInt(formData.tiempo),
      });
      
      alert('✅ Publicidad creada exitosamente\n\nEstá pendiente de aprobación por el administrador.\nUna vez aprobada, deberás realizar el pago para activarla.');
      
      setShowForm(false);
      setFormData({ iD_Comercio: '', descripcion: '', imagen: null, tiempo: 7 });
      setImagePreview(null);
      loadData();
      
    } catch (error) {
      console.error('Error creando publicidad:', error);
      setFormError('No se pudo crear la publicidad. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (publicidad) => {
    if (!confirm('¿Estás seguro de eliminar esta publicidad?')) return;
    
    try {
      await deletePublicidad(publicidad.iD_Publicidad);
      alert('Publicidad eliminada');
      loadData();
    } catch (error) {
      console.error('Error eliminando publicidad:', error);
      alert('No se pudo eliminar la publicidad');
    }
  };

  const handlePagar = (publicidad) => {
    // Agregar info del comercio si no está
    const pubWithComercio = {
      ...publicidad,
      comercio: publicidad.comercio || comercios.find(c => c.iD_Comercio === publicidad.iD_Comercio)
    };
    setPublicidadToPay(pubWithComercio);
    setShowPagoModal(true);
  };

  const getNombreComercio = (idComercio) => {
    const comercio = comercios.find(c => c.iD_Comercio === idComercio);
    return comercio?.nombre || 'Comercio';
  };

  const getEstadoBadge = (publicidad) => {
    // Rechazada
    if (!publicidad.estado && publicidad.motivoRechazo) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-300">
          Rechazada
        </span>
      );
    }
    
    // Pendiente de aprobación
    if (!publicidad.estado) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-300">
          Pendiente aprobación
        </span>
      );
    }
    
    // Aprobada pero sin pagar
    if (publicidad.estado && !publicidad.pago) {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-300">
          Pendiente de pago
        </span>
      );
    }
    
    // Activa y pagada
    const diasRestantes = calcularDiasRestantes(publicidad);
    if (diasRestantes <= 0) {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-300">
          Expirada
        </span>
      );
    }
    
    if (diasRestantes <= 2) {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-300">
          Expira en {diasRestantes}d
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-300">
        Activa - {diasRestantes}d restantes
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando publicidades...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-primary" />
                Mis Publicidades
              </h1>
              <p className="text-gray-600 mt-1">Gestiona las publicidades de tus comercios</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={comercios.length === 0}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Plus className="w-5 h-5" />
              Nueva Publicidad
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={<Megaphone />} title="Total" value={stats.total || 0} color="blue" />
            <StatCard icon={<CheckCircle />} title="Activas" value={stats.activas || 0} color="green" />
            <StatCard icon={<Clock />} title="Pendientes" value={stats.pendientes || 0} color="yellow" />
            <StatCard icon={<DollarSign />} title="Sin pagar" value={stats.sinPagar || 0} color="orange" />
            <StatCard icon={<XCircle />} title="Rechazadas" value={stats.rechazadas || 0} color="red" />
            <StatCard icon={<Eye />} title="Vistas totales" value={stats.totalVisualizaciones || 0} color="purple" />
          </div>

          {/* Formulario de nueva publicidad */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Publicidad</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comercio *
                    </label>
                    <select
                      value={formData.iD_Comercio}
                      onChange={(e) => setFormData(prev => ({ ...prev, iD_Comercio: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecciona un comercio</option>
                      {comercios.filter(c => c.estado).map(comercio => (
                        <option key={comercio.iD_Comercio} value={comercio.iD_Comercio}>
                          {comercio.nombre}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Solo comercios aprobados</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duración y Precio *
                    </label>
                    <select
                      value={formData.tiempo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tiempo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="7">7 días - {formatPrice(1500)}</option>
                      <option value="15">15 días - {formatPrice(2500)}</option>
                      <option value="30">30 días - {formatPrice(4000)}</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describe tu publicidad: promociones, eventos especiales, ofertas, happy hour..."
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.descripcion.length}/300 caracteres</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Imagen (opcional pero recomendada)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  {imagePreview && (
                    <div className="relative mt-2">
                      <img
                        src={`data:image/jpeg;base64,${imagePreview}`}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, imagen: null }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>📋 Proceso:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Creas la publicidad (gratis)</li>
                    <li>Un administrador la revisa y aprueba</li>
                    <li>Realizas el pago con Mercado Pago</li>
                    <li>¡Tu publicidad se activa automáticamente!</li>
                  </ol>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Publicidad'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormError('');
                      setImagePreview(null);
                      setFormData({ iD_Comercio: '', descripcion: '', imagen: null, tiempo: 7 });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de publicidades */}
          {comercios.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin comercios</h3>
              <p className="text-gray-600">Debes tener al menos un comercio aprobado para crear publicidades.</p>
            </div>
          ) : publicidades.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin publicidades</h3>
              <p className="text-gray-600 mb-6">Crea tu primera publicidad para promocionar tus comercios.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Crear Primera Publicidad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicidades.map(pub => (
                <div key={pub.iD_Publicidad} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  {pub.imagen && (
                    <img
                      src={convertBase64ToImage(pub.imagen)}
                      alt="Publicidad"
                      className="w-full h-40 object-cover"
                    />
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary">
                        {getNombreComercio(pub.iD_Comercio)}
                      </span>
                      {getEstadoBadge(pub)}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                      {pub.descripcion}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {pub.visualizaciones || 0} vistas
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {pub.tiempo} días
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatPrice(calcularPrecioPublicidad(pub.tiempo))}
                      </span>
                    </div>
                    
                    {/* Motivo de rechazo */}
                    {pub.motivoRechazo && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-3">
                        <strong>Motivo de rechazo:</strong> {pub.motivoRechazo}
                      </div>
                    )}
                    
                    {/* Acciones */}
                    <div className="space-y-2">
                      {/* Botón de pagar - Solo si está aprobada pero no pagada */}
                      {pub.estado && !pub.pago && (
                        <button
                          onClick={() => handlePagar(pub)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#009EE3] text-white rounded-lg hover:bg-[#007eb5] transition font-semibold"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pagar para Activar
                        </button>
                      )}
                      
                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleDelete(pub)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      <PagoPublicidadModal
        isOpen={showPagoModal}
        onClose={() => {
          setShowPagoModal(false);
          setPublicidadToPay(null);
        }}
        publicidad={publicidadToPay}
        onSuccess={loadData}
      />
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="w-5 h-5">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{title}</p>
    </div>
  );
};

export default MisPublicidades;
