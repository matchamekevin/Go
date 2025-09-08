import React, { useEffect, useState } from 'react';
import { Users, Ticket, CreditCard, TrendingUp, Activity, DollarSign, Eye, RefreshCw, Share2, Plus } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, activityResponse] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.getRecentActivity()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        
        if (activityResponse.success && activityResponse.data) {
          setRecentActivity(activityResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Données à afficher (API ou fallback)
  const displayStats = [
    {
      name: 'Total Utilisateurs',
      value: stats?.users?.total_users?.toString() || '2,651',
      change: '+4.75%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Tickets Vendus',
      value: stats?.tickets?.total_tickets?.toString() || '8,324',
      change: '+12.35%',
      changeType: 'positive',
      icon: Ticket,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Revenus Totaux',
      value: stats?.revenue?.total_revenue ? `€${stats.revenue.total_revenue.toLocaleString()}` : '€45,231',
      change: '+23.01%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      name: 'Routes Actives',
      value: stats?.routes?.active_routes?.toString() || '42',
      change: '+2.1%',
      changeType: 'positive',
      icon: CreditCard,
      color: 'from-orange-400 to-orange-500',
    },
  ];

  const displayActivity = recentActivity.length > 0 ? recentActivity : [
    {
      id: 1,
      user: 'Kevin Matcha',
      action: 'Achat de ticket',
      time: 'Il y a 2 minutes',
      amount: '€2.50',
    },
    {
      id: 2,
      user: 'Marie Dubois',
      action: 'Inscription',
      time: 'Il y a 5 minutes',
      amount: null,
    },
    {
      id: 3,
      user: 'Jean Martin',
      action: 'Utilisation ticket',
      time: 'Il y a 10 minutes',
      amount: null,
    },
    {
      id: 4,
      user: 'Sophie Laurent',
      action: 'Achat de ticket',
      time: 'Il y a 15 minutes',
      amount: '€3.00',
    },
  ];

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
                        <div className={`ml-2 flex items-baseline text-xs font-medium text-[#065f46]`}>
                          {stat.changeType === 'positive' ? (
                            <TrendingUp className="self-center flex-shrink-0 h-3 w-3 mr-1" />
                          ) : (
                            <TrendingUp className="self-center flex-shrink-0 h-3 w-3 transform rotate-180 mr-1" />
                          )}
                          {stat.change}
                        </div>
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
                <h3 className="text-lg sm:text-xl font-bold text-[#065f46] mb-2 sm:mb-0">Revenus des derniers jours</h3>
                <div className="flex space-x-2">
                  <button className="px-2 py-1 rounded text-xs text-[#065f46] hover:bg-[#d1fae5] transition-colors">7j</button>
                  <button className="px-2 py-1 rounded text-xs text-white font-medium bg-[#065f46] hover:bg-[#10b981]">30j</button>
                  <button className="px-2 py-1 rounded text-xs text-[#065f46] hover:bg-[#d1fae5] transition-colors">90j</button>
                </div>
              </div>
              <div className="h-48 sm:h-56 bg-[#d1fae5] rounded flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-10 w-10 text-[#10b981] mx-auto mb-2" />
                  <p className="text-[#065f46] font-semibold text-sm">Graphique des revenus</p>
                  <p className="text-xs text-[#065f46] mt-1">Données en cours de chargement...</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button className="flex items-center text-xs text-[#065f46] hover:text-[#181c1f]">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Actualiser
                </button>
                <button className="flex items-center text-xs text-[#065f46] hover:text-[#181c1f]">
                  <Eye className="h-3 w-3 mr-1" />
                  Détails
                </button>
                <button className="flex items-center text-xs text-[#065f46] hover:text-[#181c1f]">
                  <Share2 className="h-3 w-3 mr-1" />
                  Exporter
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white h-full p-4 rounded-lg border border-[#d1fae5] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#065f46]">Activité récente</h3>
                <button className="text-xs font-medium text-[#065f46] hover:text-[#181c1f]">Voir tout</button>
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
              <div className="mt-4 pt-4 border-t border-[#d1fae5]">
                <button className="w-full flex items-center justify-center rounded py-2 text-xs font-bold text-[#065f46] hover:text-[#181c1f] hover:bg-[#d1fae5] transition-colors">
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter une action
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="bg-white p-4 rounded-lg border border-[#d1fae5] shadow-sm">
            <h3 className="text-lg font-bold text-[#065f46] mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button className="flex items-center p-3 rounded border border-[#065f46] bg-[#065f46] hover:bg-[#10b981] transition-colors">
                <div className="bg-white p-2 rounded mr-2">
                  <Users className="h-4 w-4 text-[#065f46]" />
                </div>
                <span className="text-xs font-bold text-white">Nouvel utilisateur</span>
              </button>
              <button className="flex items-center p-3 rounded border border-[#d1fae5] hover:border-[#065f46] hover:bg-[#d1fae5] transition-colors">
                <div className="bg-[#d1fae5] p-2 rounded mr-2">
                  <Ticket className="h-4 w-4 text-[#065f46]" />
                </div>
                <span className="text-xs font-bold text-[#065f46]">Nouveau produit</span>
              </button>
              <button className="flex items-center p-3 rounded border border-[#d1fae5] hover:border-[#065f46] hover:bg-[#d1fae5] transition-colors">
                <div className="bg-[#d1fae5] p-2 rounded mr-2">
                  <CreditCard className="h-4 w-4 text-[#065f46]" />
                </div>
                <span className="text-xs font-bold text-[#065f46]">Voir paiements</span>
              </button>
              <button className="flex items-center p-3 rounded border border-[#d1fae5] hover:border-[#065f46] hover:bg-[#d1fae5] transition-colors">
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
