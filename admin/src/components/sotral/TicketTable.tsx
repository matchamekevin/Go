import React from 'react';
import { SotralTicketWithDetails, TicketStatus } from '../../types/sotral';
import { Eye, Download, Calendar, User, CreditCard } from 'lucide-react';

interface TicketTableProps {
  tickets: SotralTicketWithDetails[];
  loading: boolean;
  onViewDetails: (ticket: SotralTicketWithDetails) => void;
  onDownloadQR: (ticket: SotralTicketWithDetails) => void;
}

const getStatusColor = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.ACTIVE:
      return 'bg-green-100 text-green-800 border-green-200';
    case TicketStatus.USED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case TicketStatus.EXPIRED:
      return 'bg-red-100 text-red-800 border-red-200';
    case TicketStatus.CANCELLED:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  loading,
  onViewDetails,
  onDownloadQR
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Chargement des tickets...</span>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 mb-4">
          <CreditCard className="h-12 w-12 mx-auto mb-2" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ticket trouvé</h3>
        <p className="text-gray-500">
          Aucun ticket ne correspond aux critères de recherche actuels.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ligne
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voyages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {ticket.ticket_code}
                      </div>
                      {ticket.user_id && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          User {ticket.user_id}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.line_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ligne {ticket.line_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{ticket.ticket_type_name}</div>
                  <div className="text-xs text-gray-500">{ticket.ticket_type_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(ticket.price_paid_fcfa)} FCFA
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status as TicketStatus)}`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ticket.trips_remaining} restant(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(ticket.expires_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(ticket)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDownloadQR(ticket)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Télécharger QR Code"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};