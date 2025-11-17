// AdminComercios.jsx - Gestión de comercios para admin
// Ruta: src/pages/admin/AdminComercios.jsx
// Fase 8: Panel de Administración

import { useState, useEffect } from 'react';
import { 
  Store, CheckCircle, XCircle, Clock, Eye, 
  ArrowLeft, Search, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Shared/Header';
import { getAllComercios, aprobarComercio, rechazarComercio } from '../../services/adminService';
import { convertBase64ToImage } from '../../utils/formatters';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';

const AdminComercios = () => {
  const navigate = useNavigate();
  const [comercios, setComercios] = useState([]);
  const [filteredComercios, setFilteredComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendientes'); // pendientes, aprobados, rechazados, todos
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedComercio, setSelectedComercio] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    loadComercios();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [comercios, filter, searchTerm]);

  const loadComercios = async () => {
    try {
      const data = await getAllComercios();
      setComercios(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...comercios];

    // Filtro por estado
    if (filter === 'pendientes') {
      filtered = filtered.filter(c => !c.estado && !c.motivoRechazo);
    } else if (filter === 'aprobados') {
      filtered = filtered.filter(c => c.estado);
    } else if (filter === 'rechazados') {
      filtered = filtered.filter(c => !c.estado && c.motivoRechazo);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.direccion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComercios(filtered);
  };

  const handleAprobar = async (comercio) => {
    if (!confirm(`¿Aprobar el comercio "${comercio.nombre}"?`)) return;
    
    try {
      await aprobarComercio(comercio.iD_Comercio, comercio);
      alert('✅ Comercio aprobado');
      loadComercios();
    } catch (error) {
      alert('Error al aprobar');
    }
  };

  const handleRechazar = (comercio) => {
    setSelectedComercio(comercio);
    setMotivoRechazo('');
    setShowRejectModal(true);
  };

  const confirmRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Ingresa un motivo de rechazo');
      return;
    }

    try {
      await rechazarComercio(selectedComercio.iD_Comercio, selectedComercio, motivoRechazo);
      alert('Comercio rechazado');
      setShowRejectModal(false);
      loadComercios();
    } catch (error) {
      alert('Error al rechazar');
    }
  };

  const getEstadoBadge = (comercio) => {
    if (comercio.estado) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Aprobado</span>;
    }
    if (comercio.motivoRechazo) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Rechazado</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pendiente</span>;
  };

  const counts = {
    todos: comercios.length,
    pendientes: comercios.filter(c => !c.estado && !c.motivoRechazo).length,
    aprobados: comercios.filter(c => c.estado).length,
    rechazados: comercios.filter(c => !c.estado && c.motivoRechazo).length,
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
              <Store className="w-7 h-7 text-primary" />
              Gestión de Comercios
            </h1>
            <p className="text-gray-600">Aprueba o rechaza comercios</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['todos', 'pendientes', 'aprobados', 'rechazados'].map(f => (
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
                placeholder="Buscar por nombre o dirección..."
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
        ) : filteredComercios.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No hay comercios en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredComercios.map(comercio => (
              <div key={comercio.iD_Comercio} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="flex">
                  {comercio.foto && (
                    <img
                      src={convertBase64ToImage(comercio.foto)}
                      alt={comercio.nombre}
                      className="w-40 h-full object-cover"
                    />
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{comercio.nombre}</h3>
                      {getEstadoBadge(comercio)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{comercio.direccion}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {TIPOS_COMERCIO_DESCRIPCION[comercio.iD_TipoComercio] || 'Comercio'}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>📧 {comercio.correo}</p>
                      <p>📞 {comercio.telefono}</p>
                      <p>🆔 CUIT: {comercio.nroDocumento}</p>
                    </div>

                    {comercio.motivoRechazo && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        <strong>Motivo:</strong> {comercio.motivoRechazo}
                      </div>
                    )}

                    {/* Acciones */}
                    {!comercio.estado && !comercio.motivoRechazo && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAprobar(comercio)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(comercio)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
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
            <h3 className="text-lg font-bold mb-4">Rechazar Comercio</h3>
            <p className="text-sm text-gray-600 mb-4">
              Comercio: <strong>{selectedComercio?.nombre}</strong>
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ingresa el motivo del rechazo..."
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
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComercios;
