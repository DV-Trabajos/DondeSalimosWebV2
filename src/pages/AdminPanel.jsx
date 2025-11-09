// AdminPanel.jsx - Panel de administración principal

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ComerciosAdmin from '../components/Admin/ComerciosAdmin';
import UsuariosAdmin from '../components/Admin/UsuariosAdmin';
import ResenasAdmin from '../components/Admin/ResenasAdmin';
import StatsCards from '../components/Admin/StatsCards';
import { Shield, Store, Users, MessageSquare } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const { user } = useAuth();

  const tabs = [
    { id: 'stats', label: 'Estadísticas', icon: Shield },
    { id: 'comercios', label: 'Comercios', icon: Store },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'resenas', label: 'Reseñas', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.nombreUsuario}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit px-6 py-4 font-semibold transition border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'stats' && <StatsCards />}
          {activeTab === 'comercios' && <ComerciosAdmin />}
          {activeTab === 'usuarios' && <UsuariosAdmin />}
          {activeTab === 'resenas' && <ResenasAdmin />}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
