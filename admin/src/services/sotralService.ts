import apiClient from './apiClient.new';

export interface Line {
  id: string;
  name: string;
  number: string;
  color?: string;
  type?: string;
  createdAt: string;
  stops?: Stop[];
}

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
  lines?: string[];
}

export interface Schedule {
  id: string;
  lineId: string;
  departureTime: string;
  arrivalTime: string;
  days?: string[];
}

export interface Vehicle {
  id: string;
  lineId: string;
  vehicleNumber: string;
  capacity?: number;
}

class SotralService {
  // ==================== LIGNES ====================

  /**
   * Créer une nouvelle ligne
   */
  async createLine(data: {
    name: string;
    number: string;
    color?: string;
    type?: string;
  }): Promise<Line> {
    try {
      const response = await apiClient.createLine(data);
      return response.line || response;
    } catch (error: any) {
      console.error('Erreur création ligne:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de création de la ligne'
      );
    }
  }

  /**
   * Modifier une ligne
   */
  async updateLine(
    lineId: string,
    data: {
      name?: string;
      number?: string;
      color?: string;
      type?: string;
    }
  ): Promise<Line> {
    try {
      const response = await apiClient.updateLine(lineId, data);
      return response.line || response;
    } catch (error: any) {
      console.error('Erreur modification ligne:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de modification de la ligne'
      );
    }
  }

  /**
   * Supprimer une ligne
   */
  async deleteLine(lineId: string): Promise<void> {
    try {
      await apiClient.deleteLine(lineId);
    } catch (error: any) {
      console.error('Erreur suppression ligne:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de suppression de la ligne'
      );
    }
  }

  // ==================== ARRÊTS ====================

  /**
   * Créer un nouvel arrêt
   */
  async createStop(data: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }): Promise<Stop> {
    try {
      const response = await apiClient.createStop(data);
      return response.stop || response;
    } catch (error: any) {
      console.error('Erreur création arrêt:', error);
      throw new Error(
        error.response?.data?.message || "Erreur de création de l'arrêt"
      );
    }
  }

  /**
   * Modifier un arrêt
   */
  async updateStop(
    stopId: string,
    data: {
      name?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    }
  ): Promise<Stop> {
    try {
      const response = await apiClient.updateStop(stopId, data);
      return response.stop || response;
    } catch (error: any) {
      console.error('Erreur modification arrêt:', error);
      throw new Error(
        error.response?.data?.message || "Erreur de modification de l'arrêt"
      );
    }
  }

  /**
   * Supprimer un arrêt
   */
  async deleteStop(stopId: string): Promise<void> {
    try {
      await apiClient.deleteStop(stopId);
    } catch (error: any) {
      console.error('Erreur suppression arrêt:', error);
      throw new Error(
        error.response?.data?.message || "Erreur de suppression de l'arrêt"
      );
    }
  }

  // ==================== ASSOCIATION LIGNE-ARRÊTS ====================

  /**
   * Ajouter un arrêt à une ligne
   */
  async addStopToLine(lineId: string, stopId: string, order?: number): Promise<void> {
    try {
      await apiClient.addStopToLine(lineId, stopId, order);
    } catch (error: any) {
      console.error("Erreur ajout arrêt à la ligne:", error);
      throw new Error(
        error.response?.data?.message || "Erreur d'ajout de l'arrêt à la ligne"
      );
    }
  }

  /**
   * Retirer un arrêt d'une ligne
   */
  async removeStopFromLine(lineId: string, stopId: string): Promise<void> {
    try {
      await apiClient.removeStopFromLine(lineId, stopId);
    } catch (error: any) {
      console.error("Erreur retrait arrêt de la ligne:", error);
      throw new Error(
        error.response?.data?.message || "Erreur de retrait de l'arrêt"
      );
    }
  }

  /**
   * Réorganiser les arrêts d'une ligne
   */
  async reorderLineStops(lineId: string, stopIds: string[]): Promise<void> {
    try {
      await apiClient.reorderLineStops(lineId, stopIds);
    } catch (error: any) {
      console.error('Erreur réorganisation arrêts:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de réorganisation des arrêts'
      );
    }
  }

  // ==================== HORAIRES ====================

  /**
   * Créer un horaire
   */
  async createSchedule(data: {
    lineId: string;
    departureTime: string;
    arrivalTime: string;
    days?: string[];
  }): Promise<Schedule> {
    try {
      const response = await apiClient.createSchedule(data);
      return response.schedule || response;
    } catch (error: any) {
      console.error('Erreur création horaire:', error);
      throw new Error(
        error.response?.data?.message || "Erreur de création de l'horaire"
      );
    }
  }

  // ==================== VÉHICULES ====================

  /**
   * Créer un véhicule
   */
  async createVehicle(data: {
    lineId: string;
    vehicleNumber: string;
    capacity?: number;
  }): Promise<Vehicle> {
    try {
      const response = await apiClient.createVehicle(data);
      return response.vehicle || response;
    } catch (error: any) {
      console.error('Erreur création véhicule:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de création du véhicule'
      );
    }
  }

  // ==================== IMPORT ====================

  /**
   * Importer des données SOTRAL
   */
  async importSotralData(data: any): Promise<any> {
    try {
      const response = await apiClient.importSotralData(data);
      return response;
    } catch (error: any) {
      console.error('Erreur import SOTRAL:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur lors de l\'import'
      );
    }
  }

  // ==================== UTILITAIRES ====================

  /**
   * Formater le type de ligne
   */
  getLineTypeLabel(type?: string): string {
    if (!type) return 'Standard';
    const labels: { [key: string]: string } = {
      bus: 'Bus',
      minibus: 'Minibus',
      express: 'Express',
      night: 'Nuit',
    };
    return labels[type] || type;
  }

  /**
   * Valider les coordonnées GPS
   */
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Calculer la distance entre deux points (Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convertir en radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Formater la distance
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }

  /**
   * Formater les coordonnées
   */
  formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}

export default new SotralService();
