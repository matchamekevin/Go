import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface RouteData {
  id?: number;
  code: string;
  name: string;
  departure: string;
  arrival: string;
  price_category: 'T100' | 'T150' | 'T200' | 'T250' | 'T300';
  distance_km: number;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export class RouteService {
  static async getAllRoutes(): Promise<ApiResponse<RouteData[]>> {
    return apiClient.get<ApiResponse<RouteData[]>>('/admin/routes');
  }

  static async createRoute(data: Omit<RouteData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<RouteData>> {
    return apiClient.post<ApiResponse<RouteData>>('/admin/routes', data);
  }

  static async updateRoute(id: number, data: Partial<RouteData>): Promise<ApiResponse<RouteData>> {
    return apiClient.put<ApiResponse<RouteData>>(`/admin/routes/${id}`, data);
  }

  static async deleteRoute(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/admin/routes/${id}`);
  }

  static async getRouteStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
  }>> {
    return apiClient.get<ApiResponse<any>>('/admin/routes/stats');
  }
}
