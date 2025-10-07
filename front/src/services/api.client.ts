/**
 * Client API GoSOTRAL - Intégration complète avec le backend
 * Basé sur les routes: /api/auth, /api/tickets, /api/payments, /api/sotral
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
// Force production API même en développement pour les tests
const API_BASE_URL = 'https://go-j2rr.onrender.com';

// Configuration normale (décommenter pour dev local):
// const API_BASE_URL = __DEV__ 
//   ? 'http://192.168.1.78:7000'
//   : 'https://go-j2rr.onrender.com';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
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
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();
        
        // Log différent selon le type d'erreur
        if (error.response) {
          // Erreur du serveur (4xx, 5xx)
          console.error(`❌ ${method} ${url} - ${status}`);
        } else if (error.request) {
          // Pas de réponse du serveur (réseau, timeout)
          console.error(`❌ ${method} ${url} - Erreur réseau (pas de réponse)`);
        } else {
          // Erreur lors de la configuration de la requête
          console.error(`❌ ${method} ${url} - Erreur configuration:`, error.message);
        }
        
        // Si 401, déconnecter l'utilisateur
        if (status === 401 && !url?.includes('/auth/login')) {
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

  async getToken(): Promise<string | null> {
    return this.token || await AsyncStorage.getItem(TOKEN_KEY);
  }

  async removeToken() {
    await this.clearAuth();
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

  // Méthode pour compatibilité avec l'ancien apiClient
  clearAuthHeader() {
    this.token = null;
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
   * POST /auth/register
   * Inscription avec email/phone + mot de passe
   */
  async register(data: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  /**
   * POST /auth/login
   * Connexion avec email ou phone + mot de passe
   */
  async login(data: {
    email?: string;
    phone?: string;
    password: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', data);
    const resData = response.data;
    // Stocker le token si présent
    if (resData.success && resData.token) {
      await this.setToken(resData.token);
    }
    return resData;
  }

  /**
   * POST /auth/verify-email
   * Vérification OTP email
   */
  async verifyEmail(email: string, otp: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/verify-email', { email, otp });
    return response.data;
  }

  /**
   * POST /auth/resend-otp
   * Renvoyer l'OTP de vérification
   */
  async resendOTP(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/resend-otp', { email });
    return response.data;
  }

  /**
   * POST /auth/forgot-password
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  /**
   * POST /auth/reset-password
   * Réinitialiser le mot de passe avec OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
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

  // ==================== TICKETS ROUTES ====================

  /**
   * GET /tickets
   * Récupérer les tickets de l'utilisateur
   */
  async getMyTickets(params?: {
    status?: 'active' | 'used' | 'expired';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> {
    const response = await this.client.get('/tickets/my-tickets', { params });
    return response.data;
  }

  /**
   * GET /tickets/:ticketId
   * Récupérer un ticket spécifique
   */
  async getTicketById(ticketId: number): Promise<ApiResponse> {
    const response = await this.client.get(`/tickets/${ticketId}`);
    return response.data;
  }

  /**
   * POST /tickets/:ticketId/activate
   * Activer un ticket
   */
  async activateTicket(ticketId: number): Promise<ApiResponse> {
    const response = await this.client.post(`/tickets/${ticketId}/activate`);
    return response.data;
  }

  /**
   * GET /tickets/stats
   * Statistiques des tickets de l'utilisateur
   */
  async getTicketStats(): Promise<ApiResponse> {
    const response = await this.client.get('/tickets/stats');
    return response.data;
  }

  // ==================== PAYMENTS ROUTES ====================

  /**
   * POST /payments/initiate
   * Initier un paiement mobile (TMoney/Flooz)
   */
  async initiatePayment(data: {
    ticket_type: 'single' | 'day_pass' | 'week_pass' | 'month_pass';
    payment_method: 'tmoney' | 'flooz';
    phone_number: string;
    quantity?: number;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/payments/initiate', data);
    return response.data;
  }

  /**
   * GET /payments/status/:paymentId
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(paymentId: number): Promise<ApiResponse> {
    const response = await this.client.get(`/payments/status/${paymentId}`);
    return response.data;
  }

  /**
   * GET /payments/history
   * Historique des paiements
   */
  async getPaymentHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> {
    const response = await this.client.get('/payments/history', { params });
    return response.data;
  }

  // ==================== SOTRAL ROUTES ====================

  /**
   * GET /sotral/lines
   * Récupérer toutes les lignes de bus
   */
  async getSotralLines(): Promise<ApiResponse> {
    const response = await this.client.get('/sotral/lines');
    return response.data;
  }

  /**
   * GET /sotral/lines/:lineId
   * Récupérer les détails d'une ligne
   */
  async getSotralLineById(lineId: number): Promise<ApiResponse> {
    const response = await this.client.get(`/sotral/lines/${lineId}`);
    return response.data;
  }

  /**
   * GET /sotral/stops
   * Récupérer tous les arrêts (avec recherche par proximité)
   */
  async getSotralStops(params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<ApiResponse> {
    const response = await this.client.get('/sotral/stops', { params });
    return response.data;
  }

  /**
   * GET /sotral/stops/:stopId
   * Récupérer les détails d'un arrêt
   */
  async getSotralStopById(stopId: number): Promise<ApiResponse> {
    const response = await this.client.get(`/sotral/stops/${stopId}`);
    return response.data;
  }

  /**
   * GET /sotral/route
   * Calculer un itinéraire entre deux arrêts
   */
  async calculateRoute(fromStopId: number, toStopId: number): Promise<ApiResponse> {
    const response = await this.client.get('/sotral/route', {
      params: { from_stop_id: fromStopId, to_stop_id: toStopId },
    });
    return response.data;
  }

  /**
   * GET /sotral/schedules/:lineId
   * Récupérer les horaires d'une ligne
   */
  async getLineSchedules(lineId: number, dayType?: 'weekday' | 'weekend'): Promise<ApiResponse> {
    const response = await this.client.get(`/sotral/schedules/${lineId}`, {
      params: { day_type: dayType },
    });
    return response.data;
  }

  /**
   * GET /sotral/realtime/:lineId
   * Données temps réel des véhicules d'une ligne
   */
  async getRealtimeVehicles(lineId: number): Promise<ApiResponse> {
    const response = await this.client.get(`/sotral/realtime/${lineId}`);
    return response.data;
  }

  /**
   * POST /sotral/favorite
   * Ajouter un arrêt aux favoris
   */
  async addFavoriteStop(stopId: number, alias?: string): Promise<ApiResponse> {
    const response = await this.client.post('/sotral/favorite', {
      stop_id: stopId,
      alias,
    });
    return response.data;
  }

  /**
   * GET /sotral/favorites
   * Récupérer les arrêts favoris
   */
  async getFavoriteStops(): Promise<ApiResponse> {
    const response = await this.client.get('/sotral/favorites');
    return response.data;
  }

  /**
   * DELETE /sotral/favorite/:favoriteId
   * Supprimer un arrêt des favoris
   */
  async removeFavoriteStop(favoriteId: number): Promise<ApiResponse> {
    const response = await this.client.delete(`/sotral/favorite/${favoriteId}`);
    return response.data;
  }

  // ==================== SUPPORT ROUTES ====================

  /**
   * POST /support/tickets
   * Créer un ticket de support
   */
  async createSupportTicket(data: {
    subject: string;
    category: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<ApiResponse> {
    const response = await this.client.post('/support/tickets', data);
    return response.data;
  }

  /**
   * GET /support/tickets
   * Récupérer les tickets de support
   */
  async getSupportTickets(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> {
    const response = await this.client.get('/support/tickets', { params });
    return response.data;
  }

  /**
   * GET /support/faq
   * Récupérer la FAQ
   */
  async getFAQ(category?: string): Promise<ApiResponse> {
    const response = await this.client.get('/support/faq', {
      params: { category },
    });
    return response.data;
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
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient, API_BASE_URL };
