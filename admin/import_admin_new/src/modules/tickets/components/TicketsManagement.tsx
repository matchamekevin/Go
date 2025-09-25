import React, { useState } from 'react';
import { useTicketsQueries } from '../hooks/useTicketsQueries';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { TicketCard } from './TicketCard';
import { Plus, Search, Filter, Download } from 'lucide-react';

export const TicketsManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const { 
    useGetTickets, 
    useValidateTicket,
    useGetTicketStats 
  } = useTicketsQueries();
  
  const { data: tickets = [], isLoading, error } = useGetTickets();
  const { data: stats } = useGetTicketStats();
  const validateTicketMutation = useValidateTicket();

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.uuid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'used' && ticket.isUsed) ||
                         (selectedStatus === 'unused' && !ticket.isUsed);
    
    return matchesSearch && matchesStatus;
  });

  const handleValidateTicket = (ticketId: string) => {
    validateTicketMutation.mutate(ticketId);
  };

  const exportTickets = () => {
    // Logic to export tickets to CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "UUID,Email,Utilisé,Date création,Date validation\n" +
      tickets.map(ticket => 
        `${ticket.uuid},${ticket.userEmail},${ticket.isUsed ? 'Oui' : 'Non'},${ticket.createdAt},${ticket.validatedAt || ''}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tickets_sotral.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Erreur lors du chargement des tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tickets</h1>
          <p className="text-gray-600">Gérez et validez les tickets SOTRAL</p>
        </div>
        <Button
          onClick={exportTickets}
          variant="secondary"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total tickets</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.total || tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Tickets utilisés</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats?.used || tickets.filter(t => t.isUsed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Tickets non utilisés</h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats?.unused || tickets.filter(t => !t.isUsed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Taux d'utilisation</h3>
          <p className="text-2xl font-bold text-purple-600">
            {tickets.length > 0 ? Math.round((tickets.filter(t => t.isUsed).length / tickets.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par UUID ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les tickets</option>
          <option value="used">Utilisés</option>
          <option value="unused">Non utilisés</option>
        </select>
      </div>

      {/* Liste des tickets */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.uuid}
                  ticket={ticket}
                  onValidate={() => handleValidateTicket(ticket.uuid)}
                  isValidating={validateTicketMutation.isLoading}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Aucun ticket trouvé avec ces filtres' 
                : 'Aucun ticket disponible'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};