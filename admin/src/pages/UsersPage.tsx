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
import UserActionsModal from '../components/UserActionsModal';

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

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

  const openActionsForUser = (user: User) => {
    setSelectedUser(user);
    setActionsModalOpen(true);
  };

  const onActionComplete = () => {
    fetchUsers();
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
      key: 'is_suspended',
      header: 'Statut',
      render: (_value: boolean, user: User) => (
        <StatusBadge status={user.is_suspended ? 'suspended' : 'active'} />
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
  ];

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
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

        {/* Notification temporaire */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Fonctionnalité de suspension améliorée
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  La suspension d'utilisateurs utilise temporairement la fonction de changement de statut. 
                  Les corrections complètes seront disponibles après le redéploiement du serveur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters, Search & Add User Button */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
            className="flex-1"
          />
          <div className="flex gap-2 items-center">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46] text-black bg-white"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tous les statuts</option>
              <option value="verified">Vérifiés</option>
              <option value="unverified">Non vérifiés</option>
              <option value="suspended">Suspendus</option>
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
        {/* Admins card removed to avoid confusing "Admins 0" display */}
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
          onRowClick={(user) => openActionsForUser(user)}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
      />

      <UserActionsModal
        user={selectedUser}
        isOpen={actionsModalOpen}
        onClose={() => { setActionsModalOpen(false); setSelectedUser(null); }}
        onActionComplete={onActionComplete}
      />
    </div>
  );
};

export default UsersPage;
