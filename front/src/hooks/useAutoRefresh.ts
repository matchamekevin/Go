import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

interface UseAutoRefreshOptions {
  refreshInterval?: number; // en millisecondes
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}

export const useAutoRefresh = ({
  refreshInterval = 30000, // 30 secondes par défaut
  onRefresh,
  enabled = true,
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;

    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        try {
          await onRefresh();
        } catch (error) {
          console.error('Erreur lors du rafraîchissement automatique:', error);
        }
      }, refreshInterval);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Démarrer l'intervalle
    startInterval();

    // Gérer les changements d'état de l'app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App revient au premier plan - rafraîchir immédiatement
        const refreshPromise = onRefresh();
        if (refreshPromise instanceof Promise) {
          refreshPromise.catch((error: any) =>
            console.error('Erreur lors du rafraîchissement au retour au premier plan:', error)
          );
        }
        // Redémarrer l'intervalle
        startInterval();
      } else if (nextAppState.match(/inactive|background/)) {
        // App passe en arrière-plan - arrêter l'intervalle
        stopInterval();
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      stopInterval();
      subscription?.remove();
    };
  }, [refreshInterval, onRefresh, enabled]);

  // Fonction pour rafraîchir manuellement
  const refreshNow = async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement manuel:', error);
      throw error;
    }
  };

  return {
    refreshNow,
  };
};