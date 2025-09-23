import { useState, useEffect, useCallback } from 'react';
import { adminSotralService } from '../../services/adminSotralService';
import { AnalyticsData, LoadingState } from '../../types/sotral';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null
  });

  const loadAnalytics = useCallback(async (dateFrom?: string, dateTo?: string) => {
    setLoadingState({ isLoading: true, error: null });

    try {
      const response = await adminSotralService.getAnalytics(dateFrom, dateTo);
      
      if (response.data) {
        setAnalytics(response.data);
      }
      
      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des analytics';
      setLoadingState({ isLoading: false, error: errorMessage });
    }
  }, []);

  const refreshAnalytics = useCallback(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Charger les analytics au montage
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    ...loadingState,
    loadAnalytics,
    refreshAnalytics
  };
};