/**
 * ✅ CLIENT API SCAN - NOUVELLE INTÉGRATION
 * Basé sur les endpoints backend: /api/tickets/validate & /api/sotral
 * Pour l'application de scan des contrôleurs
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.78:5000/api'
  : 'https://api.gosotral.tg/api';

const TOKEN_KEY = 'scanner_auth_token';
const USER_KEY = 'scanner_auth_user';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

class ScannerApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        console.log(`📤 SCAN: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ SCAN Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ SCAN: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const status = error.response?.status;
        console.error(`❌ SCAN: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`);
        
        if (status === 401) {
          await this.clearAuth();
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erreur chargement token:', error);
    }
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async setUser(user: any) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  async clearAuth() {
    this.token = null;
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  private handleError(error: AxiosError): ApiResponse {
    if (error.response) {
      const data = error.response.data as any;
      return {
        success: false,
        message: data?.message || 'Erreur serveur',
        status: error.response.status,
        ...data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Impossible de contacter le serveur',
      };
    } else {
      return {
        success: false,
        message: error.message || 'Erreur inconnue',
      };
    }
  }

  // ==================== AUTH ROUTES ====================

  /**
   * POST /auth/login
   * Connexion du contrôleur
   */
  async login(data: {
    email?: string;
    phone?: string;
    password: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  /**
   * GET /auth/me
   * Récupérer l'utilisateur connecté
   */
  async getCurrentUser(): Promise<ApiResponse> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // ==================== TICKET VALIDATION ROUTES ====================

  /**
   * POST /tickets/validate
   * Valider un ticket (ENDPOINT PRINCIPAL)
   * Backend: POST /tickets/validate
   * Body: { qr_code: string }
   */
  async validateTicket(qrCode: string): Promise<ApiResponse> {
    const response = await this.client.post('/tickets/validate', {
      qr_code: qrCode,
    });
    return response.data;
  }

  // ==================== SOTRAL VALIDATION ROUTES ====================

  /**
   * POST /sotral/validate-ticket
   * Alternative: Validation via SOTRAL (si existant)
   */
  async validateTicketSOTRAL(qrCode: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/sotral/validate-ticket', {
        qr_code: qrCode,
      });
      return response.data;
    } catch (error: any) {
      // Si la route n'existe pas, utiliser /tickets/validate
      return this.validateTicket(qrCode);
    }
  }

  // ==================== SCAN HISTORY ====================

  /**
   * GET /tickets/validation-history (si existant)
   * Historique des validations du contrôleur
   */
  async getValidationHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/tickets/validation-history', { params });
      return response.data;
    } catch (error) {
      console.warn('Endpoint validation-history non disponible');
      return { success: false, validations: [] };
    }
  }

  // ==================== STATS ====================

  /**
   * GET /tickets/validation-stats (si existant)
   * Statistiques de validation
   */
  async getValidationStats(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/tickets/validation-stats');
      return response.data;
    } catch (error) {
      console.warn('Endpoint validation-stats non disponible');
      return { success: false, stats: { today: 0, total: 0 } };
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * GET /health
   * Vérifier l'état du serveur
   */
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.client.get('/health', {
      baseURL: API_BASE_URL.replace('/api', ''),
    });
    return response.data;
  }
}

// Instance singleton
const scannerApiClient = new ScannerApiClient();

export default scannerApiClient;
export { ScannerApiClient, API_BASE_URL };
