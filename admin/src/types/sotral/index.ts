// Types centralisés pour le système SOTRAL
export interface SotralLine {
  id: number;
  line_name: string;
  line_number: number; // Changé de string à number pour correspondre au schéma Zod
  name?: string; // Alternative name field for compatibility
  route_from?: string;
  route_to?: string;
  distance_km: number; // Changé de string à number pour correspondre au schéma Zod
  stops_count: number;
  price_range: string;
  is_active: boolean;
  category_id?: number;
  created_at: string;
  updated_at: string;
}

export interface SotralTicketType {
  id: number;
  code: string;
  name: string;
  description: string;
  price_fcfa: number;
  max_trips: number;
  is_student_discount: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SotralTicket {
  id: number;
  ticket_code: string;
  qr_code: string;
  user_id?: number;
  ticket_type_id: number;
  line_id: number;
  stop_from_id?: number;
  stop_to_id?: number;
  price_paid_fcfa: number;
  status: TicketStatus;
  expires_at: string;
  trips_remaining: number;
  purchased_at: string;
  created_at: string;
  updated_at: string;
}

export interface SotralTicketWithDetails extends SotralTicket {
  ticket_type_name: string;
  ticket_type_code: string;
  ticket_type_description: string;
  line_name: string;
  line_number: string;
  stop_from_name?: string;
  stop_to_name?: string;
}

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface TicketGenerationRequest {
  lineId: number;
  ticketTypeCode: string;
  quantity: number;
  validityHours?: number;
}

export interface BulkTicketGenerationRequest {
  requests: TicketGenerationRequest[];
}

export interface TicketGenerationResult {
  success: boolean;
  generatedTickets: SotralTicket[];
  totalGenerated: number;
  message: string;
}

export interface BulkTicketGenerationResult {
  success: boolean;
  totalGenerated: number;
  tickets: SotralTicket[];
  lineBreakdown: Array<{
    lineId: number;
    lineName: string;
    ticketType: string;
    quantity: number;
    totalPrice: number;
  }>;
  message: string;
}

export interface TicketFilters {
  status?: TicketStatus | string;
  lineId?: number;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsData {
  general: {
    total_tickets: number;
    total_revenue: number;
    active_users: number;
    period: string;
  };
  popularLines: Array<{
    line_id: number;
    line_name: string;
    tickets_count: number;
    revenue_fcfa: number;
  }>;
  dailySales: Array<{
    date: string;
    tickets_count: number;
    revenue_fcfa: number;
  }>;
  ticketTypes: Array<{
    type_name: string;
    count: number;
    revenue_fcfa: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}