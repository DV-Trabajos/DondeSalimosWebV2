// AdminPublicidades.jsx - Gestión de publicidades para admin
// Ruta: src/pages/admin/AdminPublicidades.jsx
// Fase 8: Panel de Administración

import { useState, useEffect } from 'react';
import { 
  Megaphone, CheckCircle, XCircle, ArrowLeft, Search, Eye, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Shared/Header';
import { getAllPublicidades, aprobarPublicidad, rechazarPublicidad } from '../../services/adminService';
import { convertBase64ToImage } from '../../utils/formatters';
import { calcularDiasRestantes } from '../../services/publicidadesService';

const AdminPublicidades = () => {
  const navigate = useNavigate();
  const [publicidades, setPublicidades] = useState([]);
  const [filteredPubs, setFilteredPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    loadPublicidades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [publicidades, filter, searchTerm]);

  const loadPublicidades = async () => {
    try {
      const data = await getAllPublicidades();
      setPublicidades(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...publicidades];

    if (filter === 'pendientes') {
      filtered = filtered.filter(p => !p.estado && !p.motivoRechazo);
    } else if (filter === 'aprobadas') {
      filtered = filtered.filter(p => p.estado);
    } else if (filter === 'rechazadas') {
      filtered = filtered.filter(p => !p.estado && p.motivoRechazo);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.comercio?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPubs(filtered);
  };

  const handleAprobar = async (pub) => {
    if (!confirm('¿Aprobar esta publicidad?')) return;
    
    try {
      await aprobarPublicidad(pub.iD_Publicidad, pub);
      alert('✅ Publicidad aprobada');
      loadPublicidades();
    } catch (error) {
      alert('Error al aprobar');
    }
  };

  const handleRechazar = (pub) => {
    setSelectedPub(pub);
    setMotivoRechazo('');
    setShowRejectModal(true);
  };

  const confirmRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Ingresa un motivo');
      return;
    }

    try {
      await rechazarPublicidad(selectedPub.iD_Publicidad, selectedPub, motivoRechazo);
      alert('Publicidad rechazada');
      setShowRejectModal(false);
      loadPublicidades();
    } catch (error) {
      alert('Error al rechazar');
    }
  };

  const getEstadoBadge = (pub) => {
    if (pub.estado) {
      const dias = calcularDiasRestantes(pub);
      if (dias <= 0) {
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Expirada</span>;
      }
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Activa ({dias}d)</span>;
    }
    if (pub.motivoRechazo) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Rechazada</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pendiente</span>;
  };

  const counts = {
    todas: publicidades.length,
    pendientes: publicidades.filter(p => !p.estado && !p.motivoRechazo).length,
    aprobadas: publicidades.filter(p => p.estado).length,
    rechazadas: publicidades.filter(p => !p.estado && p.motivoRechazo).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-primary" />
              Gestión de Publicidades
            </h1>
            <p className="text-gray-600">Aprueba o rechaza publicidades</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['todas', 'pendientes', 'aprobadas', 'rechazadas'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filter === f 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredPubs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No hay publicidades en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPubs.map(pub => (
              <div key={pub.iD_Publicidad} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {pub.imagen && (
                  <img
                    src={convertBase64ToImage(pub.imagen)}
                    alt="Publicidad"
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-primary">
                      {pub.comercio?.nombre || 'Comercio'}
                    </span>
                    {getEstadoBadge(pub)}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {pub.descripcion}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {pub.visualizaciones || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {pub.tiempo} días
                    </span>
                  </div>

                  {pub.motivoRechazo && (
                    <div className="p-2 bg-red-50 rounded text-xs text-red-700 mb-3">
                      <strong>Motivo:</strong> {pub.motivoRechazo}
                    </div>
                  )}

                  {!pub.estado && !pub.motivoRechazo && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAprobar(pub)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(pub)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Rechazar Publicidad</h3>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRechazar}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPublicidades;
