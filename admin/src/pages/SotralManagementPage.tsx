import React, { useState, useEffect } from 'react';
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
  Info,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SotralLine } from '../services/sotralService';
import StatsCards from '../components/StatsCards';
import LineTable from '../components/LineTable';
import ErrorDisplay from '../components/ErrorDisplay';
import { useSotralLines } from '../hooks/useSotralLines';
import { useSotralStops } from '../hooks/useSotralStops';
import { useSotralStats } from '../hooks/useSotralStats';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

// Le type SotralStop et LineStats ne sont pas utilisés directement ici;
// les hooks fournissent déjà les données typées.

const SotralManagementPage: React.FC = () => {
  // Use custom hooks for API calls
  const { lines: apiLines, loading: linesLoading, error: linesError, loadLines, createLine: hookCreateLine, updateLine: hookUpdateLine, deleteLine: hookDeleteLine, toggleLineStatus: hookToggleLineStatus, isUsingCache } = useSotralLines();
  const { loading: stopsLoading, error: stopsError, loadStops } = useSotralStops();
  const { stats, loading: statsLoading, error: statsError, loadStats } = useSotralStats();

  // Les lignes viennent directement de l'API (toutes, actives et inactives)
  const lines = apiLines;

  // console.log('Rendering SotralManagementPage with lines:', lines);

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
  const [forceStopLoading, setForceStopLoading] = useState(false);

  // Timeout de sécurité pour éviter que la page reste blanche indéfiniment
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (loading && !forceStopLoading) {
      timeoutId = setTimeout(() => {
        console.warn('⏰ Page loading timeout reached - forcing stop loading to prevent blank page');
        setForceStopLoading(true);
      }, 10000); // 10 secondes timeout

      return () => clearTimeout(timeoutId);
    }

    return () => {
      // cleanup
    };
  }, [loading, forceStopLoading]);

  // Logique simplifiée pour éviter la page blanche
  // Afficher le contenu dès que les lignes sont chargées (données essentielles)
  const shouldShowContent = lines.length > 0 || forceStopLoading;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<SotralLine | null>(null);

  // État des filtres
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // 'all', 'active', 'inactive'
    category: 'all' // 'all', '1' (ordinaire), '2' (étudiantes)
  });

  // Fonction pour obtenir la ligne actuelle (avec données temps réel)
  const getCurrentLine = (lineId: number) => {
    return lines.find(line => line.id === lineId);
  };

  // Fonction pour obtenir la ligne sélectionnée actuelle
  const getSelectedLineCurrent = () => {
    if (!selectedLine) return null;
    return getCurrentLine(selectedLine.id);
  };

  // Gérer la classe modal-open sur le body
  const isAnyModalOpen = isCreateModalOpen || isEditModalOpen || isDeleteModalOpen || isDetailsModalOpen;
  
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }

    // Nettoyer au démontage du composant
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isAnyModalOpen]);
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

  // Rafraîchissement automatique toutes les 30 secondes
  const { autoRefresh, setAutoRefresh } = useAutoRefresh(refreshData, {
    interval: 30000, // 30 secondes
    enabled: true // Activé par défaut
  });

  const [togglingLines, setTogglingLines] = useState<Set<number>>(new Set());

  // keep toggleLineStatus for real backend toggles (used in other places)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleLineStatus = async (lineId: number) => {
    if (togglingLines.has(lineId)) return; // Éviter les clics multiples

    try {
      setTogglingLines(prev => new Set(prev).add(lineId));

      const result = await hookToggleLineStatus(lineId);

      if (result.success) {
        toast.success(result.message || 'Statut de la ligne mis à jour avec succès');
        // Les données sont automatiquement mises à jour par le hook
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
        const result = await hookToggleLineStatus(line.id);
        if (result && result.success) {
          toast.success(result.message || `Statut de la ligne ${line.line_number} mis à jour`);
          // Les données sont automatiquement mises à jour par le hook
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
      const result = await hookDeleteLine(lineId);

      if (result.success) {
        toast.success('Ligne supprimée définitivement avec succès');
        setIsDeleteModalOpen(false);
        setSelectedLine(null);
        // Les données sont automatiquement mises à jour par le hook
      } else {
        showErrorToast(result.error || 'Erreur lors de la suppression de la ligne');
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
        line_number: Number(formData.line_number), // Convertir en nombre
        name: formData.name.trim(),
        route_from: formData.route_from.trim(),
        route_to: formData.route_to.trim(),
        category_id: Number(formData.category_id),
        distance_km: formData.distance_km ? Number(formData.distance_km) : undefined, // Convertir en nombre ou undefined
        stops_count: formData.stops_count ? Number(formData.stops_count) : undefined // Convertir en nombre ou undefined
      };

      // Validation supplémentaire des valeurs numériques
      if (lineData.distance_km && (isNaN(Number(lineData.distance_km)) || Number(lineData.distance_km) <= 0)) {
        showErrorToast('La distance doit être un nombre positif');
        return;
      }

      if (lineData.stops_count !== undefined && (isNaN(lineData.stops_count) || lineData.stops_count <= 0)) {
        showErrorToast('Le nombre d\'arrêts doit être un nombre positif');
        return;
      }

      const result = await hookUpdateLine(selectedLine.id, lineData);

      if (result.success) {
        toast.success(result.message || 'Ligne modifiée avec succès');
        setIsEditModalOpen(false);
        setSelectedLine(null);
        // Les données sont automatiquement mises à jour par le hook
      } else {
        showErrorToast(result.error || 'Erreur lors de la modification de la ligne');
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
        line_number: Number(formData.line_number), // Convertir en nombre
        name: formData.name.trim(),
        route_from: formData.route_from.trim(),
        route_to: formData.route_to.trim(),
        category_id: Number(formData.category_id),
        distance_km: formData.distance_km ? Number(formData.distance_km) : undefined, // Convertir en nombre ou undefined
        stops_count: formData.stops_count ? Number(formData.stops_count) : undefined, // Convertir en nombre ou undefined
        is_active: true
      };

      // Validation supplémentaire des valeurs numériques
      if (lineData.distance_km && (isNaN(Number(lineData.distance_km)) || Number(lineData.distance_km) <= 0)) {
        showErrorToast('La distance doit être un nombre positif');
        return;
      }

      if (lineData.stops_count !== undefined && (isNaN(lineData.stops_count) || lineData.stops_count <= 0)) {
        showErrorToast('Le nombre d\'arrêts doit être un nombre positif');
        return;
      }

      const result = await hookCreateLine(lineData);

      if (result.success) {
        toast.success(result.message || 'Ligne créée avec succès');
        setIsCreateModalOpen(false);
        resetForm();
        // Les données sont automatiquement mises à jour par le hook
      } else {
        showErrorToast(result.error || 'Erreur lors de la création de la ligne');
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
      line_number: line.line_number.toString(), // Convertir en string pour le formulaire
      name: line.name,
      route_from: line.route_from,
      route_to: line.route_to,
      category_id: line.category_id?.toString() || '1',
      distance_km: line.distance_km?.toString() || '', // Convertir en string pour le formulaire
      stops_count: line.stops_count?.toString() || '' // Convertir en string pour le formulaire
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

  // Gestionnaire de changement des filtres
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour filtrer les lignes
  const filteredLines = lines.filter(line => {
    // Filtre par recherche (nom, numéro, départ, arrivée)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        (line.name?.toLowerCase().includes(searchTerm)) ||
        line.line_number.toString().includes(searchTerm) ||
        (line.route_from?.toLowerCase().includes(searchTerm)) ||
        (line.route_to?.toLowerCase().includes(searchTerm));
      if (!matchesSearch) return false;
    }

    // Filtre par statut
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      if (line.is_active !== isActive) return false;
    }

    // Filtre par catégorie
    if (filters.category !== 'all') {
      const categoryId = parseInt(filters.category);
      if (line.category_id !== categoryId) return false;
    }

    return true;
  });

  if (!shouldShowContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#065f46] mx-auto mb-4"></div>
          <p className="text-[#065f46] font-semibold">Chargement des données SOTRAL...</p>
          <p className="text-sm text-gray-500 mt-2">
            Chargement des lignes de transport...
          </p>
          <p className="text-xs text-gray-400 mt-1">
            La page s'affichera automatiquement dès que les données essentielles seront disponibles.
          </p>
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Info className="h-3 w-3 mr-1" />
                Données en cache
              </span>
            )}
            {forceStopLoading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Chargement incomplet
              </span>
            )}
            {(statsLoading || stopsLoading) && !forceStopLoading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Chargement en cours
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les lignes de transport et les trajets
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
            className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:bg-green-600"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Actualiser
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-3 font-semibold rounded-full transition-all duration-200 shadow-lg ${
              autoRefresh 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            title={autoRefresh ? 'Rafraîchissement auto activé (30s)' : 'Rafraîchissement auto désactivé'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
            <span className="text-sm">
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </span>
            {autoRefresh && (
              <span className="ml-2 text-xs opacity-75">
                (30s)
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      <ErrorDisplay error={apiError} />

      {/* Statistiques */}
      <StatsCards stats={stats} />

      {/* Filtres */}
      <div className="glass-container p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Filter className="h-6 w-6 mr-3 text-blue-600" />
            Filtres des lignes
          </h2>
          {(filters.search || filters.status !== 'all' || filters.category !== 'all') && (
            <button
              onClick={() => setFilters({ search: '', status: 'all', category: 'all' })}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recherche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Nom, numéro, départ, arrivée..."
                className="input text-gray-900 pl-10"
              />
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input text-gray-900"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input text-gray-900"
            >
              <option value="all">Toutes les catégories</option>
              <option value="1">Ordinaire</option>
              <option value="2">Lignes étudiantes</option>
            </select>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        {(filters.search || filters.status !== 'all' || filters.category !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredLines.length} ligne{filteredLines.length !== 1 ? 's' : ''} trouvée{filteredLines.length !== 1 ? 's' : ''}
                {lines.length !== filteredLines.length && (
                  <span className="text-gray-500"> sur {lines.length} au total</span>
                )}
              </span>
              <div className="flex items-center space-x-2">
                {filters.search && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Recherche: "{filters.search}"
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Statut: {filters.status === 'active' ? 'Actives' : 'Inactives'}
                  </span>
                )}
                {filters.category !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Catégorie: {filters.category === '1' ? 'Ordinaire' : 'Étudiantes'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des lignes */}
      <LineTable
        lines={filteredLines}
        onDetailsClick={openDetailsModal}
      />



      {/* Modal de création de ligne */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div className="glass-container p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in modal-content" onClick={(e) => e.stopPropagation()}>
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
      {isDetailsModalOpen && selectedLine && (() => {
        const currentLine = getSelectedLineCurrent();
        if (!currentLine) return null;
        
        return (
          <div className="modal-backdrop" onClick={closeAllModals}>
            <div className="glass-container p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bus className="h-8 w-8 mr-3 text-blue-600" />
                  Ligne {currentLine.line_number} - {currentLine.name}
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
                        <dd className="text-sm font-semibold text-gray-900">{currentLine.line_number}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Nom:</dt>
                        <dd className="text-sm font-semibold text-gray-900">{currentLine.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Catégorie:</dt>
                        <dd className="text-sm font-semibold">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            currentLine.category_id === 2 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {currentLine.category_id === 2 ? 'Lignes étudiantes' : 'Ordinaire'}
                          </span>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Statut:</dt>
                        <dd className="text-sm font-semibold">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            currentLine.is_active 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {currentLine.is_active ? 'Active' : 'Inactive'}
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
                        <dd className="text-sm font-semibold text-gray-900">{currentLine.route_from}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Arrivée:</dt>
                        <dd className="text-sm font-semibold text-gray-900">{currentLine.route_to}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Distance:</dt>
                        <dd className="text-sm font-semibold text-gray-900">{currentLine.distance_km} km</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Nombre d'arrêts:</dt>
                        <dd className="text-sm font-semibold text-gray-900">{currentLine.stops_count}</dd>
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
                      currentLine.is_active
                        ? 'bg-orange-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    <Power className="h-5 w-5 mr-2" />
                    {currentLine.is_active ? 'Suspendre la ligne' : 'Activer la ligne'}
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
        );
      })()}

      {/* Modal de suppression */}
      {isDeleteModalOpen && selectedLine && (() => {
        const currentLine = getSelectedLineCurrent();
        if (!currentLine) return null;
        
        return (
          <div className="modal-backdrop" onClick={closeAllModals}>
            <div className="glass-container p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in modal-content" onClick={(e) => e.stopPropagation()}>
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
                          Êtes-vous sûr de vouloir <strong>supprimer définitivement</strong> la ligne <strong>{currentLine.name}</strong> (Ligne {currentLine.line_number}) ?
                        </p>
                        <p className="mt-2">
                          Cette ligne sera <strong>complètement supprimée</strong> de la base de données et ne pourra plus être récupérée. Cette action est irréversible.
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
                      <dd className="text-sm font-medium text-gray-900">{currentLine.line_number}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Nom :</dt>
                      <dd className="text-sm font-medium text-gray-900">{currentLine.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Itinéraire :</dt>
                      <dd className="text-sm font-medium text-gray-900">{currentLine.route_from} ↔ {currentLine.route_to}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Statut :</dt>
                      <dd className="text-sm font-medium">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentLine.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentLine.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => deleteLine(currentLine.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer définitivement
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
        );
      })()}

      {/* Modal d'édition */}
      {isEditModalOpen && selectedLine && (() => {
        const currentLine = getSelectedLineCurrent();
        if (!currentLine) return null;
        
        return (
          <div className="modal-backdrop" onClick={closeAllModals}>
            <div className="glass-container p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Edit className="h-6 w-6 mr-3 text-blue-600" />
                  Modifier la ligne {currentLine.line_number} - {currentLine.name}
                </h3>
                <button
                  onClick={closeAllModals}
                  className="text-gray-400 transition-colors duration-200 p-2 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

            <form onSubmit={updateLine} className="space-y-6">

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
      );
      })()}

    </div>
  );
};

export default SotralManagementPage;
