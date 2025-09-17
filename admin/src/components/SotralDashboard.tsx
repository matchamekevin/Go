import React, { useState, useEffect } from 'react';
import SotralService, { type SotralStats } from '../services/sotralService';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className={`rounded-lg border-2 ${colorClasses[color]} p-6`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-4 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium truncate">
              {title}
            </dt>
            <dd className="text-lg font-semibold">
              {value}
            </dd>
            {subValue && (
              <dd className="text-sm opacity-75">
                {subValue}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

interface PopularLineCardProps {
  line: {
    line_id: number;
    line_name: string;
    tickets_count: number;
    revenue_fcfa: number;
  };
  rank: number;
}

const PopularLineCard: React.FC<PopularLineCardProps> = ({ line, rank }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
            #{rank}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">{line.line_name}</h4>
          <p className="text-sm text-gray-500">{line.tickets_count} tickets vendus</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {SotralService.formatCurrency(line.revenue_fcfa)}
        </p>
      </div>
    </div>
  );
};

const SotralDashboard: React.FC = () => {
  const [stats, setStats] = useState<SotralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SotralService.getStats(
        dateFilter.from || undefined,
        dateFilter.to || undefined
      );
      setStats(data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Error loading SOTRAL stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [dateFilter]);

  const handleDateFilterChange = (field: 'from' | 'to', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erreur
            </h3>
            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
            <button
              onClick={loadStats}
              className="mt-2 bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres de date */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord SOTRAL</h1>
            <p className="mt-1 text-sm text-gray-600">
              Vue d'ensemble des ventes de tickets et statistiques
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">📅</span>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Date début"
              />
              <span className="text-gray-500">à</span>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Date fin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total tickets vendus"
          value={stats.total_tickets_sold.toLocaleString()}
          icon={<span className="text-2xl">🎫</span>}
          color="blue"
        />
        <StatsCard
          title="Revenus totaux"
          value={SotralService.formatCurrency(stats.total_revenue_fcfa)}
          icon={<span className="text-2xl">💰</span>}
          color="green"
        />
        <StatsCard
          title="Utilisateurs actifs"
          value={stats.active_users.toLocaleString()}
          icon={<span className="text-2xl">👥</span>}
          color="purple"
        />
        <StatsCard
          title="Revenue moyen/ticket"
          value={SotralService.formatCurrency(
            stats.total_tickets_sold > 0 
              ? stats.total_revenue_fcfa / stats.total_tickets_sold 
              : 0
          )}
          icon={<span className="text-2xl">📊</span>}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lignes populaires */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Lignes les plus populaires
          </h3>
          <div className="space-y-3">
            {stats.popular_lines.slice(0, 5).map((line, index) => (
              <PopularLineCard 
                key={line.line_id} 
                line={line} 
                rank={index + 1} 
              />
            ))}
          </div>
        </div>

        {/* Distribution des types de tickets */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Types de tickets
          </h3>
          <div className="space-y-3">
            {stats.ticket_types_distribution.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{type.type_name}</span>
                    <span className="text-gray-500">{type.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {type.count} tickets
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ventes quotidiennes */}
      {stats.daily_sales.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ventes quotidiennes (7 derniers jours)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets vendus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenus
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.daily_sales.map((day, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {day.tickets_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {SotralService.formatCurrency(day.revenue_fcfa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SotralDashboard;