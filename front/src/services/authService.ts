/**
 * ✅ SERVICE D'AUTHENTIFICATION - NOUVELLE INTÉGRATION
 * Basé sur les endpoints backend réels: /api/auth
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.client';

export interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  is_verified: boolean;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export type LoginRequest = LoginData;
export type RegisterRequest = RegisterData;
export type AuthResponse = AuthResult;

class AuthService {
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const response = await apiClient.register(data);
      
      if (response.success && response.token) {
        await apiClient.setToken(response.token);
        if (response.user) {
          await apiClient.setUser(response.user);
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur inscription',
      };
    }
  }

  async login(data: LoginData): Promise<AuthResult> {
    try {
      const response = await apiClient.login(data);
      console.log('REPONSE LOGIN µµµµµµµ :', response);
      if (response.success && response.data.token) {
        console.log('Token reçu lors du login:', response.data.token);
        await apiClient.setToken(response.data.token);
        // Ajout explicite : stocker le token dans AsyncStorage pour le paiement
        await AsyncStorage.setItem('auth_token', response.data.token);
        const goToken = await AsyncStorage.getItem('auth_token');
        console.log('TOKEN TOKEN TOKEN:', goToken);
        if (response.user) {
          await apiClient.setUser(response.user);
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur connexion',
      };
    }
  }

  async loginWithPhone(phone: string, password: string): Promise<AuthResult> {
    const normalizedPhone = this.normalizeTogoPhone(phone);
    return this.login({ phone: normalizedPhone, password });
  }

  async verifyEmail(email: string, otp: string): Promise<AuthResult> {
    try {
      return await apiClient.verifyEmail(email, otp);
    } catch (error: any) {
      return { success: false, message: error.message || 'Erreur vérification' };
    }
  }

  async resendOTP(email: string): Promise<AuthResult> {
    try {
      return await apiClient.resendOTP(email);
    } catch (error: any) {
      return { success: false, message: error.message || 'Erreur renvoi OTP' };
    }
  }

  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      return await apiClient.forgotPassword(email);
    } catch (error: any) {
      return { success: false, message: error.message || 'Erreur' };
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResult> {
    try {
      return await apiClient.resetPassword(email, otp, newPassword);
    } catch (error: any) {
      return { success: false, message: error.message || 'Erreur réinitialisation' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.user) {
        await apiClient.setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    await apiClient.clearAuth();
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await apiClient.getUser();
    return user !== null;
  }

  async getStoredUser(): Promise<User | null> {
    return await apiClient.getUser();
  }

  private normalizeTogoPhone(phone: string): string {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    if (normalized.startsWith('00228')) {
      normalized = '+228' + normalized.substring(5);
    } else if (normalized.startsWith('228') && !normalized.startsWith('+')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+') && normalized.length === 8) {
      normalized = '+228' + normalized;
    }
    
    return normalized;
  }

  validateTogoPhone(phone: string): boolean {
    const normalized = this.normalizeTogoPhone(phone);
    return /^\+228\d{8}$/.test(normalized);
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static async login(credentials: LoginData): Promise<AuthResult> {
    return authService.login(credentials);
  }

  static async register(userData: RegisterData): Promise<AuthResult> {
    return authService.register(userData);
  }

  static async logout(): Promise<void> {
    return authService.logout();
  }

  static async isAuthenticated(): Promise<boolean> {
    return authService.isAuthenticated();
  }

  static async getProfile(): Promise<User | null> {
    return authService.getCurrentUser();
  }

  static async verifyOTP(email: string, otp: string): Promise<void> {
    const result = await authService.verifyEmail(email, otp);
    if (!result.success) {
      throw new Error(result.message || 'Erreur vérification');
    }
  }

  static async resendOTP(email: string): Promise<void> {
    const result = await authService.resendOTP(email);
    if (!result.success) {
      throw new Error(result.message || 'Erreur renvoi');
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const result = await authService.forgotPassword(email);
    if (!result.success) {
      throw new Error(result.message || 'Erreur');
    }
  }

  static async resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<void> {
    const result = await authService.resetPassword(email, otp, newPassword);
    if (!result.success) {
      throw new Error(result.message || 'Erreur réinitialisation');
    }
  }
}

const authService = new AuthService();

export default authService;
export { AuthService };
