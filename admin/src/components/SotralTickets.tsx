import React, { useState, useEffect } from 'react';
import SotralService, { type SotralTicket } from '../services/sotralService';

interface TicketCardProps {
  ticket: SotralTicket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header avec code ticket et statut */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-mono font-medium">
              {ticket.ticket_code}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${SotralService.getTicketStatusColor(ticket.status)}`}>
              {SotralService.getTicketStatusLabel(ticket.status)}
            </span>
          </div>

          {/* Informations du ticket */}
          <div className="space-y-2 text-sm">
            {ticket.ticket_type && (
              <div className="flex items-center">
                <span className="w-20 font-medium text-gray-600">Type:</span>
                <span className="text-gray-900">{ticket.ticket_type.name}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="w-20 font-medium text-gray-600">Prix:</span>
              <span className="text-gray-900 font-medium">
                {SotralService.formatCurrency(ticket.price_paid_fcfa)}
              </span>
            </div>

            {ticket.line && (
              <div className="flex items-center">
                <span className="w-20 font-medium text-gray-600">Ligne:</span>
                <span className="text-gray-900">
                  Ligne {ticket.line.line_number} - {ticket.line.name}
                </span>
              </div>
            )}

            {ticket.stop_from && ticket.stop_to && (
              <div className="flex items-center">
                <span className="w-20 font-medium text-gray-600">Trajet:</span>
                <span className="text-gray-900">
                  {ticket.stop_from.name} → {ticket.stop_to.name}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <span className="w-20 font-medium text-gray-600">Voyages:</span>
              <span className="text-gray-900">
                {ticket.trips_remaining} restant{ticket.trips_remaining !== 1 ? 's' : ''}
              </span>
            </div>

            {ticket.payment_method && (
              <div className="flex items-center">
                <span className="w-20 font-medium text-gray-600">Paiement:</span>
                <span className="text-gray-900">
                  {SotralService.getPaymentMethodLabel(ticket.payment_method)}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <span className="w-20 font-medium text-gray-600">Acheté:</span>
              <span className="text-gray-900">
                {formatDate(ticket.purchased_at)}
              </span>
            </div>

            {ticket.expires_at && (
              <div className="flex items-center">
                <span className="w-20 font-medium text-gray-600">Expire:</span>
                <div className="flex flex-col">
                  <span className="text-gray-900">
                    {formatDate(ticket.expires_at)}
                  </span>
                  {ticket.status === 'active' && (
                    <span className="text-xs text-orange-600">
                      {getTimeRemaining(ticket.expires_at)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code (placeholder) */}
        <div className="ml-4 flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500 text-center">QR</span>
          </div>
        </div>
      </div>

      {/* Footer avec référence de paiement */}
      {ticket.payment_reference && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Référence: {ticket.payment_reference}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterOptionsProps {
  filters: {
    status: string;
    userId: string;
    page: number;
    limit: number;
  };
  onFilterChange: (key: string, value: string | number) => void;
  totalTickets: number;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ filters, onFilterChange, totalTickets }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Filtre par statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Tous</option>
            <option value="active">Actif</option>
            <option value="used">Utilisé</option>
            <option value="expired">Expiré</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        {/* Filtre par utilisateur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Utilisateur
          </label>
          <input
            type="number"
            value={filters.userId}
            onChange={(e) => onFilterChange('userId', e.target.value)}
            placeholder="ID utilisateur..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Nombre par page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Par page
          </label>
          <select
            value={filters.limit}
            onChange={(e) => onFilterChange('limit', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Informations */}
        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            Total: {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-center">
        <p className="text-sm text-gray-700">
          Page {currentPage} sur {totalPages}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Précédent
        </button>
        
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm border rounded-md ${
              page === currentPage
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

const SotralTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SotralTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    page: 1,
    limit: 50
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.userId && { userId: parseInt(filters.userId) })
      };
      
      const response = await SotralService.getAllTickets(params);
      setTickets(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors du chargement des tickets');
      console.error('Error loading SOTRAL tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset to page 1 when changing filters
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Statistiques rapides
  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const usedTickets = tickets.filter(t => t.status === 'used').length;
  const expiredTickets = tickets.filter(t => t.status === 'expired').length;
  const totalRevenue = tickets.reduce((sum, t) => sum + t.price_paid_fcfa, 0);

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
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadTickets}
              className="mt-2 bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets SOTRAL</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestion et suivi des tickets de transport
            </p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{activeTickets}</div>
            <div className="text-sm text-blue-600">Tickets actifs</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{usedTickets}</div>
            <div className="text-sm text-green-600">Tickets utilisés</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{expiredTickets}</div>
            <div className="text-sm text-red-600">Tickets expirés</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {SotralService.formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-purple-600">Revenus (page actuelle)</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <FilterOptions
        filters={filters}
        onFilterChange={handleFilterChange}
        totalTickets={pagination.total}
      />

      {/* Liste des tickets */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun ticket trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default SotralTickets;