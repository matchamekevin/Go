import { useState, useEffect, useCallback } from 'react';
import { SotralTicket, ApiResponse, TicketFilters } from '../types/sotral';
import { adminSotralService } from '../services/adminSotralService';

interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found' | 'unknown';
  message: string;
  details?: string;
  suggestion?: string;
  errorType?: string;
}

interface UseSotralTicketsReturn {
  tickets: SotralTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  error: ApiError | null;
  filters: TicketFilters;
  loadTickets: (filters?: TicketFilters) => Promise<void>;
  updateTicketStatus: (id: number, status: string) => Promise<ApiResponse<SotralTicket>>;
  deleteTicket: (id: number) => Promise<ApiResponse<void>>;
  setFilters: (filters: Partial<TicketFilters>) => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const CACHE_KEY = 'sotral:tickets:cache';
const CACHE_TIMESTAMP_KEY = 'sotral:tickets:timestamp';

export const useSotralTickets = (initialFilters: TicketFilters = {}): UseSotralTicketsReturn => {
  const [tickets, setTickets] = useState<SotralTicket[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [filters, setFiltersState] = useState<TicketFilters>({
    page: 1,
    limit: 20,
    ...initialFilters
  });

  // Cache management
  const readCache = useCallback((): { tickets: SotralTicket[]; pagination: any } | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (!raw || !timestamp) return null;

      // Check if cache is still valid (1 hour for tickets)
      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > 60 * 60 * 1000) {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        return null;
      }

      return JSON.parse(raw);
    } catch (e) {
      console.warn('[useSotralTickets] failed to read cache', e);
      return null;
    }
  }, []);

  const writeCache = useCallback((data: { tickets: SotralTicket[]; pagination: any }) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('[useSotralTickets] failed to write cache', e);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiError = useCallback((apiResponse: ApiResponse<any>): ApiError => {
    const errorType = (apiResponse as any).errorType || 'unknown';

    let type: ApiError['type'] = 'unknown';
    let suggestion = 'Veuillez réessayer.';

    switch (errorType) {
      case 'auth':
        type = 'auth';
        suggestion = 'Vérifiez votre session et reconnectez-vous si nécessaire.';
        break;
      case 'network':
        type = 'network';
        suggestion = 'Vérifiez votre connexion internet.';
        break;
      case 'validation':
        type = 'validation';
        suggestion = 'Vérifiez les données saisies.';
        break;
      case 'not_found':
        type = 'not_found';
        suggestion = 'Le ticket demandé n\'existe pas.';
        break;
      case 'server':
        type = 'server';
        suggestion = 'Un problème serveur s\'est produit. Réessayez plus tard.';
        break;
      default:
        type = 'server';
    }

    return {
      type,
      message: apiResponse.error || 'Une erreur inattendue s\'est produite',
      details: apiResponse.error,
      suggestion,
      errorType
    };
  }, []);

  const loadTickets = useCallback(async (newFilters?: Partial<TicketFilters>) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = { ...filters, ...newFilters };
      setFiltersState(currentFilters);

      const response = await adminSotralService.getTickets(currentFilters);

      if (response.success && response.data) {
        setTickets(response.data.data);
        setPagination({
          page: response.data.pagination?.page || currentFilters.page || 1,
          limit: response.data.pagination?.limit || currentFilters.limit || 20,
          total: response.data.pagination?.total || response.data.data.length,
          pages: Math.ceil((response.data.pagination?.total || response.data.data.length) / (currentFilters.limit || 20))
        });

        // Cache the results
        writeCache({
          tickets: response.data.data,
          pagination: response.data.pagination
        });
      } else {
        // Try to use cache as fallback
        const fallback = readCache();
        if (fallback) {
          setTickets(fallback.tickets);
          setPagination(fallback.pagination);
        }

        setError(handleApiError(response));
      }
    } catch (err) {
      // Network error - try cache
      const fallback = readCache();
      if (fallback) {
        setTickets(fallback.tickets);
        setPagination(fallback.pagination);
      }

      setError({
        type: 'network',
        message: 'Erreur de connexion',
        details: 'Impossible de contacter le serveur.',
        suggestion: 'Vérifiez votre connexion internet.'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, readCache, writeCache, handleApiError]);

  const updateTicketStatus = useCallback(async (id: number, status: string): Promise<ApiResponse<SotralTicket>> => {
    try {
      setError(null);
      const response = await adminSotralService.updateTicketStatus(id, status);

      if (response.success && response.data) {
        // Mettre à jour l'état local immédiatement
        setTickets(prev => prev.map(ticket => ticket.id === id ? response.data! : ticket));
        
        // Rafraîchir les données depuis le serveur pour être sûr d'avoir l'état à jour
        setTimeout(() => loadTickets(), 500);
        
        return response;
      } else {
        const apiError = handleApiError(response);
        setError(apiError);
        return response;
      }
    } catch (err) {
      const networkError = {
        type: 'network' as const,
        message: 'Erreur de connexion',
        details: 'Impossible de modifier le statut du ticket.',
        suggestion: 'Vérifiez votre connexion internet.'
      };
      setError(networkError);
      return { success: false, error: networkError.message };
    }
  }, [handleApiError, loadTickets]);

  const deleteTicket = useCallback(async (id: number): Promise<ApiResponse<void>> => {
    try {
      setError(null);
      const response = await adminSotralService.deleteTicket(id);

      if (response.success) {
        // Mettre à jour l'état local immédiatement
        setTickets(prev => prev.filter(ticket => ticket.id !== id));
        // Update pagination
        if (pagination) {
          setPagination(prev => prev ? {
            ...prev,
            total: prev.total - 1,
            pages: Math.ceil((prev.total - 1) / prev.limit)
          } : null);
        }
        
        // Rafraîchir les données depuis le serveur pour être sûr d'avoir l'état à jour
        setTimeout(() => loadTickets(), 500);
        
        return response;
      } else {
        const apiError = handleApiError(response);
        setError(apiError);
        return response;
      }
    } catch (err) {
      const networkError = {
        type: 'network' as const,
        message: 'Erreur de connexion',
        details: 'Impossible de supprimer le ticket.',
        suggestion: 'Vérifiez votre connexion internet.'
      };
      setError(networkError);
      return { success: false, error: networkError.message };
    }
  }, [handleApiError, pagination, loadTickets]);

  const setFilters = useCallback((newFilters: Partial<TicketFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  }, []);

  const refresh = useCallback(async () => {
    await loadTickets();
  }, [loadTickets]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    tickets,
    pagination,
    loading,
    error,
    filters,
    loadTickets,
    updateTicketStatus,
    deleteTicket,
    setFilters,
    refresh,
    clearError
  };
};