import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Ticket,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// Renommer Route pour éviter le conflit avec React Router
import { MapPin as RouteIcon } from 'lucide-react';

// Données temporaires (à remplacer par de vraies données de l'API)
const statsData = {
  general: {
    total_tickets_sold: 15420,
    total_revenue_fcfa: 38550000,
    active_tickets: 3240,
    lines_count: 25,
    active_lines_count: 22
  },
  sales: {
    tickets_sold_today: 186,
    revenue_today_fcfa: 465000,
    tickets_sold_this_week: 1250,
    revenue_this_week_fcfa: 3125000,
    tickets_sold_this_month: 4680,
    revenue_this_month_fcfa: 11700000
  },
  top_lines: [
    { line_id: 1, line_name: "Ligne 1 - Zanguéra ↔ BIA", tickets_sold: 1240, revenue_fcfa: 3100000 },
    { line_id: 2, line_name: "Ligne 2 - Adétikopé ↔ REX", tickets_sold: 980, revenue_fcfa: 2450000 },
    { line_id: 3, line_name: "Ligne 3 - Akato ↔ BIA", tickets_sold: 850, revenue_fcfa: 2125000 },
  ],
  ticket_status_distribution: {
    active: 3240,
    used: 10180,
    expired: 1820,
    cancelled: 180
  }
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <div className={`flex items-center ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${
              trend.direction === 'down' ? 'rotate-180' : ''
            }`} />
            <span className="text-sm font-medium">{trend.value}%</span>
          </div>
          <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
        </div>
      )}
    </div>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      
      {/* Stats principales */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tickets vendus"
            value={statsData.general.total_tickets_sold.toLocaleString('fr-FR')}
            subtitle="Total historique"
            icon={Ticket}
            color="green"
            trend={{ value: 12.5, direction: 'up' }}
          />
          <StatCard
            title="Chiffre d'affaires"
            value={formatCurrency(statsData.general.total_revenue_fcfa)}
            subtitle="Total historique"
            icon={DollarSign}
            color="blue"
            trend={{ value: 8.2, direction: 'up' }}
          />
          <StatCard
            title="Tickets actifs"
            value={statsData.general.active_tickets.toLocaleString('fr-FR')}
            subtitle="En circulation"
            icon={Activity}
            color="yellow"
          />
          <StatCard
            title="Lignes actives"
            value={`${statsData.general.active_lines_count}/${statsData.general.lines_count}`}
            subtitle="Lignes en service"
            icon={RouteIcon}
            color="purple"
          />
        </div>
      </div>

      {/* Stats journalières/hebdomadaires */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performances récentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Aujourd'hui"
            value={statsData.sales.tickets_sold_today}
            subtitle={formatCurrency(statsData.sales.revenue_today_fcfa)}
            icon={Clock}
            color="green"
          />
          <StatCard
            title="Cette semaine"
            value={statsData.sales.tickets_sold_this_week}
            subtitle={formatCurrency(statsData.sales.revenue_this_week_fcfa)}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Ce mois"
            value={statsData.sales.tickets_sold_this_month}
            subtitle={formatCurrency(statsData.sales.revenue_this_month_fcfa)}
            icon={Activity}
            color="purple"
          />
        </div>
      </div>

      {/* Deux colonnes : Top lignes + Distribution des statuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top des lignes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lignes les plus populaires</h3>
            <p className="text-sm text-gray-500 mt-1">Ce mois-ci</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {statsData.top_lines.map((line, index) => (
                <div key={line.line_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
                      <span className="text-sm font-semibold text-emerald-700">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{line.line_name}</p>
                      <p className="text-xs text-gray-500">{line.tickets_sold} tickets vendus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(line.revenue_fcfa)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution des statuts de tickets */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">État des tickets</h3>
            <p className="text-sm text-gray-500 mt-1">Distribution actuelle</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Actifs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {statsData.ticket_status_distribution.active.toLocaleString('fr-FR')}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(statsData.ticket_status_distribution.active / 
                                 Object.values(statsData.ticket_status_distribution).reduce((a, b) => a + b, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">Utilisés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {statsData.ticket_status_distribution.used.toLocaleString('fr-FR')}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(statsData.ticket_status_distribution.used / 
                                 Object.values(statsData.ticket_status_distribution).reduce((a, b) => a + b, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Expirés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {statsData.ticket_status_distribution.expired.toLocaleString('fr-FR')}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(statsData.ticket_status_distribution.expired / 
                                 Object.values(statsData.ticket_status_distribution).reduce((a, b) => a + b, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">Annulés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {statsData.ticket_status_distribution.cancelled.toLocaleString('fr-FR')}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(statsData.ticket_status_distribution.cancelled / 
                                 Object.values(statsData.ticket_status_distribution).reduce((a, b) => a + b, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
          <p className="text-sm text-gray-500 mt-1">Raccourcis vers les actions fréquentes</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/lines"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <RouteIcon className="w-8 h-8 text-emerald-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Gérer les lignes</p>
                <p className="text-sm text-gray-500">Créer et modifier les lignes</p>
              </div>
            </a>
            
            <a
              href="/tickets/generate"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Ticket className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Générer des tickets</p>
                <p className="text-sm text-gray-500">Créer des tickets en masse</p>
              </div>
            </a>
            
            <a
              href="/tickets"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Users className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Voir les tickets</p>
                <p className="text-sm text-gray-500">Consulter tous les tickets</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};