// Types pour l'API GoSOTRAL Backend

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  count?: number;
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
  name: string;
  phone: string;
}

// ==========================================
// TYPES SOTRAL SPÉCIFIQUES
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

// ==========================================
// TYPES DE PAIEMENT MOBILE
// ==========================================

export interface MobilePaymentRequest {
  ticket_id: number;
  payment_method: 'mixx' | 'flooz';
  phone_number: string;
  amount: number;
}

export interface MobilePaymentResponse {
  payment_ref: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_url?: string;
  expires_at?: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  ticket?: SotralTicket;
  transaction_details?: {
    payment_ref: string;
    amount: number;
    phone_number: string;
    payment_method: 'mixx' | 'flooz';
    processed_at?: string;
  };
}

export interface PaymentInitiationData {
  ticketId: number;
  paymentMethod: 'mixx' | 'flooz';
  phoneNumber: string;
  amount: number;
}

export interface PaymentStatus {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  ticket?: SotralTicket;
  error?: string;
}
