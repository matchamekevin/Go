import { apiClient } from './apiClient';
import type { ApiResponse, Route } from '../types/api';

export interface PopularRoute {
  id: string;
  from: string;
  to: string;
  price: string;
  duration: string;
  type: string;
  popularity_score?: number;
}

export class RouteService {
  // Récupérer tous les trajets
  static async getAllRoutes(): Promise<Route[]> {
    const response = await apiClient.get<ApiResponse<Route[]>>('/tickets/routes');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des trajets');
    }
    return response.data || [];
  }

  // Récupérer les trajets populaires (transformés pour l'affichage)
  static async getPopularRoutes(limit: number = 10): Promise<PopularRoute[]> {
    try {
      const routes = await this.getAllRoutes();

      // Transformer les données backend en format d'affichage
      return routes
        // tolérer plusieurs noms de champs pour l'état actif
        .filter(route => {
          const isActive = (route as any).is_active ?? (route as any).active ?? true;
          return Boolean(isActive);
        })
        .slice(0, limit)
        .map(route => this.transformToPopularRoute(route));
    } catch (error) {
      console.error('Erreur lors de la récupération des trajets populaires:', error);
      // Fallback avec données mockées en cas d'erreur
      return this.getFallbackPopularRoutes(limit);
    }
  }

  // Récupérer les trajets par catégorie de prix
  static async getRoutesByCategory(category: string): Promise<Route[]> {
    const response = await apiClient.get<ApiResponse<Route[]>>(`/tickets/routes/category/${category}`);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des trajets');
    }
    return response.data || [];
  }

  // Transformer une route backend en PopularRoute pour l'affichage
  private static transformToPopularRoute(route: Route): PopularRoute {
    // Mapper les catégories de prix
    const priceMap = {
      'T100': '100 FCFA',
      'T150': '150 FCFA', 
      'T200': '200 FCFA',
      'T250': '250 FCFA',
      'T300': '300 FCFA'
    };

    // Déterminer le type basé sur la distance/durée
    let type = 'Bus urbain';
    if (route.distance_km && route.distance_km > 50) {
      type = 'Bus rapide';
    } else if (route.name?.toLowerCase().includes('métro') || route.name?.toLowerCase().includes('metro')) {
      type = 'Métro';
    }

    // Calculer la durée d'affichage
    const duration = route.duration_minutes 
      ? `${route.duration_minutes} min`
      : '-- min';

    // Supporter plusieurs noms de champs possibles renvoyés par l'API
    const from = (route as any).start_point ?? (route as any).startPoint ?? (route as any).start ?? (route as any).from ?? route.name ?? 'Départ';
    const to = (route as any).end_point ?? (route as any).endPoint ?? (route as any).end ?? (route as any).to ?? 'Arrivée';
  const priceCategory = ((route as any).price_category ?? (route as any).priceCategory ?? (route as any).price) || '';

    return {
      id: route.id,
      from,
      to,
  price: priceMap[(priceCategory as keyof typeof priceMap)] || (typeof (route as any).price === 'string' ? (route as any).price : '-- FCFA'),
      duration,
      type,
      popularity_score: Math.random() * 100 // Simulation score popularité
    };
  }

  // Données de fallback en cas d'erreur API
  private static getFallbackPopularRoutes(limit: number): PopularRoute[] {
    const fallbackRoutes: PopularRoute[] = [
      {
        id: 'fallback-1',
        from: 'Centre-ville',
        to: 'Aéroport',
        price: '250 FCFA',
        duration: '45 min',
        type: 'Bus rapide',
      },
      {
        id: 'fallback-2', 
        from: 'Université',
        to: 'Marché central',
        price: '150 FCFA',
        duration: '25 min',
        type: 'Bus urbain',
      },
      {
        id: 'fallback-3',
        from: 'Gare routière',
        to: 'Plateau',
        price: '100 FCFA',
        duration: '20 min',
        type: 'Métro',
      }
    ];

    return fallbackRoutes.slice(0, limit);
  }
}