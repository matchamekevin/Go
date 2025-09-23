import React from 'react';
import { Bus, TrendingUp, MapPin } from 'lucide-react';

interface LineStats {
  total_lines: number;
  active_lines: number;
  total_stops: number;
  ticket_types: number;
}

interface StatsCardsProps {
  stats: LineStats | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="glass-container p-6 rounded-xl">
        <div className="flex items-center">
          <Bus className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total lignes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_lines}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-container p-6 rounded-xl">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Lignes actives</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active_lines}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-container p-6 rounded-xl">
        <div className="flex items-center">
          <MapPin className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total arrêts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_stops || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-container p-6 rounded-xl">
        <div className="flex items-center">
          <Bus className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Types de lignes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.ticket_types || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
