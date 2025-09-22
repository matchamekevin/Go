import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Ticket, CreditCard, TrendingUp, Activity, DollarSign} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { DashboardService } from '../services/dashboardService';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [revenueDaily, setRevenueDaily] = useState<any[]>([]);
  // Pour test manuel
  const injectFakeCFA = () => {
    const fake = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 10000) + 2000,
      };
    });
    setRevenueDaily(fake);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activityResponse, chartResponse] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.getRecentActivity(),
          DashboardService.getChartData('revenue', '30d'),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (activityResponse.success && activityResponse.data) {
          setRecentActivity(activityResponse.data);
        }

        if (chartResponse.success && chartResponse.data) {
          setRevenueDaily(chartResponse.data.map((d: any) => ({ date: d.date, amount: d.value })));
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    fetchData();
  }, []);

  // Données à afficher (strictement API)
  const displayStats = stats ? [
    {
      name: 'Total Utilisateurs',
      value: stats.users?.total_users?.toString() ?? '',
      change: stats.users?.change ?? '',
      changeType: stats.users?.changeType ?? 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Tickets Vendus',
      value: stats.tickets?.total_tickets?.toString() ?? '',
      change: stats.tickets?.change ?? '',
      changeType: stats.tickets?.changeType ?? 'positive',
      icon: Ticket,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Revenus Totaux',
      value: typeof stats.revenue?.total_revenue === 'number' ? `${stats.revenue.total_revenue.toLocaleString()} F CFA` : '',
      change: stats.revenue?.change ?? '',
      changeType: stats.revenue?.changeType ?? 'positive',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
    },
  ] : [];

  const displayActivity = recentActivity;

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#065f46] mx-auto mb-4"></div>
          <p className="text-[#065f46] font-semibold">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#065f46]">
            Tableau de bord
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#065f46] font-medium max-w-2xl mx-auto">
            Bienvenue dans l'administration GoSOTRAL. Voici un aperçu de votre activité.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {displayStats.map((stat: any) => {
            const Icon = stat.icon;
            if (!stat.value) return null;
            return (
              <div 
                key={stat.name} 
                className="bg-white p-3 sm:p-4 rounded-lg border border-[#d1fae5] shadow-sm hover:border-[#065f46] transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#d1fae5] rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#065f46]" />
                  </div>
                  <div className="ml-3 sm:ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-[#065f46] truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline mt-1">
                        <div className="text-lg sm:text-xl font-bold text-[#181c1f]">
                          {stat.value}
                        </div>
                        {stat.change && (
                          <div className={`ml-2 flex items-baseline text-xs font-medium text-[#065f46]`}>
                            {stat.changeType === 'positive' ? (
                              <TrendingUp className="self-center flex-shrink-0 h-3 w-3 mr-1" />
                            ) : (
                              <TrendingUp className="self-center flex-shrink-0 h-3 w-3 transform rotate-180 mr-1" />
                            )}
                            {stat.change}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg border border-[#d1fae5] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#065f46] mb-2 sm:mb-0">Revenus quotidiens</h3>
                <button
                  className="ml-auto px-3 py-1 rounded bg-[#10b981] text-white text-xs font-bold hover:bg-[#065f46] transition-colors"
                  onClick={injectFakeCFA}
                  title="Injecter des données de test CFA"
                >
                  Tester F CFA
                </button>
              </div>
              <div className="h-64 sm:h-72">
                {revenueDaily && revenueDaily.length > 0 ? (
                  <Bar
                    data={{
                      labels: revenueDaily.map((d: any) => d.date),
                      datasets: [
                        {
                          label: 'Revenus (F CFA)',
                          data: revenueDaily.map((d: any) => d.amount),
                          backgroundColor: '#10b981',
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx: any) => `${ctx.parsed.y.toLocaleString()} F CFA`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          title: { display: true, text: 'Date', color: '#065f46', font: { weight: 'bold' } },
                          ticks: { color: '#065f46', font: { weight: 'bold' } },
                        },
                        y: {
                          grid: { color: '#d1fae5' },
                          title: { display: true, text: 'Revenus (F CFA)', color: '#065f46', font: { weight: 'bold' } },
                          ticks: { color: '#065f46', font: { weight: 'bold' } },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[#065f46] font-semibold">Aucune donnée de revenus disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white min-h-[180px] max-h-[420px] overflow-y-auto p-4 rounded-lg border border-[#d1fae5] shadow-sm transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#065f46]">Activité récente</h3>
              </div>
              <div className="space-y-3">
                {displayActivity.map((activity: any) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-3 p-2 rounded hover:bg-[#d1fae5] transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#d1fae5] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#065f46]">
                        {activity.user.split(' ').map((n: any) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#181c1f] truncate">
                        {activity.user}
                      </p>
                      <p className="text-xs text-[#065f46]">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-xs font-bold text-[#065f46]">{activity.amount}</p>
                      )}
                      <p className="text-xs text-[#065f46]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Plus de bouton ajouter */}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="bg-white p-4 rounded-lg border border-[#d1fae5] shadow-sm">
            <h3 className="text-lg font-bold text-[#065f46] mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Navigation corrigée vers les vraies pages */}
              <button
                className="flex items-center p-3 rounded border border-[#d1fae5] hover:border-[#065f46] hover:bg-[#d1fae5] transition-colors min-w-[140px]"
                onClick={() => navigate('/products')}
              >
                <div className="bg-[#d1fae5] p-2 rounded mr-2">
                  <Ticket className="h-4 w-4 text-[#065f46]" />
                </div>
                <span className="text-xs font-bold text-[#065f46]">Nouveau produit</span>
              </button>
              <button
                className="flex items-center p-3 rounded border border-[#d1fae5] hover:border-[#065f46] hover:bg-[#d1fae5] transition-colors min-w-[140px]"
                onClick={() => navigate('/payments')}
              >
                <div className="bg-[#d1fae5] p-2 rounded mr-2">
                  <CreditCard className="h-4 w-4 text-[#065f46]" />
                </div>
                <span className="text-xs font-bold text-[#065f46]">Voir paiements</span>
              </button>
              <button
                className="flex items-center p-3 rounded border border-[#d1fae5] hover:border-[#065f46] hover:bg-[#d1fae5] transition-colors min-w-[140px]"
                onClick={() => navigate('/reports')}
              >
                <div className="bg-[#d1fae5] p-2 rounded mr-2">
                  <Activity className="h-4 w-4 text-[#065f46]" />
                </div>
                <span className="text-xs font-bold text-[#065f46]">Rapport détaillé</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
