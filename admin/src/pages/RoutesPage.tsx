import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Router, MapPin, Clock } from 'lucide-react';

const RoutesPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const routes = [
    {
      id: 1,
      route_code: 'DAK_PIK_001',
      name: 'Dakar - Pikine',
      departure: 'Dakar Centre',
      arrival: 'Pikine Icotaf',
      price_category: 'T250' as const,
      distance_km: 15,
      estimated_duration_minutes: 45,
      is_active: true,
      created_at: '2024-01-15',
      usage_count: 2340,
    },
    {
      id: 2,
      route_code: 'DAK_GUE_001',
      name: 'Dakar - Guédiawaye',
      departure: 'Dakar Plateau',
      arrival: 'Guédiawaye Golf',
      price_category: 'T300' as const,
      distance_km: 18,
      estimated_duration_minutes: 55,
      is_active: true,
      created_at: '2024-01-15',
      usage_count: 1890,
    },
    {
      id: 3,
      route_code: 'PIK_DAK_001',
      name: 'Pikine - Dakar',
      departure: 'Pikine Icotaf',
      arrival: 'Dakar Centre',
      price_category: 'T250' as const,
      distance_km: 15,
      estimated_duration_minutes: 50,
      is_active: true,
      created_at: '2024-01-15',
      usage_count: 2156,
    },
    {
      id: 4,
      route_code: 'DAK_RUF_001',
      name: 'Dakar - Rufisque',
      departure: 'Dakar Terminus',
      arrival: 'Rufisque Gare',
      price_category: 'T200' as const,
      distance_km: 25,
      estimated_duration_minutes: 65,
      is_active: false,
      created_at: '2024-02-01',
      usage_count: 156,
    },
  ];

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="status-badge status-active">Active</span>
    ) : (
      <span className="status-badge status-inactive">Inactive</span>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'T100':
        return 'text-green-600 bg-green-100';
      case 'T150':
        return 'text-blue-600 bg-blue-100';
      case 'T200':
        return 'text-yellow-600 bg-yellow-100';
      case 'T250':
        return 'text-orange-600 bg-orange-100';
      case 'T300':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryPrice = (category: string) => {
    switch (category) {
      case 'T100': return 100;
      case 'T150': return 150;
      case 'T200': return 200;
      case 'T250': return 250;
      case 'T300': return 300;
      default: return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des routes</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les itinéraires et leurs tarifications
            </p>
          </div>
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle route
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Router className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total routes</p>
              <p className="text-2xl font-semibold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Router className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-semibold text-gray-900">
                {routes.filter(r => r.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Distance moy.</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(routes.reduce((sum, r) => sum + (r.distance_km || 0), 0) / routes.length)} km
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Durée moy.</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(routes.reduce((sum, r) => sum + (r.estimated_duration_minutes || 0), 0) / routes.length)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="card hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Router className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{route.name}</h3>
                  <p className="text-sm text-gray-500">{route.route_code}</p>
                </div>
              </div>
              {getStatusBadge(route.is_active)}
            </div>

            <div className="space-y-4 mb-4">
              {/* Itinéraire */}
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-2 text-sm font-medium text-gray-900">{route.departure}</div>
                  </div>
                  <div className="ml-5 border-l-2 border-gray-200 h-4"></div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="ml-2 text-sm font-medium text-gray-900">{route.arrival}</div>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-500">Catégorie prix</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(route.price_category)}`}>
                      {route.price_category} - {getCategoryPrice(route.price_category)} FCFA
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Utilisations</span>
                  <p className="text-lg font-semibold text-gray-900">{route.usage_count.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Distance</span>
                  <p className="text-sm text-gray-900">{route.distance_km} km</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Durée estimée</span>
                  <p className="text-sm text-gray-900">{route.estimated_duration_minutes} min</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center">
                <Edit2 className="h-4 w-4 mr-1" />
                Modifier
              </button>
              <button className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nouvelle route</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code de la route
                  </label>
                  <input
                    type="text"
                    className="input text-gray-900"
                    placeholder="DAK_XXX_001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la route
                  </label>
                  <input
                    type="text"
                    className="input text-gray-900"
                    placeholder="Dakar - Destination"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Point de départ
                  </label>
                  <input
                    type="text"
                    className="input text-gray-900"
                    placeholder="Point de départ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Point d'arrivée
                  </label>
                  <input
                    type="text"
                    className="input text-gray-900"
                    placeholder="Point d'arrivée"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie de prix
                  </label>
                  <select className="input text-gray-900">
                    <option value="">Sélectionner une catégorie</option>
                    <option value="T100">T100 - 100 FCFA</option>
                    <option value="T150">T150 - 150 FCFA</option>
                    <option value="T200">T200 - 200 FCFA</option>
                    <option value="T250">T250 - 250 FCFA</option>
                    <option value="T300">T300 - 300 FCFA</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      className="input text-gray-900"
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (min)
                    </label>
                    <input
                      type="number"
                      className="input text-gray-900"
                      placeholder="45"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active_route"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active_route" className="ml-2 block text-sm text-gray-900">
                    Route active
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
