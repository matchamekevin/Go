// Types pour l'API GoSOTRAL Backend

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TicketProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  rides: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  start_point: string;
  end_point: string;
  distance_km?: number;
  duration_minutes?: number;
  price_category: 'T100' | 'T150' | 'T200' | 'T250' | 'T300';
  is_active: boolean;
  stops?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Ticket {
  id?: string;
  user_id?: number;
  product_code: string;
  route_code?: string;
  code?: string;
  status: 'unused' | 'used' | 'expired';
  purchased_at?: string;
  used_at?: string;
  purchase_method?: 'mobile_money' | 'cash' | 'card' | 'ussd';
  metadata?: Record<string, any>;
  // Jointures depuis le backend
  product_name?: string;
  product_price?: number;
  product_rides?: number;
  route_name?: string;
  route_start_point?: string;
  route_end_point?: string;
}

export interface TicketPurchase {
  product_code: string;
  route_code?: string;
  quantity: number;
  purchase_method: 'mobile_money' | 'cash' | 'card' | 'ussd';
  payment_details?: Record<string, any>;
}

export interface TicketValidation {
  ticket_code: string;
}

export interface PaymentWebhook {
  external_id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  ticket_purchase: TicketPurchase;
  signature?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}
