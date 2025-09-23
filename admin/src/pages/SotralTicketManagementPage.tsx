import React, { useState, useCallback, useMemo } from 'react';
import { 
  Ticket, 
  BarChart3, 
  Settings, 
  Download,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

// Types et hooks
import { 
  SotralTicketWithDetails, 
  TicketGenerationRequest,
  BulkTicketGenerationRequest,
  TabConfig 
} from '../types/sotral';

import { 
  useTicketGeneration, 
  useTicketFilters, 
  useAnalytics, 
  useSotralData 
} from '../hooks/sotral';

// Composants modulaires
import {
  TicketTable,
  TicketGenerationForm,
  AnalyticsPanel,
  FilterPanel
} from '../components/sotral';

// Composant pour les onglets
const TabNavigation: React.FC<{
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => (
  <div className="border-b border-gray-200 mb-6">
    <nav className="-mb-px flex space-x-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  </div>
);

// Composant pour les notifications
const Notification: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const iconColor = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400';

  return (
    <div className={`${bgColor} p-4 rounded-lg mb-6`}>
      <div className="flex">
        <Icon className={`h-5 w-5 ${iconColor} mt-0.5`} />
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-3 ${textColor} hover:opacity-75`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Composant principal réorganisé
const SotralTicketManagementPage: React.FC = () => {
  // État local pour l'UI
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState<SotralTicketWithDetails | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Hooks personnalisés pour la logique métier
  const { lines, ticketTypes, isLoading: dataLoading, error: dataError } = useSotralData();
  const { 
    tickets, 
    pagination, 
    filters, 
    isLoading: ticketsLoading, 
    error: ticketsError,
    updateFilters,
    resetFilters,
    refreshTickets 
  } = useTicketFilters();
  
  const { 
    isLoading: generationLoading, 
    error: generationError,
    generateTickets,
    generateBulkTickets 
  } = useTicketGeneration();
  
  const { 
    analytics, 
    isLoading: analyticsLoading, 
    refreshAnalytics 
  } = useAnalytics();

  // Gestionnaires d'événements memoizés
  const handleTicketGeneration = useCallback(async (request: TicketGenerationRequest) => {
    const result = await generateTickets(request);
    if (result?.success) {
      setNotification({
        type: 'success',
        message: result.message || 'Tickets générés avec succès'
      });
      refreshTickets();
    } else {
      setNotification({
        type: 'error',
        message: generationError || 'Erreur lors de la génération'
      });
    }
  }, [generateTickets, generationError, refreshTickets]);

  const handleBulkGeneration = useCallback(async (requests: TicketGenerationRequest[]) => {
    const result = await generateBulkTickets(requests);
    if (result?.success) {
      setNotification({
        type: 'success',
        message: `${result.totalGenerated} tickets générés en lot`
      });
      refreshTickets();
    } else {
      setNotification({
        type: 'error',
        message: generationError || 'Erreur lors de la génération en lot'
      });
    }
  }, [generateBulkTickets, generationError, refreshTickets]);

  const handleViewTicketDetails = useCallback((ticket: SotralTicketWithDetails) => {
    setSelectedTicket(ticket);
    // TODO: Ouvrir modal de détails
  }, []);

  const handleDownloadQR = useCallback(async (ticket: SotralTicketWithDetails) => {
    try {
      // TODO: Implémenter le téléchargement du QR code
      setNotification({
        type: 'info',
        message: `QR Code pour le ticket ${ticket.ticket_code} téléchargé`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors du téléchargement du QR code'
      });
    }
  }, []);

  // Configuration des onglets
  const tabs: TabConfig[] = useMemo(() => [
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      component: () => (
        <div className="space-y-6">
          <FilterPanel
            lines={lines}
            ticketTypes={ticketTypes}
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            onRefresh={refreshTickets}
          />
          <TicketTable
            tickets={tickets}
            loading={ticketsLoading}
            onViewDetails={handleViewTicketDetails}
            onDownloadQR={handleDownloadQR}
          />
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => updateFilters({ page })}
                    className={`px-3 py-1 rounded ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'generation',
      label: 'Génération',
      icon: Settings,
      component: () => (
        <div className="space-y-6">
          <TicketGenerationForm
            lines={lines}
            ticketTypes={ticketTypes}
            loading={generationLoading}
            onGenerate={handleTicketGeneration}
          />
          {/* TODO: Ajouter le formulaire de génération en lot */}
        </div>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: () => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Statistiques et Analytics
            </h3>
            <button
              onClick={refreshAnalytics}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
          </div>
          <AnalyticsPanel
            analytics={analytics}
            loading={analyticsLoading}
          />
        </div>
      )
    }
  ], [
    lines, 
    ticketTypes, 
    filters, 
    tickets, 
    ticketsLoading, 
    generationLoading, 
    analytics, 
    analyticsLoading,
    pagination,
    updateFilters,
    resetFilters,
    refreshTickets,
    refreshAnalytics,
    handleTicketGeneration,
    handleViewTicketDetails,
    handleDownloadQR
  ]);

  // Affichage des erreurs globales
  const globalError = dataError || ticketsError || generationError;

  // Rendu principal
  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Tickets SOTRAL
          </h1>
          <p className="text-gray-600 mt-1">
            Génération, suivi et analyse des tickets de transport
          </p>
        </div>
        
        {/* Indicateurs de statut */}
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-lg font-semibold text-gray-900">
              {pagination.total.toLocaleString()}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Lignes Actives</div>
            <div className="text-lg font-semibold text-gray-900">
              {lines.filter(line => line.is_active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Erreurs globales */}
      {globalError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{globalError}</p>
            </div>
          </div>
        </div>
      )}

      {/* État de chargement global */}
      {dataLoading && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-800">Chargement des données...</p>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenu de l'onglet actif */}
      <div className="min-h-96">
        {tabs.find(tab => tab.id === activeTab)?.component() || (
          <div className="text-center py-12">
            <p className="text-gray-500">Contenu non disponible</p>
          </div>
        )}
      </div>

      {/* Modal de détails de ticket (si nécessaire) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Détails du Ticket {selectedTicket.ticket_code}
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            {/* TODO: Ajouter le contenu des détails */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <p className="text-sm text-gray-900 font-mono">{selectedTicket.ticket_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ligne</label>
                <p className="text-sm text-gray-900">{selectedTicket.line_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedTicket.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTicket.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SotralTicketManagementPage;