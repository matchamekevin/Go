import React, { useState } from 'react';
import { Search, Filter, Download, CreditCard, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const payments = [
    {
      id: 1,
      transactionId: 'TXN-2024-001',
      user: 'Kevin Matcha',
      amount: 250,
      currency: 'FCFA',
      method: 'Orange Money',
      status: 'completed',
      date: '2024-03-15 10:30',
      ticketCode: 'TKT-2024-001',
    },
    {
      id: 2,
      transactionId: 'TXN-2024-002',
      user: 'Marie Dubois',
      amount: 500,
      currency: 'FCFA',
      method: 'Wave',
      status: 'completed',
      date: '2024-03-14 08:15',
      ticketCode: 'TKT-2024-002',
    },
    {
      id: 3,
      transactionId: 'TXN-2024-003',
      user: 'Jean Martin',
      amount: 250,
      currency: 'FCFA',
      method: 'Free Money',
      status: 'failed',
      date: '2024-03-13 14:20',
      ticketCode: null,
    },
    {
      id: 4,
      transactionId: 'TXN-2024-004',
      user: 'Sophie Laurent',
      amount: 750,
      currency: 'FCFA',
      method: 'Orange Money',
      status: 'pending',
      date: '2024-03-15 16:45',
      ticketCode: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge status-active">Réussi</span>;
      case 'pending':
        return <span className="status-badge status-pending">En attente</span>;
      case 'failed':
        return <span className="status-badge status-inactive">Échoué</span>;
      case 'cancelled':
        return <span className="status-badge status-inactive">Annulé</span>;
      default:
        return <span className="status-badge status-pending">Inconnu</span>;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Orange Money':
        return 'text-orange-600 bg-orange-100';
      case 'Wave':
        return 'text-blue-600 bg-blue-100';
      case 'Free Money':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
            <p className="mt-2 text-sm text-gray-600">
              Suivez toutes les transactions et revenus
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn btn-secondary flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Rapport
            </button>
            <button className="btn btn-secondary flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID transaction, utilisateur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Réussis</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoués</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-semibold text-gray-900">{totalRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paiements réussis</p>
              <p className="text-2xl font-semibold text-gray-900">{completedPayments}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingPayments}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Échoués</p>
              <p className="text-2xl font-semibold text-gray-900">{failedPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-medium text-gray-900">Liste des transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(payment.method)}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{payment.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.ticketCode ? (
                      <div className="text-sm text-blue-600 hover:text-blue-900 cursor-pointer">
                        {payment.ticketCode}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Précédent
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">{payments.length}</span> sur{' '}
              <span className="font-medium">{payments.length}</span> résultats
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Précédent
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
