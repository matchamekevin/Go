// ==========================================
// TYPES SOTRAL - API BACKEND
// ==========================================

export interface SotralLine {
  id: number;
  line_number: number;
  name: string;
  route_from: string;
  route_to: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  distance_km?: number;
  stops_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SotralStop {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SotralTicketType {
  id: number;
  code: string;
  name: string;
  description?: string;
  base_price_fcfa: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SotralTicket {
  id: number;
  ticket_code: string;
  qr_code: string;
  user_id?: number;
  line_id?: number;
  line_name?: string;
  ticket_type_code: string;
  price_paid_fcfa: number;
  payment_method?: 'mobile_money' | 'card' | 'cash' | 'ussd' | 'admin_generated';
  status: 'active' | 'used' | 'expired' | 'cancelled';
  trips_remaining: number;
  expires_at?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// TYPES DE STATISTIQUES
// ==========================================

export interface AdminStats {
  general: {
    total_tickets_sold: number;
    total_revenue_fcfa: number;
    active_tickets: number;
    lines_count: number;
    active_lines_count: number;
  };
  sales: {
    tickets_sold_today: number;
    revenue_today_fcfa: number;
    tickets_sold_this_week: number;
    revenue_this_week_fcfa: number;
    tickets_sold_this_month: number;
    revenue_this_month_fcfa: number;
  };
  top_lines: Array<{
    line_id: number;
    line_name: string;
    tickets_sold: number;
    revenue_fcfa: number;
  }>;
  ticket_status_distribution: {
    active: number;
    used: number;
    expired: number;
    cancelled: number;
  };
  daily_sales: Array<{
    date: string;
    tickets_sold: number;
    revenue_fcfa: number;
  }>;
}

// ==========================================
// TYPES DE REQUÊTES
// ==========================================

export interface CreateLineRequest {
  line_number: number;
  name: string;
  route_from: string;
  route_to: string;
  category_id: number;
  distance_km?: number;
  stops_count?: number;
  is_active?: boolean;
}

export interface UpdateLineRequest extends Partial<CreateLineRequest> {}

export interface TicketFilters {
  status?: string;
  lineId?: number;
  userId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  ticketType?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ==========================================
// TYPES DE GÉNÉRATION DE TICKETS
// ==========================================

export interface TicketGenerationRequest {
  lineId: number;
  ticketTypeCode: string;
  quantity: number;
  validityHours?: number;
}

export interface BulkTicketGenerationRequest {
  ticketTypeCode?: string;
  quantityPerLine?: number;
  validityHours?: number;
  selectedLineIds?: number[];
}

export interface TicketGenerationResult {
  line_id: number;
  line_name: string;
  tickets_generated: number;
  success: boolean;
  error?: string;
}

// ==========================================
// TYPES D'ERREURS
// ==========================================

export interface ApiError {
  type: 'auth' | 'validation' | 'server' | 'network' | 'not_found';
  message: string;
  details?: string;
  suggestion?: string;
}

// ==========================================
// TYPES D'ÉTAT UI
// ==========================================

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}

export interface TableState {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  pagination: PaginationParams;
}

export type ViewMode = 'list' | 'grid' | 'cards';