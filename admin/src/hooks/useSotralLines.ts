import { useState, useEffect, useCallback } from 'react';
import { SotralLine, ApiResponse } from '../types/sotral';
import { adminSotralService } from '../services/adminSotralService';

interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found' | 'unknown';
  message: string;
  details?: string;
  suggestion?: string;
  errorType?: string;
}

interface UseSotralLinesReturn {
  lines: SotralLine[];
  loading: boolean;
  error: ApiError | null;
  isUsingCache: boolean;
  loadLines: () => Promise<void>;
  createLine: (lineData: Partial<SotralLine>) => Promise<ApiResponse<SotralLine>>;
  updateLine: (id: number, lineData: Partial<SotralLine>) => Promise<ApiResponse<SotralLine>>;
  deleteLine: (id: number) => Promise<ApiResponse<void>>;
  toggleLineStatus: (id: number) => Promise<ApiResponse<SotralLine>>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const CACHE_KEY = 'sotral:lines:cache';
const CACHE_TIMESTAMP_KEY = 'sotral:lines:timestamp';

export const useSotralLines = (): UseSotralLinesReturn => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  // Cache management
  const readCache = useCallback((): SotralLine[] | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (!raw || !timestamp) return null;

      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        return null;
      }

      return JSON.parse(raw) as SotralLine[];
    } catch (e) {
      console.warn('[useSotralLines] failed to read cache', e);
      return null;
    }
  }, []);

  const writeCache = useCallback((data: SotralLine[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('[useSotralLines] failed to write cache', e);
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
        suggestion = 'La ressource demandée n\'existe pas.';
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

  const loadLines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminSotralService.getLines();
      console.log('Fetched lines:', response);

      if (response.success && response.data) {
        setLines(response.data);
        setIsUsingCache(false);
        writeCache(response.data);
      } else {
        // Try to use cache as fallback
        const fallback = readCache();
        if (fallback && fallback.length > 0) {
          setLines(fallback);
          setIsUsingCache(true);
        }

        setError(handleApiError(response));
      }
    } catch (err) {
      // Network error - try cache
      const fallback = readCache();
      if (fallback && fallback.length > 0) {
        setLines(fallback);
        setIsUsingCache(true);
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
  }, [readCache, writeCache, handleApiError]);

  const createLine = useCallback(async (lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> => {
    try {
      setError(null);
      const response = await adminSotralService.createLine(lineData);

      if (response.success && response.data) {
        setLines(prev => [...prev, response.data!]);
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
        details: 'Impossible de créer la ligne.',
        suggestion: 'Vérifiez votre connexion internet.'
      };
      setError(networkError);
      return { success: false, error: networkError.message };
    }
  }, [handleApiError]);

  const updateLine = useCallback(async (id: number, lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> => {
    try {
      setError(null);
      const response = await adminSotralService.updateLine(id, lineData);

      if (response.success && response.data) {
        setLines(prev => prev.map(line => line.id === id ? response.data! : line));
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
        details: 'Impossible de modifier la ligne.',
        suggestion: 'Vérifiez votre connexion internet.'
      };
      setError(networkError);
      return { success: false, error: networkError.message };
    }
  }, [handleApiError]);

  const deleteLine = useCallback(async (id: number): Promise<ApiResponse<void>> => {
    try {
      setError(null);
      const response = await adminSotralService.deleteLine(id);

      if (response.success) {
        setLines(prev => prev.filter(line => line.id !== id));
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
        details: 'Impossible de supprimer la ligne.',
        suggestion: 'Vérifiez votre connexion internet.'
      };
      setError(networkError);
      return { success: false, error: networkError.message };
    }
  }, [handleApiError]);

  const toggleLineStatus = useCallback(async (id: number): Promise<ApiResponse<SotralLine>> => {
    try {
      setError(null);
      const response = await adminSotralService.toggleLineStatus(id);

      if (response.success && response.data) {
        setLines(prev => prev.map(line => line.id === id ? response.data! : line));
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
        details: 'Impossible de changer le statut de la ligne.',
        suggestion: 'Vérifiez votre connexion internet.'
      };
      setError(networkError);
      return { success: false, error: networkError.message };
    }
  }, [handleApiError]);

  const refresh = useCallback(async () => {
    await loadLines();
  }, [loadLines]);

  // Load data on mount
  useEffect(() => {
    const cached = readCache();
    if (cached && cached.length > 0) {
      setLines(cached);
      setIsUsingCache(true);
    }

    // Ne pas appeler loadLines ici car cela créerait une boucle infinie
    // loadLines est déjà appelé via le useCallback au montage
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await adminSotralService.getLines();
        console.log('Fetched lines:', response);

        if (response.success && response.data) {
          setLines(response.data);
          setIsUsingCache(false);
          writeCache(response.data);
        } else {
          // Try to use cache as fallback
          const fallback = readCache();
          if (fallback && fallback.length > 0) {
            setLines(fallback);
            setIsUsingCache(true);
          }

          setError(handleApiError(response));
        }
      } catch (err) {
        // Network error - try cache
        const fallback = readCache();
        if (fallback && fallback.length > 0) {
          setLines(fallback);
          setIsUsingCache(true);
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
    };

    initialLoad();

    // Timeout de sécurité pour éviter que loading reste true indéfiniment
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('[useSotralLines] Loading timeout reached, forcing loading to false');
        setLoading(false);
        setError({
          type: 'network',
          message: 'Timeout de chargement',
          details: 'Le chargement des données a pris trop de temps.',
          suggestion: 'Les données peuvent être partielles. Actualisez la page.'
        });
      }
    }, 8000); // 8 secondes timeout

    return () => clearTimeout(loadingTimeout);
  }, []); // Dépendances vides pour éviter les re-renders

  return {
    lines,
    loading,
    error,
    isUsingCache,
    loadLines,
    createLine,
    updateLine,
    deleteLine,
    toggleLineStatus,
    refresh,
    clearError
  };
};
