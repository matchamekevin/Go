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
      // Désactivation du cache : on récupère toujours les données fraîches
      const payload = await apiClient.get<any>(`${this.baseUrl}/lines`);
      const data = payload?.data ?? payload ?? [];
      return { success: true, data };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des lignes', error);
    }
  }

  async getLineById(id: number): Promise<ApiResponse<SotralLine>> {
    try {
      const payload = await apiClient.get<any>(`${this.baseUrl}/lines/${id}`);
      return {
        success: true,
        data: payload?.data ?? payload
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la récupération de la ligne ${id}`, error);
    }
  }

  async createLine(lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> {
    try {
      const payload = await apiClient.post<any>(`${this.baseUrl}/lines`, lineData);
      return {
        success: true,
        data: payload?.data ?? payload,
        message: 'Ligne créée avec succès'
      };
    } catch (error) {
      return this.handleError('Erreur lors de la création de la ligne', error);
    }
  }

  async updateLine(id: number, lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> {
    try {
      const payload = await apiClient.put<any>(`${this.baseUrl}/lines/${id}`, lineData);
      return {
        success: true,
        data: payload?.data ?? payload,
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

  async toggleLineStatus(id: number): Promise<ApiResponse<SotralLine>> {
    try {
      // Invalider le cache avant de faire la requête
      this.clearCache();

      const payload = await apiClient.post<any>(`${this.baseUrl}/lines/${id}/toggle-status`);
      return {
        success: true,
        data: payload?.data ?? payload,
        message: payload?.message || 'Statut de la ligne mis à jour avec succès'
      };
    } catch (error) {
      return this.handleError(`Erreur lors du changement de statut de la ligne ${id}`, error);
    }
  }

  // ==========================================
  // GESTION DES TYPES DE TICKETS
  // ==========================================

  async getTicketTypes(): Promise<ApiResponse<SotralTicketType[]>> {
    try {
      const cacheKey = 'sotral:ticket-types';
      const cached = this.getCachedData<SotralTicketType[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const payload = await apiClient.get<any>(`${this.baseUrl}/ticket-types`);
      const data = payload?.data ?? payload ?? [];
      this.setCachedData(cacheKey, data, 10);
      return { success: true, data };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des types de tickets', error);
    }
  }

  async createTicketType(typeData: Partial<SotralTicketType>): Promise<ApiResponse<SotralTicketType>> {
    try {
      const payload = await apiClient.post<any>(`${this.baseUrl}/ticket-types`, typeData);
      return {
        success: true,
        data: payload?.data ?? payload,
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

      const payload = await apiClient.post<any>(`${this.baseUrl}/generate-tickets`, requestData);
      return {
        success: true,
        data: payload?.data ?? payload,
        message: `${quantity} tickets générés avec succès`
      };
    } catch (error) {
      return this.handleError('Erreur lors de la génération de tickets', error);
    }
  }

  async generateBulkTickets(requests: TicketGenerationRequest[]): Promise<ApiResponse<any>> {
    try {
      const requestData: BulkTicketGenerationRequest = { requests };

      const payload = await apiClient.post<any>(`${this.baseUrl}/bulk-generate-tickets`, requestData);
      return {
        success: true,
        data: payload?.data ?? payload,
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

      const payload = await apiClient.get<any>(`${this.baseUrl}/tickets?${params.toString()}`);
      return {
        success: true,
        data: payload?.data ?? payload
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des tickets', error);
    }
  }

  async getTicketById(id: number): Promise<ApiResponse<SotralTicketWithDetails>> {
    try {
      const payload = await apiClient.get<any>(`${this.baseUrl}/tickets/${id}`);
      return {
        success: true,
        data: payload?.data ?? payload
      };
    } catch (error) {
      return this.handleError(`Erreur lors de la récupération du ticket ${id}`, error);
    }
  }

  async updateTicketStatus(id: number, status: string): Promise<ApiResponse<SotralTicketWithDetails>> {
    try {
      const payload = await apiClient.patch<any>(`${this.baseUrl}/tickets/${id}/status`, { status });
      return {
        success: true,
        data: payload?.data ?? payload,
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

      const payload = await apiClient.get<any>(`${this.baseUrl}/analytics?${params.toString()}`);
      return {
        success: true,
        data: payload?.data ?? payload
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération des analytics', error);
    }
  }

  async getRevenueSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
    try {
      const payload = await apiClient.get<any>(`${this.baseUrl}/analytics/revenue?period=${period}`);
      return {
        success: true,
        data: payload?.data ?? payload
      };
    } catch (error) {
      return this.handleError('Erreur lors de la récupération du résumé des revenus', error);
    }
  }

  async getPopularLines(limit: number = 10): Promise<ApiResponse<any>> {
    try {
      const payload = await apiClient.get<any>(`${this.baseUrl}/analytics/popular-lines?limit=${limit}`);
      return {
        success: true,
        data: payload?.data ?? payload
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
      const payload = await apiClient.get<Blob>(`${this.baseUrl}/tickets/${ticketId}/qr`, {
        responseType: 'blob' as any
      } as any);
      return payload;
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

      const payload = await apiClient.get<Blob>(`${this.baseUrl}/tickets/export?${params.toString()}`, {
        responseType: 'blob' as any
      } as any);
      return payload;
    } catch (error) {
      throw new Error('Erreur lors de l\'exportation des tickets');
    }
  }

  async validateTicket(ticketCode: string): Promise<ApiResponse<any>> {
    try {
      const payload = await apiClient.post<any>(`${this.baseUrl}/tickets/validate`, { ticketCode });
      return {
        success: true,
        data: payload?.data ?? payload,
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