import { apiClient } from './apiClient';
import { Payment, ApiResponse, PaginatedResponse } from '../types/api';

export class PaymentService {
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: number;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const url = `/payment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<Payment>>(url);
  }

  static async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.get<ApiResponse<Payment>>(`/payment/${id}`);
  }

  static async getReceiptByExternalId(externalId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<ApiResponse<Payment>>(`/payment/receipts/${externalId}`);
  }

  static async refundPayment(id: number, reason?: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<ApiResponse<Payment>>(`/payment/${id}/refund`, { reason });
  }

  static async getPaymentStats(): Promise<ApiResponse<{
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averageTransactionValue: number;
    revenueGrowth: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  }>> {
    return apiClient.get<ApiResponse<any>>('/payment/stats');
  }

  static async getDailyRevenue(days: number = 30): Promise<ApiResponse<Array<{ date: string; revenue: number }>>> {
    return apiClient.get<ApiResponse<any>>(`/payment/revenue/daily?days=${days}`);
  }
}
