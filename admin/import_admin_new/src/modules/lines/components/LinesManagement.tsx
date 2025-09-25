import React, { useState } from 'react';
import { useLinesQueries } from '../hooks/useLinesQueries';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { LineForm } from './LineForm';
import { LineCard } from './LineCard';
import { Plus, Search, Filter } from 'lucide-react';

export const LinesManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    useGetLines, 
    useCreateLine, 
    useUpdateLine, 
    useDeleteLine 
  } = useLinesQueries();
  
  const { data: lines = [], isLoading, error } = useGetLines();
  const createLineMutation = useCreateLine();
  const updateLineMutation = useUpdateLine();
  const deleteLineMutation = useDeleteLine();

  const filteredLines = lines.filter(line =>
    line.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    line.color?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLine = (lineData: any) => {
    createLineMutation.mutate(lineData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      }
    });
  };

  const handleUpdateLine = (lineData: any) => {
    if (selectedLineId) {
      updateLineMutation.mutate({ id: selectedLineId, data: lineData }, {
        onSuccess: () => {
          setSelectedLineId(null);
        }
      });
    }
  };

  const handleDeleteLine = (lineId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
      deleteLineMutation.mutate(lineId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Erreur lors du chargement des lignes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Lignes</h1>
          <p className="text-gray-600">Gérez les lignes de transport SOTRAL</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle ligne
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une ligne..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="secondary" className="whitespace-nowrap">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total lignes</h3>
          <p className="text-2xl font-bold text-gray-900">{lines.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Lignes actives</h3>
          <p className="text-2xl font-bold text-green-600">
            {lines.filter(line => line.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Lignes inactives</h3>
          <p className="text-2xl font-bold text-red-600">
            {lines.filter(line => !line.active).length}
          </p>
        </div>
      </div>

      {/* Liste des lignes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLines.map((line) => (
          <LineCard
            key={line.id}
            line={line}
            onEdit={() => setSelectedLineId(line.id)}
            onDelete={() => handleDeleteLine(line.id)}
          />
        ))}
      </div>

      {filteredLines.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune ligne trouvée pour "{searchQuery}"</p>
        </div>
      )}

      {/* Modale création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer une nouvelle ligne"
      >
        <LineForm
          onSubmit={handleCreateLine}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createLineMutation.isLoading}
        />
      </Modal>

      {/* Modale modification */}
      <Modal
        isOpen={selectedLineId !== null}
        onClose={() => setSelectedLineId(null)}
        title="Modifier la ligne"
      >
        {selectedLineId && (
          <LineForm
            initialData={lines.find(line => line.id === selectedLineId)}
            onSubmit={handleUpdateLine}
            onCancel={() => setSelectedLineId(null)}
            isLoading={updateLineMutation.isLoading}
          />
        )}
      </Modal>
    </div>
  );
};