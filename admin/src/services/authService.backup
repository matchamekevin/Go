import { apiClient } from './apiClient';
import { LoginRequest, LoginResponse, ApiResponse } from '../types/api';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/admin/login', credentials);
  }

  static async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  static clearStoredData(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  static async checkHealth(): Promise<ApiResponse<{ backend: string; database: string }>> {
    return apiClient.get<ApiResponse<{ backend: string; database: string }>>('/health');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  static getStoredUser() {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getStoredToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  static setAuthData(token: string, user: any): void {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  }
}
