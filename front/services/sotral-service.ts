import { apiClient } from '../src/services/apiClient';
import type { SotralLine, SotralStop, SotralTicketType, PricingZone, SotralTicket } from '../src/types/api';

export interface TicketPurchaseRequest {
  ticket_type_code: string;
  line_id?: number;
  stop_from_id?: number;
  stop_to_id?: number;
  quantity?: number;
  payment_method: 'mobile_money' | 'card' | 'cash' | 'ussd';
  payment_details?: {
    phone?: string;
    operator?: string;
    reference?: string;
  };
}

export interface TicketValidationRequest {
  ticket_code: string;
  line_id?: number;
  stop_id?: number;
  validator_device_id?: string;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  ticket?: {
    ticket_code: string;
    line_name?: string;
    trips_remaining: number;
    status: string;
  };
  validation?: {
    validated_at: string;
    location?: string;
  };
}

// ==========================================
// SERVICE SOTRAL POUR FRONTEND MOBILE
// ==========================================

export class SotralMobileService {
  // ==========================================
  // LIGNES ET ARRÊTS
  // ==========================================

  /**
   * Récupérer toutes les lignes avec les tickets générés associés
   */
  static async getAllLines(): Promise<{ data: SotralLine[] }> {
    return apiClient.get('/sotral/lines');
  }

  static async getLineById(id: number): Promise<{ data: SotralLine }> {
    return apiClient.get(`/sotral/lines/${id}`);
  }

  static async getLinesByCategory(categoryId: number): Promise<{ data: SotralLine[] }> {
    return apiClient.get(`/sotral/lines/category/${categoryId}`);
  }

  static async getStopsByLine(lineId: number): Promise<{ data: SotralStop[] }> {
    return apiClient.get(`/sotral/lines/${lineId}/stops`);
  }

  // ==========================================
  // TYPES DE TICKETS ET TARIFICATION
  // ==========================================

  static async getTicketTypes(): Promise<{ data: SotralTicketType[] }> {
    return apiClient.get('/sotral/ticket-types');
  }

  static async getPricingZones(): Promise<{ data: PricingZone[] }> {
    return apiClient.get('/sotral/pricing-zones');
  }

  static async calculatePrice(params: {
    lineId: number;
    stopFromId?: number;
    stopToId?: number;
    isStudent?: boolean;
  }): Promise<{
    data: {
      distance_km: number;
      base_price_fcfa: number;
      is_student_discount: boolean;
      final_price_fcfa: number;
      zone_name: string;
    }
  }> {
    return apiClient.post('/sotral/calculate-price', {
      lineId: params.lineId,
      stopFromId: params.stopFromId,
      stopToId: params.stopToId,
      isStudent: params.isStudent || false
    });
  }

  // ==========================================
  // ACHAT DE TICKETS
  // ==========================================

  static async purchaseTicket(purchaseData: TicketPurchaseRequest): Promise<{
    success: boolean;
    data: SotralTicket;
    message?: string;
  }> {
    return apiClient.post('/sotral/purchase', purchaseData);
  }

  // ==========================================
  // GESTION DES TICKETS UTILISATEUR
  // ==========================================

  static async getMyTickets(): Promise<{ data: SotralTicket[] }> {
    return apiClient.get('/sotral/my-tickets');
  }

  /**
   * Récupérer les tickets générés par l'admin (publics)
   */
  static async getGeneratedTickets(options: {
    lineId?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      ticket_code: string;
      qr_code: string;
      line_id?: number;
      line_name?: string;
      price_paid_fcfa: number;
      status: string;
      expires_at?: string;
      trips_remaining: number;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    count: number;
  }> {
    const params = new URLSearchParams();
    if (options.lineId) params.append('lineId', options.lineId.toString());
    if (options.status) params.append('status', options.status);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const endpoint = `/sotral/generated-tickets${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(endpoint);
  }

  static async getTicketByCode(ticketCode: string): Promise<{ data: SotralTicket }> {
    return apiClient.get(`/sotral/ticket/${ticketCode}`);
  }

  // ==========================================
  // ANNULATION DE TICKETS UTILISATEUR
  // ==========================================

  static async cancelUserTicket(ticketId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    return apiClient.delete(`/sotral/my-tickets/${ticketId}`);
  }

  // ==========================================
  // VALIDATION DE TICKETS (POUR SCANNER)
  // ==========================================

  static async validateTicket(validationData: TicketValidationRequest): Promise<{
    success: boolean;
    ticket?: SotralTicket;
    message?: string;
    error?: string;
  }> {
    return apiClient.post('/sotral/validate-ticket', validationData);
  }

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  static async healthCheck(): Promise<{
    success: boolean;
    service: string;
    status: string;
    timestamp: string;
    data?: any;
    error?: string;
  }> {
    return apiClient.get('/sotral/health');
  }

  // ==========================================
  // UTILITAIRES FRONTEND
  // ==========================================

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  }

  static getTicketStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Actif',
      used: 'Utilisé',
      expired: 'Expiré',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }

  static getTicketStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#10B981', // Green
      used: '#6B7280',   // Gray
      expired: '#EF4444', // Red
      cancelled: '#F59E0B' // Orange
    };
    return colors[status] || '#6B7280';
  }

  static getPaymentMethodLabel(method?: string): string {
    const labels: Record<string, string> = {
      mobile_money: 'Mobile Money',
      card: 'Carte bancaire',
      cash: 'Espèces',
      ussd: 'USSD'
    };
    return method ? labels[method] || method : 'Non spécifié';
  }

  static isTicketExpired(expiresAt?: string): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  static getTimeUntilExpiry(expiresAt?: string): string | null {
    if (!expiresAt) return null;

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expiré';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }

    return `${hours}h ${minutes}min`;
  }

  static generateQRCodeUrl(qrCode: string): string {
    // Utilise un service de génération de QR codes
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
  }
}

export default SotralMobileService;
