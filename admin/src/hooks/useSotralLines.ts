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
  const [isUsingCache, setIsUsingCache] = useState(false);

  const CACHE_KEY = 'sotral:lines:cache';

  const readCache = (): SotralLine[] | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SotralLine[];
    } catch (e) {
      console.warn('[useSotralLines] failed to read cache', e);
      return null;
    }
  };

  const writeCache = (data: SotralLine[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[useSotralLines] failed to write cache', e);
    }
  };

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
        // S'assurer que nous prenons bien les données du bon champ
        const linesData = Array.isArray(data.data) ? data.data : data || [];
        setLines(linesData);
        setIsUsingCache(false); // Données fraîche du serveur
        // Mémoriser la dernière version réussie
        writeCache(linesData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Si on a un cache local, l'utiliser comme fallback pour éviter que le tableau disparaisse
        const fallback = readCache();
        if (fallback && fallback.length > 0) {
          setLines(fallback);
          setIsUsingCache(true); // Indiquer que les données viennent du cache
        }

        setError({
          type: 'server',
          message: 'Erreur lors du chargement des lignes',
          details: errorData.error || 'Impossible de récupérer les données des lignes.',
          suggestion: 'Vérifiez votre connexion et réessayez.'
        });
      }
    } catch (err) {
      // En cas d'erreur réseau, tenter d'afficher le cache local
      const fallback = readCache();
      if (fallback && fallback.length > 0) {
        setLines(fallback);
        setIsUsingCache(true); // Indiquer que les données viennent du cache
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

  useEffect(() => {
    // Charger d'abord le cache si présent pour affichage immédiat
    const cached = readCache();
    if (cached && cached.length > 0) setLines(cached);
    loadLines();
  }, []);

  return { lines, loading, error, loadLines, isUsingCache };
};
