import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useSotralLines } from '../hooks/useSotralLines';
import { useSotralStats } from '../hooks/useSotralStats';
import StatsCards from '../components/StatsCards';
import LineTable from '../components/LineTable';
import ErrorDisplay from '../components/ErrorDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateLineModal from '../components/sotral/CreateLineModal';
import EditLineModal from '../components/sotral/EditLineModal';
import DeleteLineModal from '../components/sotral/DeleteLineModal';
import LineDetailsModal from '../components/sotral/LineDetailsModal';
import { SotralLine } from '../types/sotral';

const SotralManagementPage: React.FC = () => {
  // Use custom hooks for data management
  const {
    lines,
    loading: linesLoading,
    error: linesError,
    isUsingCache,
    createLine,
    updateLine,
    deleteLine,
    toggleLineStatus,
    refresh: refreshLines
  } = useSotralLines();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    loadStats
  } = useSotralStats();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<SotralLine | null>(null);

  const loading = linesLoading || statsLoading;
  const apiError = linesError || statsError;

  const refreshData = async () => {
    await Promise.all([refreshLines(), loadStats()]);
  };

  const handleCreateLine = async (lineData: Partial<SotralLine>) => {
    const result = await createLine(lineData);
    if (result.success) {
      setIsCreateModalOpen(false);
    }
    return result;
  };

  const handleUpdateLine = async (id: number, lineData: Partial<SotralLine>) => {
    const result = await updateLine(id, lineData);
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedLine(null);
    }
    return result;
  };

  const handleDeleteLine = async (id: number) => {
    const result = await deleteLine(id);
    if (result.success) {
      setIsDeleteModalOpen(false);
      setSelectedLine(null);
    }
    return result;
  };

  const handleToggleLineStatus = async (id: number) => {
    return await toggleLineStatus(id);
  };

  const openCreateModal = () => {
    setSelectedLine(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (line: SotralLine) => {
    setSelectedLine(line);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (line: SotralLine) => {
    setSelectedLine(line);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (line: SotralLine) => {
    setSelectedLine(line);
    setIsDetailsModalOpen(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedLine(null);
  };

  if (loading && !lines.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des données SOTRAL..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Gestion SOTRAL
            {isUsingCache && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Données en cache
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les lignes de transport et les trajets
            {isUsingCache && (
              <span className="block text-sm text-yellow-600 mt-1">
                Les données affichées proviennent du cache local en raison d'une erreur de connexion.
                <button
                  onClick={refreshData}
                  className="ml-2 text-yellow-700 underline hover:text-yellow-800 font-medium"
                >
                  Actualiser maintenant
                </button>
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={openCreateModal}
            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle ligne
          </button>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:bg-green-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Error Display */}
      <ErrorDisplay error={apiError} />

      {/* Statistiques */}
      <StatsCards stats={stats} />

      {/* Tableau des lignes */}
      <LineTable
        lines={lines}
        loading={linesLoading}
        onDetailsClick={openDetailsModal}
        onEditClick={openEditModal}
        onDeleteClick={openDeleteModal}
        onToggleStatus={handleToggleLineStatus}
      />

      {/* Modals */}
      <CreateLineModal
        isOpen={isCreateModalOpen}
        onClose={closeAllModals}
        onSubmit={handleCreateLine}
      />

      <EditLineModal
        isOpen={isEditModalOpen}
        onClose={closeAllModals}
        onSubmit={handleUpdateLine}
        line={selectedLine}
      />

      <DeleteLineModal
        isOpen={isDeleteModalOpen}
        onClose={closeAllModals}
        onConfirm={handleDeleteLine}
        line={selectedLine}
      />

      <LineDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeAllModals}
        line={selectedLine}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onToggleStatus={handleToggleLineStatus}
      />
    </div>
  );
};

export default SotralManagementPage;