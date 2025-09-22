import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Power, 
  Bus, 
  MapPin, 
  Ticket,
  TrendingUp,
  RefreshCw
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
  total_tickets_generated?: number;
  total_revenue?: number;
}

const SotralManagementPage: React.FC = () => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [stats, setStats] = useState<LineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

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

  const generateTicketsForLine = async (lineId: number, quantity: number = 100) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/generate-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineId,
          ticketTypeCode: 'SIMPLE',
          quantity,
          validityHours: 24
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        loadData(); // Recharger les statistiques
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération des tickets');
    }
  };

  const bulkGenerateTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/bulk-generate-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketTypeCode: 'SIMPLE',
          quantityPerLine: 50,
          validityHours: 24
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la génération en masse');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération en masse');
    }
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
            Gérez les lignes de transport, les arrêts et la génération de tickets
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Générer des tickets
          </button>
          <button
            onClick={() => console.log('Nouvelle ligne - à implémenter')}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle ligne
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
              <Ticket className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Types de tickets</p>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => generateTicketsForLine(line.id)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Générer des tickets"
                    >
                      <Ticket className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleLineStatus(line.id)}
                      className={`${
                        line.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                      title={line.is_active ? 'Désactiver' : 'Activer'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => console.log('Modifier ligne', line.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de génération de tickets en masse */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-container p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Générer des tickets en masse
            </h3>
            <p className="text-gray-600 mb-6">
              Cette action va générer 50 tickets pour chaque ligne active.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  bulkGenerateTickets();
                  setIsGenerateModalOpen(false);
                }}
                className="btn-primary flex-1"
              >
                Confirmer
              </button>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SotralManagementPage;