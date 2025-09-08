import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResponse } from '../types/api';

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  rides: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  external_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export class ProductService {
  static async getAllProducts(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<ApiResponse<Product[]>>('/admin/products');
  }

  static async createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Product>> {
    return apiClient.post<ApiResponse<Product>>('/admin/products', data);
  }

  static async updateProduct(id: number, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
  }

  static async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/admin/products/${id}`);
  }
}

export class AdminPaymentService {
  static async getAllPayments(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<Payment>>(url);
  }

  static async getPaymentStats(): Promise<ApiResponse<{
    total_payments: number;
    completed_payments: number;
    pending_payments: number;
    failed_payments: number;
    total_amount: number;
    amount_month: number;
  }>> {
    return apiClient.get<ApiResponse<any>>('/admin/payments/stats');
  }
}
