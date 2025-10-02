import { apiClient } from '@shared/services/apiClient';
import {
  SotralLine,
  CreateLineRequest,
  UpdateLineRequest,
  ApiResponse,
  PaginatedResponse
} from '@shared/types';

// ==========================================
// SERVICE GESTION DES LIGNES SOTRAL
// ==========================================

export class LinesService {
  private readonly basePath = '/api/admin/sotral/lines';

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Récupérer toutes les lignes
   */
  async getAllLines(): Promise<ApiResponse<SotralLine[]>> {
    return apiClient.get(`${this.basePath}`);
  }

  /**
   * Récupérer une ligne par ID
   */
  async getLineById(id: number): Promise<ApiResponse<SotralLine>> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  /**
   * Créer une nouvelle ligne
   */
  async createLine(data: CreateLineRequest): Promise<ApiResponse<SotralLine>> {
    return apiClient.post(`${this.basePath}`, data);
  }

  /**
   * Mettre à jour une ligne
   */
  async updateLine(id: number, data: UpdateLineRequest): Promise<ApiResponse<SotralLine>> {
    return apiClient.put(`${this.basePath}/${id}`, data);
  }

  /**
   * Supprimer une ligne
   */
  async deleteLine(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Activer/désactiver une ligne
   */
  async toggleLineStatus(id: number): Promise<ApiResponse<SotralLine>> {
    return apiClient.post(`${this.basePath}/${id}/toggle-status`);
  }

  // ==========================================
  // OPÉRATIONS SPÉCIALISÉES
  // ==========================================

  /**
   * Récupérer les lignes actives uniquement
   */
  async getActiveLines(): Promise<ApiResponse<SotralLine[]>> {
    const result = await this.getAllLines();
    if (result.success) {
      result.data = result.data.filter(line => line.is_active);
    }
    return result;
  }

  /**
   * Rechercher des lignes par nom ou numéro
   */
  async searchLines(query: string): Promise<ApiResponse<SotralLine[]>> {
    const result = await this.getAllLines();
    if (result.success && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      result.data = result.data.filter(line =>
        line.name.toLowerCase().includes(searchTerm) ||
        line.line_number.toString().includes(searchTerm) ||
        line.route_from.toLowerCase().includes(searchTerm) ||
        line.route_to.toLowerCase().includes(searchTerm)
      );
    }
    return result;
  }

  /**
   * Récupérer les lignes par catégorie
   */
  async getLinesByCategory(categoryId: number): Promise<ApiResponse<SotralLine[]>> {
    const result = await this.getAllLines();
    if (result.success) {
      result.data = result.data.filter(line => line.category_id === categoryId);
    }
    return result;
  }

  /**
   * Vérifier si un numéro de ligne existe déjà
   */
  async isLineNumberAvailable(lineNumber: number, excludeId?: number): Promise<boolean> {
    const result = await this.getAllLines();
    if (!result.success) return false;
    
    return !result.data.some(line => 
      line.line_number === lineNumber && 
      (!excludeId || line.id !== excludeId)
    );
  }

  // ==========================================
  // STATISTIQUES DES LIGNES
  // ==========================================

  /**
   * Récupérer les statistiques d'une ligne
   */
  async getLineStats(id: number): Promise<ApiResponse<{
    tickets_generated: number;
    active_tickets: number;
    total_revenue: number;
    usage_today: number;
  }>> {
    // Note: Cette méthode nécessiterait une route backend dédiée
    // Pour l'instant, on peut l'implémenter côté front en combinant les données
    throw new Error('Method not implemented - requires backend endpoint');
  }

  /**
   * Exporter les données des lignes
   */
  async exportLines(format: 'csv' | 'json' = 'json'): Promise<SotralLine[]> {
    const result = await this.getAllLines();
    if (!result.success) {
      throw new Error(result.error || 'Failed to export lines');
    }
    return result.data;
  }

  // ==========================================
  // VALIDATION ET UTILITAIRES
  // ==========================================

  /**
   * Valider les données d'une ligne avant création/modification
   */
  validateLineData(data: CreateLineRequest | UpdateLineRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validation numéro de ligne
    if ('line_number' in data) {
      if (!data.line_number || data.line_number <= 0) {
        errors.push('Le numéro de ligne doit être un entier positif');
      }
    }

    // Validation nom
    if ('name' in data) {
      if (!data.name || data.name.trim().length < 3) {
        errors.push('Le nom de la ligne doit contenir au moins 3 caractères');
      }
    }

    // Validation routes
    if ('route_from' in data) {
      if (!data.route_from || data.route_from.trim().length < 2) {
        errors.push('Le point de départ doit contenir au moins 2 caractères');
      }
    }

    if ('route_to' in data) {
      if (!data.route_to || data.route_to.trim().length < 2) {
        errors.push('Le point d\'arrivée doit contenir au moins 2 caractères');
      }
    }

    // Validation catégorie
    if ('category_id' in data) {
      if (!data.category_id || data.category_id <= 0) {
        errors.push('Une catégorie valide doit être sélectionnée');
      }
    }

    // Validation distance
    if ('distance_km' in data && data.distance_km !== undefined) {
      if (data.distance_km <= 0) {
        errors.push('La distance doit être positive');
      }
    }

    // Validation nombre d'arrêts
    if ('stops_count' in data && data.stops_count !== undefined) {
      if (data.stops_count <= 0) {
        errors.push('Le nombre d\'arrêts doit être positif');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formater une ligne pour l'affichage
   */
  formatLineForDisplay(line: SotralLine): {
    displayName: string;
    routeDescription: string;
    statusLabel: string;
    statusColor: string;
    categoryLabel: string;
  } {
    return {
      displayName: `Ligne ${line.line_number} - ${line.name}`,
      routeDescription: `${line.route_from} ↔ ${line.route_to}`,
      statusLabel: line.is_active ? 'Active' : 'Inactive',
      statusColor: line.is_active ? '#10B981' : '#EF4444',
      categoryLabel: line.category?.name || 'Ordinaire'
    };
  }

  /**
   * Obtenir les suggestions pour l'autocomplétion
   */
  async getAutocompleteSuggestions(): Promise<{
    routePoints: string[];
    lineNames: string[];
  }> {
    const result = await this.getAllLines();
    if (!result.success) {
      return { routePoints: [], lineNames: [] };
    }

    const routePoints = new Set<string>();
    const lineNames: string[] = [];

    result.data.forEach(line => {
      routePoints.add(line.route_from);
      routePoints.add(line.route_to);
      lineNames.push(line.name);
    });

    return {
      routePoints: Array.from(routePoints).sort(),
      lineNames: lineNames.sort()
    };
  }
}

// Instance singleton
export const linesService = new LinesService();
export default linesService;