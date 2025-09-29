import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config';
import { getApiBaseUrl, testConnectivity } from '../utils/network';

// Configuration de l'API
const TOKEN_KEY = Config.storageKeys.token;

class ApiClient {
  private client: AxiosInstance;
  private fallbackTried = false;
  private detectedBaseUrl: string | null = null;

  constructor() {
    // Initialisation avec l'URL par défaut
    const initialBaseUrl = this.getBaseUrl();
    
    this.client = axios.create({
      baseURL: initialBaseUrl,
      timeout: Config.apiTimeout,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
    
    // Tenter de détecter la meilleure URL en arrière-plan
    this.detectBestBaseUrl();
  }

  private getBaseUrl(): string {
    try {
      const platform = require('react-native').Platform;
      
      if (platform.OS === 'android') {
        return 'https://go-j2rr.onrender.com';
      } else if (platform.OS === 'ios') {
        return 'https://go-j2rr.onrender.com';
      } else {
        return 'https://go-j2rr.onrender.com';
      }
    } catch (error) {
      return 'https://go-j2rr.onrender.com';
    }
  }

  private async detectBestBaseUrl(): Promise<void> {
    if (this.detectedBaseUrl) return;

    const candidateUrls = [
      'https://go-j2rr.onrender.com', // Production Render (priorité 1)
      'http://192.168.1.184:7000', // IP réseau local (fallback)
      'http://10.0.2.2:7000',      // Android emulator (fallback)
      'http://127.0.0.1:7000',     // iOS simulator fallback
      'http://localhost:7000',      // Web/fallback
    ];

    console.log('[ApiClient] Détection de la meilleure URL...');

    for (const url of candidateUrls) {
      try {
        const isAvailable = await testConnectivity(url);
        if (isAvailable) {
          console.log(`[ApiClient] URL détectée: ${url}`);
          this.detectedBaseUrl = url;
          
          // Mettre à jour la base URL si elle est différente
          if (this.client.defaults.baseURL !== url) {
            console.log(`[ApiClient] Mise à jour baseURL: ${this.client.defaults.baseURL} -> ${url}`);
            this.client.defaults.baseURL = url;
          }
          break;
        }
      } catch (error) {
        console.log(`[ApiClient] ${url} non disponible`);
      }
    }

    if (!this.detectedBaseUrl) {
      console.warn('[ApiClient] Aucune URL détectée, utilisation de l\'URL par défaut');
    }
  }

  private setupInterceptors(): void {
    // Intercepteur pour ajouter le token aux requêtes
    this.client.interceptors.request.use(
      async (config) => {
        if (Config.debug) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL || this.client.defaults.baseURL,
            fullURL: `${(config.baseURL || this.client.defaults.baseURL) ?? ''}${config.url}`,
          });
        }
        
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        if (Config.debug) {
          console.error('❌ API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs de réponse
    this.client.interceptors.response.use(
      (response) => {
        if (Config.debug) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            baseURL: response.config.baseURL,
          });
        }
        return response;
      },
      async (error) => {
        if (Config.debug) {
          console.error('❌ API Response Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            baseURL: error.config?.baseURL || this.client.defaults.baseURL,
          });
        }

        // Retry automatique avec détection d'URL si Network Error
        if (!error.response && error.message === 'Network Error' && !this.fallbackTried) {
          this.fallbackTried = true;
          console.warn('[ApiClient] Network Error détecté, tentative de redétection d\'URL...');
          
          // Reset la détection et retry
          this.detectedBaseUrl = null;
          await this.detectBestBaseUrl();
          
          if (this.detectedBaseUrl && error.config) {
            console.log(`[ApiClient] Retry avec ${this.detectedBaseUrl}`);
            error.config.baseURL = this.detectedBaseUrl;
            return this.client.request(error.config);
          }
        }

        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
        return Promise.reject(error);
      }
    );
  }

  // Méthodes HTTP de base
  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Gestion du token
  async setToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  async removeToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  // Vérification de l'état de l'API
  async healthCheck() {
    return this.get('/health');
  }

  // Obtenir l'URL actuelle
  getCurrentBaseUrl(): string {
    return this.detectedBaseUrl || this.client.defaults.baseURL || 'unknown';
  }
}

export const apiClient = new ApiClient();
export { TOKEN_KEY };
