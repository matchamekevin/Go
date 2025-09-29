import { apiClient } from './apiClient';
import type { ApiResponse, Route, SotralLine } from '../types/api';

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
  // Récupérer toutes les lignes SOTRAL
  static async getAllRoutes(): Promise<SotralLine[]> {
    const response = await apiClient.get<ApiResponse<SotralLine[]>>('/sotral/lines');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des lignes');
    }
    return response.data || [];
  }

  // Récupérer les lignes populaires (transformés pour l'affichage)
  static async getPopularRoutes(limit: number = 10): Promise<PopularRoute[]> {
    try {
      const lines = await this.getAllRoutes();

      // Transformer les données backend en format d'affichage
      return lines
        .filter(line => line.is_active)
        .slice(0, limit)
        .map(line => this.transformToPopularRoute(line));
    } catch (error) {
      console.error('Erreur lors de la récupération des lignes populaires:', error);
      // Plus de fallback - utiliser uniquement les données de l'admin via l'API
      return [];
    }
  }

  // Récupérer les lignes par catégorie
  static async getRoutesByCategory(categoryId: number): Promise<SotralLine[]> {
    const response = await apiClient.get<ApiResponse<SotralLine[]>>(`/sotral/lines/category/${categoryId}`);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des lignes');
    }
    return response.data || [];
  }

  // Transformer une ligne SOTRAL en PopularRoute pour l'affichage
  private static transformToPopularRoute(line: SotralLine): PopularRoute {
    // Déterminer le type basé sur la catégorie
    let type = 'Bus urbain';
    if (line.category?.name?.toLowerCase().includes('rapide') || line.category?.name?.toLowerCase().includes('express')) {
      type = 'Bus rapide';
    } else if (line.category?.name?.toLowerCase().includes('étudiant') || line.category?.name?.toLowerCase().includes('student')) {
      type = 'Bus étudiant';
    }

    // Calculer la durée d'affichage basée sur la distance (estimation)
    const duration = line.distance_km 
      ? `${Math.round(line.distance_km * 2)} min` // ~30 km/h moyenne
      : '-- min';

    return {
      id: line.id.toString(),
      from: line.route_from,
      to: line.route_to,
      price: '-- FCFA', // Prix déterminé par l'admin lors de la génération des tickets
      duration,
      type: `Ligne ${line.line_number}`,
      popularity_score: Math.random() * 100 // Simulation score popularité
    };
  }

  // Données de fallback en cas d'erreur API
  private static getFallbackPopularRoutes(limit: number): PopularRoute[] {
    // Plus de données hardcodées - utiliser uniquement les données de l'admin via l'API
    console.log('RouteService: Aucun trajet populaire via API, retour vide');
    return [];
  }
}