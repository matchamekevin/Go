import { apiClient } from './apiClient';
import { User, ApiResponse, PaginatedResponse } from '../types/api';

export class UserService {
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<User>>(url);
  }

  static async getUserById(id: number): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  }

  static async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
  }

  static async toggleUserStatus(id: number): Promise<ApiResponse<User>> {
    return apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-status`);
  }

  static async toggleUserSuspension(id: number): Promise<ApiResponse<User>> {
    // Workaround temporaire : utiliser la route de changement de statut comme fallback
    try {
      return await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-suspension`);
    } catch (error: any) {
      // Si la route principale échoue (404), utiliser la route de toggle status comme fallback temporaire
      if (error.response?.status === 404) {
        console.warn('Route toggle-suspension non trouvée, utilisation de toggle-status comme fallback');
        return await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-status`);
      }
      throw error;
    }
  }

  static async getSuspendedUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<ApiResponse<User[]>>('/admin/users/suspended');
  }

  static async createUser(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>('/admin/users', data);
  }
}
