import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Config } from '../config'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: Config.apiBaseUrl,
      timeout: Config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Intercepteur pour ajouter le token
    this.client.interceptors.request.use(
      async (config) => {
        if (Config.debug) {
          console.log('🔍 Scan API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
          })
        }
        
        const token = await AsyncStorage.getItem(Config.storageKeys.token)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        if (Config.debug) {
          console.error('❌ Scan API Request Error:', error)
        }
        return Promise.reject(error)
      }
    )

    // Intercepteur pour gérer les réponses
    this.client.interceptors.response.use(
      (response) => {
        if (Config.debug) {
          console.log('✅ Scan API Response:', {
            status: response.status,
            url: response.config.url,
          })
        }
        return response
      },
      async (error) => {
        if (Config.debug) {
          console.error('❌ Scan API Response Error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
          })
        }
        
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(Config.storageKeys.token)
          // Navigation vers login si nécessaire
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async setToken(token: string) {
    await AsyncStorage.setItem(Config.storageKeys.token, token)
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(Config.storageKeys.token)
  }

  async removeToken() {
    await AsyncStorage.removeItem(Config.storageKeys.token)
  }
}

export const apiClient = new ApiClient()
