import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSotralOperations } from '../../hooks/useSotralOperations';
import { SotralLine } from '../../contexts/SotralContext';

interface LineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  line?: SotralLine | null;
}

const LineFormModal: React.FC<LineFormModalProps> = ({ isOpen, onClose, line }) => {
  const {
    loading,
    error,
    createLine,
    updateLine,
    closeAllModals
  } = useSotralOperations();

  const [localFormData, setLocalFormData] = useState({
    line_number: '',
    name: '',
    route_from: '',
    route_to: '',
    category_id: '1',
    distance_km: '',
    stops_count: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditMode = !!line;

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && line) {
        setLocalFormData({
          line_number: line.line_number.toString(),
          name: line.name,
          route_from: line.route_from,
          route_to: line.route_to,
          category_id: line.category_id?.toString() || '1',
          distance_km: line.distance_km?.toString() || '',
          stops_count: line.stops_count?.toString() || ''
        });
      } else {
        setLocalFormData({
          line_number: '',
          name: '',
          route_from: '',
          route_to: '',
          category_id: '1',
          distance_km: '',
          stops_count: ''
        });
      }
      setValidationErrors({});
    }
  }, [isOpen, isEditMode, line]);

  if (!isOpen) return null;

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

  const showValidationError = (message: string) => {
    toast.error(message);
    setValidationErrors({ general: message });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!localFormData.line_number || isNaN(Number(localFormData.line_number))) {
      errors.line_number = 'Le numéro de ligne est requis et doit être un nombre valide';
    }

    if (!localFormData.name?.trim()) {
      errors.name = 'Le nom de la ligne est requis';
    }

    if (!localFormData.route_from?.trim()) {
      errors.route_from = 'Le point de départ est requis';
    }

    if (!localFormData.route_to?.trim()) {
      errors.route_to = 'Le point d\'arrivée est requis';
    }

    if (!localFormData.category_id || isNaN(Number(localFormData.category_id))) {
      errors.category_id = 'La catégorie est requise';
    }

    // Validation supplémentaire des valeurs numériques
    if (localFormData.distance_km && (isNaN(Number(localFormData.distance_km)) || Number(localFormData.distance_km) <= 0)) {
      errors.distance_km = 'La distance doit être un nombre positif';
    }

    if (localFormData.stops_count && (isNaN(Number(localFormData.stops_count)) || Number(localFormData.stops_count) <= 0)) {
      errors.stops_count = 'Le nombre d\'arrêts doit être un nombre positif';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      showValidationError(firstError);
      return;
    }

    const lineData = {
      line_number: Number(localFormData.line_number),
      name: localFormData.name.trim(),
      route_from: localFormData.route_from.trim(),
      route_to: localFormData.route_to.trim(),
      category_id: Number(localFormData.category_id),
      distance_km: localFormData.distance_km ? Number(localFormData.distance_km) : undefined,
      stops_count: localFormData.stops_count ? Number(localFormData.stops_count) : undefined
    };

    try {
      let result;
      if (isEditMode && line) {
        result = await updateLine(line.id, lineData);
      } else {
        result = await createLine(lineData);
      }

      if (result?.success) {
        closeAllModals();
      } else if (result?.error) {
        if (result.error.includes('duplicate key value')) {
          showValidationError('Ce numéro de ligne existe déjà. Veuillez choisir un numéro unique.');
        } else {
          showValidationError(result.error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showValidationError('Une erreur inattendue est survenue');
    }
  };

  const handleClose = () => {
    if (!loading.linesAction) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="glass-container p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            {isEditMode ? <Edit className="h-6 w-6 mr-3 text-blue-600" /> : <Plus className="h-6 w-6 mr-3 text-green-600" />}
            {isEditMode ? 'Modifier la ligne' : 'Créer une nouvelle ligne'}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading.linesAction}
            className="text-gray-400 transition-colors duration-200 p-2 rounded-lg disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {(error.general || validationErrors.general) && (
            <div className="border rounded-lg p-4 bg-red-50 border-red-200">
              <div className="text-sm text-red-700">
                {error.general?.message || validationErrors.general}
              </div>
            </div>
          )}

          {/* Line Number */}
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2">
              Numéro de ligne *
            </label>
            <input
              type="number"
              name="line_number"
              value={localFormData.line_number}
              onChange={handleInputChange}
              placeholder="Numéro de ligne (ex: 1, 2, 3...)"
              list="line-numbers-datalist"
              required
              disabled={loading.linesAction}
              className={`input text-gray-900 ${validationErrors.line_number ? 'border-red-300' : ''}`}
            />
            <datalist id="line-numbers-datalist">
              {selectionOptions.lineNumbers.map((number) => (
                <option key={number} value={number} />
              ))}
            </datalist>
            {validationErrors.line_number && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.line_number}</p>
            )}
          </div>

          {/* Line Name */}
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2">
              Nom de la ligne *
            </label>
            <input
              type="text"
              name="name"
              value={localFormData.name}
              onChange={handleInputChange}
              placeholder="Nom de la ligne (ex: Zanguéra ↔ BIA)"
              list="line-names-datalist"
              required
              disabled={loading.linesAction}
              className={`input text-gray-900 ${validationErrors.name ? 'border-red-300' : ''}`}
            />
            <datalist id="line-names-datalist">
              {selectionOptions.lineNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            {validationErrors.name && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Routes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Départ *
              </label>
              <input
                type="text"
                name="route_from"
                value={localFormData.route_from}
                onChange={handleInputChange}
                placeholder="Point de départ (ex: Zanguéra)"
                list="route-from-datalist"
                required
                disabled={loading.linesAction}
                className={`input text-gray-900 ${validationErrors.route_from ? 'border-red-300' : ''}`}
              />
              <datalist id="route-from-datalist">
                {selectionOptions.routePoints.map((route) => (
                  <option key={route} value={route} />
                ))}
              </datalist>
              {validationErrors.route_from && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.route_from}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Arrivée *
              </label>
              <input
                type="text"
                name="route_to"
                value={localFormData.route_to}
                onChange={handleInputChange}
                placeholder="Point d'arrivée (ex: BIA)"
                list="route-to-datalist"
                required
                disabled={loading.linesAction}
                className={`input text-gray-900 ${validationErrors.route_to ? 'border-red-300' : ''}`}
              />
              <datalist id="route-to-datalist">
                {selectionOptions.routePoints.map((route) => (
                  <option key={route} value={route} />
                ))}
              </datalist>
              {validationErrors.route_to && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.route_to}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2">
              Catégorie *
            </label>
            <select
              name="category_id"
              value={localFormData.category_id}
              onChange={handleInputChange}
              required
              disabled={loading.linesAction}
              className={`input text-gray-900 ${validationErrors.category_id ? 'border-red-300' : ''}`}
            >
              <option value="" disabled>Sélectionnez une catégorie</option>
              <option value="1">Ordinaire</option>
              <option value="2">Lignes étudiantes</option>
            </select>
            {validationErrors.category_id && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.category_id}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                name="distance_km"
                value={localFormData.distance_km}
                onChange={handleInputChange}
                placeholder="Distance en km (ex: 15.3)"
                list="distances-datalist"
                disabled={loading.linesAction}
                className={`input text-gray-900 ${validationErrors.distance_km ? 'border-red-300' : ''}`}
              />
              <datalist id="distances-datalist">
                {selectionOptions.distances.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              {validationErrors.distance_km && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.distance_km}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Nombre d'arrêts
              </label>
              <input
                type="number"
                name="stops_count"
                value={localFormData.stops_count}
                onChange={handleInputChange}
                placeholder="Nombre d'arrêts (ex: 45)"
                list="stops-count-datalist"
                disabled={loading.linesAction}
                className={`input text-gray-900 ${validationErrors.stops_count ? 'border-red-300' : ''}`}
              />
              <datalist id="stops-count-datalist">
                {selectionOptions.stopsCounts.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              {validationErrors.stops_count && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.stops_count}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading.linesAction}
              className="btn-success-dark flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.linesAction ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  {isEditMode ? 'Modifier la ligne' : 'Créer la ligne'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading.linesAction}
              className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LineFormModal;
