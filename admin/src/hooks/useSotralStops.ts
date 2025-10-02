import { useState, useEffect } from 'react';

interface SotralStop {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_major_stop: boolean;
  is_active: boolean;
}

interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found';
  message: string;
  details?: string;
  suggestion?: string;
}

export const useSotralStops = () => {
  const [stops, setStops] = useState<SotralStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadStops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/stops`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStops(data.data || []);
      } else {
        setError({
          type: 'server',
          message: 'Erreur lors du chargement des arrêts',
          details: 'Impossible de récupérer les données des arrêts.',
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

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/stops`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStops(data.data || []);
        } else {
          setError({
            type: 'server',
            message: 'Erreur lors du chargement des arrêts',
            details: 'Impossible de récupérer les données des arrêts.',
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
        console.warn('[useSotralStops] Loading timeout reached, forcing loading to false');
        setLoading(false);
        setError({
          type: 'network',
          message: 'Timeout de chargement',
          details: 'Le chargement des arrêts a pris trop de temps.',
          suggestion: 'Les données des arrêts peuvent être partielles. Actualisez la page.'
        });
      }
    }, 8000); // 8 secondes timeout

    return () => clearTimeout(loadingTimeout);
  }, []); // Dépendances vides pour éviter les re-renders

  return { stops, loading, error, loadStops };
};
