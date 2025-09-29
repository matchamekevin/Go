import { useState, useEffect, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // en millisecondes, défaut 30000 (30s)
  enabled?: boolean; // si la réactualisation automatique est activée
}

interface UseAutoRefreshReturn {
  lastRefresh: Date;
  isRefreshing: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshData: (showLoading?: boolean) => Promise<void>;
}

/**
 * Hook pour gérer la réactualisation automatique des données
 * Utilise un polling toutes les 30 secondes par défaut
 */
export function useAutoRefresh(
  refreshFunction: () => Promise<void>,
  options: UseAutoRefreshOptions = {}
): UseAutoRefreshReturn {
  const { interval = 30000, enabled = true } = options;

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(enabled);

  const refreshData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true);
      await refreshFunction();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, [refreshFunction]);

  // Polling automatique
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refreshData(false); // Rafraîchissement silencieux
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, interval, refreshData]);

  return {
    lastRefresh,
    isRefreshing,
    autoRefresh,
    setAutoRefresh,
    refreshData,
  };
}