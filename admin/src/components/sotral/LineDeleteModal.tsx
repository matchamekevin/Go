import React from 'react';
import { AlertTriangle, X, Trash2, XCircle } from 'lucide-react';
import { useSotralOperations } from '../../hooks/useSotralOperations';

interface LineDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LineDeleteModal: React.FC<LineDeleteModalProps> = ({ isOpen, onClose }) => {
  const { selectedLine, loading, deleteLine, closeAllModals } = useSotralOperations();

  if (!isOpen || !selectedLine) return null;

  const handleDelete = async () => {
    const result = await deleteLine(selectedLine.id);
    if (result) {
      closeAllModals();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-container p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
            Confirmer la suppression
          </h3>
          <button
            onClick={onClose}
            disabled={loading.linesAction}
            className="text-gray-400 transition-colors duration-200 p-2 rounded-lg disabled:opacity-50"
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
              onClick={handleDelete}
              disabled={loading.linesAction}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.linesAction ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Désactiver définitivement
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading.linesAction}
              className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineDeleteModal;
