import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  DollarSign, 
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

interface Statistics {
  overview: StatCard[];
  revenue_chart: ChartData;
  users_chart: ChartData;
  routes_stats: {
    route_name: string;
    tickets_sold: number;
    revenue: number;
    percentage: number;
  }[];
  time_stats: {
    hour: string;
    bookings: number;
  }[];
}

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      // const response = await StatisticsService.getStatistics({ period: dateRange });
      
      // Données mockées pour l'instant
      const mockStats: Statistics = {
        overview: [
          {
            title: 'Revenus Totaux',
            value: '2,845,600 FCFA',
            change: 12.3,
            changeType: 'increase',
            icon: <DollarSign className="h-6 w-6" />,
            color: 'green'
          },
          {
            title: 'Tickets Vendus',
            value: '1,247',
            change: 8.7,
            changeType: 'increase',
            icon: <Ticket className="h-6 w-6" />,
            color: 'blue'
          },
          {
            title: 'Utilisateurs Actifs',
            value: '856',
            change: 15.2,
            changeType: 'increase',
            icon: <Users className="h-6 w-6" />,
            color: 'purple'
          },
          {
            title: 'Routes Actives',
            value: '23',
            change: -2.1,
            changeType: 'decrease',
            icon: <MapPin className="h-6 w-6" />,
            color: 'orange'
          }
        ],
        revenue_chart: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Revenus (FCFA)',
            data: [245000, 189000, 324000, 267000, 398000, 445000],
            backgroundColor: 'rgba(6, 95, 70, 0.1)',
            borderColor: 'rgb(6, 95, 70)'
          }]
        },
        users_chart: {
          labels: ['Nouveaux', 'Actifs', 'Inactifs'],
          datasets: [{
            label: 'Utilisateurs',
            data: [156, 856, 234],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(6, 95, 70, 0.8)',
              'rgba(156, 163, 175, 0.8)'
            ]
          }]
        },
        routes_stats: [
          { route_name: 'Lomé - Kpalimé', tickets_sold: 234, revenue: 468000, percentage: 18.8 },
          { route_name: 'Lomé - Sokodé', tickets_sold: 189, revenue: 378000, percentage: 15.2 },
          { route_name: 'Lomé - Kara', tickets_sold: 156, revenue: 312000, percentage: 12.5 },
          { route_name: 'Lomé - Atakpamé', tickets_sold: 134, revenue: 268000, percentage: 10.8 },
          { route_name: 'Autres routes', tickets_sold: 534, revenue: 1068000, percentage: 42.7 }
        ],
        time_stats: [
          { hour: '06:00', bookings: 45 },
          { hour: '07:00', bookings: 78 },
          { hour: '08:00', bookings: 156 },
          { hour: '09:00', bookings: 134 },
          { hour: '10:00', bookings: 89 },
          { hour: '11:00', bookings: 67 },
          { hour: '12:00', bookings: 98 },
          { hour: '13:00', bookings: 112 },
          { hour: '14:00', bookings: 145 },
          { hour: '15:00', bookings: 123 },
          { hour: '16:00', bookings: 167 },
          { hour: '17:00', bookings: 189 },
          { hour: '18:00', bookings: 145 },
          { hour: '19:00', bookings: 89 },
          { hour: '20:00', bookings: 56 },
          { hour: '21:00', bookings: 34 }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatistics = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
    toast.success('Statistiques mises à jour');
  };

  const exportStatistics = () => {
    toast.success('Export des statistiques en cours...');
    // TODO: Implémenter l'export réel
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065f46]"></div>
        <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune donnée statistique disponible</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistiques & Analytics</h1>
            <p className="mt-2 text-sm text-gray-600">
              Analysez les performances et tendances de votre plateforme
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshStatistics}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
            <button
              onClick={exportStatistics}
              className="flex items-center px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">12 derniers mois</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.overview.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.changeType === 'increase' ? '+' : '-'}{Math.abs(stat.change)}% ce mois
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Graphique des revenus */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution des Revenus</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique en cours de développement</p>
              <p className="text-sm text-gray-500 mt-2">
                Revenus: {formatCurrency(stats.revenue_chart.datasets[0].data.reduce((a, b) => a + b, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Répartition des utilisateurs */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Répartition Utilisateurs</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique circulaire en cours de développement</p>
              <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                {stats.users_chart.labels.map((label, index) => (
                  <div key={index} className="text-center">
                    <p className="font-medium">{label}</p>
                    <p className="text-gray-600">{stats.users_chart.datasets[0].data[index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top routes */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Routes les Plus Populaires</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.routes_stats.map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{route.route_name}</p>
                      <p className="text-sm text-gray-600">{route.percentage}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#065f46] h-2 rounded-full"
                        style={{ width: `${route.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-600">
                      <span>{route.tickets_sold} tickets</span>
                      <span>{formatCurrency(route.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heures de pointe */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Heures de Pointe</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.time_stats.map((timeData, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{timeData.hour}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-[#065f46] h-2 rounded-full"
                        style={{ width: `${(timeData.bookings / 200) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{timeData.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;