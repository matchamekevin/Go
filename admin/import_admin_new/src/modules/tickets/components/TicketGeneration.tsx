import React, { useState } from 'react';
import { useTicketsQueries } from '../hooks/useTicketsQueries';
import { useLinesQueries } from '../../lines/hooks/useLinesQueries';
import { Button } from '../../../shared/components/Button';
import { Plus, Download, Users, Ticket } from 'lucide-react';

export const TicketGeneration: React.FC = () => {
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(50);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { useGenerateTickets } = useTicketsQueries();
  const { useGetLines } = useLinesQueries();
  
  const { data: lines = [] } = useGetLines();
  const generateTicketsMutation = useGenerateTickets();

  const handleGenerateTickets = async () => {
    if (!selectedLineId || quantity <= 0) {
      alert('Veuillez sélectionner une ligne et une quantité valide');
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateTicketsMutation.mutateAsync({
        lineId: selectedLineId,
        quantity: quantity
      });
      
      // Télécharger automatiquement les QR codes
      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `tickets_ligne_${selectedLineId}_${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
      }
      
      alert(`${quantity} tickets générés avec succès !`);
      
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération des tickets');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Génération de Tickets</h1>
        <p className="text-gray-600">Générez des tickets QR pour les lignes SOTRAL</p>
      </div>

      {/* Formulaire de génération */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Nouveau lot de tickets
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection de ligne */}
          <div>
            <label htmlFor="line" className="block text-sm font-medium text-gray-700 mb-2">
              Ligne de transport *
            </label>
            <select
              id="line"
              value={selectedLineId || ''}
              onChange={(e) => setSelectedLineId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            >
              <option value="">Sélectionnez une ligne</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de tickets *
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50"
              disabled={isGenerating}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum 1000 tickets par génération
            </p>
          </div>
        </div>

        {/* Aperçu */}
        {selectedLineId && quantity > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Aperçu</h3>
            <div className="flex items-center space-x-4 text-sm text-blue-800">
              <div className="flex items-center">
                <Ticket className="w-4 h-4 mr-1" />
                {quantity} tickets
              </div>
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: lines.find(l => l.id === selectedLineId)?.color }}
                />
                {lines.find(l => l.id === selectedLineId)?.name}
              </div>
            </div>
          </div>
        )}

        {/* Bouton de génération */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleGenerateTickets}
            disabled={!selectedLineId || quantity <= 0 || isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Génération en cours...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Générer les tickets
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Guide d'utilisation
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
              1
            </div>
            <div>
              <strong>Sélectionnez une ligne :</strong> Choisissez la ligne de transport pour laquelle générer les tickets
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
              2
            </div>
            <div>
              <strong>Définissez la quantité :</strong> Indiquez le nombre de tickets à générer (1-1000)
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
              3
            </div>
            <div>
              <strong>Générez et téléchargez :</strong> Les QR codes seront automatiquement téléchargés au format ZIP
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
              4
            </div>
            <div>
              <strong>Distribution :</strong> Imprimez et distribuez les tickets aux utilisateurs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};