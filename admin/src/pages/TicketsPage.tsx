import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Bus, TrendingUp, X, Ticket, DollarSign, CheckCircle, QrCode, Eye, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { SotralLine } from '../services/sotralService';
import { useSotralLinesQuery, useSotralStatsQuery, useGenerateTicketsMutation, useDeleteTicketMutation, useRefreshData } from '../hooks/useReactQuery';

interface SotralStop {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_major_stop: boolean;
  is_active: boolean;
}

interface SotralTicketType {
  id: number;
  name: string;
  code: string;
  description?: string;
  price_fcfa: number;
  validity_duration_hours?: number;
  max_trips: number;
  is_student_discount: boolean;
  is_active: boolean;
}

interface SotralTicket {
  id: number;
  ticket_code: string;
  qr_code: string;
  user_id?: number;
  ticket_type_id: number;
  line_id?: number;
  stop_from_id?: number;
  stop_to_id?: number;
  price_paid_fcfa: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchased_at: Date;
  expires_at?: Date;
  trips_remaining: number;
  payment_method?: string;
  payment_reference?: string;
  created_at: Date;
  updated_at: Date;
  // Relations
  ticket_type?: SotralTicketType;
  line?: SotralLine;
  stop_from?: SotralStop;
  stop_to?: SotralStop;
  user_name?: string;
  user_email?: string;
}

interface TicketGeneration {
  lineId: number;
  ticketTypeCode: string;
  quantity: number;
  validityHours: number;
}

interface LineStats {
  total_lines: number;
  active_lines: number;
  total_stops: number;
  ticket_types: number;
}

interface TicketStats {
  total_tickets: number;
  total_revenue: number;
  active_tickets: number;
  used_tickets: number;
}

const SotralTicketManagementPage: React.FC = () => {
  // Default lines based on the provided list (fallback when API not available)
  const DEFAULT_LINES: SotralLine[] = [
    { id: 1, line_number: 1, name: 'Zanguéra ↔ BIA (Centre-ville)', route_from: 'Zanguéra', route_to: 'BIA', category_id: 1, distance_km: 19.4, stops_count: 68, is_active: true },
    { id: 2, line_number: 2, name: 'Adétikopé ↔ REX (front de mer)', route_from: 'Adétikopé', route_to: 'REX', category_id: 1, distance_km: 24.5, stops_count: 62, is_active: true },
    { id: 3, line_number: 3, name: 'Akato ↔ BIA', route_from: 'Akato', route_to: 'BIA', category_id: 1, distance_km: 19.2, stops_count: 68, is_active: true },
    { id: 6, line_number: 6, name: 'Agoè-Assiyéyé ↔ BIA', route_from: 'Agoè-Assiyéyé', route_to: 'BIA', category_id: 1, distance_km: 16.3, stops_count: 60, is_active: true },
    { id: 7, line_number: 7, name: 'Kpogan ↔ BIA', route_from: 'Kpogan', route_to: 'BIA', category_id: 1, distance_km: 19.7, stops_count: 58, is_active: true },
    { id: 8, line_number: 8, name: 'Djagblé ↔ REX', route_from: 'Djagblé', route_to: 'REX', category_id: 1, distance_km: 18.9, stops_count: 49, is_active: true },
    { id: 10, line_number: 10, name: 'Legbassito ↔ BIA', route_from: 'Legbassito', route_to: 'BIA', category_id: 1, distance_km: 24.2, stops_count: 74, is_active: true },
    { id: 11, line_number: 11, name: 'Attiegouvi ↔ REX', route_from: 'Attiegouvi', route_to: 'REX', category_id: 1, distance_km: 9.5, stops_count: 43, is_active: true },
    { id: 12, line_number: 12, name: 'Entreprise de l\'Union ↔ BIA', route_from: 'Entreprise de l\'Union', route_to: 'BIA', category_id: 1, distance_km: 15.3, stops_count: 66, is_active: true },
    { id: 13, line_number: 13, name: 'Adétikopé ↔ Campus (Université)', route_from: 'Adétikopé', route_to: 'Campus', category_id: 1, distance_km: 17.8, stops_count: 51, is_active: true },
    { id: 14, line_number: 14, name: 'Legbassito ↔ Campus', route_from: 'Legbassito', route_to: 'Campus', category_id: 1, distance_km: 17.3, stops_count: 38, is_active: true },
    { id: 15, line_number: 15, name: 'Zanguéra ↔ Campus', route_from: 'Zanguéra', route_to: 'Campus', category_id: 1, distance_km: 13.2, stops_count: 64, is_active: true },
    { id: 16, line_number: 16, name: 'Akato ↔ Campus', route_from: 'Akato', route_to: 'Campus', category_id: 1, distance_km: 18.0, stops_count: 58, is_active: true },
    { id: 17, line_number: 17, name: 'Adjalolo ↔ Campus', route_from: 'Adjalolo', route_to: 'Campus', category_id: 1, distance_km: 11.1, stops_count: 40, is_active: true },
    { id: 18, line_number: 18, name: 'Adakpamé ↔ Campus', route_from: 'Adakpamé', route_to: 'Campus', category_id: 1, distance_km: 13.0, stops_count: 56, is_active: true },
    { id: 19, line_number: 19, name: 'Akodesséwa-Bè ↔ Campus', route_from: 'Akodesséwa-Bè', route_to: 'Campus', category_id: 1, distance_km: 13.0, stops_count: 45, is_active: true },
    { id: 20, line_number: 20, name: 'Avépozo ↔ Campus', route_from: 'Avépozo', route_to: 'Campus', category_id: 1, distance_km: 18.0, stops_count: 71, is_active: true },
    { id: 21, line_number: 21, name: 'Entreprise de l\'Union ↔ Campus', route_from: 'Entreprise de l\'Union', route_to: 'Campus', category_id: 1, distance_km: 11.0, stops_count: 45, is_active: true },
    { id: 22, line_number: 22, name: 'Djagblé ↔ Campus', route_from: 'Djagblé', route_to: 'Campus', category_id: 1, distance_km: 16.4, stops_count: 41, is_active: true }
  ];
  
  // Utiliser les hooks React Query pour les données avec revalidation intelligente
  const { data: realtimeLines, isLoading: linesLoading } = useSotralLinesQuery();
  const { data: realtimeStats, isLoading: statsLoading } = useSotralStatsQuery();

  // Mutations pour les opérations
  const generateTicketsMutation = useGenerateTicketsMutation();
  const deleteTicketMutation = useDeleteTicketMutation();
  const { refreshAll } = useRefreshData();

  // États pour les tickets
  const [tickets, setTickets] = useState<SotralTicket[]>([]);
  const [ticketTypes, setTicketTypes] = useState<SotralTicketType[]>([]);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  // Selection pour suppression de tickets
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);
  
  // États pour l'interface
  const [activeTab, setActiveTab] = useState<'lines' | 'tickets' | 'generation' | 'analytics'>('lines');
  
  // Modales
  const [isTicketGenerationModalOpen, setIsTicketGenerationModalOpen] = useState(false);
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false);
  const [isBulkGenerationModalOpen, setIsBulkGenerationModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SotralTicket | null>(null);
  
  // Erreurs et notifications
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);

  // Formulaires (formData removed; page uses dedicated ticket generation forms)

  const [ticketGenForm, setTicketGenForm] = useState<TicketGeneration>({
    lineId: 0,
    ticketTypeCode: 'SIMPLE',
    quantity: 100,
    validityHours: 24
  });

  // Prix optionnel pour la génération
  const [generationPriceFcfa, setGenerationPriceFcfa] = useState<number | ''>('');

  const [bulkGenForm, setBulkGenForm] = useState({
    ticketTypeCode: 'SIMPLE',
    quantityPerLine: 50,
    validityHours: 24,
    selectedLineIds: [] as number[]
  });

  // Filtres pour les tickets
  const [ticketFilters, setTicketFilters] = useState({
    status: '',
    lineId: '',
    dateFrom: '',
    dateTo: '',
    ticketType: ''
  });

  // Gérer l'état du body pour les modales
  useEffect(() => {
    const hasModalOpen = isTicketGenerationModalOpen || isBulkGenerationModalOpen || isTicketDetailsModalOpen;
    
    if (hasModalOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }

    // Cleanup au démontage
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isTicketGenerationModalOpen, isBulkGenerationModalOpen, isTicketDetailsModalOpen]);

  const showErrorToast = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const now = Date.now();
    if (now - lastErrorTime > 2000) {
      if (type === 'error') toast.error(message);
      else if (type === 'warning') toast(message, { icon: '⚠️' });
      else toast(message, { icon: 'ℹ️' });
      setLastErrorTime(now);
    }
  };

  // Calculer les lignes affichées en utilisant les données React Query
  const lines = useMemo(() => {
    if (realtimeLines && realtimeLines.length > 0) {
      return realtimeLines;
    }
    return DEFAULT_LINES;
  }, [realtimeLines]);

  // Filtrer les tickets selon les critères
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (ticketFilters.status && ticket.status !== ticketFilters.status) return false;
      if (ticketFilters.lineId && ticket.line_id !== parseInt(ticketFilters.lineId)) return false;
      if (ticketFilters.ticketType && ticket.ticket_type?.code !== ticketFilters.ticketType) return false;
      if (ticketFilters.dateFrom && new Date(ticket.created_at) < new Date(ticketFilters.dateFrom)) return false;
      if (ticketFilters.dateTo && new Date(ticket.created_at) > new Date(ticketFilters.dateTo)) return false;
      return true;
    });
  }, [tickets, ticketFilters]);

  useEffect(() => {
    // Charger les tickets initialement
    const loadInitialTickets = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/tickets?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const ticketsData = await response.json();
          const ticketsArray = ticketsData.data || [];
          setTickets(ticketsArray);
          
          // Calculer les stats des tickets
          const ticketStats: TicketStats = {
            total_tickets: ticketsArray.length,
            total_revenue: ticketsArray.reduce((sum: number, ticket: any) => sum + ticket.price_paid_fcfa, 0),
            active_tickets: ticketsArray.filter((t: any) => t.status === 'active').length,
            used_tickets: ticketsArray.filter((t: any) => t.status === 'used').length
          };
          setTicketStats(ticketStats);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
      }
    };

    // Charger les types de tickets
    const loadTicketTypes = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/ticket-types`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const ticketTypesData = await response.json();
          const ticketTypesArray = ticketTypesData.data || ticketTypesData || [];
          setTicketTypes(ticketTypesArray);
        } else {
          console.warn('Impossible de charger les types de tickets, utilisation des valeurs par défaut');
          // Valeurs par défaut si l'API ne fonctionne pas
          setTicketTypes([
            { id: 1, name: 'Simple', code: 'SIMPLE', price_fcfa: 150, validity_duration_hours: 24, max_trips: 1, is_student_discount: false, is_active: true },
            { id: 2, name: 'Aller-retour', code: 'ROUND_TRIP', price_fcfa: 250, validity_duration_hours: 48, max_trips: 2, is_student_discount: false, is_active: true },
            { id: 3, name: 'Étudiant', code: 'STUDENT', price_fcfa: 100, validity_duration_hours: 24, max_trips: 1, is_student_discount: true, is_active: true }
          ]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des types de tickets:', error);
        // Valeurs par défaut en cas d'erreur
        setTicketTypes([
          { id: 1, name: 'Simple', code: 'SIMPLE', price_fcfa: 150, validity_duration_hours: 24, max_trips: 1, is_student_discount: false, is_active: true },
          { id: 2, name: 'Aller-retour', code: 'ROUND_TRIP', price_fcfa: 250, validity_duration_hours: 48, max_trips: 2, is_student_discount: false, is_active: true },
          { id: 3, name: 'Étudiant', code: 'STUDENT', price_fcfa: 100, validity_duration_hours: 24, max_trips: 1, is_student_discount: true, is_active: true }
        ]);
      }
    };

    loadInitialTickets();
    loadTicketTypes();
  }, []);

  // Génération de tickets pour une ligne
  const generateTicketsForLine = async () => {
    if (!ticketGenForm.lineId || ticketGenForm.quantity <= 0) {
      showErrorToast('Veuillez sélectionner une ligne et une quantité valide');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/generate-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineId: ticketGenForm.lineId,
          ticketTypeCode: ticketGenForm.ticketTypeCode,
          quantity: ticketGenForm.quantity,
          validityHours: ticketGenForm.validityHours,
          price_fcfa: generationPriceFcfa === '' ? undefined : generationPriceFcfa
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setIsTicketGenerationModalOpen(false);
        // Plus besoin de recharger manuellement, les données sont temps réel
      } else {
        const error = await response.json();
        showErrorToast(error.error || 'Erreur lors de la génération des tickets');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showErrorToast('Erreur lors de la génération des tickets');
    }
  };

  // Génération en masse
  const bulkGenerateTickets = async () => {
    if (bulkGenForm.selectedLineIds.length === 0 || bulkGenForm.quantityPerLine <= 0) {
      showErrorToast('Veuillez sélectionner au moins une ligne et une quantité valide');
      return;
    }

    try {
      const promises = bulkGenForm.selectedLineIds.map(lineId =>
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/generate-tickets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineId: lineId,
            ticketTypeCode: bulkGenForm.ticketTypeCode,
            quantity: bulkGenForm.quantityPerLine,
            validityHours: bulkGenForm.validityHours,
            price_fcfa: generationPriceFcfa === '' ? undefined : generationPriceFcfa
          })
        })
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} générations réussies${failed > 0 ? `, ${failed} échecs` : ''}`);
        setIsBulkGenerationModalOpen(false);
        // Plus besoin de recharger manuellement, les données sont temps réel
      } else {
        showErrorToast('Toutes les générations ont échoué');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showErrorToast('Erreur lors de la génération en masse');
    }
  };

  const refreshData = () => {
    refreshAll();
    toast.success('Données actualisées avec succès');
  };

  // Suppression de tickets (un ou plusieurs)
  const deleteTickets = async (ids: number[]) => {
    console.log('🗑️ deleteTickets called with IDs:', ids);
    if (ids.length === 0) return;

    try {
      // Utiliser la mutation React Query pour supprimer
      for (const id of ids) {
        await deleteTicketMutation.mutateAsync(id);
      }
      toast.success(`${ids.length} ticket(s) supprimé(s) avec succès`);
    } catch (error) {
      console.error('🗑️ Error in deleteTickets:', error);
      showErrorToast('Erreur lors de la suppression des tickets');
    }
  };

  // NOTE: form input handling uses specific handlers for ticket generation and bulk generation.

  const handleTicketGenInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicketGenForm(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'validityHours' || name === 'lineId' ? parseInt(value) : value 
    }));
  };

  const handleBulkGenInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'selectedLineIds') {
      const lineId = parseInt(value);
      setBulkGenForm(prev => ({
        ...prev,
        selectedLineIds: prev.selectedLineIds.includes(lineId)
          ? prev.selectedLineIds.filter(id => id !== lineId)
          : [...prev.selectedLineIds, lineId]
      }));
    } else {
      setBulkGenForm(prev => ({ 
        ...prev, 
        [name]: name === 'quantityPerLine' || name === 'validityHours' ? parseInt(value) : value 
      }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicketFilters(prev => ({ ...prev, [name]: value }));
  };

  const openTicketDetails = (ticket: SotralTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailsModalOpen(true);
  };

  const closeAllModals = () => {
    setIsTicketGenerationModalOpen(false);
    setIsTicketDetailsModalOpen(false);
    setIsBulkGenerationModalOpen(false);
    setSelectedTicket(null);
  };

  if (linesLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#065f46] mx-auto mb-4"></div>
          <p className="text-[#065f46] font-semibold">Chargement des données SOTRAL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Tickets SOTRAL</h1>
          <p className="text-gray-600 mt-1">
            Gérez les lignes de transport et générez des tickets
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsTicketGenerationModalOpen(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full transition-all duration-200 shadow-lg"
          >
            <Ticket className="h-5 w-5 mr-2" />
            Générer Tickets
          </button>
          <button
            onClick={() => setIsBulkGenerationModalOpen(true)}
            className="flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-full transition-all duration-200 shadow-lg"
          >
            <Target className="h-5 w-5 mr-2" />
            Génération Masse
          </button>
          <button
            onClick={refreshData}
            className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full transition-all duration-200 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-container p-6 rounded-xl">
          <div className="flex items-center">
            <Bus className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lignes Actives</p>
              <p className="text-2xl font-bold text-gray-900">{realtimeStats?.active_lines || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-container p-6 rounded-xl">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{ticketStats?.total_tickets || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-container p-6 rounded-xl">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus (FCFA)</p>
              <p className="text-2xl font-bold text-gray-900">{ticketStats?.total_revenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-container p-6 rounded-xl">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tickets Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{ticketStats?.active_tickets || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'lines', label: 'Lignes', icon: Bus },
            { id: 'tickets', label: 'Tickets', icon: Ticket },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${
                activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'lines' && (
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
                    Distance (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrêts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarifs (FCFA)
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
                {lines.map((line) => {
                  // Calculer les tarifs disponibles pour cette ligne
                  const availableTarifs = (() => {
                    // Filtrer les types de tickets actifs et non étudiants
                    const availableTypes = ticketTypes.filter(type => 
                      type.is_active && !type.is_student_discount
                    );
                    
                    if (availableTypes.length === 0) {
                      return 'N/A';
                    }
                    
                    // Trier par prix croissant
                    const sortedTypes = availableTypes.sort((a, b) => a.price_fcfa - b.price_fcfa);
                    
                    // Afficher les prix séparés par des virgules
                    return sortedTypes.map(type => `${type.price_fcfa}`).join(', ');
                  })();
                  
                  return (
                    <tr 
                      key={line.id} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
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
                        {line.distance_km}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {line.stops_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {availableTarifs}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setTicketGenForm(prev => ({ ...prev, lineId: line.id! }));
                            setIsTicketGenerationModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Ticket className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="glass-container p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les tickets</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                name="status"
                value={ticketFilters.status}
                onChange={handleFilterChange}
                className="input text-gray-900"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="used">Utilisé</option>
                <option value="expired">Expiré</option>
                <option value="cancelled">Annulé</option>
              </select>
              
              <select
                name="lineId"
                value={ticketFilters.lineId}
                onChange={handleFilterChange}
                className="input text-gray-900"
              >
                <option value="">Toutes les lignes</option>
                {lines.map(line => (
                  <option key={line.id} value={line.id} disabled={!line.is_active}>
                    Ligne {line.line_number} - {line.name}{!line.is_active ? ' (Inactive)' : ''}
                  </option>
                ))}
              </select>
              
              <input
                type="date"
                name="dateFrom"
                value={ticketFilters.dateFrom}
                onChange={handleFilterChange}
                className="input text-gray-900"
                placeholder="Date début"
              />
              
              <input
                type="date"
                name="dateTo"
                value={ticketFilters.dateTo}
                onChange={handleFilterChange}
                className="input text-gray-900"
                placeholder="Date fin"
              />
              
              <button
                onClick={() => setTicketFilters({
                  status: '', lineId: '', dateFrom: '', dateTo: '', ticketType: ''
                })}
                className="btn-secondary"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Liste des tickets */}
          <div className="glass-container rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tickets ({filteredTickets.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deleteTickets(selectedTicketIds)}
                    disabled={selectedTicketIds.length === 0}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedTicketIds.length === 0 ? "Aucune sélection" : `Supprimer ${selectedTicketIds.length} ticket(s)`}
                  >
                    Supprimer sélection
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="form-checkbox" onChange={(e) => {
                        if (e.target.checked) setSelectedTicketIds(filteredTickets.slice(0,1000).map(t => t.id));
                        else setSelectedTicketIds([]);
                      }} checked={selectedTicketIds.length > 0 && selectedTicketIds.length === Math.min(filteredTickets.length, 1000)} />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ligne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix (FCFA)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.slice(0, 1000).map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTicketIds.includes(ticket.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTicketIds(prev => [...prev, ticket.id]);
                              else setSelectedTicketIds(prev => prev.filter(id => id !== ticket.id));
                            }}
                            className="form-checkbox"
                          />
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.ticket_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.ticket_type?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.line ? `Ligne ${ticket.line.line_number}` : 'Non assigné'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.line?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.price_paid_fcfa.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'used' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status === 'active' ? 'Actif' :
                           ticket.status === 'used' ? 'Utilisé' :
                           ticket.status === 'expired' ? 'Expiré' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openTicketDetails(ticket)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Voir QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={() => deleteTickets(selectedTicketIds)}
            disabled={selectedTicketIds.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Supprimer sélection ({selectedTicketIds.length})
          </button>
        </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Graphiques et analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par statut */}
            <div className="glass-container p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
              <div className="space-y-3">
                {(() => {
                  const statusCounts = {
                    active: tickets.filter(t => t.status === 'active').length,
                    used: tickets.filter(t => t.status === 'used').length,
                    expired: tickets.filter(t => t.status === 'expired').length,
                    cancelled: tickets.filter(t => t.status === 'cancelled').length
                  };

                  const total = tickets.length;
                  const statusLabels = {
                    active: 'Actifs',
                    used: 'Utilisés',
                    expired: 'Expirés',
                    cancelled: 'Annulés'
                  };

                  return Object.entries(statusCounts).map(([status, count]) => {
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            status === 'active' ? 'bg-green-500' :
                            status === 'used' ? 'bg-blue-500' :
                            status === 'expired' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">{statusLabels[status as keyof typeof statusLabels]}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Top lignes */}
            <div className="glass-container p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top lignes utilisées</h3>
              <div className="space-y-3">
                {(() => {
                  const lineStats = tickets.reduce((acc, ticket) => {
                    if (ticket.line) {
                      const lineKey = `Ligne ${ticket.line.line_number}`;
                      acc[lineKey] = (acc[lineKey] || 0) + 1;
                    }
                    return acc;
                  }, {} as Record<string, number>);

                  return Object.entries(lineStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([lineName, count]) => (
                      <div key={lineName} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate">{lineName}</span>
                        <span className="text-sm font-medium text-gray-900">{count} tickets</span>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>

          {/* Types de tickets */}
          <div className="glass-container p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de tickets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const typeStats = tickets.reduce((acc, ticket) => {
                  const typeName = ticket.ticket_type?.name || 'Non spécifié';
                  acc[typeName] = (acc[typeName] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                return Object.entries(typeStats).map(([typeName, count]) => (
                  <div key={typeName} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{typeName}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Évolution temporelle */}
          <div className="glass-container p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes (7 derniers jours)</h3>
            <div className="space-y-3">
              {(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  return date.toISOString().split('T')[0];
                });

                return last7Days.map(date => {
                  const dayTickets = tickets.filter(ticket =>
                    new Date(ticket.created_at).toISOString().split('T')[0] === date
                  );
                  const revenue = dayTickets.reduce((sum, ticket) => sum + ticket.price_paid_fcfa, 0);

                  return (
                    <div key={date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-700">
                        {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-900">{dayTickets.length} tickets</span>
                        <span className="text-sm font-medium text-gray-900">{revenue.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de génération de tickets */}
      {isTicketGenerationModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            margin: 0,
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="modal-content glass-container p-8 rounded-2xl max-w-md w-full animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: 10000,
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Ticket className="h-6 w-6 mr-3 text-blue-600" />
                Générer des tickets
              </h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Ligne *
                </label>
                <select
                  name="lineId"
                  value={ticketGenForm.lineId}
                  onChange={handleTicketGenInputChange}
                  required
                  className="input text-gray-900"
                >
                  <option value={0}>Sélectionnez une ligne</option>
                  {lines.map(line => (
                    <option key={line.id} value={line.id} disabled={!line.is_active}>
                      Ligne {line.line_number} - {line.name}{!line.is_active ? ' (Inactive)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Lignes ordinaires, Lignes étudiantes *
                </label>
                <select
                  name="ticketTypeCode"
                  value={ticketGenForm.ticketTypeCode}
                  onChange={handleTicketGenInputChange}
                  required
                  className="input text-gray-900"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="ordinaires">Lignes ordinaires</option>
                  <option value="etudiantes">Lignes étudiantes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Quantité *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={ticketGenForm.quantity}
                  onChange={handleTicketGenInputChange}
                  min="1"
                  max="1000"
                  required
                  className="input text-gray-900"
                  placeholder="Ex: 100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Validité (heures)
                </label>
                <input
                  type="number"
                  name="validityHours"
                  value={ticketGenForm.validityHours}
                  onChange={handleTicketGenInputChange}
                  min="1"
                  max="8760"
                  className="input text-gray-900"
                  placeholder="Ex: 24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Prix (FCFA)</label>
                <input
                  type="number"
                  name="generationPriceFcfa"
                  value={generationPriceFcfa}
                  onChange={(e) => setGenerationPriceFcfa(e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="0"
                  className="input text-gray-900"
                  placeholder="Ex: 150"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={generateTicketsForLine}
                  className="btn-success-dark flex-1"
                >
                  Générer
                </button>
                <button
                  onClick={closeAllModals}
                  className="btn-danger flex-1"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de génération en masse */}
      {isBulkGenerationModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            margin: 0,
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="modal-content glass-container p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: 10000,
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Target className="h-6 w-6 mr-3 text-purple-600" />
                Génération en masse
              </h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Sélectionner les lignes
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {lines.map(line => (
                    <label key={line.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={line.id}
                        checked={bulkGenForm.selectedLineIds.includes(line.id!)}
                        onChange={(e) => handleBulkGenInputChange(e)}
                        name="selectedLineIds"
                        className="mr-2"
                        disabled={!line.is_active}
                      />
                      <span className={`text-sm ${!line.is_active ? 'text-gray-400' : 'text-gray-900'}`}>Ligne {line.line_number} - {line.name}{!line.is_active ? ' (Inactive)' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Prix (FCFA) (optionnel)</label>
                <input
                  type="number"
                  name="generationPriceFcfa_bulk"
                  value={generationPriceFcfa}
                  onChange={(e) => setGenerationPriceFcfa(e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="0"
                  className="input text-gray-900"
                  placeholder="Ex: 150"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Lignes ordinaires, Lignes étudiantes
                  </label>
                  <select
                    name="ticketTypeCode"
                    value={bulkGenForm.ticketTypeCode}
                    onChange={handleBulkGenInputChange}
                    className="input text-gray-900"
                  >
                    <option value="" className="text-gray-900">Sélectionner un type</option>
                    <option value="ordinaires" className="text-gray-900">Lignes ordinaires</option>
                    <option value="etudiantes" className="text-gray-900">Lignes étudiantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Quantité par ligne
                  </label>
                  <input
                    type="number"
                    name="quantityPerLine"
                    value={bulkGenForm.quantityPerLine}
                    onChange={handleBulkGenInputChange}
                    min="1"
                    max="500"
                    className="input text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">
                  Validité (heures)
                </label>
                <input
                  type="number"
                  name="validityHours"
                  value={bulkGenForm.validityHours}
                  onChange={handleBulkGenInputChange}
                  min="1"
                  max="8760"
                  className="input text-gray-900"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Résumé</h4>
                <p className="text-sm text-gray-600">
                  {bulkGenForm.selectedLineIds.length} ligne(s) sélectionnée(s)<br/>
                  {bulkGenForm.quantityPerLine} tickets par ligne<br/>
                  <strong className="text-gray-900">Total: {bulkGenForm.selectedLineIds.length * bulkGenForm.quantityPerLine} tickets</strong>
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={bulkGenerateTickets}
                  disabled={bulkGenForm.selectedLineIds.length === 0}
                  className="btn-success-dark flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Générer en masse
                </button>
                <button
                  onClick={closeAllModals}
                  className="btn-danger flex-1"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails du ticket */}
      {isTicketDetailsModalOpen && selectedTicket && (
        <div 
          className="modal-backdrop" 
          onClick={closeAllModals}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            margin: 0,
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="modal-content glass-container p-8 rounded-2xl max-w-lg w-full animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: 10000,
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Ticket className="h-6 w-6 mr-3 text-blue-600" />
                Détails du ticket
              </h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Code Ticket</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-900">{selectedTicket.ticket_code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Statut</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedTicket.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedTicket.status === 'used' ? 'bg-blue-100 text-blue-800' :
                    selectedTicket.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTicket.status === 'active' ? 'Actif' :
                     selectedTicket.status === 'used' ? 'Utilisé' :
                     selectedTicket.status === 'expired' ? 'Expiré' : 'Annulé'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Ligne</label>
                <p className="text-sm text-gray-900">
                  {selectedTicket.line ? `Ligne ${selectedTicket.line.line_number} - ${selectedTicket.line.name}` : 'Non assigné'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Prix payé</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedTicket.price_paid_fcfa.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Trajets restants</label>
                  <p className="text-sm text-gray-900">{selectedTicket.trips_remaining}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Créé le</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                {selectedTicket.expires_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Expire le</label>
                    <p className="text-sm text-gray-900">{new Date(selectedTicket.expires_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedTicket.qr_code && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">QR Code</label>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-xs text-gray-500 font-mono break-all">
                      {selectedTicket.qr_code}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (selectedTicket) {
                        deleteTickets([selectedTicket.id]);
                        setIsTicketDetailsModalOpen(false);
                        setSelectedTicket(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Supprimer le ticket
                  </button>

                  <button
                    onClick={closeAllModals}
                    className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SotralTicketManagementPage;
