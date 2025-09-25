import React, { useState } from 'react';
import {
  Power,
  RefreshCw,
  Plus,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Bus,
  XCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SotralLine } from '../services/sotralService';
import StatsCards from '../components/StatsCards';
import LineTable from '../components/LineTable';
import ErrorDisplay from '../components/ErrorDisplay';
import { useSotralLines } from '../hooks/useSotralLines';
import { useSotralStops } from '../hooks/useSotralStops';
import { useSotralStats } from '../hooks/useSotralStats';
import { adminSotralService } from '../services/adminSotralService';

// Le type SotralStop et LineStats ne sont pas utilisés directement ici;
// les hooks fournissent déjà les données typées.

const SotralManagementPage: React.FC = () => {
  // Use custom hooks for API calls
  const { lines: apiLines, loading: linesLoading, error: linesError, loadLines, isUsingCache } = useSotralLines();
  const { loading: stopsLoading, error: stopsError, loadStops } = useSotralStops();
  const { stats, loading: statsLoading, error: statsError, loadStats } = useSotralStats();

  // Les lignes viennent directement de l'API (toutes, actives et inactives)
  const lines = apiLines;

  // Listes de sélection indépendantes (ne changent pas avec les actions sur la table)
  // Basées sur les lignes canoniques + possibilité de saisie libre
  const selectionOptions = {
    lineNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    lineNames: [
      'Zanguéra ↔ BIA (Centre-ville)',
      'Adétikopé ↔ REX (front de mer)', 
      'Akato ↔ BIA',
      'Agoè-Assiyéyé ↔ BIA',
      'Kpogan ↔ BIA',
      'Djagblé ↔ REX',
      'Legbassito ↔ BIA',
      'Attiegouvi ↔ REX',
      'Entreprise de l\'Union ↔ BIA',
      'Adétikopé ↔ Campus (Université)',
      'Legbassito ↔ Campus',
      'Zanguéra ↔ Campus',
      'Akato ↔ Campus',
      'Adjalolo ↔ Campus',
      'Adakpamé ↔ Campus',
      'Akodesséwa-Bè ↔ Campus',
      'Avépozo ↔ Campus',
      'Entreprise de l\'Union ↔ Campus',
      'Djagblé ↔ Campus'
    ],
    routePoints: [
      'Zanguéra', 'BIA', 'Adétikopé', 'REX', 'Akato', 'Agoè-Assiyéyé', 
      'Kpogan', 'Djagblé', 'Legbassito', 'Attiegouvi', 'Entreprise de l\'Union',
      'Campus', 'Adjalolo', 'Adakpamé', 'Akodesséwa-Bè', 'Avépozo'
    ].sort(),
    distances: [9.5, 11.0, 11.1, 13.0, 13.2, 15.3, 16.3, 16.4, 17.3, 17.8, 18.0, 18.9, 19.2, 19.4, 19.7, 24.2, 24.5],
    stopsCounts: [38, 40, 41, 43, 45, 49, 51, 56, 58, 60, 62, 64, 66, 68, 71, 74]
  };

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

  const [togglingLines, setTogglingLines] = useState<Set<number>>(new Set());

  // keep toggleLineStatus for real backend toggles (used in other places)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleLineStatus = async (lineId: number) => {
    if (togglingLines.has(lineId)) return; // Éviter les clics multiples

    try {
      setTogglingLines(prev => new Set(prev).add(lineId));

      const result = await adminSotralService.toggleLineStatus(lineId);

      if (result.success) {
        toast.success(result.message || 'Statut de la ligne mis à jour avec succès');
        refreshData(); // Refresh all data
      } else {
        showErrorToast(result.error || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      showErrorToast('Erreur de connexion');
    } finally {
      setTogglingLines(prev => {
        const newSet = new Set(prev);
        newSet.delete(lineId);
        return newSet;
      });
    }
  };

  // Expose for debugging / other pages when needed (avoid unused warning)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).toggleLineStatus = toggleLineStatus;
  } catch (e) {
    // ignore in non-browser envs
  }

  // Toggle suspension locally (does not call backend) — used for temporary suspension without affecting tickets on mobile
  const toggleLocalSuspend = (line: SotralLine) => {
    // First attempt backend toggle (preferred). If backend fails, fallback to local suspension.
    (async () => {
      try {
        const result = await adminSotralService.toggleLineStatus(line.id);
        if (result && result.success) {
          toast.success(result.message || `Statut de la ligne ${line.line_number} mis à jour`);
          refreshData();
          return;
        }
      } catch (err) {
        console.warn('toggleLineStatus backend failed, fallback to local suspend', err);
      }

      // Backend failed or returned an error -> fallback local
      try {
        const raw = localStorage.getItem('sotral_suspended_lines');
        const current: SotralLine[] = raw ? JSON.parse(raw) : [];
        const exists = current.find(l => l.id === line.id);

        let updated: SotralLine[];
        if (exists) {
          updated = current.filter(l => l.id !== line.id);
          toast.success(`Suspension locale retirée pour la ligne ${line.line_number}`);
        } else {
          updated = [...current, { ...line, is_active: false }];
          toast.success(`Ligne ${line.line_number} suspendue localement`);
        }

        localStorage.setItem('sotral_suspended_lines', JSON.stringify(updated));
        refreshData();
      } catch (e) {
        console.error('Erreur lors de la suspension locale fallback:', e);
        toast.error('Impossible de suspendre la ligne');
      }
    })();
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
      // Validation des champs requis
      if (!formData.line_number || isNaN(Number(formData.line_number))) {
        showErrorToast('Le numéro de ligne est requis et doit être un nombre valide');
        return;
      }

      if (!formData.name?.trim()) {
        showErrorToast('Le nom de la ligne est requis');
        return;
      }

      if (!formData.route_from?.trim()) {
        showErrorToast('Le point de départ est requis');
        return;
      }

      if (!formData.route_to?.trim()) {
        showErrorToast('Le point d\'arrivée est requis');
        return;
      }

      if (!formData.category_id || isNaN(Number(formData.category_id))) {
        showErrorToast('La catégorie est requise');
        return;
      }

      const lineData = {
        line_number: Number(formData.line_number),
        name: formData.name.trim(),
        route_from: formData.route_from.trim(),
        route_to: formData.route_to.trim(),
        category_id: Number(formData.category_id),
        distance_km: formData.distance_km ? Number(formData.distance_km) : undefined,
        stops_count: formData.stops_count ? Number(formData.stops_count) : undefined
      };

      // Validation supplémentaire des valeurs numériques
      if (lineData.distance_km !== undefined && (isNaN(lineData.distance_km) || lineData.distance_km <= 0)) {
        showErrorToast('La distance doit être un nombre positif');
        return;
      }

      if (lineData.stops_count !== undefined && (isNaN(lineData.stops_count) || lineData.stops_count <= 0)) {
        showErrorToast('Le nombre d\'arrêts doit être un nombre positif');
        return;
      }

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
        refreshData();
      } else {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
          if (errorData.error && errorData.error.includes('duplicate key value')) {
            showErrorToast('Ce numéro de ligne existe déjà. Veuillez choisir un numéro unique.');
          } else {
            showErrorToast(errorData.error || 'Erreur lors de la modification de la ligne');
          }
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showErrorToast('Erreur lors de la modification de la ligne');
    }
  };

  const handleCreateLine = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Vérifier localement que le numéro de ligne n'existe pas déjà (évite erreur 409 côté serveur)
      const requestedNumber = Number(formData.line_number);
      if (apiLines && apiLines.find(l => Number(l.line_number) === requestedNumber)) {
        showErrorToast('Ce numéro de ligne existe déjà. Veuillez choisir un numéro unique.');
        return;
      }
      // Validation des champs requis
      if (!formData.line_number || isNaN(Number(formData.line_number))) {
        showErrorToast('Le numéro de ligne est requis et doit être un nombre valide');
        return;
      }

      if (!formData.name?.trim()) {
        showErrorToast('Le nom de la ligne est requis');
        return;
      }

      if (!formData.route_from?.trim()) {
        showErrorToast('Le point de départ est requis');
        return;
      }

      if (!formData.route_to?.trim()) {
        showErrorToast('Le point d\'arrivée est requis');
        return;
      }

      if (!formData.category_id || isNaN(Number(formData.category_id))) {
        showErrorToast('La catégorie est requise');
        return;
      }

      const lineData = {
        line_number: Number(formData.line_number),
        name: formData.name.trim(),
        route_from: formData.route_from.trim(),
        route_to: formData.route_to.trim(),
        category_id: Number(formData.category_id),
        distance_km: formData.distance_km ? Number(formData.distance_km) : undefined,
        stops_count: formData.stops_count ? Number(formData.stops_count) : undefined,
        is_active: true
      };

      // Validation supplémentaire des valeurs numériques
      if (lineData.distance_km !== undefined && (isNaN(lineData.distance_km) || lineData.distance_km <= 0)) {
        showErrorToast('La distance doit être un nombre positif');
        return;
      }

      if (lineData.stops_count !== undefined && (isNaN(lineData.stops_count) || lineData.stops_count <= 0)) {
        showErrorToast('Le nombre d\'arrêts doit être un nombre positif');
        return;
      }

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
        toast.success(result.message || 'Ligne créée avec succès');
        setIsCreateModalOpen(false);
        resetForm();
        refreshData();
      } else {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
          if (errorData.error && errorData.error.includes('duplicate key value')) {
            showErrorToast('Ce numéro de ligne existe déjà. Veuillez choisir un numéro unique.');
          } else {
            showErrorToast(errorData.error || 'Erreur lors de la création de la ligne');
          }
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
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

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Gestion SOTRAL
            {isUsingCache && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Info className="h-3 w-3 mr-1" />
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
            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle ligne
          </button>
          <button
            onClick={refreshData}
            className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full transition-all duration-200 shadow-lg"
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
                className="text-gray-400 transition-colors duration-200 p-2 rounded-lg"
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
                  value={formData.line_number || ''}
                  onChange={handleInputChange}
                  placeholder="Numéro de ligne (ex: 1, 2, 3...)"
                  list="line-numbers-datalist"
                  required
                  className="input text-gray-900"
                />
                <datalist id="line-numbers-datalist">
                  {selectionOptions.lineNumbers.map((number) => (
                    <option key={number} value={number} />
                  ))}
                </datalist>
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
                  placeholder="Nom de la ligne (ex: Zanguéra ↔ BIA)"
                  list="line-names-datalist"
                  required
                  className="input text-gray-900"
                />
                <datalist id="line-names-datalist">
                  {selectionOptions.lineNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
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
                    placeholder="Point de départ (ex: Zanguéra)"
                    list="route-from-datalist"
                    required
                    className="input text-gray-900"
                  />
                  <datalist id="route-from-datalist">
                    {selectionOptions.routePoints.map((route) => (
                      <option key={route} value={route} />
                    ))}
                  </datalist>
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
                    placeholder="Point d'arrivée (ex: BIA)"
                    list="route-to-datalist"
                    required
                    className="input text-gray-900"
                  />
                  <datalist id="route-to-datalist">
                    {selectionOptions.routePoints.map((route) => (
                      <option key={route} value={route} />
                    ))}
                  </datalist>
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
                    step="0.1"
                    name="distance_km"
                    value={formData.distance_km || ''}
                    onChange={handleInputChange}
                    placeholder="Distance en km (ex: 15.3)"
                    list="distances-datalist"
                    className="input text-gray-900"
                  />
                  <datalist id="distances-datalist">
                    {selectionOptions.distances.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Nombre d'arrêts
                  </label>
                  <input
                    type="number"
                    name="stops_count"
                    value={formData.stops_count || ''}
                    onChange={handleInputChange}
                    placeholder="Nombre d'arrêts (ex: 45)"
                    list="stops-count-datalist"
                    className="input text-gray-900"
                  />
                  <datalist id="stops-count-datalist">
                    {selectionOptions.stopsCounts.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
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
                className="text-gray-400 transition-colors duration-200 p-2 rounded-lg"
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
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Modifier
                </button>

                <button
                  onClick={() => toggleLocalSuspend(selectedLine)}
                  className={`flex items-center justify-center px-4 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    selectedLine.is_active
                      ? 'bg-orange-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  <Power className="h-5 w-5 mr-2" />
                  {selectedLine.is_active ? 'Suspendre la ligne' : 'Activer la ligne'}
                </button>

                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openDeleteModal(selectedLine);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Désactiver définitivement
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeAllModals}
                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200"
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
                className="text-gray-400 transition-colors duration-200 p-2 rounded-lg"
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
                      Action définitive
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Êtes-vous sûr de vouloir <strong>désactiver définitivement</strong> la ligne <strong>{selectedLine.name}</strong> (Ligne {selectedLine.line_number}) ?
                      </p>
                      <p className="mt-2">
                        Cette ligne ne sera plus visible dans la liste et ne pourra plus être utilisée. Cette action peut être annulée en réactivant la ligne plus tard.
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
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Désactiver définitivement
                </button>
                <button
                  onClick={closeAllModals}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex-1"
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
                className="text-gray-400 transition-colors duration-200 p-2 rounded-lg"
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
                  value={formData.line_number || ''}
                  onChange={handleInputChange}
                  placeholder="Numéro de ligne (ex: 1, 2, 3...)"
                  list="edit-line-numbers-datalist"
                  required
                  className="input text-gray-900"
                />
                <datalist id="edit-line-numbers-datalist">
                  {selectionOptions.lineNumbers.map((number) => (
                    <option key={number} value={number} />
                  ))}
                </datalist>
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
                  placeholder="Nom de la ligne (ex: Zanguéra ↔ BIA)"
                  list="edit-line-names-datalist"
                  required
                  className="input text-gray-900"
                />
                <datalist id="edit-line-names-datalist">
                  {selectionOptions.lineNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Départ *
                  </label>
                  <input
                    type="text"
                    name="route_from"
                    value={formData.route_from}
                    onChange={handleInputChange}
                    placeholder="Point de départ (ex: Zanguéra)"
                    list="edit-route-from-datalist"
                    required
                    className="input text-gray-900"
                  />
                  <datalist id="edit-route-from-datalist">
                    {selectionOptions.routePoints.map((route) => (
                      <option key={route} value={route} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Arrivée *
                  </label>
                  <input
                    type="text"
                    name="route_to"
                    value={formData.route_to}
                    onChange={handleInputChange}
                    placeholder="Point d'arrivée (ex: BIA)"
                    list="edit-route-to-datalist"
                    required
                    className="input text-gray-900"
                  />
                  <datalist id="edit-route-to-datalist">
                    {selectionOptions.routePoints.map((route) => (
                      <option key={route} value={route} />
                    ))}
                  </datalist>
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
                    step="0.1"
                    name="distance_km"
                    value={formData.distance_km || ''}
                    onChange={handleInputChange}
                    placeholder="Distance en km (ex: 15.3)"
                    list="edit-distances-datalist"
                    className="input text-gray-900"
                  />
                  <datalist id="edit-distances-datalist">
                    {selectionOptions.distances.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Nombre d'arrêts
                  </label>
                  <input
                    type="number"
                    name="stops_count"
                    value={formData.stops_count || ''}
                    onChange={handleInputChange}
                    placeholder="Nombre d'arrêts (ex: 45)"
                    list="edit-stops-count-datalist"
                    className="input text-gray-900"
                  />
                  <datalist id="edit-stops-count-datalist">
                    {selectionOptions.stopsCounts.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
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
