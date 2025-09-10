import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config';

// Configuration de l'API
const API_BASE_URL = Config.apiBaseUrl;
const TOKEN_KEY = Config.storageKeys.token;

class ApiClient {
  private client: AxiosInstance;
  private fallbackTried = false;

  constructor() {
    // Préparation de la base URL avec correction Android le cas échéant
    let baseURL = API_BASE_URL;
    try {
      const platform = require('react-native').Platform;
      if (/localhost(:\d+)?$/i.test(baseURL)) {
        if (platform.OS === 'android') {
          const adjusted = baseURL.replace('localhost', '10.0.2.2');
          console.warn('[ApiClient] Remplacement immédiat localhost -> 10.0.2.2 (Android)');
          baseURL = adjusted;
        } else if (platform.OS === 'ios') {
          // Utiliser l'IP de la machine hôte pour iOS
          const adjusted = baseURL.replace('localhost', '192.168.1.184');
          if (adjusted !== baseURL) console.warn('[ApiClient] Remplacement localhost -> 192.168.1.184 (iOS)');
          baseURL = adjusted;
        }
      }
    } catch (_) {}

    this.client = axios.create({
      baseURL,
      timeout: Config.apiTimeout,
      headers: { 'Content-Type': 'application/json' },
    });

    // Intercepteur pour ajouter le token aux requêtes
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const platform = require('react-native').Platform;
          const effectiveBase = config.baseURL || this.client.defaults.baseURL;
          if (effectiveBase && /localhost(:\d+)?$/i.test(effectiveBase)) {
            if (platform.OS === 'android') {
              const newBase = effectiveBase.replace('localhost', '10.0.2.2');
              if (this.client.defaults.baseURL !== newBase) {
                console.warn('[ApiClient][request] Correction baseURL (defaults) localhost ->', newBase);
                this.client.defaults.baseURL = newBase;
              }
              if (config.baseURL !== newBase) {
                config.baseURL = newBase;
              }
            } else if (platform.OS === 'ios') {
              const newBase = effectiveBase.replace('localhost', '192.168.1.184');
              if (this.client.defaults.baseURL !== newBase) {
                console.warn('[ApiClient][request] Correction localhost -> 192.168.1.184 (iOS)');
                this.client.defaults.baseURL = newBase;
              }
              if (config.baseURL !== newBase) {
                config.baseURL = newBase;
              }
            }
          }
        } catch (_) { /* ignore */ }

        if (Config.debug) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL || this.client.defaults.baseURL,
            defaultsBaseURL: this.client.defaults.baseURL,
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
            data: response.data,
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
              baseURL: this.client.defaults.baseURL,
            });
          }

          // Fallback automatique si Network Error et localhost Android
          if (!error.response && error.message === 'Network Error' && !this.fallbackTried) {
            this.fallbackTried = true;
            try {
              const platform = require('react-native').Platform;
              if (platform.OS === 'android') {
                const currentBase = this.client.defaults.baseURL || '';
                if (/localhost(:\d+)?$/i.test(currentBase)) {
                  const newBase = currentBase.replace('localhost', '10.0.2.2');
                  console.warn('[ApiClient] Fallback retry avec', newBase);
                  this.client.defaults.baseURL = newBase;
                  if (error.config) error.config.baseURL = newBase;
                  return this.client.request(error.config);
                }
              }
            } catch(_) {}
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
}

export const apiClient = new ApiClient();
export { API_BASE_URL, TOKEN_KEY };
