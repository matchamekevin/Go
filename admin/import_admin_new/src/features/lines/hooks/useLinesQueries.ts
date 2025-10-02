import { useQuery, useMutation, useQueryClient } from 'react-query';
import { linesService } from '../services/linesService';
import {
  SotralLine,
  CreateLineRequest,
  UpdateLineRequest,
  ApiError
} from '@shared/types';

// ==========================================
// QUERY KEYS
// ==========================================

export const LINES_QUERY_KEYS = {
  all: ['lines'] as const,
  lists: () => [...LINES_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...LINES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...LINES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...LINES_QUERY_KEYS.details(), id] as const,
  search: (query: string) => [...LINES_QUERY_KEYS.all, 'search', query] as const,
  suggestions: () => [...LINES_QUERY_KEYS.all, 'suggestions'] as const,
};

// ==========================================
// QUERIES - LECTURE DES DONNÉES
// ==========================================

/**
 * Hook pour récupérer toutes les lignes
 */
export const useLines = (enabled: boolean = true) => {
  return useQuery(
    LINES_QUERY_KEYS.lists(),
    () => linesService.getAllLines(),
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      select: (data) => data.success ? data.data : [],
      onError: (error: ApiError) => {
        console.error('Erreur lors du chargement des lignes:', error);
      }
    }
  );
};

/**
 * Hook pour récupérer les lignes actives uniquement
 */
export const useActiveLines = (enabled: boolean = true) => {
  return useQuery(
    LINES_QUERY_KEYS.list({ active: true }),
    () => linesService.getActiveLines(),
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      select: (data) => data.success ? data.data : [],
      onError: (error: ApiError) => {
        console.error('Erreur lors du chargement des lignes actives:', error);
      }
    }
  );
};

/**
 * Hook pour récupérer une ligne par ID
 */
export const useLine = (id: number | null, enabled: boolean = true) => {
  return useQuery(
    LINES_QUERY_KEYS.detail(id!),
    () => linesService.getLineById(id!),
    {
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => data.success ? data.data : null,
      onError: (error: ApiError) => {
        console.error(`Erreur lors du chargement de la ligne ${id}:`, error);
      }
    }
  );
};

/**
 * Hook pour rechercher des lignes
 */
export const useSearchLines = (query: string, enabled: boolean = true) => {
  return useQuery(
    LINES_QUERY_KEYS.search(query),
    () => linesService.searchLines(query),
    {
      enabled: enabled && query.trim().length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes pour la recherche
      select: (data) => data.success ? data.data : [],
      onError: (error: ApiError) => {
        console.error('Erreur lors de la recherche de lignes:', error);
      }
    }
  );
};

/**
 * Hook pour récupérer les suggestions d'autocomplétion
 */
export const useLinesSuggestions = (enabled: boolean = true) => {
  return useQuery(
    LINES_QUERY_KEYS.suggestions(),
    () => linesService.getAutocompleteSuggestions(),
    {
      enabled,
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error: ApiError) => {
        console.error('Erreur lors du chargement des suggestions:', error);
      }
    }
  );
};

/**
 * Hook pour récupérer les lignes par catégorie
 */
export const useLinesByCategory = (categoryId: number | null, enabled: boolean = true) => {
  return useQuery(
    LINES_QUERY_KEYS.list({ category: categoryId }),
    () => linesService.getLinesByCategory(categoryId!),
    {
      enabled: enabled && !!categoryId,
      staleTime: 5 * 60 * 1000,
      select: (data) => data.success ? data.data : [],
      onError: (error: ApiError) => {
        console.error(`Erreur lors du chargement des lignes de catégorie ${categoryId}:`, error);
      }
    }
  );
};

// ==========================================
// MUTATIONS - MODIFICATION DES DONNÉES
// ==========================================

/**
 * Hook pour créer une nouvelle ligne
 */
export const useCreateLine = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: CreateLineRequest) => linesService.createLine(data),
    {
      onSuccess: (result) => {
        if (result.success) {
          // Invalider et refetch les queries de lignes
          queryClient.invalidateQueries(LINES_QUERY_KEYS.all);
          
          // Ajouter la nouvelle ligne au cache existant si possible
          queryClient.setQueryData(
            LINES_QUERY_KEYS.lists(),
            (oldData: any) => {
              if (oldData?.success) {
                return {
                  ...oldData,
                  data: [...oldData.data, result.data]
                };
              }
              return oldData;
            }
          );
        }
      },
      onError: (error: ApiError) => {
        console.error('Erreur lors de la création de la ligne:', error);
      }
    }
  );
};

/**
 * Hook pour mettre à jour une ligne
 */
export const useUpdateLine = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: UpdateLineRequest }) => 
      linesService.updateLine(id, data),
    {
      onSuccess: (result, variables) => {
        if (result.success) {
          const { id } = variables;
          
          // Mettre à jour la ligne dans le cache de détail
          queryClient.setQueryData(
            LINES_QUERY_KEYS.detail(id),
            result
          );

          // Mettre à jour la ligne dans la liste
          queryClient.setQueryData(
            LINES_QUERY_KEYS.lists(),
            (oldData: any) => {
              if (oldData?.success) {
                return {
                  ...oldData,
                  data: oldData.data.map((line: SotralLine) =>
                    line.id === id ? result.data : line
                  )
                };
              }
              return oldData;
            }
          );

          // Invalider les queries liées
          queryClient.invalidateQueries(LINES_QUERY_KEYS.all);
        }
      },
      onError: (error: ApiError) => {
        console.error('Erreur lors de la mise à jour de la ligne:', error);
      }
    }
  );
};

/**
 * Hook pour supprimer une ligne
 */
export const useDeleteLine = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => linesService.deleteLine(id),
    {
      onSuccess: (result, id) => {
        if (result.success) {
          // Retirer la ligne de la liste
          queryClient.setQueryData(
            LINES_QUERY_KEYS.lists(),
            (oldData: any) => {
              if (oldData?.success) {
                return {
                  ...oldData,
                  data: oldData.data.filter((line: SotralLine) => line.id !== id)
                };
              }
              return oldData;
            }
          );

          // Supprimer du cache de détail
          queryClient.removeQueries(LINES_QUERY_KEYS.detail(id));

          // Invalider les queries liées
          queryClient.invalidateQueries(LINES_QUERY_KEYS.all);
        }
      },
      onError: (error: ApiError) => {
        console.error('Erreur lors de la suppression de la ligne:', error);
      }
    }
  );
};

/**
 * Hook pour activer/désactiver une ligne
 */
export const useToggleLineStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => linesService.toggleLineStatus(id),
    {
      onSuccess: (result, id) => {
        if (result.success) {
          // Mettre à jour dans le cache de détail
          queryClient.setQueryData(
            LINES_QUERY_KEYS.detail(id),
            result
          );

          // Mettre à jour dans la liste
          queryClient.setQueryData(
            LINES_QUERY_KEYS.lists(),
            (oldData: any) => {
              if (oldData?.success) {
                return {
                  ...oldData,
                  data: oldData.data.map((line: SotralLine) =>
                    line.id === id ? result.data : line
                  )
                };
              }
              return oldData;
            }
          );

          // Invalider les queries de lignes actives
          queryClient.invalidateQueries(LINES_QUERY_KEYS.list({ active: true }));
        }
      },
      onError: (error: ApiError) => {
        console.error('Erreur lors du changement de statut de la ligne:', error);
      }
    }
  );
};

// ==========================================
// HOOKS COMBINÉS ET UTILITAIRES
// ==========================================

/**
 * Hook pour gérer l'état complet d'une ligne (CRUD)
 */
export const useLineManager = (id?: number) => {
  const queryClient = useQueryClient();

  const lineQuery = useLine(id || null, !!id);
  const createMutation = useCreateLine();
  const updateMutation = useUpdateLine();
  const deleteMutation = useDeleteLine();
  const toggleStatusMutation = useToggleLineStatus();

  const refetch = () => {
    if (id) {
      return lineQuery.refetch();
    }
    return queryClient.invalidateQueries(LINES_QUERY_KEYS.all);
  };

  return {
    // Data
    line: lineQuery.data,
    
    // Loading states
    isLoading: lineQuery.isLoading,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isTogglingStatus: toggleStatusMutation.isLoading,
    
    // Error states
    error: lineQuery.error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    toggleError: toggleStatusMutation.error,
    
    // Actions
    create: createMutation.mutate,
    update: (data: UpdateLineRequest) => id && updateMutation.mutate({ id, data }),
    delete: () => id && deleteMutation.mutate(id),
    toggleStatus: () => id && toggleStatusMutation.mutate(id),
    refetch,
    
    // Helpers
    isAnyLoading: lineQuery.isLoading || createMutation.isLoading || 
                  updateMutation.isLoading || deleteMutation.isLoading || 
                  toggleStatusMutation.isLoading,
  };
};

/**
 * Hook pour vérifier si un numéro de ligne est disponible
 */
export const useCheckLineNumberAvailability = () => {
  return useMutation(
    ({ lineNumber, excludeId }: { lineNumber: number; excludeId?: number }) =>
      linesService.isLineNumberAvailable(lineNumber, excludeId),
    {
      onError: (error: ApiError) => {
        console.error('Erreur lors de la vérification du numéro de ligne:', error);
      }
    }
  );
};