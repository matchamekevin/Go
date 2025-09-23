import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Shield, ShieldCheck, Users } from 'lucide-react';
import { UserService } from '../services/userService';
import { User } from '../types/api';
import { toast } from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        role: filterStatus !== 'all' ? filterStatus : undefined
      });

      if (response.success && response.data) {
        setUsers(response.data.items);
        setTotalPages(response.data.totalPages);
      } else {
        console.warn('Aucune donnée utilisateur reçue:', response);
        setUsers([]);
        toast.error('Aucune donnée utilisateur disponible');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Ne pas afficher de toast ici car apiClient gère déjà les erreurs globalement
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await UserService.toggleUserStatus(userId);
      if (response.success) {
        toast.success('Statut utilisateur modifié');
        fetchUsers(); // Recharger la liste
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const userColumns = [
    {
      key: 'name',
      header: 'Utilisateur',
      render: (_value: string, user: User) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact',
      render: (_value: string, user: User) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-900 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            {user.email}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            {user.phone || 'Non renseigné'}
          </div>
        </div>
      )
    },
    {
      key: 'is_verified',
      header: 'Statut',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'verified' : 'unverified'} />
      )
    },
    {
      key: 'tickets',
      header: 'Tickets',
      render: () => (
        <span className="text-sm text-gray-900">0</span>
      )
    },
    {
      key: 'updated_at',
      header: 'Dernière connexion',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: any, user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleToggleStatus(user.id)}
            className={`px-3 py-1 rounded text-xs font-medium ${
              user.is_verified
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {user.is_verified ? 'Suspendre' : 'Activer'}
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les comptes utilisateurs et leurs permissions
            </p>
          </div>
        </div>
      </div>

      {/* Filters, Search & Add User Button */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <div className="flex gap-2 items-center">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46] text-black bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="verified">Vérifiés</option>
              <option value="unverified">Non vérifiés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total"
          value={users.length}
          icon={Users}
        />
        <StatsCard
          title="Vérifiés"
          value={users.filter(u => u.is_verified === true).length}
          icon={ShieldCheck}
        />
        <StatsCard
          title="Non vérifiés"
          value={users.filter(u => u.is_verified === false).length}
          icon={Shield}
        />
        <StatsCard
          title="Admins"
          value={users.filter(u => u.email?.includes('admin')).length}
          icon={ShieldCheck}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Liste des utilisateurs</h3>
        </div>
        <DataTable
          data={users}
          columns={userColumns}
          loading={loading}
          emptyMessage="Aucun utilisateur trouvé"
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
      />
    </div>
  );
};

export default UsersPage;
