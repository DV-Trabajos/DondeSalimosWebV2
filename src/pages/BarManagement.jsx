// BarManagement.jsx - Gestión de comercios para dueños

import { useState, useEffect } from 'react';
import { Plus, Loader, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ComercioCard from '../components/Home/ComercioCard';
import ComercioForm from '../components/Home/ComercioForm';
import PlaceDetailModal from '../components/Home/PlaceDetailModal';
import {
  getComerciosByUsuario,
  createComercio,
  updateComercio,
  deleteComercio,
} from '../services/comerciosService';

const BarManagement = () => {
  const { user } = useAuth();
  const [comercios, setComercios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedComercio, setSelectedComercio] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadComercios();
  }, [user]);

  const loadComercios = async () => {
    if (!user?.iD_Usuario) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(data);
    } catch (err) {
      console.error('Error cargando comercios:', err);
      setError('Error al cargar tus comercios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedComercio(null);
    setShowForm(true);
  };

  const handleEdit = (comercio) => {
    setSelectedComercio(comercio);
    setShowForm(true);
  };

  const handleView = (comercio) => {
    setSelectedComercio(comercio);
    setShowDetailModal(true);
  };

  const handleDelete = async (comercio) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${comercio.nombre}"?`)) {
      return;
    }

    try {
      await deleteComercio(comercio.iD_Comercio);
      await loadComercios();
      alert('Comercio eliminado exitosamente');
    } catch (err) {
      console.error('Error eliminando comercio:', err);
      alert('Error al eliminar el comercio: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);

      const dataToSend = {
        ...formData,
        iD_Usuario: user.iD_Usuario,
        estado: false, // Siempre inicia como pendiente de aprobación
      };

      if (selectedComercio) {
        // Actualizar
        await updateComercio(selectedComercio.iD_Comercio, {
          ...dataToSend,
          iD_Comercio: selectedComercio.iD_Comercio,
        });
        alert('Comercio actualizado exitosamente');
      } else {
        // Crear
        await createComercio(dataToSend);
        alert('Comercio creado exitosamente. Está pendiente de aprobación.');
      }

      setShowForm(false);
      setSelectedComercio(null);
      await loadComercios();
    } catch (err) {
      console.error('Error guardando comercio:', err);
      alert('Error al guardar el comercio: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedComercio(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header de página */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Mis Comercios
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona tus bares y restaurantes
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Nuevo Comercio
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Nota:</strong> Los comercios nuevos deben ser aprobados por un administrador antes de aparecer públicamente.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando comercios...</p>
            </div>
          </div>
        ) : comercios.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <Store className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No tienes comercios aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer comercio para empezar a recibir reservas
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Crear Comercio
            </button>
          </div>
        ) : (
          /* Grid de comercios */
          <div>
            <div className="mb-4">
              <p className="text-gray-600">
                {comercios.length} {comercios.length === 1 ? 'comercio' : 'comercios'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comercios.map((comercio) => (
                <ComercioCard
                  key={comercio.iD_Comercio}
                  comercio={comercio}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <ComercioForm
          comercio={selectedComercio}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          isLoading={isSaving}
        />
      )}

      {/* Detail Modal */}
      <PlaceDetailModal
        place={selectedComercio}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onReserve={() => {}}
      />
    </div>
  );
};

export default BarManagement;