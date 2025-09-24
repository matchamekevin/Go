import React, { useState, useEffect, useMemo } from 'react';
import {
  Power,
  RefreshCw,
  Plus,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Ticket,
  Bus,
  XCircle,
  Info
} from 'lucide-react';
import SotralTicketManagementPage from './SotralTicketManagementPage';
import toast from 'react-hot-toast';
import { SotralLine } from '../services/sotralService';
import StatsCards from '../components/StatsCards';
import LineTable from '../components/LineTable';
import ErrorDisplay from '../components/ErrorDisplay';
import { useSotralLines } from '../hooks/useSotralLines';
import { useSotralStops } from '../hooks/useSotralStops';
import { useSotralStats } from '../hooks/useSotralStats';

// Le type SotralStop et LineStats ne sont pas utilisés directement ici;
// les hooks fournissent déjà les données typées.

const SotralManagementPage: React.FC = () => {
  const [suspendedLines, setSuspendedLines] = useState<SotralLine[]>([]);
  const [showTicketManagement, setShowTicketManagement] = useState(false);

  // Charger les lignes suspendues depuis localStorage au démarrage
  useEffect(() => {
    const savedSuspended = localStorage.getItem('sotral_suspended_lines');
    if (savedSuspended) {
      try {
        const parsedSuspended = JSON.parse(savedSuspended);
        setSuspendedLines(parsedSuspended);
      } catch (error) {
        console.error('Erreur lors du chargement des lignes suspendues:', error);
        localStorage.removeItem('sotral_suspended_lines');
      }
    }
  }, []);

  // Use custom hooks for API calls
  const { lines: apiLines, loading: linesLoading, error: linesError, loadLines } = useSotralLines();
  const { stops, loading: stopsLoading, error: stopsError, loadStops } = useSotralStops();
  const { stats, loading: statsLoading, error: statsError, loadStats } = useSotralStats();

  // Calculer les lignes affichées - utiliser uniquement les données de l'API
  const lines = useMemo(() => {
    // Utiliser les données de l'API uniquement
    if (apiLines.length > 0) {
      const mergedLines = [...apiLines];

      // Appliquer les statuts suspendus
      suspendedLines.forEach(suspendedLine => {
        const existingIndex = mergedLines.findIndex(line => line.id === suspendedLine.id);
        if (existingIndex >= 0) {
          // Mettre à jour la ligne existante avec le statut suspendu
          mergedLines[existingIndex] = { ...mergedLines[existingIndex], is_active: false };
        }
      });

      return mergedLines;
    }

    // Pas de données API disponibles - retourner un tableau vide
    console.warn('Aucune donnée API disponible pour les lignes');
    return [];
  }, [apiLines, suspendedLines]);

  const loading = linesLoading || stopsLoading || statsLoading;
  const apiError = linesError || stopsError || statsError;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<SotralLine | null>(null);
  const [formData, setFormData] = useState({
    line_number: '',
    name: '',
    route_from: '',
    route_to: '',
    category_id: '1', // Par défaut catégorie ordinaire
    distance_km: '',
    stops_count: ''
  });

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  const refreshData = async () => {
    await Promise.all([loadLines(), loadStops(), loadStats()]);
  };

  const toggleLineStatus = async (lineId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines/${lineId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        refreshData(); // Refresh all data
      } else {
        showErrorToast('Erreur lors du changement de statut');
      }
    } catch (error) {
      showErrorToast('Erreur de connexion');
    }
  };

  const deleteLine = async (lineId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines/${lineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Ligne supprimée avec succès');
        setIsDeleteModalOpen(false);
        setSelectedLine(null);
        refreshData(); // Refresh all data
      } else {
        showErrorToast('Erreur lors de la suppression de la ligne');
      }
    } catch (error) {
      showErrorToast('Erreur lors de la suppression');
    }
  };

  const updateLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLine) return;

    try {
      const lineData = {
        line_number: parseInt(formData.line_number),
        name: formData.name.trim(),
        route_from: formData.route_from.trim(),
        route_to: formData.route_to.trim(),
        category_id: parseInt(formData.category_id),
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        stops_count: formData.stops_count ? parseInt(formData.stops_count) : null
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines/${selectedLine.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lineData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Ligne modifiée avec succès');
        setIsEditModalOpen(false);
        setSelectedLine(null);
        refreshData(); // Refresh all data
      } else {
        showErrorToast('Erreur lors de la modification de la ligne');
      }
    } catch (error) {
      showErrorToast('Erreur lors de la modification');
    }
  };

  const handleCreateLine = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const lineData = {
        line_number: parseInt(formData.line_number),
        name: formData.name.trim(),
        route_from: formData.route_from.trim(),
        route_to: formData.route_to.trim(),
        category_id: parseInt(formData.category_id),
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
        stops_count: formData.stops_count ? parseInt(formData.stops_count) : undefined,
        is_active: true
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lineData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setIsCreateModalOpen(false);
        setFormData({
          line_number: '',
          name: '',
          route_from: '',
          route_to: '',
          category_id: '1',
          distance_km: '',
          stops_count: ''
        });
        refreshData(); // Refresh all data
      } else {
        showErrorToast('Erreur lors de la création de la ligne');
      }
    } catch (error) {
      showErrorToast('Erreur lors de la création de la ligne');
    }
  };

  const resetForm = () => {
    setFormData({
      line_number: '',
      name: '',
      route_from: '',
      route_to: '',
      category_id: '1',
      distance_km: '',
      stops_count: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (line: SotralLine) => {
    setSelectedLine(line);
    setFormData({
      line_number: line.line_number.toString(),
      name: line.name,
      route_from: line.route_from,
      route_to: line.route_to,
      category_id: line.category_id?.toString() || '1',
      distance_km: line.distance_km?.toString() || '',
      stops_count: line.stops_count?.toString() || ''
    });
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
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#065f46] mx-auto mb-4"></div>
          <p className="text-[#065f46] font-semibold">Chargement des données SOTRAL...</p>
        </div>
      </div>
    );
  }

  // Navigation conditionnelle vers la gestion des tickets
  if (showTicketManagement) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => setShowTicketManagement(false)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Retour à la gestion des lignes
          </button>
        </div>
        <SotralTicketManagementPage />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion SOTRAL</h1>
          <p className="text-gray-600 mt-1">
            Gérez les lignes de transport et les trajets
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTicketManagement(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Ticket className="h-5 w-5 mr-2" />
            Gestion Tickets
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle ligne
          </button>
          <button
            onClick={refreshData}
            className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
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
        onDetailsClick={openDetailsModal}
      />



      {/* Modal de création de ligne */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="glass-container p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Plus className="h-6 w-6 mr-3 text-green-600" />
                Créer une nouvelle ligne
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateLine} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Numéro de ligne *
                </label>
                <input
                  type="number"
                  name="line_number"
                  value={formData.line_number}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="input text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Nom de la ligne *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Départ *
                  </label>
                  <input
                    type="text"
                    name="route_from"
                    value={formData.route_from}
                    onChange={handleInputChange}
                    required
                    className="input text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Arrivée *
                  </label>
                  <input
                    type="text"
                    name="route_to"
                    value={formData.route_to}
                    onChange={handleInputChange}
                    required
                    className="input text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                >
                  <option value="" disabled>Sélectionnez une catégorie</option>
                  <option value="1">Ordinaire</option>
                  <option value="2">Lignes étudiantes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    name="distance_km"
                    value={formData.distance_km}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="input text-gray-900"
                    placeholder="Ex: 12.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Nombre d'arrêts
                  </label>
                  <input
                    type="number"
                    name="stops_count"
                    value={formData.stops_count}
                    onChange={handleInputChange}
                    min="1"
                    className="input text-gray-900"
                    placeholder="Ex: 25"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-success-dark flex-1"
                >
                  Créer la ligne
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="btn-danger flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails et actions */}
      {isDetailsModalOpen && selectedLine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="glass-container p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bus className="h-8 w-8 mr-3 text-blue-600" />
                Ligne {selectedLine.line_number} - {selectedLine.name}
              </h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Informations générales
                  </h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Numéro de ligne:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{selectedLine.line_number}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Nom:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{selectedLine.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Catégorie:</dt>
                      <dd className="text-sm font-semibold">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedLine.category?.name === 'Lignes étudiantes' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedLine.category?.name || 'Ordinaire'}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Statut:</dt>
                      <dd className="text-sm font-semibold">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedLine.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedLine.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Itinéraire et caractéristiques
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Départ:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{selectedLine.route_from}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Arrivée:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{selectedLine.route_to}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Distance:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{selectedLine.distance_km} km</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Nombre d'arrêts:</dt>
                      <dd className="text-sm font-semibold text-gray-900">{selectedLine.stops_count}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openEditModal(selectedLine);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Modifier
                </button>

                <button
                  onClick={() => toggleLineStatus(selectedLine.id)}
                  className={`flex items-center justify-center px-4 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    selectedLine.is_active
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Power className="h-5 w-5 mr-2" />
                  {selectedLine.is_active ? 'Suspendre' : 'Activer'}
                </button>

                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openDeleteModal(selectedLine);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeAllModals}
                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {isDeleteModalOpen && selectedLine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="glass-container p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                Confirmer la suppression
              </h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Action irréversible
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Êtes-vous sûr de vouloir supprimer la ligne <strong>{selectedLine.name}</strong> (Ligne {selectedLine.line_number}) ?
                      </p>
                      <p className="mt-2">
                        Cette action supprimera définitivement la ligne et toutes les données associées.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Détails de la ligne :</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Numéro :</dt>
                    <dd className="text-sm font-medium text-gray-900">{selectedLine.line_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Nom :</dt>
                    <dd className="text-sm font-medium text-gray-900">{selectedLine.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Itinéraire :</dt>
                    <dd className="text-sm font-medium text-gray-900">{selectedLine.route_from} ↔ {selectedLine.route_to}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Statut :</dt>
                    <dd className="text-sm font-medium">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedLine.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedLine.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => deleteLine(selectedLine.id)}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </button>
                <button
                  onClick={closeAllModals}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-200 flex-1"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {isEditModalOpen && selectedLine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="glass-container p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Edit className="h-6 w-6 mr-3 text-blue-600" />
                Modifier la ligne
              </h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={updateLine} className="space-y-6">
              {apiError && (
                <div className={`border rounded-lg p-4 mb-4 ${
                  apiError.type === 'auth' ? 'bg-red-50 border-red-200' :
                  apiError.type === 'server' ? 'bg-orange-50 border-orange-200' :
                  apiError.type === 'validation' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {apiError.type === 'auth' && <XCircle className="h-5 w-5 text-red-400" />}
                      {apiError.type === 'server' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
                      {apiError.type === 'validation' && <Info className="h-5 w-5 text-yellow-400" />}
                      {apiError.type === 'network' && <XCircle className="h-5 w-5 text-red-400" />}
                      {apiError.type === 'not_found' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        apiError.type === 'auth' ? 'text-red-800' :
                        apiError.type === 'server' ? 'text-orange-800' :
                        apiError.type === 'validation' ? 'text-yellow-800' :
                        apiError.type === 'network' ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {apiError.message}
                      </h3>
                      <div className={`mt-2 text-sm ${
                        apiError.type === 'auth' ? 'text-red-700' :
                        apiError.type === 'server' ? 'text-orange-700' :
                        apiError.type === 'validation' ? 'text-yellow-700' :
                        apiError.type === 'network' ? 'text-red-700' :
                        'text-blue-800'
                      }`}>
                        <p>{apiError.details}</p>
                        {apiError.suggestion && (
                          <p className="mt-1 font-medium">{apiError.suggestion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Numéro de ligne *
                </label>
                <input
                  type="number"
                  name="line_number"
                  value={formData.line_number}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="input text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Nom de la ligne *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Départ *
                  </label>
                  <select
                    name="route_from"
                    value={formData.route_from}
                    onChange={handleInputChange}
                    required
                    className="input text-gray-900"
                  >
                    <option value="" disabled>Sélectionnez un arrêt de départ</option>
                    {stops.map((stop) => (
                      <option key={stop.id} value={stop.name}>
                        {stop.name} {stop.is_major_stop && '(Principal)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Arrivée *
                  </label>
                  <select
                    name="route_to"
                    value={formData.route_to}
                    onChange={handleInputChange}
                    required
                    className="input text-gray-900"
                  >
                    <option value="" disabled>Sélectionnez un arrêt d'arrivée</option>
                    {stops.map((stop) => (
                      <option key={stop.id} value={stop.name}>
                        {stop.name} {stop.is_major_stop && '(Principal)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                >
                  <option value="" disabled>Sélectionnez une catégorie</option>
                  <option value="1">Ordinaire</option>
                  <option value="2">Lignes étudiantes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    name="distance_km"
                    value={formData.distance_km}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="input text-gray-900"
                    placeholder="Ex: 12.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Nombre d'arrêts
                  </label>
                  <input
                    type="number"
                    name="stops_count"
                    value={formData.stops_count}
                    onChange={handleInputChange}
                    min="1"
                    className="input text-gray-900"
                    placeholder="Ex: 25"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-success flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Modifier la ligne
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="btn-danger flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SotralManagementPage;