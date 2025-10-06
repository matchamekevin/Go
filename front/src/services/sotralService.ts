/**
 * ✅ SERVICE SOTRAL (TRANSPORT) - NOUVELLE INTÉGRATION
 * Basé sur les endpoints backend réels: /api/sotral
 */

import apiClient from './api.client';

export interface Line {
  id: number;
  number: string;
  name: string;
  color: string;
  type: 'bus' | 'minibus' | 'express';
  is_active: boolean;
}

export interface Stop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lines?: string[];
  distance?: number;
}

export interface LineDetails extends Line {
  description?: string;
  stops: StopWithOrder[];
}

export interface StopWithOrder {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface StopDetails {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lines: Line[];
}

export interface RouteSegment {
  line: {
    id: number;
    number: string;
    name: string;
    color: string;
  };
  stops: StopWithOrder[];
  duration_estimate: number;
}

export interface Route {
  origin: string;
  destination: string;
  segments: RouteSegment[];
}

export interface Schedule {
  stop_name: string;
  departure_time: string;
  arrival_time: string;
  day_type: 'weekday' | 'weekend';
}

export interface Vehicle {
  id: number;
  line: {
    id: number;
    number: string;
  };
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  last_update: string;
}

export interface FavoriteStop {
  id: number;
  stop: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };
  alias?: string;
  created_at: string;
}

class SotralService {
  /**
   * Récupérer toutes les lignes
   * Backend: GET /sotral/lines
   */
  async getAllLines(): Promise<Line[]> {
    try {
      const response = await apiClient.getSotralLines();
      return response.success ? (response.lines || []) : [];
    } catch (error) {
      console.error('Erreur récupération lignes:', error);
      return [];
    }
  }

  /**
   * Récupérer les détails d'une ligne
   * Backend: GET /sotral/lines/:lineId
   */
  async getLineById(lineId: number): Promise<LineDetails | null> {
    try {
      const response = await apiClient.getSotralLineById(lineId);
      return response.success ? response.line : null;
    } catch (error) {
      console.error('Erreur récupération ligne:', error);
      return null;
    }
  }

  /**
   * Récupérer tous les arrêts
   * Backend: GET /sotral/stops
   */
  async getAllStops(): Promise<Stop[]> {
    try {
      const response = await apiClient.getSotralStops();
      return response.success ? (response.stops || []) : [];
    } catch (error) {
      console.error('Erreur récupération arrêts:', error);
      return [];
    }
  }

  /**
   * Rechercher les arrêts à proximité
   * Backend: GET /sotral/stops?latitude=...&longitude=...&radius=...
   */
  async getNearbyStops(
    latitude: number,
    longitude: number,
    radius: number = 1000
  ): Promise<Stop[]> {
    try {
      const response = await apiClient.getSotralStops({
        latitude,
        longitude,
        radius,
      });
      return response.success ? (response.stops || []) : [];
    } catch (error) {
      console.error('Erreur recherche arrêts proximité:', error);
      return [];
    }
  }

  /**
   * Récupérer les détails d'un arrêt
   * Backend: GET /sotral/stops/:stopId
   */
  async getStopById(stopId: number): Promise<StopDetails | null> {
    try {
      const response = await apiClient.getSotralStopById(stopId);
      return response.success ? response.stop : null;
    } catch (error) {
      console.error('Erreur récupération arrêt:', error);
      return null;
    }
  }

  /**
   * Calculer un itinéraire
   * Backend: GET /sotral/route?from_stop_id=...&to_stop_id=...
   */
  async calculateRoute(fromStopId: number, toStopId: number): Promise<Route | null> {
    try {
      const response = await apiClient.calculateRoute(fromStopId, toStopId);
      return response.success ? response.route : null;
    } catch (error) {
      console.error('Erreur calcul itinéraire:', error);
      return null;
    }
  }

  /**
   * Récupérer les horaires d'une ligne
   * Backend: GET /sotral/schedules/:lineId
   */
  async getLineSchedules(
    lineId: number,
    dayType?: 'weekday' | 'weekend'
  ): Promise<Schedule[]> {
    try {
      const response = await apiClient.getLineSchedules(lineId, dayType);
      return response.success ? (response.schedules || []) : [];
    } catch (error) {
      console.error('Erreur récupération horaires:', error);
      return [];
    }
  }

  /**
   * Récupérer les véhicules en temps réel
   * Backend: GET /sotral/realtime/:lineId
   */
  async getRealtimeVehicles(lineId: number): Promise<Vehicle[]> {
    try {
      const response = await apiClient.getRealtimeVehicles(lineId);
      return response.success ? (response.vehicles || []) : [];
    } catch (error) {
      console.error('Erreur données temps réel:', error);
      return [];
    }
  }

  /**
   * Ajouter un arrêt aux favoris
   * Backend: POST /sotral/favorite
   */
  async addFavoriteStop(stopId: number, alias?: string): Promise<{
    success: boolean;
    favorite?: FavoriteStop;
    message?: string;
  }> {
    try {
      const response = await apiClient.addFavoriteStop(stopId, alias);
      return {
        success: response.success,
        favorite: response.favorite,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur ajout favori',
      };
    }
  }

  /**
   * Récupérer les arrêts favoris
   * Backend: GET /sotral/favorites
   */
  async getFavoriteStops(): Promise<FavoriteStop[]> {
    try {
      const response = await apiClient.getFavoriteStops();
      return response.success ? (response.favorites || []) : [];
    } catch (error) {
      console.error('Erreur récupération favoris:', error);
      return [];
    }
  }

  /**
   * Supprimer un arrêt des favoris
   * Backend: DELETE /sotral/favorite/:favoriteId
   */
  async removeFavoriteStop(favoriteId: number): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await apiClient.removeFavoriteStop(favoriteId);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur suppression favori',
      };
    }
  }

  /**
   * Calculer la distance entre deux points (formule de Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Formater la distance
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Formater la durée
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  }

  /**
   * Obtenir le type de véhicule
   */
  getVehicleTypeLabel(type: string): string {
    const types: Record<string, string> = {
      bus: 'Bus',
      minibus: 'Minibus',
      express: 'Express',
    };
    return types[type] || type;
  }
}

const sotralService = new SotralService();

export default sotralService;
export { SotralService };
