import React, { useState } from 'react';
import { SotralLine, SotralTicketType, TicketFilters, TicketStatus } from '../../types/sotral';
import { Filter, X, Search, Calendar, RefreshCw } from 'lucide-react';

interface FilterPanelProps {
  lines: SotralLine[];
  ticketTypes: SotralTicketType[];
  filters: TicketFilters;
  onFiltersChange: (filters: Partial<TicketFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  lines,
  ticketTypes,
  filters,
  onFiltersChange,
  onReset,
  onRefresh
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<TicketFilters>(filters);

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange({ [key]: value });
  };

  const handleReset = () => {
    const resetFilters: TicketFilters = { page: 1, limit: 10 };
    setLocalFilters(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status && filters.status !== '') count++;
    if (filters.lineId && filters.lineId > 0) count++;
    if (filters.userId && filters.userId > 0) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* En-tête avec bouton d'expansion */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              title="Réinitialiser les filtres"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtres rapides (toujours visibles) */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          {/* Recherche par code ticket */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par code ticket..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  // Pour l'instant, on peut implémenter une recherche simple
                  // TODO: Implémenter la recherche par code ticket
                }}
              />
            </div>
          </div>

          {/* Filtre statut */}
          <div className="w-48">
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value={TicketStatus.ACTIVE}>Actif</option>
              <option value={TicketStatus.USED}>Utilisé</option>
              <option value={TicketStatus.EXPIRED}>Expiré</option>
              <option value={TicketStatus.CANCELLED}>Annulé</option>
            </select>
          </div>

          {/* Items par page */}
          <div className="w-32">
            <select
              value={localFilters.limit || 10}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtres avancés (extensibles) */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par ligne */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ligne SOTRAL
              </label>
              <select
                value={localFilters.lineId || ''}
                onChange={(e) => handleFilterChange('lineId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les lignes</option>
                {lines.map(line => (
                  <option key={line.id} value={line.id}>
                    {line.line_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par utilisateur */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ID Utilisateur
              </label>
              <input
                type="number"
                placeholder="ID utilisateur"
                value={localFilters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                Date début
              </label>
              <input
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                Date fin
              </label>
              <input
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              {activeFiltersCount > 0 && (
                <span>{activeFiltersCount} filtre(s) actif(s)</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
              >
                Masquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};