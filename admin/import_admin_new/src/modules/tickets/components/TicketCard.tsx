import React from 'react';
import { Check, Clock, User } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface Ticket {
  uuid: string;
  userEmail?: string;
  isUsed: boolean;
  createdAt: string;
  validatedAt?: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onValidate: () => void;
  isValidating?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onValidate, 
  isValidating = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">
            {ticket.uuid.slice(0, 8)}...
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="w-4 h-4 text-gray-400 mr-2" />
          <div className="text-sm text-gray-900">
            {ticket.userEmail || 'N/A'}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          ticket.isUsed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {ticket.isUsed ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Utilisé
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 mr-1" />
              En attente
            </>
          )}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(ticket.createdAt)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {!ticket.isUsed && (
          <Button
            onClick={onValidate}
            size="sm"
            disabled={isValidating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isValidating ? 'Validation...' : 'Valider'}
          </Button>
        )}
        {ticket.isUsed && ticket.validatedAt && (
          <span className="text-xs text-gray-500">
            Validé le {formatDate(ticket.validatedAt)}
          </span>
        )}
      </td>
    </tr>
  );
};