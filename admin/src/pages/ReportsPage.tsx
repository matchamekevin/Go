import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, DollarSign, Users, Ticket, Filter, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RevenueData {
  period: string;
  revenue: number;
  tickets_sold: number;
  active_users: number;
}

interface ReportStats {
  total_revenue: number;
  total_tickets: number;
  total_users: number;
  average_ticket_price: number;
  period_revenue: RevenueData[];
}

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('financial');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      // const response = await ReportService.getReports({ period: dateRange, type: reportType });
      
      // Données mockées pour l'instant
      const mockData: ReportStats = {
        total_revenue: 2845600, // en FCFA
        total_tickets: 1247,
        total_users: 856,
        average_ticket_price: 2280,
        period_revenue: [
          { period: '2024-01-01', revenue: 245600, tickets_sold: 108, active_users: 89 },
          { period: '2024-01-02', revenue: 189300, tickets_sold: 83, active_users: 72 },
          { period: '2024-01-03', revenue: 324800, tickets_sold: 142, active_users: 115 },
          { period: '2024-01-04', revenue: 267400, tickets_sold: 117, active_users: 94 },
          { period: '2024-01-05', revenue: 398700, tickets_sold: 175, active_users: 148 },
        ]
      };
      
      setStats(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF', // Code ISO pour Franc CFA
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  };

  const exportReport = () => {
    toast.success('Export du rapport en cours...');
    // TODO: Implémenter l'export réel
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065f46]"></div>
        <span className="ml-2 text-gray-600">Chargement des rapports...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rapports Financiers</h1>
            <p className="mt-2 text-sm text-gray-600">
              Analysez les performances financières et les métriques de votre plateforme
            </p>
          </div>
          <button 
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
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
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
            >
              <option value="financial">Rapport Financier</option>
              <option value="users">Rapport Utilisateurs</option>
              <option value="tickets">Rapport Tickets</option>
              <option value="routes">Rapport Routes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.total_revenue) : '0 FCFA'}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.3% ce mois
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tickets Vendus</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? stats.total_tickets.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-blue-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8.7% ce mois
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? stats.total_users.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-purple-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +15.2% ce mois
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Prix Moyen Ticket</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.average_ticket_price) : '0 FCFA'}
              </p>
              <p className="text-sm text-orange-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.1% ce mois
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des revenus */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des Revenus (FCFA)</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Graphique des revenus en cours de développement</p>
            <p className="text-sm text-gray-500 mt-2">
              Les données sont disponibles via l'API
            </p>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Détail par Période</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus (FCFA)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Vendus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateurs Actifs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix Moyen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.period_revenue.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.period).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tickets_sold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.active_users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.revenue / item.tickets_sold)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;