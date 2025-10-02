import { apiClient } from './apiClient';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api';

export class AuthService {
  // Connexion utilisateur
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      
      // Le backend retourne toujours { success: boolean, data?: T, error?: string }
      if (!response.success || !response.data) {
        // Mapping supplémentaire si possible
        const raw = response.error || '';
        const lower = raw.toLowerCase();
        if (lower.includes('utilisateur introuvable') || lower.includes('user not found')) {
          throw new Error('USER_NOT_FOUND');
        }
        if (lower.includes('mot de passe') || lower.includes('invalid credentials') || lower.includes('incorrect')) {
          throw new Error('INVALID_CREDENTIALS');
        }
        if (lower.includes('compte non vérifié') || lower.includes('not verified')) {
          throw new Error('ACCOUNT_NOT_VERIFIED');
        }
        throw new Error(raw || 'Erreur lors de la connexion');
      }
      
      const authData = response.data;
      // Sauvegarder le token
      await apiClient.setToken(authData.token);
      return authData;
    } catch (error: any) {
      // Handle enriched error from apiClient for unverified accounts
      if (error?.message === 'ACCOUNT_UNVERIFIED' && error?.response?.data) {
        const err: any = new Error('ACCOUNT_UNVERIFIED');
        err.response = { data: { email: error.response.data.email } };
        throw err;
      }
      
      // Si le backend a renvoyé un flag indiquant que le compte n'est pas vérifié,
      // on enrichit l'erreur pour que le front puisse rediriger facilement.
      // Note: l'intercepteur `apiClient` peut normaliser l'erreur en une simple Error
      // sans propriété `response`, donc vérifier aussi le texte de l'erreur.
      const rawMsg = (error?.response?.data?.error || error?.response?.data?.message || error?.message || String(error || '')).toString();
      const low = rawMsg.toLowerCase();
      const looksUnverified = low.includes('compte non vérifié') || low.includes('not verified') || low.includes('unverified') || low.includes('email not verified');
      if ((error?.response && error.response.data && error.response.data.unverified) || looksUnverified) {
        const err: any = new Error('ACCOUNT_UNVERIFIED');
        // attacher l'email si disponible
        const email = error?.response?.data?.email || undefined;
        if (email) err.response = { data: { email } };
        throw err;
      }
      // Interpréter la réponse HTTP quand disponible
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        const raw = (data?.error || data?.message || '').toString();
        const lower = raw.toLowerCase();
        if (status === 400) {
          if (lower.includes('utilisateur introuvable') || lower.includes('user not found')) {
            throw new Error('USER_NOT_FOUND');
          }
          if (lower.includes('compte non vérifié') || lower.includes('not verified')) {
            throw new Error('ACCOUNT_NOT_VERIFIED');
          }
          if (lower.includes('mot de passe') || lower.includes('credentials') || lower.includes('incorrect')) {
            throw new Error('INVALID_CREDENTIALS');
          }
        }
        if (status === 401) {
          if (lower.includes('compte non vérifié') || lower.includes('not verified')) {
            throw new Error('ACCOUNT_NOT_VERIFIED');
          }
        }
      }
      // Si c'est une erreur réseau ou autre, la transformer
      if (error.message === 'Network Error') {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      }
      throw error;
    }
  }

  // Inscription utilisateur
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('[AuthService] 🔍 Starting registration with:', {
      email: userData.email,
      endpoint: apiClient.getCurrentBaseUrl(),
      networkConfig: apiClient.getNetworkConfig()
    });

    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      console.log('[AuthService] ✅ API Response received:', response);

      if (!response.success) {
        console.log('[AuthService] ❌ API returned success=false:', response.error);
        throw new Error(response.error || 'Erreur lors de l\'inscription');
      }

      console.log('[AuthService] ✅ Registration successful for:', userData.email);
      // L'inscription ne retourne pas de token directement (vérification OTP requise)
      // Donc on ne sauvegarde pas le token ici
      return response.data!;
    } catch (error: any) {
      console.log('[AuthService] ❌ Register error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.response?.status,
        fullError: error
      });

      // Gestion spécifique des erreurs d'inscription
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;

        console.log('[AuthService] 📊 Processing HTTP error:', { status, data });

        if (status === 400 && data) {
          // Vérifier différents formats de réponse d'erreur
          const errorMessage = data.error || data.message || '';
          console.log('[AuthService] 🎯 Error message extracted:', errorMessage);

          if (errorMessage.includes('Email déjà utilisé') ||
              errorMessage.includes('already exists') ||
              errorMessage.includes('already used') ||
              errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
            console.log('[AuthService] 🏷️ Transforming to: EMAIL_ALREADY_EXISTS');
            throw new Error('EMAIL_ALREADY_EXISTS');
          }
          if (errorMessage.includes('Email invalide') || errorMessage.includes('invalid email')) {
            console.log('[AuthService] 🏷️ Transforming to: INVALID_EMAIL');
            throw new Error('INVALID_EMAIL');
          }
          if (errorMessage.includes('Mot de passe') || errorMessage.includes('password')) {
            console.log('[AuthService] 🏷️ Transforming to: INVALID_PASSWORD');
            throw new Error('INVALID_PASSWORD');
          }
          // Autres erreurs 400
          console.log('[AuthService] 🏷️ Transforming to generic error:', errorMessage);
          throw new Error(errorMessage || 'Erreur de validation');
        }

        if (status === 409) {
          console.log('[AuthService] 🏷️ Transforming 409 to: EMAIL_ALREADY_EXISTS');
          throw new Error('EMAIL_ALREADY_EXISTS');
        }
      }

      // Si l'erreur vient directement de la réponse API (pas d'axios response wrapper)
      if (error?.data?.error) {
        const errorMessage = error.data.error;
        console.log('[AuthService] 📦 Direct API error:', errorMessage);
        if (errorMessage.includes('Email déjà utilisé') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('already used')) {
          console.log('[AuthService] 🏷️ Transforming direct error to: EMAIL_ALREADY_EXISTS');
          throw new Error('EMAIL_ALREADY_EXISTS');
        }
      }

      // Erreur réseau
      if (error.message === 'Network Error') {
        console.log('[AuthService] 🌐 Network error detected');
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      }

      console.log('[AuthService] 💥 Throwing unhandled error:', error.message);
      throw error;
    }
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
    try {
      const response = await apiClient.post<ApiResponse<void>>('/auth/verify-otp', { email, otp });
      if (!response.success) {
        throw new Error(response.error || 'Code de vérification invalide');
      }
    } catch (error: any) {
      // Transformation des erreurs HTTP 400 (OTP invalide) en message contrôlé
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 400) {
          const msg = (data && (data.error || data.message)) || 'OTP invalide';
          throw new Error(msg);
        }
      }
      // Erreur réseau ou autre
      if (error.message === 'Network Error') {
        throw new Error('Impossible de contacter le serveur');
      }
      throw error;
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
    const response = await apiClient.post<any>('/auth/forgot-password', { email });
    // Support legacy shape (no success) or standard ApiResponse
    if (response && typeof response.success === 'boolean') {
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la demande de réinitialisation');
      }
    } else if (response && response.error) {
      throw new Error(response.error || 'Erreur lors de la demande de réinitialisation');
    }
  }

  // Vérifier OTP pour réinitialisation
  static async verifyResetOTP(email: string, otp: string): Promise<void> {
    const response = await apiClient.post<any>('/auth/verify-reset-otp', { email, otp });
    if (response && typeof response.success === 'boolean') {
      if (!response.success) throw new Error(response.error || 'Code de vérification invalide');
    } else if (response && response.error) {
      throw new Error(response.error || 'Code de vérification invalide');
    }
  }

  // Réinitialiser mot de passe avec OTP
  static async resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<any>('/auth/reset-password', { 
      email, 
      otp, 
      newPassword 
    });
    if (response && typeof response.success === 'boolean') {
      if (!response.success) throw new Error(response.error || 'Erreur lors de la réinitialisation du mot de passe');
    } else if (response && response.error) {
      throw new Error(response.error || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }
}
