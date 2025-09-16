import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config';
import { normalizeErrorMessage } from '../utils/normalizeError';
import { networkManager } from '../utils/networkManager';

// Configuration de l'API
const TOKEN_KEY = Config.storageKeys.token;

class ApiClient {
  private client: AxiosInstance;
  private fallbackTried = false;
  private isInitialized = false;
  private suppressAuthReset = false; // Empêche logout auto pendant certaines opérations

  constructor() {
    // Initialisation avec une URL temporaire
    this.client = axios.create({
      baseURL: 'http://localhost:7000', // Sera remplacée par NetworkManager
      timeout: Config.apiTimeout,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
    
    // Initialiser le NetworkManager et configurer l'URL
    this.initializeWithNetworkManager();
  }

  private async initializeWithNetworkManager(): Promise<void> {
    try {
      await networkManager.init();
      const bestEndpoint = await networkManager.getCurrentEndpoint();
      
      if (bestEndpoint) {
        console.log(`[ApiClient] Configuration avec endpoint: ${bestEndpoint}`);
        this.client.defaults.baseURL = bestEndpoint;
      } else {
        console.warn('[ApiClient] Aucun endpoint disponible, utilisation de localhost par défaut');
        this.client.defaults.baseURL = this.getDefaultBaseUrl();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('[ApiClient] Erreur d\'initialisation:', error);
      this.client.defaults.baseURL = this.getDefaultBaseUrl();
      this.isInitialized = true;
    }
  }

  private getDefaultBaseUrl(): string {
    try {
      const platform = require('react-native').Platform;
      
      if (platform.OS === 'android') {
        return 'http://10.0.2.2:7000';
      } else if (platform.OS === 'ios') {
        return 'http://192.168.1.184:7000';
      } else {
        return 'http://localhost:7000';
      }
    } catch (error) {
      return 'http://localhost:7000';
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeWithNetworkManager();
    }
  }

  private async detectBestBaseUrl(): Promise<void> {
    console.log('[ApiClient] Redétection de l\'endpoint...');
    
    try {
      const bestEndpoint = await networkManager.forceRefresh();
      
      if (bestEndpoint) {
        console.log(`[ApiClient] Nouveau endpoint détecté: ${bestEndpoint}`);
        this.client.defaults.baseURL = bestEndpoint;
      } else {
        console.warn('[ApiClient] Aucun endpoint trouvé lors de la redétection');
      }
    } catch (error) {
      console.error('[ApiClient] Erreur lors de la redétection:', error);
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
          // Log warning (sanitized) to avoid dev overlay printing raw error objects
          const short = error?.message || String(error);
          if (Config.debug) {
            console.warn('❌ API Request Error:', short);
          }
        // Reject with a plain Error containing only a sanitized message so
        // UI code (toasts) doesn't get raw objects.
        return Promise.reject(new Error(String(short)));
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
        // Build a short sanitized message for logging and rejection.
        const shortData = error?.response?.data?.error || error?.response?.data?.message || undefined;
        const logPayload = {
          message: error?.message,
          status: error?.response?.status,
          error: shortData,
          url: error?.config?.url,
        };
        if (Config.debug) {
            // Avoid printing full error object (prevents in-app dev overlays showing JSON blob)
            console.warn('❌ API Response Error:', logPayload);
        }

        // Retry automatique avec détection d'URL si Network Error
        const isNetworkError = !error.response && (error.message === 'Network Error' || error.code === 'ECONNABORTED');
        if (isNetworkError && !this.fallbackTried) {
          this.fallbackTried = true;
          console.warn('[ApiClient] Network Error détecté, tentative de redétection d\'URL...');
          
          // Redétection et retry
          await this.detectBestBaseUrl();
          
          if (error.config && this.client.defaults.baseURL) {
            console.log(`[ApiClient] Retry avec ${this.client.defaults.baseURL}`);
            error.config.baseURL = this.client.defaults.baseURL;
            return this.client.request(error.config);
          }
        }

        // Retry simple pour timeouts et erreurs réseau (2 essais maximum)
        try {
          const maxRetries = 2;
          const config = error?.config;
          if (config && !config.__retryCount) config.__retryCount = 0;
          if (config && config.__retryCount < maxRetries && isNetworkError) {
            config.__retryCount += 1;
            const wait = 200 * Math.pow(2, config.__retryCount); // backoff court
            if (Config.debug) console.log(`[ApiClient] Attente ${wait}ms avant retry #${config.__retryCount}`);
            await new Promise(res => setTimeout(res, wait));
            return this.client.request(config);
          }
        } catch (retryErr) {
          console.warn('[ApiClient] Retry failed', retryErr);
        }

  if (error?.response?.status === 401) {
          // Seulement supprimer le token pour les vraies erreurs 401 (non autorisé)
          // Ne pas le faire pour les erreurs de validation (400) ou "Compte non vérifié"
          const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
          const isUnverifiedAccount = errorMessage.includes('Compte non vérifié') || 
                                     errorMessage.includes('not verified') ||
                                     errorMessage.includes('email not verified');
          
          if (!this.suppressAuthReset && !isUnverifiedAccount) {
            const stack = new Error().stack;
            console.log('[ApiClient] 401 received, removing token', { stack });
            await AsyncStorage.removeItem(TOKEN_KEY);
          } else if (Config.debug) {
            console.log('[ApiClient] 401 ignoré', { 
              suppressAuthReset: this.suppressAuthReset,
              isUnverifiedAccount,
              errorMessage 
            });
          }
        }
        
        // Special handling for unverified account errors - preserve response data
        const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
        const isUnverifiedAccount = errorMessage.includes('Compte non vérifié') || 
                                   errorMessage.includes('not verified') ||
                                   errorMessage.includes('email not verified');
        
        if (isUnverifiedAccount && error.response?.data) {
          // Create an enriched error that preserves the response data for AuthService
          const enrichedError: any = new Error('ACCOUNT_UNVERIFIED');
          enrichedError.response = {
            data: {
              ...error.response.data,
              unverified: true // Add explicit flag
            }
          };
          return Promise.reject(enrichedError);
        }
        
        // Normalize the error into a readable string for UI/toasts.
        try {
          const normalized = normalizeErrorMessage(error);
          // Protection ultra-robuste : vérifier que normalized est utilisable
          let normalizedLength = 0;
          try {
            if (normalized != null && normalized !== undefined) {
              const asString = typeof normalized === 'string' ? normalized : String(normalized);
              normalizedLength = asString.length;
            }
          } catch (lengthErr) {
            // Si même la conversion en string/length échoue, ignorer
            normalizedLength = 0;
          }
          
          if (normalizedLength > 0) {
            try {
              const safeMsg = typeof normalized === 'string' ? normalized : String(normalized);
              const err = new Error(safeMsg);
              // attacher métadonnées utiles pour le code appelant
              try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                err.status = error?.response?.status;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                err.url = error?.config?.url || error?.config?.baseURL || undefined;
              } catch (metaErr) {
                // ignore
              }
              return Promise.reject(err);
            } catch (errCreate) {
              if (Config.debug) console.warn('[ApiClient] erreur création Error normalisée', errCreate);
            }
          }
        } catch (e) {
          if (Config.debug) console.warn('[ApiClient] normalizeErrorMessage a levé', e);
        }

        // Si normalisation indisponible, construire un message explicite
        const method = error?.config?.method?.toUpperCase() || 'GET';
        const url = error?.config?.url || error?.config?.baseURL || 'unknown';
        const status = error?.response?.status || 'no-status';
        const msg = `${method} ${url} -> ${status} : ${error?.message || 'Erreur réseau / timeout'}`;
        const err = new Error(msg);
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          err.status = error?.response?.status;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          err.url = error?.config?.url || error?.config?.baseURL || undefined;
        } catch (metaErr) {
          // ignore
        }
        return Promise.reject(err);
      }
    );
  }

  // Méthodes HTTP de base
  async get<T>(url: string, config?: AxiosRequestConfig) {
    await this.ensureInitialized();
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    await this.ensureInitialized();
    const isOtpVerify = url.includes('/auth/verify-otp');
    if (isOtpVerify) this.suppressAuthReset = true;
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } finally {
      if (isOtpVerify) this.suppressAuthReset = false;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    await this.ensureInitialized();
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    await this.ensureInitialized();
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
  const stack = new Error().stack;
  console.log('[ApiClient] removeToken called', { stack });
  await AsyncStorage.removeItem(TOKEN_KEY);
  }

  // Nettoie aussi l'en-tête Authorization en mémoire (au cas où)
  clearAuthHeader() {
    try {
      console.log('[ApiClient] clearAuthHeader called');
      // supprimer la valeur par défaut d'Authorization si elle existe
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (this.client && this.client.defaults && this.client.defaults.headers) {
          // axios peut stocker des headers dans defaults.headers.common
          // on supprime la valeur si présente
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (this.client.defaults.headers.common) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete this.client.defaults.headers.common['Authorization'];
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (this.client.defaults.headers.Authorization) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete this.client.defaults.headers['Authorization'];
          }
        }
      } catch (e) {
        console.warn('[ApiClient] clearAuthHeader failed:', e);
      }
    } catch (err) {
      console.warn('[ApiClient] clearAuthHeader unexpected error:', err);
    }
  }

  // Vérification de l'état de l'API
  async healthCheck() {
    await this.ensureInitialized();
    return this.get('/health');
  }

  // Obtenir l'URL actuelle
  getCurrentBaseUrl(): string {
    return this.client.defaults.baseURL || 'unknown';
  }

  // Méthodes pour le NetworkManager
  async addEndpoint(endpoint: string): Promise<void> {
    await networkManager.addEndpoint(endpoint);
    await this.detectBestBaseUrl(); // Retest pour voir si le nouveau endpoint est meilleur
  }

  async refreshEndpoints(): Promise<void> {
    await this.detectBestBaseUrl();
  }

  async getNetworkConfig() {
    return networkManager.getConfig();
  }
}

export const apiClient = new ApiClient();
export { TOKEN_KEY };
