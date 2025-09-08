import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config';

// Configuration de l'API
const API_BASE_URL = Config.apiBaseUrl;
const TOKEN_KEY = Config.storageKeys.token;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: Config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token aux requêtes
    this.client.interceptors.request.use(
      async (config) => {
        if (Config.debug) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
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
          });
        }
        
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          await AsyncStorage.removeItem(TOKEN_KEY);
          // Rediriger vers la page de connexion si nécessaire
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
