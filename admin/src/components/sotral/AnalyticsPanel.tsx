import React from 'react';
import { AnalyticsData } from '../../types/sotral';
import { TrendingUp, Users, CreditCard, DollarSign, Activity, Calendar } from 'lucide-react';

interface AnalyticsPanelProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit'
  });
};

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  analytics,
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Données non disponibles</h3>
        <p className="text-gray-500">
          Impossible de charger les analytics pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.general.total_tickets)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">{analytics.general.period}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.general.total_revenue)} FCFA
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">Revenus cumulés</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.general.active_users)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">Utilisateurs uniques</span>
          </div>
        </div>
      </div>

      {/* Lignes populaires */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Lignes Populaires
          </h3>
        </div>
        <div className="space-y-4">
          {analytics.popularLines.slice(0, 5).map((line, index) => (
            <div key={line.line_id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{line.line_name}</p>
                  <p className="text-sm text-gray-500">{line.tickets_count} tickets vendus</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(line.revenue_fcfa)} FCFA</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ventes quotidiennes */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Ventes Quotidiennes (7 derniers jours)
          </h3>
        </div>
        <div className="space-y-3">
          {analytics.dailySales.slice(0, 7).map((sale) => (
            <div key={sale.date} className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(sale.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {sale.tickets_count} tickets
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(sale.revenue_fcfa)} FCFA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Types de tickets */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
            Répartition par Type de Ticket
          </h3>
        </div>
        <div className="space-y-4">
          {analytics.ticketTypes.map((type) => (
            <div key={type.type_name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">{type.type_name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{type.count} tickets</span>
                <span className="text-sm font-medium text-gray-900">
                  {type.percentage.toFixed(1)}%
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(type.revenue_fcfa)} FCFA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      {analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-gray-600" />
              Activité Récente
            </h3>
          </div>
          <div className="space-y-3">
            {analytics.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};