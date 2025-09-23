import { apiClient } from './apiClient';
import { 
  SotralLine, 
  SotralTicketType, 
  SotralTicketWithDetails, 
  TicketFilters,
  TicketGenerationRequest,
  BulkTicketGenerationRequest,
  AnalyticsData,
  PaginatedResponse,
  ApiResponse
} from '../types/sotral';

class AdminSotralService {
  private readonly baseUrl = '/api/admin/sotral';

  // ==========================================
  // GESTION DES LIGNES
  // ==========================================

  async getLines(): Promise<ApiResponse<SotralLine[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/lines`);
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des lignes', error);
    }
  }

  async getLineById(id: number): Promise<ApiResponse<SotralLine>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/lines/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la récupération de la ligne ${id}`, error);
    }
  }

  async createLine(lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/lines`, lineData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Ligne créée avec succès'
      };
    } catch (error) {
      return this.handleError('Erreur lors de la création de la ligne', error);
    }
  }

  async updateLine(id: number, lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/lines/${id}`, lineData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Ligne mise à jour avec succès'
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la mise à jour de la ligne ${id}`, error);
    }
  }

  async deleteLine(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.baseUrl}/lines/${id}`);
      return {
        success: true,
        message: 'Ligne supprimée avec succès'
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la suppression de la ligne ${id}`, error);
    }
  }

  // ==========================================
  // GESTION DES TYPES DE TICKETS
  // ==========================================

  async getTicketTypes(): Promise<ApiResponse<SotralTicketType[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/ticket-types`);
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des types de tickets', error);
    }
  }

  async createTicketType(typeData: Partial<SotralTicketType>): Promise<ApiResponse<SotralTicketType>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/ticket-types`, typeData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Type de ticket créé avec succès'
      };
    } catch (error) {
      return this.handleError('Erreur lors de la création du type de ticket', error);
    }
  }

  // ==========================================
  // GÉNÉRATION DE TICKETS
  // ==========================================

  async generateTickets(
    lineId: number,
    ticketTypeCode: string,
    quantity: number,
    validityHours?: number
  ): Promise<ApiResponse<any>> {
    try {
      const requestData: TicketGenerationRequest = {
        lineId,
        ticketTypeCode,
        quantity,
        validityHours
      };

      const response = await apiClient.post(`${this.baseUrl}/generate-tickets`, requestData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: `${quantity} tickets générés avec succès`
      };
    } catch (error) {
      return this.handleError('Erreur lors de la génération de tickets', error);
    }
  }

  async generateBulkTickets(requests: TicketGenerationRequest[]): Promise<ApiResponse<any>> {
    try {
      const requestData: BulkTicketGenerationRequest = { requests };

      const response = await apiClient.post(`${this.baseUrl}/bulk-generate-tickets`, requestData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Génération en lot réussie'
      };
    } catch (error) {
      return this.handleError('Erreur lors de la génération en lot', error);
    }
  }

  // ==========================================
  // GESTION DES TICKETS
  // ==========================================

  async getTickets(filters?: TicketFilters): Promise<ApiResponse<PaginatedResponse<SotralTicketWithDetails>>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}/tickets?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des tickets', error);
    }
  }

  async getTicketById(id: number): Promise<ApiResponse<SotralTicketWithDetails>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/tickets/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la récupération du ticket ${id}`, error);
    }
  }

  async updateTicketStatus(id: number, status: string): Promise<ApiResponse<SotralTicketWithDetails>> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/tickets/${id}/status`, { status });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Statut du ticket mis à jour'
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la mise à jour du statut du ticket ${id}`, error);
    }
  }

  async deleteTicket(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.baseUrl}/tickets/${id}`);
      return {
        success: true,
        message: 'Ticket supprimé avec succès'
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la suppression du ticket ${id}`, error);
    }
  }

  // ==========================================
  // ANALYTICS ET STATISTIQUES
  // ==========================================

  async getAnalytics(dateFrom?: string, dateTo?: string): Promise<ApiResponse<AnalyticsData>> {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await apiClient.get(`${this.baseUrl}/analytics?${params.toString()}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des analytics', error);
    }
  }

  async getRevenueSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/revenue?period=${period}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération du résumé des revenus', error);
    }
  }

  async getPopularLines(limit: number = 10): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/popular-lines?limit=${limit}`);
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des lignes populaires', error);
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  async downloadTicketQR(ticketId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/tickets/${ticketId}/qr`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du téléchargement du QR code');
    }
  }

  async exportTickets(filters?: TicketFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseUrl}/tickets/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de l\'exportation des tickets');
    }
  }

  async validateTicket(ticketCode: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/tickets/validate`, { ticketCode });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Ticket validé avec succès'
      };
    } catch (error) {
      return this.handleError('Erreur lors de la validation du ticket', error);
    }
  }

  // ==========================================
  // GESTION D'ERREURS
  // ==========================================

  private handleError(message: string, error: any): ApiResponse<any> {
    console.error(message, error);
    
    let errorMessage = message;
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }

  // ==========================================
  // CACHE ET OPTIMISATIONS
  // ==========================================

  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const adminSotralService = new AdminSotralService();