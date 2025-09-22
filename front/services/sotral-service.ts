// Configuration par défaut - à adapter selon l'environnement
const API_BASE_URL = 'http://localhost:7000';

// ==========================================
// TYPES POUR LE FRONTEND MOBILE
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
  category?: {
    id: number;
    name: string;
    description?: string;
  };
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
}

export interface PricingZone {
  id: number;
  name: string;
  base_price_fcfa: number;
  student_discount_percent: number;
  description?: string;
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
}

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
// CONFIGURATION API
// ==========================================

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ==========================================
// SERVICE SOTRAL POUR FRONTEND MOBILE
// ==========================================

export class SotralMobileService {
  private static client = new ApiClient(API_BASE_URL || 'http://localhost:7000');

  // Définir le token utilisateur
  static setAuthToken(token: string) {
    this.client.setToken(token);
  }

  // ==========================================
  // LIGNES ET ARRÊTS
  // ==========================================

  static async getAllLines(): Promise<{ data: SotralLine[] }> {
    return this.client.get('/sotral/lines');
  }

  static async getLineById(id: number): Promise<{ data: SotralLine }> {
    return this.client.get(`/sotral/lines/${id}`);
  }

  static async getLinesByCategory(categoryId: number): Promise<{ data: SotralLine[] }> {
    return this.client.get(`/sotral/lines/category/${categoryId}`);
  }

  static async getStopsByLine(lineId: number): Promise<{ data: SotralStop[] }> {
    return this.client.get(`/sotral/lines/${lineId}/stops`);
  }

  // ==========================================
  // TYPES DE TICKETS ET TARIFICATION
  // ==========================================

  static async getTicketTypes(): Promise<{ data: SotralTicketType[] }> {
    return this.client.get('/sotral/ticket-types');
  }

  static async getPricingZones(): Promise<{ data: PricingZone[] }> {
    return this.client.get('/sotral/pricing-zones');
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
    return this.client.post('/sotral/calculate-price', {
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
    return this.client.post('/sotral/purchase', purchaseData);
  }

  // ==========================================
  // GESTION DES TICKETS UTILISATEUR
  // ==========================================

  static async getMyTickets(): Promise<{ data: SotralTicket[] }> {
    return this.client.get('/sotral/my-tickets');
  }

  static async getTicketByCode(ticketCode: string): Promise<{ data: SotralTicket }> {
    return this.client.get(`/sotral/ticket/${ticketCode}`);
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
    return this.client.post('/sotral/validate-ticket', validationData);
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
    return this.client.get('/sotral/health');
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