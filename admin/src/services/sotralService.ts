import { apiClient } from './apiClient';

// ==========================================
// TYPES POUR L'ADMIN FRONTEND
// ==========================================

export interface SotralLine {
  id: number;
  line_number: number;
  name: string;
  route_from: string;
  route_to: string;
  category_id: number;
  distance_km?: number;
  stops_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface SotralTicket {
  id: number;
  ticket_code: string;
  qr_code: string;
  user_id?: number;
  ticket_type_id: number;
  line_id?: number;
  stop_from_id?: number;
  stop_to_id?: number;
  price_paid_fcfa: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchased_at: string;
  expires_at?: string;
  trips_remaining: number;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  // Relations
  ticket_type?: {
    id: number;
    name: string;
    code: string;
    description?: string;
  };
  line?: {
    id: number;
    name: string;
    line_number: number;
  };
  stop_from?: {
    id: number;
    name: string;
  };
  stop_to?: {
    id: number;
    name: string;
  };
}

export interface SotralStats {
  total_tickets_sold: number;
  total_revenue_fcfa: number;
  active_users: number;
  popular_lines: Array<{
    line_id: number;
    line_name: string;
    tickets_count: number;
    revenue_fcfa: number;
  }>;
  daily_sales: Array<{
    date: string;
    tickets_count: number;
    revenue_fcfa: number;
  }>;
  ticket_types_distribution: Array<{
    type_name: string;
    count: number;
    percentage: number;
  }>;
}

export interface SotralTicketType {
  id: number;
  name: string;
  code: string;
  description?: string;
  price_fcfa: number;
  validity_duration_hours?: number;
  max_trips: number;
  is_student_discount: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SotralStop {
  id: number;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  is_major_stop: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// SERVICE SOTRAL POUR L'ADMIN
// ==========================================

export class SotralService {
  private static readonly BASE_URL = '/admin/sotral';

  // ==========================================
  // STATISTIQUES
  // ==========================================

  static async getStats(dateFrom?: string, dateTo?: string): Promise<SotralStats> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const queryString = params.toString();
    const url = `${this.BASE_URL}/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ data: SotralStats }>(url);
    return response.data;
  }

  // ==========================================
  // GESTION DES LIGNES
  // ==========================================

  static async getAllLines(): Promise<SotralLine[]> {
    const response = await apiClient.get<{ data: SotralLine[] }>(`${this.BASE_URL}/lines`);
    return response.data;
  }

  static async getLineById(id: number): Promise<SotralLine> {
    const response = await apiClient.get<{ data: SotralLine }>(`/sotral/lines/${id}`);
    return response.data;
  }

  static async getLinesByCategory(categoryId: number): Promise<SotralLine[]> {
    const response = await apiClient.get<{ data: SotralLine[] }>(`/sotral/lines/category/${categoryId}`);
    return response.data;
  }

  // ==========================================
  // GESTION DES ARRÊTS
  // ==========================================

  static async getAllStops(): Promise<SotralStop[]> {
    const response = await apiClient.get<{ data: SotralStop[] }>(`${this.BASE_URL}/stops`);
    return response.data;
  }

  static async getStopsByLine(lineId: number): Promise<SotralStop[]> {
    const response = await apiClient.get<{ data: SotralStop[] }>(`/sotral/lines/${lineId}/stops`);
    return response.data;
  }

  // ==========================================
  // GESTION DES TYPES DE TICKETS
  // ==========================================

  static async getAllTicketTypes(): Promise<SotralTicketType[]> {
    const response = await apiClient.get<{ data: SotralTicketType[] }>(`${this.BASE_URL}/ticket-types`);
    return response.data;
  }

  // ==========================================
  // GESTION DES TICKETS
  // ==========================================

  static async deleteTicket(ticketId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/tickets/${ticketId}`);
  }

  static async getAllTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: number;
  }): Promise<{
    data: SotralTicket[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId.toString());

    const queryString = queryParams.toString();
    const url = `${this.BASE_URL}/tickets${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{
      data: SotralTicket[];
      pagination: { page: number; limit: number; total: number };
    }>(url);
    
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 50, total: 0 }
    };
  }

  static async getUserTickets(userId: number): Promise<SotralTicket[]> {
    const response = await apiClient.get<{ data: SotralTicket[] }>(`${this.BASE_URL}/users/${userId}/tickets`);
    return response.data;
  }

  // ==========================================
  // UTILITAIRES
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
      active: 'text-green-600 bg-green-100',
      used: 'text-gray-600 bg-gray-100',
      expired: 'text-red-600 bg-red-100',
      cancelled: 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
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
    const response = await apiClient.get<{
      success: boolean;
      service: string;
      status: string;
      timestamp: string;
      data?: any;
      error?: string;
    }>('/sotral/health');
    return response;
  }
}

export default SotralService;
