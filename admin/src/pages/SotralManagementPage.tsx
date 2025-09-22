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

interface SotralLine {
  id: number;
  line_number: number;
  name: string;
  route_from: string;
  route_to: string;
  distance_km: number;
  stops_count: number;
  is_active: boolean;
  category?: {
    name: string;
  };
}

interface LineStats {
  total_lines: number;
  active_lines: number;
  total_stops: number;
  ticket_types: number;
}

const SotralManagementPage: React.FC = () => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [stats, setStats] = useState<LineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      toast.error('Erreur lors du chargement des données');
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
        toast.error(error.error || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du changement de statut');
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
        toast.error(error.error || 'Erreur lors de la création de la ligne');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de la ligne');
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
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mb-4" />
          <p className="text-gray-600">Chargement des données SOTRAL...</p>
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
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle ligne
          </button>
          <button
            onClick={loadData}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-container p-6 rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Créer une nouvelle ligne
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateLine} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  placeholder="Ex: 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la ligne *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input text-gray-900"
                  placeholder="Ex: Ligne 15 - Lomé Centre"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Départ *
                  </label>
                  <input
                    type="text"
                    name="route_from"
                    value={formData.route_from}
                    onChange={handleInputChange}
                    required
                    className="input text-gray-900"
                    placeholder="Ex: Lomé Centre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrivée *
                  </label>
                  <input
                    type="text"
                    name="route_to"
                    value={formData.route_to}
                    onChange={handleInputChange}
                    required
                    className="input text-gray-900"
                    placeholder="Ex: Adidogomé"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="btn-primary flex-1"
                >
                  Créer la ligne
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary flex-1"
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