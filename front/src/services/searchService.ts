import { apiClient } from './apiClient';
import type { ApiResponse, Route } from '../types/api';
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
  // Recherche de trajets via l'API
  static async searchRoutes(query: string): Promise<SearchResult[]> {
    devLog('SearchService', `searchRoutes query=${query}`);

    if (DEV_CONFIG.FORCE_FALLBACK) {
      devLog('SearchService', 'Mode fallback activé, retour des résultats mockés');
      return this.getFallbackResults(query);
    }

    try {
      const response = await apiClient.get<ApiResponse<Route[]>>(`/tickets/routes?search=${encodeURIComponent(query)}`);
      if (!response.success) {
        devError('SearchService', new Error(response.error || 'API error'), 'searchRoutes');
        return this.getFallbackResults(query);
      }

      const routes = response.data || [];
      // Transformer
      return routes.map(r => ({
        id: r.id,
        from: r.start_point || 'Départ',
        to: r.end_point || 'Arrivée',
        price: this.priceFromCategory(r.price_category),
        duration: r.duration_minutes ? `${r.duration_minutes} min` : '--',
        type: 'Bus urbain',
        company: r.metadata?.company || undefined
      }));
    } catch (error) {
      devError('SearchService', error, 'searchRoutes - network');
      return this.getFallbackResults(query);
    }
  }

  private static getFallbackResults(query: string): SearchResult[] {
    const base: SearchResult[] = [
      { id: 'fb1', from: 'Centre-ville', to: 'Aéroport', price: '250 FCFA', duration: '45 min', type: 'Bus rapide', company: 'SOTRAL Express' },
      { id: 'fb2', from: 'Université', to: 'Plateau', price: '150 FCFA', duration: '25 min', type: 'Bus urbain', company: 'Transport City' },
      { id: 'fb3', from: 'Marché', to: 'Gare routière', price: '100 FCFA', duration: '20 min', type: 'Mini-bus', company: 'Petit Transport' }
    ];

    if (!query) return base;
    const q = query.toLowerCase();
    return base.filter(r => r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q) || (r.company || '').toLowerCase().includes(q));
  }

  private static priceFromCategory(cat: string) {
    switch (cat) {
      case 'T100': return '100 FCFA';
      case 'T150': return '150 FCFA';
      case 'T200': return '200 FCFA';
      case 'T250': return '250 FCFA';
      case 'T300': return '300 FCFA';
      default: return '-- FCFA';
    }
  }
}
