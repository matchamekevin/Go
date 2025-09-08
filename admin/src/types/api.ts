// Types pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
    };
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

// Types pour les tickets
export interface TicketProduct {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: number;
  route_code: string;
  name: string;
  departure: string;
  arrival: string;
  price_category: 'T100' | 'T150' | 'T200' | 'T250' | 'T300';
  distance_km?: number;
  estimated_duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  code: string;
  user_id: number;
  product_code: string;
  route_code?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchased_at: string;
  valid_until?: string;
  used_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Relations populées
  user?: User;
  product?: TicketProduct;
  route?: Route;
}

// Types pour les paiements
export interface Payment {
  id: number;
  user_id: number;
  external_payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_data?: any;
  created_at: string;
  updated_at: string;
  // Relations
  user?: User;
}

// Types de réponse API standardisés
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  activeTickets: number;
  usersGrowth: number;
  ticketsGrowth: number;
  revenueGrowth: number;
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}
