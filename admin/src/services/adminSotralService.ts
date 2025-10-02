import { apiClient } from './apiClient';
import {
  SotralLine,
  SotralTicket,
  SotralTicketType,
  AnalyticsData,
  PaginatedResponse,
  ApiResponse,
  TicketFilters,
  TicketGenerationRequest,
  BulkTicketGenerationRequest
} from '../types/sotral';

interface AdminSotralServiceConfig {
  baseUrl: string;
  cacheTimeout: number;
  retryAttempts: number;
}

interface ApiErrorResponse extends ApiResponse<any> {
  errorType?: string;
}

class AdminSotralService {
  private readonly config: AdminSotralServiceConfig = {
    baseUrl: '/admin/sotral',
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3
  };

  private cache = new Map<string, { data: any; timestamp: number }>();

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  private async handleApiCall<T>(
    operation: () => Promise<any>,
    cacheKey?: string,
    skipCache = false
  ): Promise<ApiResponse<T>> {
    try {
      // Vérifier le cache si activé
      if (cacheKey && !skipCache) {
        const cached = this.getCachedData<T>(cacheKey);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      const response = await operation();

      // Mettre en cache si demandé
      if (cacheKey && response?.data) {
        this.setCachedData(cacheKey, response.data);
      }

      return {
        success: true,
        data: response?.data ?? response
      };
    } catch (error: any) {
      console.error('API Error:', error);

      let errorMessage = 'Une erreur inattendue s\'est produite';
      let errorType = 'unknown';

      if (error?.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            errorType = 'validation';
            errorMessage = data?.message || 'Données invalides';
            break;
          case 401:
            errorType = 'auth';
            errorMessage = 'Authentification requise';
            break;
          case 403:
            errorType = 'forbidden';
            errorMessage = 'Accès refusé';
            break;
          case 404:
            errorType = 'not_found';
            errorMessage = data?.message || 'Ressource non trouvée';
            break;
          case 409:
            errorType = 'conflict';
            errorMessage = data?.message || 'Conflit de données';
            break;
          case 422:
            errorType = 'validation';
            errorMessage = data?.message || 'Erreur de validation';
            break;
          case 500:
            errorType = 'server';
            errorMessage = 'Erreur serveur interne';
            break;
          default:
            errorType = 'server';
            errorMessage = data?.message || `Erreur ${status}`;
        }
      } else if (error?.request) {
        errorType = 'network';
        errorMessage = 'Erreur de connexion réseau';
      }

      const errorResponse: ApiErrorResponse = {
        success: false,
        error: errorMessage,
        errorType
      };

      return errorResponse;
    }
  }

  // ==========================================
  // GESTION DES LIGNES
  // ==========================================

  async getLines(): Promise<ApiResponse<SotralLine[]>> {
    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/lines`),
      'lines',
      true // Skip cache pour avoir les données fraîches
    ) as Promise<ApiResponse<SotralLine[]>>;
  }

  async getLineById(id: number): Promise<ApiResponse<SotralLine>> {
    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/lines/${id}`),
      `line:${id}`
    ) as Promise<ApiResponse<SotralLine>>;
  }

  async createLine(lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> {
    const result = await this.handleApiCall(
      () => apiClient.post(`${this.config.baseUrl}/lines`, lineData),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('lines'); // Invalider le cache des lignes
    }

    return result as ApiResponse<SotralLine>;
  }

  async updateLine(id: number, lineData: Partial<SotralLine>): Promise<ApiResponse<SotralLine>> {
    const result = await this.handleApiCall(
      () => apiClient.put(`${this.config.baseUrl}/lines/${id}`, lineData),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('lines'); // Invalider le cache
      this.clearCache(`line:${id}`);
    }

    return result as ApiResponse<SotralLine>;
  }

  async deleteLine(id: number): Promise<ApiResponse<void>> {
    const result = await this.handleApiCall(
      () => apiClient.delete(`${this.config.baseUrl}/lines/${id}`),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('lines');
      this.clearCache(`line:${id}`);
    }

    return result as ApiResponse<void>;
  }

  async toggleLineStatus(id: number): Promise<ApiResponse<SotralLine>> {
    const result = await this.handleApiCall(
      () => apiClient.post(`${this.config.baseUrl}/lines/${id}/toggle-status`),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('lines');
      this.clearCache(`line:${id}`);
    }

    return result as ApiResponse<SotralLine>;
  }

  // ==========================================
  // GESTION DES TYPES DE TICKETS
  // ==========================================

  async getTicketTypes(): Promise<ApiResponse<SotralTicketType[]>> {
    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/ticket-types`),
      'ticket-types'
    ) as Promise<ApiResponse<SotralTicketType[]>>;
  }

  async createTicketType(typeData: Partial<SotralTicketType>): Promise<ApiResponse<SotralTicketType>> {
    const result = await this.handleApiCall(
      () => apiClient.post(`${this.config.baseUrl}/ticket-types`, typeData),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('ticket-types');
    }

    return result as ApiResponse<SotralTicketType>;
  }

  // ==========================================
  // GÉNÉRATION DE TICKETS
  // ==========================================

  async generateTickets(request: TicketGenerationRequest): Promise<ApiResponse<any>> {
    return this.handleApiCall(
      () => apiClient.post(`${this.config.baseUrl}/generate-tickets`, request),
      undefined,
      true
    );
  }

  async generateBulkTickets(request: BulkTicketGenerationRequest): Promise<ApiResponse<any>> {
    return this.handleApiCall(
      () => apiClient.post(`${this.config.baseUrl}/bulk-generate-tickets`, request),
      undefined,
      true
    );
  }

  // ==========================================
  // GESTION DES TICKETS
  // ==========================================

  async getTickets(filters?: TicketFilters): Promise<ApiResponse<PaginatedResponse<SotralTicket>>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const cacheKey = queryString ? `tickets:${queryString}` : 'tickets';

    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/tickets?${queryString}`),
      cacheKey,
      true // Skip cache pour les données paginées
    ) as Promise<ApiResponse<PaginatedResponse<SotralTicket>>>;
  }

  async getTicketById(id: number): Promise<ApiResponse<SotralTicket>> {
    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/tickets/${id}`),
      `ticket:${id}`
    ) as Promise<ApiResponse<SotralTicket>>;
  }

  async updateTicketStatus(id: number, status: string): Promise<ApiResponse<SotralTicket>> {
    const result = await this.handleApiCall(
      () => apiClient.patch(`${this.config.baseUrl}/tickets/${id}/status`, { status }),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('tickets');
      this.clearCache(`ticket:${id}`);
    }

    return result as ApiResponse<SotralTicket>;
  }

  async deleteTicket(id: number): Promise<ApiResponse<void>> {
    const result = await this.handleApiCall(
      () => apiClient.delete(`${this.config.baseUrl}/tickets/${id}`),
      undefined,
      true
    );

    if (result.success) {
      this.clearCache('tickets');
      this.clearCache(`ticket:${id}`);
    }

    return result as ApiResponse<void>;
  }

  // ==========================================
  // ANALYTICS ET STATISTIQUES
  // ==========================================

  async getAnalytics(dateFrom?: string, dateTo?: string): Promise<ApiResponse<AnalyticsData>> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const queryString = params.toString();
    const cacheKey = queryString ? `analytics:${queryString}` : 'analytics';

    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/analytics?${queryString}`),
      cacheKey
    ) as Promise<ApiResponse<AnalyticsData>>;
  }

  async getRevenueSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/analytics/revenue?period=${period}`),
      `revenue:${period}`
    );
  }

  async getPopularLines(limit: number = 10): Promise<ApiResponse<any>> {
    return this.handleApiCall(
      () => apiClient.get(`${this.config.baseUrl}/analytics/popular-lines?limit=${limit}`),
      `popular-lines:${limit}`
    );
  }

  // ==========================================
  // MÉTHODES UTILITAIRES PUBLIQUES
  // ==========================================

  clearAllCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const adminSotralService = new AdminSotralService();