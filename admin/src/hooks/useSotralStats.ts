import { useState, useEffect } from 'react';

interface LineStats {
  total_lines: number;
  active_lines: number;
  total_stops: number;
  ticket_types: number;
}

interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found';
  message: string;
  details?: string;
  suggestion?: string;
}

export const useSotralStats = () => {
  const [stats, setStats] = useState<LineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data?.infrastructure || null);
      } else {
        setError({
          type: 'server',
          message: 'Erreur lors du chargement des statistiques',
          details: 'Impossible de récupérer les statistiques.',
          suggestion: 'Vérifiez votre connexion et réessayez.'
        });
      }
    } catch (err) {
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

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data?.infrastructure || null);
        } else {
          setError({
            type: 'server',
            message: 'Erreur lors du chargement des statistiques',
            details: 'Impossible de récupérer les statistiques.',
            suggestion: 'Vérifiez votre connexion et réessayez.'
          });
        }
      } catch (err) {
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
        console.warn('[useSotralStats] Loading timeout reached, forcing loading to false');
        setLoading(false);
        setError({
          type: 'network',
          message: 'Timeout de chargement',
          details: 'Le chargement des statistiques a pris trop de temps.',
          suggestion: 'Les statistiques peuvent être partielles. Actualisez la page.'
        });
      }
    }, 8000); // 8 secondes timeout

    return () => clearTimeout(loadingTimeout);
  }, []); // Dépendances vides pour éviter les re-renders

  return { stats, loading, error, loadStats };
};
