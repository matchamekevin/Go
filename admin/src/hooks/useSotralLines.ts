import { useState, useEffect } from 'react';
import { SotralLine } from '../services/sotralService';

interface ApiError {
  type: 'auth' | 'server' | 'network' | 'empty' | 'validation' | 'not_found';
  message: string;
  details?: string;
  suggestion?: string;
}

export const useSotralLines = () => {
  const [lines, setLines] = useState<SotralLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadLines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/admin/sotral/lines`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLines(data.data || []);
      } else {
        setError({
          type: 'server',
          message: 'Erreur lors du chargement des lignes',
          details: 'Impossible de récupérer les données des lignes.',
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
    loadLines();
  }, []);

  return { lines, loading, error, loadLines };
};
