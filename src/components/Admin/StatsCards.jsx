// StatsCards.jsx - Tarjetas de estadísticas del admin

import { useState, useEffect } from 'react';
import { Store, Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { getAllComercios } from '../../services/comerciosService';
import { getAllUsuarios } from '../../services/usuariosService';
import { getAllResenias } from '../../services/reseniasService';

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalComercios: 0,
    comerciosPendientes: 0,
    totalUsuarios: 0,
    totalResenas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      const [comercios, usuarios, resenas] = await Promise.all([
        getAllComercios(),
        getAllUsuarios(),
        getAllResenias(),
      ]);

      setStats({
        totalComercios: comercios.length,
        comerciosPendientes: comercios.filter(c => c.estado === false).length,
        totalUsuarios: usuarios.length,
        totalResenas: resenas.length,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Comercios',
      value: stats.totalComercios,
      icon: Store,
      color: 'bg-blue-500',
    },
    {
      title: 'Comercios Pendientes',
      value: stats.comerciosPendientes,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Reseñas',
      value: stats.totalResenas,
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Resumen General
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;
