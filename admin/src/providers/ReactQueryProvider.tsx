import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Créer un client React Query avec configuration optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps pendant lequel les données sont considérées comme fraîches
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Délai avant de considérer une requête comme expirée
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Recharger automatiquement quand la fenêtre retrouve le focus
      refetchOnWindowFocus: true,
      // Recharger en cas d'erreur de réseau
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs 4xx (sauf 408, 429)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      // Délai avant retry
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Recharger automatiquement les requêtes après une mutation
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export { queryClient };