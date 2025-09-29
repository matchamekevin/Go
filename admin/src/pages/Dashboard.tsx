import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Ticket,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Bus,
  BarChart3,
  PieChart,
  Clock,
  TrendingDown
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { DashboardService } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [revenueDaily, setRevenueDaily] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Fonction de récupération des données
  const fetchData = async () => {
    const [
      statsResponse,
      activityResponse,
      revenueResponse
    ] = await Promise.allSettled([
      DashboardService.getStats(),
      DashboardService.getRecentActivity(),
      DashboardService.getChartData('revenue', selectedPeriod),
    ]);

    // Traiter les réponses individuellement sans lever d'erreur globale
    if (statsResponse.status === 'fulfilled' && statsResponse.value.success && statsResponse.value.data) {
      setStats(statsResponse.value.data);
    } else {
      console.error('Erreur lors du chargement des statistiques:', statsResponse.status === 'rejected' ? statsResponse.reason : statsResponse.value?.error);
    }

    if (activityResponse.status === 'fulfilled' && activityResponse.value.success && activityResponse.value.data) {
      setRecentActivity(activityResponse.value.data);
    } else {
      console.error('Erreur lors du chargement de l\'activité récente:', activityResponse.status === 'rejected' ? activityResponse.reason : activityResponse.value?.error);
    }

    if (revenueResponse.status === 'fulfilled' && revenueResponse.value.success && revenueResponse.value.data) {
      setRevenueDaily(revenueResponse.value.data);
    } else {
      console.error('Erreur lors du chargement des données de revenus:', revenueResponse.status === 'rejected' ? revenueResponse.reason : revenueResponse.value?.error);
    }
  };

  // Utiliser le hook de réactualisation automatique
  const { isRefreshing } = useAutoRefresh(fetchData, {
    interval: 30000, // 30 secondes
    enabled: true
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchData();
      } catch (error: any) {
        console.error('Erreur lors du chargement initial:', error);
        if (error.message?.includes('auth') || error.message?.includes('Token') || error.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError('Erreur de connexion au serveur.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadInitialData();
    } else {
      setIsLoading(false);
      setError('Veuillez vous connecter pour accéder au dashboard.');
    }
  }, [isAuthenticated, selectedPeriod]);

  // Statistiques principales
  const mainStats = stats ? [
    {
      name: 'Utilisateurs',
      value: stats.users?.total_users?.toLocaleString() ?? '0',
      change: stats.users?.new_users_month ? `+${stats.users.new_users_month} ce mois` : '',
      changeType: stats.users?.new_users_month > 0 ? 'positive' : 'neutral',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      subtitle: `${stats.users?.verified_users ?? 0} vérifiés`
    },
    {
      name: 'Tickets SOTRAL',
      value: stats.tickets?.total_tickets?.toLocaleString() ?? '0',
      change: stats.tickets?.tickets_month ? `+${stats.tickets.tickets_month} ce mois` : '',
      changeType: stats.tickets?.tickets_month > 0 ? 'positive' : 'neutral',
      icon: Ticket,
      color: 'from-purple-500 to-purple-600',
      subtitle: `${stats.tickets?.used_tickets ?? 0} utilisés`
    },
    {
      name: 'Revenus',
      value: stats.revenue?.total_revenue ? `${stats.revenue.total_revenue.toLocaleString()} F CFA` : '0 F CFA',
      change: stats.revenue?.revenue_month ? `+${stats.revenue.revenue_month.toLocaleString()} F CFA` : '',
      changeType: stats.revenue?.revenue_month > 0 ? 'positive' : 'neutral',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      subtitle: 'Ce mois'
    },
    {
      name: 'Lignes actives',
      value: stats.lines?.active_lines?.toString() ?? '0',
      change: '',
      changeType: 'neutral',
      icon: Bus,
      color: 'from-orange-500 to-orange-600',
      subtitle: 'SOTRAL'
    },
  ] : [];

  // Données pour le graphique des tickets par statut
  const ticketStatusData = stats?.tickets?.tickets_by_status ? {
    labels: stats.tickets.tickets_by_status.map((s: any) => {
      const statusLabels: any = {
        'active': 'Actifs',
        'used': 'Utilisés',
        'expired': 'Expirés',
        'cancelled': 'Annulés',
        'inactive': 'Inactifs'
      };
      return statusLabels[s.status] || s.status;
    }),
    datasets: [{
      data: stats.tickets.tickets_by_status.map((s: any) => s.count),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
      borderWidth: 0,
    }],
  } : null;

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#065f46] mx-auto mb-4"></div>
          <p className="text-[#065f46] font-bold text-lg">Chargement du tableau de bord...</p>
          <p className="text-[#065f46] text-sm mt-2">Récupération des données SOTRAL</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5]">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('Session expirée') || error.includes('connecter') ? (
              <button
                onClick={handleLogin}
                className="w-full bg-[#065f46] text-white py-3 px-6 rounded-xl hover:bg-[#054a3a] transition-all duration-200 font-semibold"
              >
                Se connecter
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="w-full bg-[#065f46] text-white py-3 px-6 rounded-xl hover:bg-[#054a3a] transition-all duration-200 flex items-center justify-center font-semibold"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center relative">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#065f46] to-[#047857] bg-clip-text text-transparent">
            Tableau de bord SOTRAL
          </h1>
          <p className="mt-3 text-lg text-[#065f46] font-medium max-w-3xl mx-auto">
            Gestion complète du système de transport urbain de Lomé
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat: any) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative"
              >
                {/* Indicateur de mise à jour en cours */}
                {isRefreshing && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-xs text-gray-500">{stat.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  {stat.change && (
                    <div className={`flex items-center mt-1 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : stat.changeType === 'negative' ? (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      ) : null}
                      {stat.change}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
              {/* Indicateur de mise à jour en cours */}
              {isRefreshing && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#065f46]">Revenus quotidiens</h3>
                  <p className="text-sm text-gray-600 mt-1">Évolution des ventes de tickets</p>
                </div>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="mt-2 sm:mt-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#065f46] focus:border-transparent"
                >
                  <option value="7d">7 jours</option>
                  <option value="30d">30 jours</option>
                  <option value="90d">90 jours</option>
                </select>
              </div>
              <div className="h-80">
                {revenueDaily && revenueDaily.length > 0 ? (
                  <Line
                    data={{
                      labels: revenueDaily.map((d: any) => {
                        const date = new Date(d.date);
                        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
                      }),
                      datasets: [
                        {
                          label: 'Revenus (F CFA)',
                          data: revenueDaily.map((d: any) => d.value),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: '#10b981',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx: any) => `${ctx.parsed.y.toLocaleString()} F CFA`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: '#6b7280', font: { weight: 'normal' } },
                        },
                        y: {
                          grid: { color: '#f3f4f6' },
                          ticks: {
                            color: '#6b7280',
                            font: { weight: 'normal' },
                            callback: (value) => `${value.toLocaleString()} F`
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Aucune donnée de revenus disponible</p>
                      <p className="text-sm text-gray-400 mt-1">Les données apparaîtront après les premières ventes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tickets by Status */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
              {/* Indicateur de mise à jour en cours */}
              {isRefreshing && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#065f46]">Statut des tickets</h3>
                <p className="text-sm text-gray-600 mt-1">Répartition par état</p>
              </div>
              <div className="h-64">
                {ticketStatusData ? (
                  <Doughnut
                    data={ticketStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12, weight: 'normal' }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (ctx: any) => `${ctx.label}: ${ctx.parsed.toLocaleString()}`,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Lines */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
            {/* Indicateur de mise à jour en cours */}
            {isRefreshing && (
              <div className="absolute top-3 right-3 z-10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#065f46]">Top lignes</h3>
              <p className="text-sm text-gray-600 mt-1">Lignes les plus utilisées</p>
            </div>
            <div className="space-y-4">
              {stats?.lines?.top_lines?.slice(0, 5).map((line: any, index: number) => (
                <div key={line.line_number} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#065f46] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">Ligne {line.line_number}</p>
                      <p className="text-sm text-gray-600 truncate max-w-48">{line.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#065f46]">{line.tickets_sold}</p>
                    <p className="text-xs text-gray-500">tickets</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Bus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucune donnée de lignes disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative">
            {/* Indicateur de mise à jour en cours */}
            {isRefreshing && (
              <div className="absolute top-3 right-3 z-10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#065f46]">Activité récente</h3>
                <p className="text-sm text-gray-600 mt-1">Dernières actions système</p>
              </div>
              <Activity className="h-6 w-6 text-[#065f46]" />
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-xl"
                >
                  <div className="w-10 h-10 bg-[#d1fae5] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#065f46]">
                      {activity.user ? activity.user.split(' ').map((n: any) => n[0]).join('') : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {activity.user || 'Utilisateur inconnu'}
                    </p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                      {activity.amount && (
                        <p className="text-sm font-bold text-[#065f46]">{activity.amount} F CFA</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-[#065f46] mb-6">Actions rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="flex items-center p-4 rounded-xl border-2 border-[#d1fae5] transition-all duration-200 group"
              onClick={() => navigate('/reports')}
            >
              <div className="bg-[#d1fae5] p-3 rounded-xl mr-3 transition-colors">
                <BarChart3 className="h-5 w-5 text-[#065f46]" />
              </div>
              <span className="font-semibold text-[#065f46]">Rapports détaillés</span>
            </button>

            <button
              className="flex items-center p-4 rounded-xl border-2 border-[#d1fae5] transition-all duration-200 group"
              onClick={() => navigate('/tickets')}
            >
              <div className="bg-[#d1fae5] p-3 rounded-xl mr-3 transition-colors">
                <Ticket className="h-5 w-5 text-[#065f46]" />
              </div>
              <span className="font-semibold text-[#065f46]">Gestion tickets</span>
            </button>

            <button
              className="flex items-center p-4 rounded-xl border-2 border-[#d1fae5] transition-all duration-200 group"
              onClick={() => navigate('/users')}
            >
              <div className="bg-[#d1fae5] p-3 rounded-xl mr-3 transition-colors">
                <Users className="h-5 w-5 text-[#065f46]" />
              </div>
              <span className="font-semibold text-[#065f46]">Utilisateurs</span>
            </button>

            <button
              className="flex items-center p-4 rounded-xl border-2 border-[#d1fae5] transition-all duration-200 group"
              onClick={() => navigate('/sotral')}
            >
              <div className="bg-[#d1fae5] p-3 rounded-xl mr-3 transition-colors">
                <Bus className="h-5 w-5 text-[#065f46]" />
              </div>
              <span className="font-semibold text-[#065f46]">Gestion SOTRAL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
