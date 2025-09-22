import React, { useState } from 'react';
import { Filter, Download, QrCode, Eye, MoreVertical } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';

const TicketsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const tickets = [
    {
      id: 1,
      code: 'TKT-2024-001',
      user: 'Kevin Matcha',
      product: 'Ticket Simple',
      route: 'Dakar - Pikine',
      status: 'active',
      purchaseDate: '2024-03-15 10:30',
      validUntil: '2024-03-15 23:59',
      price: '250 FCFA',
      used: false,
    },
    {
      id: 2,
      code: 'TKT-2024-002',
      user: 'Marie Dubois',
      product: 'Ticket Journée',
      route: 'Dakar - Guédiawaye',
      status: 'used',
      purchaseDate: '2024-03-14 08:15',
      validUntil: '2024-03-14 23:59',
      price: '500 FCFA',
      used: true,
      usedAt: '2024-03-14 16:45',
    },
    {
      id: 3,
      code: 'TKT-2024-003',
      user: 'Jean Martin',
      product: 'Ticket Simple',
      route: 'Pikine - Dakar',
      status: 'expired',
      purchaseDate: '2024-03-13 14:20',
      validUntil: '2024-03-13 23:59',
      price: '250 FCFA',
      used: false,
    },
  ];

  const ticketColumns = [
    {
      key: 'code',
      header: 'Code ticket',
      render: (value: string) => (
        <div className="flex items-center">
          <QrCode className="h-5 w-5 text-gray-400 mr-2" />
          <div className="text-sm font-medium text-gray-900">{value}</div>
        </div>
      )
    },
    {
      key: 'user',
      header: 'Utilisateur',
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'product',
      header: 'Produit',
      render: (value: string) => (
        <div className="text-sm text-gray-900">{value}</div>
      )
    },
    {
      key: 'route',
      header: 'Route',
      render: (value: string) => (
        <div className="text-sm text-gray-900">{value}</div>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      render: (value: string) => (
        <StatusBadge status={value} />
      )
    },
    {
      key: 'price',
      header: 'Prix',
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'purchaseDate',
      header: 'Date d\'achat',
      render: (value: string, ticket: any) => (
        <div>
          <div className="text-sm text-gray-500">{value}</div>
          {ticket.used && ticket.usedAt && (
            <div className="text-xs text-green-600">Utilisé: {ticket.usedAt}</div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: any, _ticket: any) => (
        <div className="flex items-center space-x-2">
          <button
            className="text-blue-600 hover:text-blue-900"
            title="Voir QR Code"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            className="text-gray-600 hover:text-gray-900"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des tickets</h1>
            <p className="mt-2 text-sm text-gray-600">
              Visualisez et gérez tous les tickets vendus
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn btn-secondary flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Exporter
            </button>
            <button className="btn btn-secondary flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtres avancés
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            placeholder="Rechercher par code, utilisateur ou route..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46] text-black bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="used">Utilisés</option>
              <option value="expired">Expirés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total tickets"
          value={tickets.length}
          icon={QrCode}
        />
        <StatsCard
          title="Actifs"
          value={tickets.filter(t => t.status === 'active').length}
          icon={QrCode}
        />
        <StatsCard
          title="Utilisés"
          value={tickets.filter(t => t.status === 'used').length}
          icon={QrCode}
        />
        <StatsCard
          title="Expirés"
          value={tickets.filter(t => t.status === 'expired').length}
          icon={QrCode}
        />
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Liste des tickets</h3>
        </div>
        <DataTable
          data={tickets}
          columns={ticketColumns}
          emptyMessage="Aucun ticket trouvé"
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        className="mt-6"
      />
    </div>
  );
};

export default TicketsPage;
