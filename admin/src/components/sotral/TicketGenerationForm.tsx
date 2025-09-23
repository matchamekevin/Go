import React, { useState } from 'react';
import { SotralLine, SotralTicketType, TicketGenerationRequest } from '../../types/sotral';
import { Plus, Zap, Settings } from 'lucide-react';

interface TicketGenerationFormProps {
  lines: SotralLine[];
  ticketTypes: SotralTicketType[];
  loading: boolean;
  onGenerate: (request: TicketGenerationRequest) => void;
}

export const TicketGenerationForm: React.FC<TicketGenerationFormProps> = ({
  lines,
  ticketTypes,
  loading,
  onGenerate
}) => {
  const [formData, setFormData] = useState<TicketGenerationRequest>({
    lineId: 0,
    ticketTypeCode: '',
    quantity: 1,
    validityHours: 24
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lineId || !formData.ticketTypeCode || formData.quantity < 1) {
      return;
    }

    onGenerate(formData);
  };

  const handleInputChange = (field: keyof TicketGenerationRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedLine = lines.find(line => line.id === formData.lineId);
  const selectedTicketType = ticketTypes.find(type => type.code === formData.ticketTypeCode);

  const estimatedPrice = selectedTicketType ? selectedTicketType.price_fcfa * formData.quantity : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            Génération de Tickets
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Générer des tickets pour une ligne spécifique
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-4 w-4 mr-1" />
          {showAdvanced ? 'Masquer' : 'Options avancées'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection de ligne */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ligne SOTRAL *
          </label>
          <select
            value={formData.lineId}
            onChange={(e) => handleInputChange('lineId', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value={0}>Sélectionner une ligne</option>
            {lines.filter(line => line.is_active).map(line => (
              <option key={line.id} value={line.id}>
                {line.line_name} ({line.distance_km} km - {line.stops_count} arrêts)
              </option>
            ))}
          </select>
          {selectedLine && (
            <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
              <span className="font-medium">Distance:</span> {selectedLine.distance_km} km | 
              <span className="font-medium ml-2">Arrêts:</span> {selectedLine.stops_count} | 
              <span className="font-medium ml-2">Prix:</span> {selectedLine.price_range} FCFA
            </div>
          )}
        </div>

        {/* Type de ticket */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de Ticket *
          </label>
          <select
            value={formData.ticketTypeCode}
            onChange={(e) => handleInputChange('ticketTypeCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionner un type</option>
            {ticketTypes.filter(type => type.is_active).map(type => (
              <option key={type.code} value={type.code}>
                {type.name} - {type.price_fcfa} FCFA
                {type.is_student_discount && ' (Étudiant)'}
              </option>
            ))}
          </select>
          {selectedTicketType && (
            <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
              <div><span className="font-medium">Description:</span> {selectedTicketType.description}</div>
              <div><span className="font-medium">Voyages max:</span> {selectedTicketType.max_trips}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité *
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Validité (options avancées) */}
          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validité (heures)
              </label>
              <input
                type="number"
                min="1"
                max="8760"
                value={formData.validityHours}
                onChange={(e) => handleInputChange('validityHours', parseInt(e.target.value) || 24)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Durée de validité en heures (par défaut: 24h)
              </p>
            </div>
          )}
        </div>

        {/* Résumé et prix estimé */}
        {formData.lineId && formData.ticketTypeCode && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Résumé de la génération</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Ligne: <span className="font-medium">{selectedLine?.line_name}</span></div>
              <div>Type: <span className="font-medium">{selectedTicketType?.name}</span></div>
              <div>Quantité: <span className="font-medium">{formData.quantity} tickets</span></div>
              <div>Validité: <span className="font-medium">{formData.validityHours}h</span></div>
              <div className="pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  Prix total estimé: {estimatedPrice.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de génération */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !formData.lineId || !formData.ticketTypeCode}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Générer {formData.quantity} ticket{formData.quantity > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};