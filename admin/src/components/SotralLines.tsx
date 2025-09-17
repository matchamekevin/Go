import React, { useState, useEffect } from 'react';
import SotralService, { type SotralLine, type SotralStop } from '../services/sotralService';

interface LineCardProps {
  line: SotralLine;
  onViewStops: (line: SotralLine) => void;
}

const LineCard: React.FC<LineCardProps> = ({ line, onViewStops }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              Ligne {line.line_number}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(line.is_active)}`}>
              {getStatusText(line.is_active)}
            </span>
          </div>
          
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            {line.name}
          </h3>
          
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-16 font-medium">De:</span>
              <span>{line.route_from}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 font-medium">Vers:</span>
              <span>{line.route_to}</span>
            </div>
            {line.distance_km && (
              <div className="flex items-center">
                <span className="w-16 font-medium">Distance:</span>
                <span>{line.distance_km} km</span>
              </div>
            )}
            {line.stops_count && (
              <div className="flex items-center">
                <span className="w-16 font-medium">Arrêts:</span>
                <span>{line.stops_count}</span>
              </div>
            )}
          </div>

          {line.category && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {line.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={() => onViewStops(line)}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Voir arrêts
          </button>
        </div>
      </div>
    </div>
  );
};

interface StopsModalProps {
  line: SotralLine | null;
  stops: SotralStop[];
  loading: boolean;
  onClose: () => void;
}

const StopsModal: React.FC<StopsModalProps> = ({ line, stops, loading, onClose }) => {
  if (!line) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Arrêts - Ligne {line.line_number}: {line.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {line.route_from} → {line.route_to}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Fermer</span>
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {stops.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucun arrêt trouvé pour cette ligne
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stops.map((stop, index) => (
                        <div 
                          key={stop.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                  #{index + 1}
                                </span>
                                {stop.is_major_stop && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                    Arrêt principal
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  stop.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {stop.is_active ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                              
                              <h4 className="mt-2 font-medium text-gray-900">
                                {stop.name}
                              </h4>
                              
                              <div className="mt-1 text-sm text-gray-600">
                                <div>Code: {stop.code}</div>
                                {stop.address && (
                                  <div className="mt-1">{stop.address}</div>
                                )}
                                {stop.latitude && stop.longitude && (
                                  <div className="mt-1 text-xs">
                                    {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SotralLines: React.FC = () => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for stops
  const [selectedLine, setSelectedLine] = useState<SotralLine | null>(null);
  const [stops, setStops] = useState<SotralStop[]>([]);
  const [stopsLoading, setStopsLoading] = useState(false);

  const loadLines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SotralService.getAllLines();
      setLines(data);
    } catch (err) {
      setError('Erreur lors du chargement des lignes');
      console.error('Error loading SOTRAL lines:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStops = async (line: SotralLine) => {
    try {
      setStopsLoading(true);
      const data = await SotralService.getStopsByLine(line.id);
      setStops(data);
    } catch (err) {
      console.error('Error loading stops:', err);
      setStops([]);
    } finally {
      setStopsLoading(false);
    }
  };

  const handleViewStops = (line: SotralLine) => {
    setSelectedLine(line);
    loadStops(line);
  };

  const handleCloseModal = () => {
    setSelectedLine(null);
    setStops([]);
  };

  useEffect(() => {
    loadLines();
  }, []);

  const filteredLines = lines.filter(line =>
    line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.route_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.route_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.line_number.toString().includes(searchTerm)
  );

  const activeLines = filteredLines.filter(line => line.is_active);
  const inactiveLines = filteredLines.filter(line => !line.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadLines}
              className="mt-2 bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lignes SOTRAL</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestion des lignes de transport SOTRAL
            </p>
          </div>
        </div>

        {/* Recherche */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Rechercher par nom, numéro de ligne, ou trajet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Statistiques */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{lines.length}</div>
            <div className="text-sm text-blue-600">Total lignes</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeLines.length}</div>
            <div className="text-sm text-green-600">Lignes actives</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{inactiveLines.length}</div>
            <div className="text-sm text-red-600">Lignes inactives</div>
          </div>
        </div>
      </div>

      {/* Lignes actives */}
      {activeLines.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lignes actives ({activeLines.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeLines.map((line) => (
              <LineCard 
                key={line.id} 
                line={line} 
                onViewStops={handleViewStops}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lignes inactives */}
      {inactiveLines.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lignes inactives ({inactiveLines.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inactiveLines.map((line) => (
              <LineCard 
                key={line.id} 
                line={line} 
                onViewStops={handleViewStops}
              />
            ))}
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {filteredLines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune ligne trouvée</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-indigo-600 hover:text-indigo-500"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      {/* Modal pour les arrêts */}
      <StopsModal
        line={selectedLine}
        stops={stops}
        loading={stopsLoading}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SotralLines;