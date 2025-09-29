import { apiClient } from './apiClient';
import type { ApiResponse, Route, SotralLine } from '../types/api';
import { DEV_CONFIG, devLog, devError } from '../config/devConfig';

export interface SearchResult {
  id: string;
  from: string;
  to: string;
  price: string;
  duration: string;
  type: string;
  company?: string;
}

export class SearchService {
  // Recherche de lignes SOTRAL via l'API
  static async searchRoutes(query: string): Promise<SearchResult[]> {
    devLog('SearchService', `searchRoutes query=${query} (utilise maintenant les lignes SOTRAL)`);

    if (DEV_CONFIG.FORCE_FALLBACK) {
      devLog('SearchService', 'Mode fallback activé, retour des résultats mockés');
      return this.getFallbackResults(query);
    }

    try {
      // Utiliser les lignes SOTRAL au lieu des routes
      const response = await apiClient.get<ApiResponse<SotralLine[]>>('/sotral/lines');
      if (!response.success) {
        devError('SearchService', new Error(response.error || 'API error'), 'searchRoutes');
        return this.getFallbackResults(query);
      }

      const lines = response.data || [];
      
      // Filtrer par la requête si elle existe
      let filteredLines = lines;
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filteredLines = lines.filter(line => 
          line.name.toLowerCase().includes(searchTerm) ||
          line.route_from.toLowerCase().includes(searchTerm) ||
          line.route_to.toLowerCase().includes(searchTerm) ||
          line.line_number.toString().includes(searchTerm)
        );
      }

      // Transformer les lignes en résultats de recherche
      return filteredLines.map(line => ({
        id: line.id.toString(),
        from: line.route_from,
        to: line.route_to,
        price: '-- FCFA', // Prix déterminé par l'admin lors de la génération des tickets
        duration: '--', // Durée déterminée par l'admin
        type: `Ligne ${line.line_number}`,
        company: line.category?.name || 'SOTRAL'
      }));
    } catch (error) {
      devError('SearchService', error, 'searchRoutes - network');
      return this.getFallbackResults(query);
    }
  }

  private static getFallbackResults(query: string): SearchResult[] {
    // Plus de données hardcodées - utiliser uniquement les données de l'admin via l'API
    devLog('SearchService', 'Aucun résultat API disponible, retour vide (pas de fallback)');
    return [];
  }
}
