// BarManagement.jsx - Gestión de comercios del usuario
// Fase 6: Versión actualizada con formulario completo

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ComercioCard from '../components/BarManagement/ComercioCard';
import ComercioForm from '../components/BarManagement/ComercioForm';
import { getComerciosByUsuario } from '../services/comerciosService';
import { Plus, Store, Loader } from 'lucide-react';

const BarManagement = () => {
  const [comercios, setComercios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComercio, setEditingComercio] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.iD_Usuario) {
      loadComercios();
    }
  }, [user]);

  const loadComercios = async () => {
    try {
      setIsLoading(true);
      const data = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(data);
    } catch (error) {
      console.error('❌ Error cargando comercios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (comercio) => {
    setEditingComercio(comercio);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingComercio(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingComercio(null);
    loadComercios();
  };

  const handleNew = () => {
    setEditingComercio(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ComercioForm
        comercio={editingComercio}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Mis Comercios
            </h1>
            <p className="text-gray-600 mt-2">Gestiona tus bares y restaurantes</p>
          </div>
          <button
            onClick={handleNew}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Comercio
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {!isLoading && comercios.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No tienes comercios registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando tu primer bar o restaurante
            </p>
            <button
              onClick={handleNew}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Mi Primer Comercio
            </button>
          </div>
        )}

        {!isLoading && comercios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comercios.map((comercio) => (
              <ComercioCard
                key={comercio.iD_Comercio}
                comercio={comercio}
                onEdit={() => handleEdit(comercio)}
                onReload={loadComercios}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BarManagement;
