import { apiClient } from './apiClient';
import { Ticket, TicketProduct, Route, ApiResponse, PaginatedResponse } from '../types/api';

export class TicketService {
  // Produits de tickets
  static async getProducts(): Promise<ApiResponse<TicketProduct[]>> {
    return apiClient.get<ApiResponse<TicketProduct[]>>('/tickets/products');
  }

  static async createProduct(data: Omit<TicketProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<TicketProduct>> {
    return apiClient.post<ApiResponse<TicketProduct>>('/admin/tickets/products', data);
  }

  static async updateProduct(id: number, data: Partial<TicketProduct>): Promise<ApiResponse<TicketProduct>> {
    return apiClient.put<ApiResponse<TicketProduct>>(`/admin/tickets/products/${id}`, data);
  }

  static async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/admin/tickets/products/${id}`);
  }

  // Routes
  static async getRoutes(): Promise<ApiResponse<Route[]>> {
    return apiClient.get<ApiResponse<Route[]>>('/tickets/routes');
  }

  static async getRoutesByCategory(category: string): Promise<ApiResponse<Route[]>> {
    return apiClient.get<ApiResponse<Route[]>>(`/tickets/routes/category/${category}`);
  }

  static async createRoute(data: Omit<Route, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Route>> {
    return apiClient.post<ApiResponse<Route>>('/admin/tickets/routes', data);
  }

  static async updateRoute(id: number, data: Partial<Route>): Promise<ApiResponse<Route>> {
    return apiClient.put<ApiResponse<Route>>(`/admin/tickets/routes/${id}`, data);
  }

  static async deleteRoute(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/admin/tickets/routes/${id}`);
  }

  // Tickets
  static async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: number;
    product_code?: string;
  }): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.product_code) queryParams.append('product_code', params.product_code);

  // Le backend expose les routes admin tickets sous /admin/tickets/tickets
  const url = `/admin/tickets/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<Ticket>>(url);
  }

  static async getTicketByCode(code: string): Promise<ApiResponse<Ticket>> {
    return apiClient.get<ApiResponse<Ticket>>(`/tickets/code/${code}`);
  }

  static async getUserTickets(userId: number): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}`);
  }

  static async updateTicketStatus(id: number, status: string): Promise<ApiResponse<Ticket>> {
    return apiClient.patch<ApiResponse<Ticket>>(`/admin/tickets/tickets/${id}/status`, { status });
  }

  static async getTicketQRCode(code: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'}/tickets/${code}/qrcode`);
    return response.blob();
  }

  static async getTicketStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    used: number;
    expired: number;
    cancelled: number;
    recentSales: number;
  }>> {
    return apiClient.get<ApiResponse<any>>('/tickets/stats');
  }
}
