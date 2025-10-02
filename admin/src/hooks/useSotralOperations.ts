import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSotral, SotralLine } from '../contexts/SotralContext';
import { adminSotralService } from '../services/adminSotralService';

const CACHE_KEY = 'sotral:lines:cache';
const CACHE_KEY_STOPS = 'sotral:stops:cache';
const CACHE_KEY_STATS = 'sotral:stats:cache';

export const useSotralOperations = () => {
  const { state, dispatch } = useSotral();

  // Cache utilities
  const readCache = useCallback((key: string) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn(`[useSotralOperations] failed to read cache for ${key}`, e);
      return null;
    }
  }, []);

  const writeCache = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[useSotralOperations] failed to write cache for ${key}`, e);
    }
  }, []);

  // Load lines with cache fallback
  const loadLines = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'lines', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'lines', error: null } });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const lines = Array.isArray(data.data) ? data.data : data || [];
        dispatch({ type: 'SET_LINES', payload: lines });
        dispatch({ type: 'SET_USING_CACHE', payload: false });
        writeCache(CACHE_KEY, lines);
      } else {
        const fallback = readCache(CACHE_KEY);
        if (fallback && fallback.length > 0) {
          dispatch({ type: 'SET_LINES', payload: fallback });
          dispatch({ type: 'SET_USING_CACHE', payload: true });
        }

        const errorData = await response.json().catch(() => ({}));
        dispatch({ type: 'SET_ERROR', payload: {
          key: 'lines',
          error: {
            type: 'server',
            message: 'Erreur lors du chargement des lignes',
            details: errorData.error || 'Impossible de récupérer les données des lignes.',
            suggestion: 'Vérifiez votre connexion et réessayez.'
          }
        }});
      }
    } catch (error) {
      const fallback = readCache(CACHE_KEY);
      if (fallback && fallback.length > 0) {
        dispatch({ type: 'SET_LINES', payload: fallback });
        dispatch({ type: 'SET_USING_CACHE', payload: true });
      }

      dispatch({ type: 'SET_ERROR', payload: {
        key: 'lines',
        error: {
          type: 'network',
          message: 'Erreur de connexion',
          details: 'Impossible de contacter le serveur.',
          suggestion: 'Vérifiez votre connexion internet.'
        }
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'lines', value: false } });
    }
  }, [dispatch, readCache, writeCache]);

  // Load stops with cache
  const loadStops = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'stops', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'stops', error: null } });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/stops`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const stops = Array.isArray(data.data) ? data.data : [];
        dispatch({ type: 'SET_STOPS', payload: stops });
        writeCache(CACHE_KEY_STOPS, stops);
      } else {
        dispatch({ type: 'SET_ERROR', payload: {
          key: 'stops',
          error: {
            type: 'server',
            message: 'Erreur lors du chargement des arrêts',
            details: 'Impossible de récupérer les données des arrêts.',
            suggestion: 'Vérifiez votre connexion et réessayez.'
          }
        }});
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: {
        key: 'stops',
        error: {
          type: 'network',
          message: 'Erreur de connexion',
          details: 'Impossible de contacter le serveur.',
          suggestion: 'Vérifiez votre connexion internet.'
        }
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'stops', value: false } });
    }
  }, [dispatch, writeCache]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'stats', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'stats', error: null } });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const stats = data.data?.infrastructure || null;
        dispatch({ type: 'SET_STATS', payload: stats });
        writeCache(CACHE_KEY_STATS, stats);
      } else {
        dispatch({ type: 'SET_ERROR', payload: {
          key: 'stats',
          error: {
            type: 'server',
            message: 'Erreur lors du chargement des statistiques',
            details: 'Impossible de récupérer les statistiques.',
            suggestion: 'Vérifiez votre connexion et réessayez.'
          }
        }});
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: {
        key: 'stats',
        error: {
          type: 'network',
          message: 'Erreur de connexion',
          details: 'Impossible de contacter le serveur.',
          suggestion: 'Vérifiez votre connexion internet.'
        }
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'stats', value: false } });
    }
  }, [dispatch, writeCache]);

  // Expansion data loading on mount
  useEffect(() => {
    const cachedLines = readCache(CACHE_KEY);
    if (cachedLines && cachedLines.length > 0) {
      dispatch({ type: 'SET_LINES', payload: cachedLines });
    }
    loadLines();

    const cachedStops = readCache(CACHE_KEY_STOPS);
    if (cachedStops && cachedStops.length > 0) {
      dispatch({ type: 'SET_STOPS', payload: cachedStops });
    }
    loadStops();

    const cachedStats = readCache(CACHE_KEY_STATS);
    if (cachedStats) {
      dispatch({ type: 'SET_STATS', payload: cachedStats });
    }
    loadStats();
  }, [dispatch, readCache, loadLines, loadStops, loadStats]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadLines(), loadStops(), loadStats()]);
  }, [loadLines, loadStops, loadStats]);

  // Toggle line status
  const toggleLineStatus = useCallback(async (lineId: number) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: true } });

    try {
      const result = await adminSotralService.toggleLineStatus(lineId);

      if (result.success) {
        dispatch({ type: 'TOGGLE_LINE_STATUS', payload: {
          id: lineId,
          is_active: !state.lines.find(l => l.id === lineId)?.is_active
        }});
        toast.success(result.message || 'Statut de la ligne mis à jour avec succès');
      } else {
        dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: {
          type: 'server',
          message: result.error || 'Erreur lors du changement de statut'
        }}});
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: {
        type: 'network',
        message: 'Erreur de connexion'
      }}});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: false } });
    }
  }, [dispatch, state.lines, adminSotralService]);

  // Create line
  const createLine = useCallback(async (lineData: {
    line_number: number;
    name: string;
    route_from: string;
    route_to: string;
    category_id: number;
    distance_km?: number;
    stops_count?: number;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: null } });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...lineData, is_active: true })
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'ADD_LINE', payload: result.data });
        toast.success(result.message || 'Ligne créée avec succès');
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        const error = {
          type: 'server' as const,
          message: errorData.error || 'Erreur lors de la création de la ligne',
          details: errorData.details || 'Une erreur est survenue'
        };
        dispatch({ type: 'SET_ERROR', payload: { key: 'general', error } });
        return { success: false, error: error.message };
      }
    } catch (error) {
      const networkError = {
        type: 'network' as const,
        message: 'Erreur lors de la création de la ligne'
      };
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: networkError } });
      return { success: false, error: networkError.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: false } });
    }
  }, [dispatch]);

  // Update line
  const updateLine = useCallback(async (lineId: number, lineData: {
    line_number: number;
    name: string;
    route_from: string;
    route_to: string;
    category_id: number;
    distance_km?: number;
    stops_count?: number;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: null } });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines/${lineId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lineData)
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'UPDATE_LINE', payload: result.data });
        toast.success(result.message || 'Ligne modifiée avec succès');
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        const error = {
          type: 'server' as const,
          message: errorData.error || 'Erreur lors de la modification de la ligne',
          details: errorData.details || 'Une erreur est survenue'
        };
        dispatch({ type: 'SET_ERROR', payload: { key: 'general', error } });
        return { success: false, error: error.message };
      }
    } catch (error) {
      const networkError = {
        type: 'network' as const,
        message: 'Erreur lors de la modification de la ligne'
      };
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: networkError } });
      return { success: false, error: networkError.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: false } });
    }
  }, [dispatch]);

  // Delete line
  const deleteLine = useCallback(async (lineId: number) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: null } });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines/${lineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        dispatch({ type: 'DELETE_LINE', payload: lineId });
        toast.success('Ligne supprimée avec succès');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: {
          type: 'server',
          message: 'Erreur lors de la suppression de la ligne'
        }}});
        return { success: false };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', error: {
        type: 'network',
        message: 'Erreur lors de la suppression'
      }}});
      return { success: false };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'linesAction', value: false } });
    }
  }, [dispatch]);

  // Modal management
  const openModal = useCallback((modal: keyof typeof state.modals, line?: SotralLine) => {
    if (line) {
      dispatch({ type: 'SET_SELECTED_LINE', payload: line });
    }
    dispatch({ type: 'OPEN_MODAL', payload: modal });
  }, [dispatch, state.modals]);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_MODALS' });
    dispatch({ type: 'RESET_FORM_DATA' });
  }, [dispatch]);

  // Form validation utilities
  const validateLineForm = useCallback((formData: typeof state.formData) => {
    const errors: Record<string, string> = {};

    if (!formData.line_number || isNaN(Number(formData.line_number))) {
      errors.line_number = 'Le numéro de ligne est requis et doit être un nombre valide';
    }

    if (!formData.name?.trim()) {
      errors.name = 'Le nom de la ligne est requis';
    }

    if (!formData.route_from?.trim()) {
      errors.route_from = 'Le point de départ est requis';
    }

    if (!formData.route_to?.trim()) {
      errors.route_to = 'Le point d\'arrivée est requis';
    }

    if (!formData.category_id || isNaN(Number(formData.category_id))) {
      errors.category_id = 'La catégorie est requise';
    }

    return errors;
  }, []);

  return {
    // State
    ...state,

    // Actions
    loadLines,
    loadStops,
    loadStats,
    refreshData,
    toggleLineStatus,
    createLine,
    updateLine,
    deleteLine,

    // Modal actions
    openModal,
    closeAllModals,

    // Utilities
    validateLineForm,
  };
};
