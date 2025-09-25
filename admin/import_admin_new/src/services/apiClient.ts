import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '../types';

// ==========================================
// CONFIGURATION API CLIENT
// ==========================================

class ApiClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - ajouter le token d'auth
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - gérer les erreurs
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = this.handleApiError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private handleApiError(error: AxiosError): ApiError {
    if (!error.response) {
      return {
        type: 'network',
        message: 'Erreur de connexion',
        details: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        suggestion: 'Réessayez dans quelques instants ou contactez l\'administrateur.'
      };
    }

    const status = error.response.status;
    const data = error.response.data as any;

    switch (status) {
      case 401:
        // Supprimer le token invalide
        localStorage.removeItem('admin_token');
        return {
          type: 'auth',
          message: 'Session expirée',
          details: 'Votre session a expiré. Veuillez vous reconnecter.',
          suggestion: 'Cliquez sur "Se connecter" pour vous réauthentifier.'
        };

      case 403:
        return {
          type: 'auth',
          message: 'Accès refusé',
          details: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
          suggestion: 'Contactez votre administrateur pour obtenir les droits requis.'
        };

      case 404:
        return {
          type: 'not_found',
          message: 'Ressource non trouvée',
          details: data?.error || 'La ressource demandée n\'existe pas ou n\'est plus disponible.',
          suggestion: 'Vérifiez l\'URL ou actualisez la page.'
        };

      case 400:
        return {
          type: 'validation',
          message: 'Données invalides',
          details: data?.error || 'Les données saisies ne sont pas valides.',
          suggestion: 'Vérifiez les informations saisies et réessayez.'
        };

      case 422:
        return {
          type: 'validation',
          message: 'Erreur de validation',
          details: data?.error || 'Certaines données ne respectent pas les contraintes requises.',
          suggestion: 'Corrigez les erreurs signalées et réessayez.'
        };

      case 500:
      case 502:
      case 503:
        return {
          type: 'server',
          message: 'Erreur serveur',
          details: 'Le serveur a rencontré une erreur temporaire.',
          suggestion: 'Réessayez dans quelques instants. Si le problème persiste, contactez le support.'
        };

      default:
        return {
          type: 'server',
          message: `Erreur ${status}`,
          details: data?.error || 'Une erreur inattendue s\'est produite.',
          suggestion: 'Réessayez ou contactez le support technique.'
        };
    }
  }

  // ==========================================
  // MÉTHODES HTTP
  // ==========================================

  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url);
    return response.data;
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  setAuthToken(token: string): void {
    localStorage.setItem('admin_token', token);
  }

  clearAuthToken(): void {
    localStorage.removeItem('admin_token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  // Test de connexion
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get('/api/sotral/health');
  }
}

// Instance singleton
export const apiClient = new ApiClient();
export default apiClient;