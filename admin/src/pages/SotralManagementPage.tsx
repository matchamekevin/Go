import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Bus, 
  MapPin, 
  TrendingUp,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SotralLine } from '../services/sotralService';

interface SotralStop {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_major_stop: boolean;
  is_active: boolean;
}

interface LineStats {
  total_lines: number;
  active_lines: number;
  total_stops: number;
  ticket_types: number;
}

const SotralManagementPage: React.FC = () => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [existingLines, setExistingLines] = useState<SotralLine[]>([]);
  const [stats, setStats] = useState<LineStats | null>(null);
  const [stops, setStops] = useState<SotralStop[]>([
    { id: 1, name: 'Centre Ville', code: 'CV', is_major_stop: true, is_active: true },
    { id: 2, name: 'Marché Kpalimé', code: 'MK', is_major_stop: true, is_active: true },
    { id: 3, name: 'Aéroport', code: 'AP', is_major_stop: true, is_active: true },
    { id: 4, name: 'Université', code: 'UNIV', is_major_stop: true, is_active: true },
    { id: 5, name: 'Hôpital', code: 'HOP', is_major_stop: false, is_active: true },
    { id: 6, name: 'Gare Routière', code: 'GR', is_major_stop: true, is_active: true }
  ]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);
  const [apiError, setApiError] = useState<{
    type: 'auth' | 'server' | 'network' | 'empty';
    message: string;
    details?: string;
  } | null>(null);

  const showErrorToast = (message: string) => {
    const now = Date.now();
    if (now - lastErrorTime > 2000) { // Minimum 2 secondes entre les erreurs
      toast.error(message);
      setLastErrorTime(now);
    }
  };
  const [formData, setFormData] = useState({
    line_number: '',
    name: '',
    route_from: '',
    route_to: '',
    category_id: '1', // Par défaut catégorie ordinaire
    distance_km: '',
    stops_count: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les lignes existantes pour les sélections
      console.log('Tentative de chargement des lignes existantes...');
      const token = localStorage.getItem('admin_token');
      console.log('Token admin présent:', !!token);
      
      const existingLinesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Réponse API lignes:', existingLinesResponse.status, existingLinesResponse.statusText);
      
      if (existingLinesResponse.ok) {
        const existingLinesData = await existingLinesResponse.json();
        console.log('Lignes existantes reçues:', existingLinesData);
        console.log('Nombre de lignes:', existingLinesData.data?.length || 0);
        setExistingLines(existingLinesData.data || []);
        setApiError(null); // Réinitialiser l'erreur si succès
      } else {
        console.error('Erreur chargement lignes existantes:', existingLinesResponse.status, existingLinesResponse.statusText);
        const errorText = await existingLinesResponse.text();
        console.error('Détails erreur API:', errorText);
        
        // Définir le type d'erreur pour un message plus spécifique
        if (existingLinesResponse.status === 401) {
          setApiError({
            type: 'auth',
            message: 'Authentification requise',
            details: 'Vous devez être connecté en tant qu\'administrateur pour accéder aux données.'
          });
        } else if (existingLinesResponse.status === 500) {
          setApiError({
            type: 'server',
            message: 'Erreur serveur',
            details: 'Le serveur backend ne répond pas correctement. Vérifiez qu\'il est démarré.'
          });
        } else if (existingLinesResponse.status >= 400) {
          setApiError({
            type: 'network',
            message: 'Erreur de réseau',
            details: `Erreur ${existingLinesResponse.status}: ${existingLinesResponse.statusText}`
          });
        }
      }
      
      // Charger les lignes
      const linesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (linesResponse.ok) {
        const linesData = await linesResponse.json();
        setLines(linesData.data || []);
      }

      // Charger les arrêts
      const stopsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/stops`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (stopsResponse.ok) {
        const stopsData = await stopsResponse.json();
        console.log('Arrêts chargés:', stopsData);
        // Utiliser les données de l'API si elles existent, sinon garder les données par défaut
        if (stopsData.data && Array.isArray(stopsData.data) && stopsData.data.length > 0) {
          setStops(stopsData.data);
        } else {
          console.warn('Aucune donnée d\'arrêts reçue de l\'API');
          // Garder les arrêts par défaut ou afficher un avertissement
        }
      } else {
        console.error('Erreur chargement arrêts:', stopsResponse.status, stopsResponse.statusText);
        const errorText = await stopsResponse.text();
        console.error('Détails erreur:', errorText);
        showErrorToast('Erreur lors du chargement des arrêts');
      }

      // Charger les statistiques
      const statsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data?.infrastructure || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showErrorToast('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
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
        loadData(); // Recharger les données
      } else {
        const error = await response.json();
        showErrorToast(error.error || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showErrorToast('Erreur lors du changement de statut');
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
        loadData(); // Recharger les données
      } else {
        const error = await response.json();
        showErrorToast(error.error || 'Erreur lors de la création de la ligne');
      }
    } catch (error) {
      console.error('Erreur:', error);
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

  const refreshData = async () => {
    setApiError(null); // Réinitialiser les erreurs
    await loadData();
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion SOTRAL</h1>
          <p className="text-gray-600 mt-1">
            Gérez les lignes de transport et les trajets
          </p>
        </div>
        <div className="flex space-x-3">
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

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-container p-6 rounded-xl">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total lignes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_lines}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-container p-6 rounded-xl">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lignes actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_lines}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-container p-6 rounded-xl">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total arrêts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_stops || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-container p-6 rounded-xl">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Types de lignes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ticket_types || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des lignes */}
      <div className="glass-container rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lignes de transport</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ligne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itinéraire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrêts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-800">
                            {line.line_number}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Ligne {line.line_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {line.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {line.route_from} ↔ {line.route_to}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {line.distance_km} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {line.stops_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      line.category?.name === 'Lignes étudiantes' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {line.category?.name || 'Ordinaire'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      line.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {line.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleLineStatus(line.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                        line.is_active 
                          ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                      title={line.is_active ? 'Désactiver la ligne' : 'Activer la ligne'}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {line.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création de ligne */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in">
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
              {apiError && (
                <div className={`border rounded-lg p-4 mb-4 ${
                  apiError.type === 'auth' ? 'bg-red-50 border-red-200' :
                  apiError.type === 'server' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className={`h-5 w-5 ${
                        apiError.type === 'auth' ? 'text-red-400' :
                        apiError.type === 'server' ? 'text-orange-400' :
                        'text-yellow-400'
                      }`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        apiError.type === 'auth' ? 'text-red-800' :
                        apiError.type === 'server' ? 'text-orange-800' :
                        'text-yellow-800'
                      }`}>
                        {apiError.message}
                      </h3>
                      <div className={`mt-2 text-sm ${
                        apiError.type === 'auth' ? 'text-red-700' :
                        apiError.type === 'server' ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        <p>{apiError.details}</p>
                        {apiError.type === 'server' && (
                          <p className="mt-1">
                            <strong>Solution:</strong> Démarrez le serveur backend avec <code>npm run dev</code> dans le dossier <code>back/</code>
                          </p>
                        )}
                        {apiError.type === 'auth' && (
                          <p className="mt-1">
                            <strong>Solution:</strong> Connectez-vous à l'interface d'administration
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {existingLines.length === 0 && !apiError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Base de données non initialisée
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Les sélections de lignes sont vides car la base de données n'a pas été initialisée avec les données SOTRAL.
                          Exécutez le script d'initialisation pour ajouter les 22 lignes de transport.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Numéro de ligne *
                </label>
                <select
                  name="line_number"
                  value={formData.line_number}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                >
                  <option value="" disabled>Sélectionnez un numéro de ligne</option>
                  {apiError ? (
                    <option value="" disabled style={{color: 'red'}}>
                      {apiError.type === 'auth' && '🔐 Connexion admin requise'}
                      {apiError.type === 'server' && '🖥️ Serveur backend indisponible'}
                      {apiError.type === 'network' && '🌐 Erreur de connexion'}
                      {apiError.type === 'empty' && '⚠️ Aucune ligne disponible'}
                    </option>
                  ) : existingLines.length === 0 ? (
                    <option value="" disabled style={{color: 'orange'}}>
                      ⏳ Chargement des lignes...
                    </option>
                  ) : (
                    existingLines.map((line) => (
                      <option key={line.id} value={line.line_number}>
                        Ligne {line.line_number} - {line.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Nom de la ligne *
                </label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                >
                  <option value="" disabled>Sélectionnez un nom de ligne</option>
                  {apiError ? (
                    <option value="" disabled style={{color: 'red'}}>
                      {apiError.type === 'auth' && '🔐 Connexion admin requise'}
                      {apiError.type === 'server' && '🖥️ Serveur backend indisponible'}
                      {apiError.type === 'network' && '🌐 Erreur de connexion'}
                      {apiError.type === 'empty' && '⚠️ Aucune ligne disponible'}
                    </option>
                  ) : existingLines.length === 0 ? (
                    <option value="" disabled style={{color: 'orange'}}>
                      ⏳ Chargement des lignes...
                    </option>
                  ) : (
                    existingLines.map((line) => (
                      <option key={line.id} value={line.name}>
                        {line.name} (Ligne {line.line_number})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
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
                  <label className="block text-sm font-semibold text-green-700 mb-2">
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
                  onClick={() => setIsCreateModalOpen(false)}
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