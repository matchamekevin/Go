import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'active':
      case 'actif':
      case 'verified':
      case 'vérifié':
        return {
          label: 'Actif',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'suspended':
      case 'suspendu':
        return {
          label: 'Compte suspendu',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'inactive':
      case 'inactif':
        return {
          label: 'Inactif',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'unverified':
      case 'non vérifié':
      case 'non-verifié':
      case 'non-verifie':
      case 'nonverifie':
        return {
          label: 'Compte non vérifié',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'pending':
      case 'en attente':
        return {
          label: 'En attente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'used':
      case 'utilisé':
      case 'completed':
      case 'terminé':
        return {
          label: 'Utilisé',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'expired':
      case 'expiré':
        return {
          label: 'Expiré',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'cancelled':
      case 'annulé':
        return {
          label: 'Annulé',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;