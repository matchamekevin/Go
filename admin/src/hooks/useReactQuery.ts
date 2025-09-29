import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SotralLine, TicketFilters } from '../types/sotral';
import { adminSotralService } from '../services/adminSotralService';

// Hook pour les lignes avec revalidation intelligente
export const useSotralLinesQuery = () => {
  return useQuery({
    queryKey: ['sotral-lines'],
    queryFn: async () => {
      const response = await adminSotralService.getLines();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Erreur lors du chargement des lignes');
    },
    staleTime: 5 * 60 * 1000, // Considérer les données fraîches pendant 5 minutes
    refetchOnWindowFocus: true, // Recharger quand la fenêtre retrouve le focus
    refetchInterval: 10 * 60 * 1000, // Recharger automatiquement toutes les 10 minutes
  });
};

// Hook pour les tickets avec pagination et filtres
export const useSotralTicketsQuery = (filters: TicketFilters) => {
  return useQuery({
    queryKey: ['sotral-tickets', filters],
    queryFn: async () => {
      const response = await adminSotralService.getTickets(filters);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Erreur lors du chargement des tickets');
    },
    staleTime: 2 * 60 * 1000, // Considérer les données fraîches pendant 2 minutes
    refetchOnWindowFocus: true,
    keepPreviousData: true, // Garder les données précédentes pendant le chargement
  });
};

// Hook pour les statistiques avec revalidation fréquente
export const useSotralStatsQuery = () => {
  return useQuery({
    queryKey: ['sotral-stats'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return data.data?.infrastructure;
      }
      throw new Error('Erreur lors du chargement des statistiques');
    },
    staleTime: 1 * 60 * 1000, // Considérer les données fraîches pendant 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Recharger automatiquement toutes les 5 minutes
  });
};

// Mutations pour les opérations d'écriture avec invalidation automatique du cache
export const useCreateLineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lineData: Partial<SotralLine>) => {
      const response = await adminSotralService.createLine(lineData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Erreur lors de la création de la ligne');
    },
    onSuccess: () => {
      // Invalider et recharger les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['sotral-lines'] });
      queryClient.invalidateQueries({ queryKey: ['sotral-stats'] });
    },
  });
};

export const useGenerateTicketsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      lineId: number;
      ticketTypeCode: string;
      quantity: number;
      validityHours: number;
      price_fcfa?: number;
    }) => {
      const response = await adminSotralService.generateTickets(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Erreur lors de la génération des tickets');
    },
    onSuccess: () => {
      // Invalider et recharger les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['sotral-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sotral-stats'] });
    },
  });
};

export const useDeleteTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await adminSotralService.deleteTicket(id);
      if (response.success) {
        return response;
      }
      throw new Error(response.error || 'Erreur lors de la suppression du ticket');
    },
    onSuccess: () => {
      // Invalider et recharger les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['sotral-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sotral-stats'] });
    },
  });
};

// Hook pour forcer le rafraîchissement manuel
export const useRefreshData = () => {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['sotral-lines'] });
      queryClient.invalidateQueries({ queryKey: ['sotral-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['sotral-stats'] });
    },
    refreshLines: () => queryClient.invalidateQueries({ queryKey: ['sotral-lines'] }),
    refreshTickets: () => queryClient.invalidateQueries({ queryKey: ['sotral-tickets'] }),
    refreshStats: () => queryClient.invalidateQueries({ queryKey: ['sotral-stats'] }),
  };
};