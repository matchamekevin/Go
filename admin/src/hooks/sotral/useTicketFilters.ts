import { useState, useEffect, useCallback } from 'react';
import { adminSotralService } from '../../services/adminSotralService';
import { 
  SotralTicketWithDetails, 
  TicketFilters, 
  PaginatedResponse,
  LoadingState 
} from '../../types/sotral';

export const useTicketFilters = () => {
  const [tickets, setTickets] = useState<SotralTicketWithDetails[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10
  });
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const loadTickets = useCallback(async (newFilters?: Partial<TicketFilters>) => {
    const currentFilters = { ...filters, ...newFilters };
    setLoadingState({ isLoading: true, error: null });

    try {
      const response = await adminSotralService.getTickets(currentFilters);
      
      if (response.data) {
        setTickets(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
      
      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des tickets';
      setLoadingState({ isLoading: false, error: errorMessage });
    }
  }, [filters, pagination]);

  const updateFilters = useCallback((newFilters: Partial<TicketFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadTickets(newFilters);
  }, [loadTickets]);

  const resetFilters = useCallback(() => {
    const defaultFilters: TicketFilters = { page: 1, limit: 10 };
    setFilters(defaultFilters);
    loadTickets(defaultFilters);
  }, [loadTickets]);

  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changeLimit = useCallback((limit: number) => {
    updateFilters({ page: 1, limit });
  }, [updateFilters]);

  const refreshTickets = useCallback(() => {
    loadTickets();
  }, [loadTickets]);

  // Charger les tickets au montage
  useEffect(() => {
    loadTickets();
  }, []);

  return {
    tickets,
    pagination,
    filters,
    ...loadingState,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    refreshTickets,
    loadTickets
  };
};