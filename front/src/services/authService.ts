import { apiClient } from './apiClient';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api';

export class AuthService {
  // Connexion utilisateur
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      
      // Le backend retourne toujours { success: boolean, data?: T, error?: string }
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erreur lors de la connexion');
      }
      
      const authData = response.data;
      // Sauvegarder le token
      await apiClient.setToken(authData.token);
      return authData;
    } catch (error: any) {
      // Si c'est une erreur réseau ou autre, la transformer
      if (error.message === 'Network Error') {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      }
      throw error;
    }
  }

  // Inscription utilisateur
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de l\'inscription');
    }
    
    const authData = response.data!;
    // Sauvegarder le token
    await apiClient.setToken(authData.token);
    return authData;
  }

  // Déconnexion
  static async logout(): Promise<void> {
    await apiClient.removeToken();
  }

  // Vérifier si l'utilisateur est connecté
  static async isAuthenticated(): Promise<boolean> {
    const token = await apiClient.getToken();
    return !!token;
  }

  // Récupérer le profil utilisateur
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération du profil');
    }
    return response.data!;
  }

  // Actualiser le token
  static async refreshToken(): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors du rafraîchissement du token');
    }
    
    const newToken = response.data!.token;
    await apiClient.setToken(newToken);
    return newToken;
  }

  // Réinitialisation du mot de passe (demande)
  static async requestPasswordReset(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/password-reset/request', { email });
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la demande de réinitialisation');
    }
  }

  // Réinitialisation du mot de passe (confirmation)
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/password-reset/confirm', {
      token,
      password: newPassword
    });
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }

  // Vérification OTP pour inscription
  static async verifyOTP(email: string, otp: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/verify-otp', { email, otp });
    if (!response.success) {
      throw new Error(response.error || 'Code de vérification invalide');
    }
  }

  // Renvoyer le code OTP
  static async resendOTP(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/resend-otp', { email });
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors du renvoi du code');
    }
  }

  // Mot de passe oublié
  static async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la demande de réinitialisation');
    }
  }

  // Vérifier OTP pour réinitialisation
  static async verifyResetOTP(email: string, otp: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/verify-reset-otp', { email, otp });
    if (!response.success) {
      throw new Error(response.error || 'Code de vérification invalide');
    }
  }

  // Réinitialiser mot de passe avec OTP
  static async resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', { 
      email, 
      otp, 
      newPassword 
    });
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }
}
