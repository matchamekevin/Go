import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

class HttpClient implements ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor pour ajouter le token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor pour gérer les erreurs globalement
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): void {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Ne pas rediriger automatiquement vers la page de login
          // Laisser AuthContext gérer la redirection si nécessaire
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expirée. Veuillez vous reconnecter.');
          }
          break;
        case 403:
          toast.error('Accès refusé. Permissions insuffisantes.');
          break;
        case 404:
          toast.error('Ressource non trouvée.');
          break;
        case 422:
          if (data.errors) {
            Object.values(data.errors).forEach((errorMessages: any) => {
              if (Array.isArray(errorMessages)) {
                errorMessages.forEach((message) => toast.error(message));
              } else {
                toast.error(errorMessages);
              }
            });
          } else {
            toast.error(data.message || 'Données invalides.');
          }
          break;
        case 500:
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;
        default:
          toast.error(data.message || data.error || 'Une erreur est survenue.');
      }
    } else if (error.request) {
      toast.error('Impossible de joindre le serveur. Vérifiez votre connexion.');
    } else {
      toast.error('Une erreur inattendue est survenue.');
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }
}

// Configuration de l'API (par défaut pointant vers le backend local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

export const apiClient = new HttpClient(API_BASE_URL);
export default apiClient;
