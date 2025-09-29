import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SotralLine, ApiResponse } from '../../types/sotral';

interface CreateLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lineData: Partial<SotralLine>) => Promise<ApiResponse<SotralLine>>;
}

const CreateLineModal: React.FC<CreateLineModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    line_number: '',
    line_name: '',
    route_from: '',
    route_to: '',
    category_id: '1',
    distance_km: '',
    stops_count: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      line_number: '',
      line_name: '',
      route_from: '',
      route_to: '',
      category_id: '1',
      distance_km: '',
      stops_count: ''
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.line_number || !formData.line_name || !formData.route_from || !formData.route_to) {
        setError('Tous les champs obligatoires doivent être remplis');
        return;
      }

      const lineData = {
        line_number: parseInt(formData.line_number), // Convertir en nombre
        line_name: formData.line_name,
        route_from: formData.route_from,
        route_to: formData.route_to,
        category_id: parseInt(formData.category_id),
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined, // Convertir en nombre ou undefined
        stops_count: formData.stops_count ? parseInt(formData.stops_count) : undefined, // Convertir en nombre ou undefined
        is_active: true
      };

      const result = await onSubmit(lineData);
      if (!result.success) {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Plus className="h-6 w-6 mr-3 text-green-600" />
              Créer une nouvelle ligne
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro de ligne *
              </label>
              <input
                type="text"
                name="line_number"
                value={formData.line_number}
                onChange={handleInputChange}
                placeholder="Ex: 1, 2, 3..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la ligne *
              </label>
              <input
                type="text"
                name="line_name"
                value={formData.line_name}
                onChange={handleInputChange}
                placeholder="Ex: Zanguéra ↔ BIA"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Départ *
                </label>
                <input
                  type="text"
                  name="route_from"
                  value={formData.route_from}
                  onChange={handleInputChange}
                  placeholder="Ex: Zanguéra"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Arrivée *
                </label>
                <input
                  type="text"
                  name="route_to"
                  value={formData.route_to}
                  onChange={handleInputChange}
                  placeholder="Ex: BIA"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="1">Ordinaire</option>
                <option value="2">Lignes étudiantes</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="distance_km"
                  value={formData.distance_km}
                  onChange={handleInputChange}
                  placeholder="Ex: 15.3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre d'arrêts
                </label>
                <input
                  type="number"
                  name="stops_count"
                  value={formData.stops_count}
                  onChange={handleInputChange}
                  placeholder="Ex: 45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Création...' : 'Créer la ligne'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLineModal;