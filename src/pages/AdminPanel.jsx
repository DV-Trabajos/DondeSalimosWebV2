// AdminPanel.jsx - Panel principal de administración
// Ruta: src/pages/AdminPanel.jsx
// Fase 8: Panel de Administración

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Store, Megaphone, Star, 
  CheckCircle, Clock, AlertTriangle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Shared/Header';
import { getAdminStats } from '../services/adminService';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Verificar que sea admin (rol 2 o el que uses)
    if (user && user.iD_RolUsuario !== 2) {
      alert('No tienes permisos de administrador');
      navigate('/');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">Gestiona usuarios, comercios y publicidades</p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="Usuarios"
            value={stats?.totalUsuarios || 0}
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
          <StatCard
            icon={<Store className="w-6 h-6 text-green-600" />}
            title="Comercios"
            value={stats?.totalComercios || 0}
            subtitle={`${stats?.comerciosAprobados || 0} aprobados`}
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
          <StatCard
            icon={<Megaphone className="w-6 h-6 text-purple-600" />}
            title="Publicidades"
            value={stats?.totalPublicidades || 0}
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-yellow-600" />}
            title="Reseñas"
            value={stats?.totalResenias || 0}
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />
        </div>

        {/* Alertas de pendientes */}
        {(stats?.comerciosPendientes > 0 || stats?.publicidadesPendientes > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" />
              Requieren tu atención
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.comerciosPendientes > 0 && (
                <div 
                  onClick={() => navigate('/admin/comercios')}
                  className="bg-white p-4 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Comercios pendientes</span>
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {stats.comerciosPendientes}
                    </span>
                  </div>
                </div>
              )}
              {stats?.publicidadesPendientes > 0 && (
                <div 
                  onClick={() => navigate('/admin/publicidades')}
                  className="bg-white p-4 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Publicidades pendientes</span>
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {stats.publicidadesPendientes}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAccessCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Gestionar Usuarios"
            description="Ver, editar y eliminar usuarios"
            onClick={() => navigate('/admin/usuarios')}
          />
          <QuickAccessCard
            icon={<Store className="w-8 h-8 text-green-600" />}
            title="Gestionar Comercios"
            description="Aprobar o rechazar comercios"
            onClick={() => navigate('/admin/comercios')}
            badge={stats?.comerciosPendientes}
          />
          <QuickAccessCard
            icon={<Megaphone className="w-8 h-8 text-purple-600" />}
            title="Gestionar Publicidades"
            description="Aprobar o rechazar publicidades"
            onClick={() => navigate('/admin/publicidades')}
            badge={stats?.publicidadesPendientes}
          />
          <QuickAccessCard
            icon={<Star className="w-8 h-8 text-yellow-600" />}
            title="Moderar Reseñas"
            description="Ver y eliminar reseñas"
            onClick={() => navigate('/admin/resenias')}
          />
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadística
const StatCard = ({ icon, title, value, subtitle, bgColor, borderColor }) => (
  <div className={`${bgColor} ${borderColor} border rounded-xl p-6`}>
    <div className="flex items-center justify-between mb-4">
      {icon}
      <TrendingUp className="w-5 h-5 text-gray-400" />
    </div>
    <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// Componente de acceso rápido
const QuickAccessCard = ({ icon, title, description, onClick, badge }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition group"
  >
    <div className="flex items-center justify-between mb-4">
      {icon}
      {badge > 0 && (
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {badge}
        </span>
      )}
    </div>
    <h3 className="font-bold text-gray-900 group-hover:text-primary transition">{title}</h3>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
  </div>
);

export default AdminPanel;
