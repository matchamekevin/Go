import { apiClient } from '@shared/services/apiClient';
import {
  SotralTicket,
  TicketFilters,
  PaginatedResponse,
  ApiResponse,
  TicketGenerationRequest,
  BulkTicketGenerationRequest,
  TicketGenerationResult
} from '@shared/types';

// ==========================================
// SERVICE GESTION DES TICKETS SOTRAL
// ==========================================

export class TicketsService {
  private readonly basePath = '/api/admin/sotral/tickets';
  private readonly generationPath = '/api/admin/sotral';

  // ==========================================
  // GESTION DES TICKETS
  // ==========================================

  /**
   * Récupérer tous les tickets avec filtres et pagination
   */
  async getAllTickets(
    page: number = 1,
    limit: number = 50,
    filters: TicketFilters = {}
  ): Promise<PaginatedResponse<SotralTicket>> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters.status) params.append('status', filters.status);
    if (filters.lineId) params.append('lineId', filters.lineId.toString());
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.ticketType) params.append('ticketType', filters.ticketType);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());

    return apiClient.get(`${this.basePath}?${params.toString()}`);
  }

  /**
   * Récupérer un ticket par ID
   */
  async getTicketById(id: number): Promise<ApiResponse<SotralTicket>> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  /**
   * Supprimer un ticket
   */
  async deleteTicket(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Supprimer plusieurs tickets
   */
  async deleteMultipleTickets(ids: number[]): Promise<ApiResponse<{
    deleted: number;
    failed: number;
    errors: string[];
  }>> {
    const results = await Promise.allSettled(
      ids.map(id => this.deleteTicket(id))
    );

    const deleted = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason.message || 'Erreur inconnue');

    return {
      success: true,
      data: { deleted, failed, errors }
    };
  }

  /**
   * Récupérer les tickets générés (publics pour mobile)
   */
  async getGeneratedTickets(
    page: number = 1,
    limit: number = 20,
    lineId?: number,
    ticketType?: string
  ): Promise<PaginatedResponse<SotralTicket>> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (lineId) params.append('lineId', lineId.toString());
    if (ticketType) params.append('ticketTypeCode', ticketType);

    return apiClient.get(`/api/sotral/generated-tickets?${params.toString()}`);
  }

  // ==========================================
  // GÉNÉRATION DE TICKETS
  // ==========================================

  /**
   * Générer des tickets pour une ligne spécifique
   */
  async generateTicketsForLine(
    request: TicketGenerationRequest
  ): Promise<ApiResponse<{
    line: any;
    tickets_generated: number;
    tickets: SotralTicket[];
  }>> {
    return apiClient.post(`${this.generationPath}/generate-tickets`, {
      lineId: request.lineId,
      ticketTypeCode: request.ticketTypeCode,
      quantity: request.quantity,
      validityHours: request.validityHours || 24
    });
  }

  /**
   * Génération en masse pour toutes les lignes
   */
  async bulkGenerateTickets(
    request: BulkTicketGenerationRequest
  ): Promise<ApiResponse<{
    total_lines_processed: number;
    successful_generations: number;
    total_tickets_generated: number;
    results: TicketGenerationResult[];
  }>> {
    return apiClient.post(`${this.generationPath}/bulk-generate-tickets`, {
      ticketTypeCode: request.ticketTypeCode || 'SIMPLE',
      quantityPerLine: request.quantityPerLine || 50,
      validityHours: request.validityHours || 24,
      selectedLineIds: request.selectedLineIds
    });
  }

  // ==========================================
  // ANALYTICS ET STATISTIQUES
  // ==========================================

  /**
   * Récupérer les statistiques des tickets
   */
  async getTicketStats(dateFrom?: Date, dateTo?: Date): Promise<ApiResponse<{
    total_tickets: number;
    active_tickets: number;
    used_tickets: number;
    cancelled_tickets: number;
    expired_tickets: number;
    total_revenue: number;
    tickets_by_line: Array<{
      line_id: number;
      line_name: string;
      count: number;
    }>;
    daily_generation: Array<{
      date: string;
      tickets_generated: number;
    }>;
  }>> {
    const params = new URLSearchParams();
    
    if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
    if (dateTo) params.append('dateTo', dateTo.toISOString());

    const queryString = params.toString();
    return apiClient.get(`${this.basePath}/stats${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Récupérer le rapport d'utilisation des tickets
   */
  async getUsageReport(
    lineId?: number,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ApiResponse<{
    total_generated: number;
    total_used: number;
    usage_rate: number;
    peak_hours: Array<{
      hour: number;
      usage_count: number;
    }>;
    daily_usage: Array<{
      date: string;
      tickets_used: number;
    }>;
  }>> {
    const params = new URLSearchParams();
    
    if (lineId) params.append('lineId', lineId.toString());
    if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
    if (dateTo) params.append('dateTo', dateTo.toISOString());

    const queryString = params.toString();
    return apiClient.get(`${this.basePath}/usage-report${queryString ? `?${queryString}` : ''}`);
  }

  // ==========================================
  // FILTRES ET RECHERCHE
  // ==========================================

  /**
   * Rechercher des tickets par code
   */
  async searchTicketsByCode(code: string): Promise<ApiResponse<SotralTicket[]>> {
    if (!code.trim()) {
      return { success: true, data: [] };
    }

    const filters: TicketFilters = {};
    const result = await this.getAllTickets(1, 100, filters);
    
    if (result.success) {
      const searchTerm = code.toLowerCase().trim();
      result.data = result.data.filter(ticket =>
        ticket.ticket_code.toLowerCase().includes(searchTerm)
      );
    }

    return {
      success: result.success,
      data: result.data
    };
  }

  /**
   * Filtrer les tickets par statut
   */
  async getTicketsByStatus(status: string, limit: number = 50): Promise<PaginatedResponse<SotralTicket>> {
    return this.getAllTickets(1, limit, { status });
  }

  /**
   * Récupérer les tickets d'une ligne spécifique
   */
  async getTicketsByLine(lineId: number, limit: number = 50): Promise<PaginatedResponse<SotralTicket>> {
    return this.getAllTickets(1, limit, { lineId });
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Formater un ticket pour l'affichage
   */
  formatTicketForDisplay(ticket: SotralTicket): {
    displayCode: string;
    statusLabel: string;
    statusColor: string;
    priceFormatted: string;
    expiryInfo: string;
    qrCodeUrl: string;
  } {
    return {
      displayCode: ticket.ticket_code.toUpperCase(),
      statusLabel: this.getStatusLabel(ticket.status),
      statusColor: this.getStatusColor(ticket.status),
      priceFormatted: this.formatPrice(ticket.price_paid_fcfa),
      expiryInfo: this.getExpiryInfo(ticket.expires_at),
      qrCodeUrl: this.generateQRCodeUrl(ticket.qr_code)
    };
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Actif',
      used: 'Utilisé',
      expired: 'Expiré',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#10B981',   // Green
      used: '#6B7280',     // Gray
      expired: '#EF4444',  // Red
      cancelled: '#F59E0B' // Orange
    };
    return colors[status] || '#6B7280';
  }

  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  }

  private getExpiryInfo(expiresAt?: string): string {
    if (!expiresAt) return 'Sans limite';

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expiré';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}j ${hours % 24}h restantes`;
    }
    return `${hours}h restantes`;
  }

  private generateQRCodeUrl(qrCode: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
  }

  /**
   * Valider les données de génération de tickets
   */
  validateGenerationRequest(request: TicketGenerationRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.lineId || request.lineId <= 0) {
      errors.push('Une ligne valide doit être sélectionnée');
    }

    if (!request.ticketTypeCode || request.ticketTypeCode.trim().length === 0) {
      errors.push('Un type de ticket doit être spécifié');
    }

    if (!request.quantity || request.quantity <= 0 || request.quantity > 1000) {
      errors.push('La quantité doit être entre 1 et 1000');
    }

    if (request.validityHours && (request.validityHours <= 0 || request.validityHours > 8760)) {
      errors.push('La durée de validité doit être entre 1 heure et 1 an');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exporter les tickets au format CSV
   */
  async exportTickets(filters: TicketFilters = {}): Promise<SotralTicket[]> {
    const result = await this.getAllTickets(1, 10000, filters);
    if (!result.success) {
      throw new Error('Failed to export tickets');
    }
    return result.data;
  }
}

// Instance singleton
export const ticketsService = new TicketsService();
export default ticketsService;