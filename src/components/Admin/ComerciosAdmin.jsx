// ComerciosAdmin.jsx - Gestión de comercios por administrador

import { useState, useEffect } from 'react';
import { 
  getAllComercios, 
  updateComercio, 
  deleteComercio 
} from '../../services/comerciosService';
import { 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Loader,
  Filter 
} from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { TIPOS_COMERCIO_DESCRIPCION } from '../../utils/constants';

const ComerciosAdmin = () => {
  const [comercios, setComercios] = useState([]);
  const [filteredComercios, setFilteredComercios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [selectedComercio, setSelectedComercio] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadComercios();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [comercios, filter]);

  const loadComercios = async () => {
    try {
      setIsLoading(true);
      const data = await getAllComercios();
      setComercios(data);
    } catch (error) {
      console.error('Error cargando comercios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = comercios;
    
    if (filter === 'pending') {
      filtered = comercios.filter(c => c.estado === false);
    } else if (filter === 'approved') {
      filtered = comercios.filter(c => c.estado === true);
    }
    
    setFilteredComercios(filtered);
  };

  const handleApprove = async (comercio) => {
    if (!confirm(`¿Aprobar el comercio "${comercio.nombre}"?`)) return;

    try {
      await updateComercio(comercio.iD_Comercio, { ...comercio, estado: true });
      alert('Comercio aprobado exitosamente');
      loadComercios();
    } catch (error) {
      console.error('Error aprobando comercio:', error);
      alert('Error al aprobar el comercio');
    }
  };

  const handleReject = async (comercio) => {
    if (!confirm(`¿Rechazar el comercio "${comercio.nombre}"?`)) return;

    try {
      await updateComercio(comercio.iD_Comercio, { ...comercio, estado: false });
      alert('Comercio rechazado');
      loadComercios();
    } catch (error) {
      console.error('Error rechazando comercio:', error);
      alert('Error al rechazar el comercio');
    }
  };

  const handleDelete = async (comercio) => {
    if (!confirm(`¿ELIMINAR permanentemente "${comercio.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await deleteComercio(comercio.iD_Comercio);
      alert('Comercio eliminado');
      loadComercios();
    } catch (error) {
      console.error('Error eliminando comercio:', error);
      alert('Error al eliminar el comercio');
    }
  };

  const handleViewDetails = (comercio) => {
    setSelectedComercio(comercio);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Comercios
        </h2>
        
        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({comercios.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({comercios.filter(c => !c.estado).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprobados ({comercios.filter(c => c.estado).length})
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filteredComercios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay comercios {filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobados' : ''}
          </div>
        ) : (
          filteredComercios.map((comercio) => (
            <div
              key={comercio.iD_Comercio}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex gap-4">
                {/* Imagen */}
                <img
                  src={comercio.foto ? convertBase64ToImage(comercio.foto) : 'https://via.placeholder.com/100'}
                  alt={comercio.nombre}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                />

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {comercio.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {TIPOS_COMERCIO_DESCRIPCION[comercio.iD_TipoComercio]}
                      </p>
                      <p className="text-sm text-gray-600">
                        {comercio.direccion}
                      </p>
                    </div>
                    
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        comercio.estado
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {comercio.estado ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleViewDetails(comercio)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    
                    {!comercio.estado && (
                      <button
                        onClick={() => handleApprove(comercio)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Aprobar
                      </button>
                    )}
                    
                    {comercio.estado && (
                      <button
                        onClick={() => handleReject(comercio)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(comercio)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedComercio && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold mb-4">{selectedComercio.nombre}</h3>
              
              <div className="space-y-3 text-sm">
                <div><strong>Tipo:</strong> {TIPOS_COMERCIO_DESCRIPCION[selectedComercio.iD_TipoComercio]}</div>
                <div><strong>Dirección:</strong> {selectedComercio.direccion}</div>
                <div><strong>CUIT:</strong> {selectedComercio.nroDocumento}</div>
                {selectedComercio.telefono && <div><strong>Teléfono:</strong> {selectedComercio.telefono}</div>}
                {selectedComercio.horario && <div><strong>Horario:</strong> {selectedComercio.horario}</div>}
                {selectedComercio.descripcion && <div><strong>Descripción:</strong> {selectedComercio.descripcion}</div>}
                <div><strong>Coordenadas:</strong> {selectedComercio.latitud}, {selectedComercio.longitud}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComerciosAdmin;
