import { useState, useEffect, useCallback } from 'react';
import { adminSotralService } from '../../services/adminSotralService';
import { SotralLine, SotralTicketType, LoadingState } from '../../types/sotral';

export const useSotralData = () => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [ticketTypes, setTicketTypes] = useState<SotralTicketType[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const loadLines = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await adminSotralService.getLines();
      setLines(response.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des lignes';
      setLoadingState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadTicketTypes = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await adminSotralService.getTicketTypes();
      setTicketTypes(response.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des types de tickets';
      setLoadingState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null });
    
    try {
      await Promise.all([
        loadLines(),
        loadTicketTypes()
      ]);
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des données';
      setLoadingState({ isLoading: false, error: errorMessage });
    }
  }, [loadLines, loadTicketTypes]);

  const refreshData = useCallback(() => {
    loadAllData();
  }, [loadAllData]);

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    lines,
    ticketTypes,
    ...loadingState,
    loadLines,
    loadTicketTypes,
    loadAllData,
    refreshData
  };
};