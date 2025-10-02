import axios, { AxiosInstance, AxiosError } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Constantes hard-codées pour éviter les problèmes d'initialisation
const API_BASE_URL = 'https://go-j2rr.onrender.com'
const API_TIMEOUT = 15000
const STORAGE_KEY_TOKEN = 'scan_token'
const STORAGE_KEY_OPERATOR = 'scan_operator'
const DEBUG_MODE = __DEV__

class ApiClient {
  private client: AxiosInstance

  constructor() {
    console.log('🔧 Initialisation ApiClient avec:', API_BASE_URL)
    
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // Intercepteur pour ajouter le token et logger les requêtes
    this.client.interceptors.request.use(
      async (config: any) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN)
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          
          if (DEBUG_MODE) {
            console.log('🔍 [SCAN API] Requête:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              fullURL: `${config.baseURL}${config.url}`,
              hasToken: !!token,
            })
          }
        } catch (err) {
          console.error('❌ [SCAN API] Erreur intercepteur requête:', err)
        }
        return config
      },
      (error: AxiosError) => {
        console.error('❌ [SCAN API] Erreur avant requête:', error.message)
        return Promise.reject(error)
      }
    )

    // Intercepteur pour gérer les réponses et erreurs
    this.client.interceptors.response.use(
      (response: any) => {
        if (DEBUG_MODE) {
          console.log('✅ [SCAN API] Réponse:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          })
        }
        return response
      },
      async (error: AxiosError) => {
        const status = error.response?.status
        const url = error.config?.url
        
        console.error('❌ [SCAN API] Erreur réponse:', {
          message: error.message,
          status,
          url,
          data: error.response?.data,
        })
        
        // Gérer l'authentification expirée
        if (status === 401) {
          try {
            await AsyncStorage.removeItem(STORAGE_KEY_TOKEN)
            await AsyncStorage.removeItem(STORAGE_KEY_OPERATOR)
            console.log('🔓 Token expiré, nettoyage effectué')
          } catch (err) {
            console.error('❌ Erreur nettoyage token:', err)
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.get(url, config)
      return response.data as T
    } catch (error) {
      console.error(`❌ [GET ${url}] Erreur:`, error)
      throw error
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.post(url, data, config)
      return response.data as T
    } catch (error) {
      console.error(`❌ [POST ${url}] Erreur:`, error)
      throw error
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.put(url, data, config)
      return response.data as T
    } catch (error) {
      console.error(`❌ [PUT ${url}] Erreur:`, error)
      throw error
    }
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.delete(url, config)
      return response.data as T
    } catch (error) {
      console.error(`❌ [DELETE ${url}] Erreur:`, error)
      throw error
    }
  }

  // Gestion du token
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token)
    console.log('✅ Token sauvegardé')
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEY_TOKEN)
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY_TOKEN)
    console.log('🔓 Token supprimé')
  }

  // Gestion de l'opérateur
  async setOperator(operator: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_OPERATOR, JSON.stringify(operator))
    console.log('✅ Opérateur sauvegardé')
  }

  async getOperator(): Promise<any | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEY_OPERATOR)
    return data ? JSON.parse(data) : null
  }

  async removeOperator(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY_OPERATOR)
    console.log('🔓 Opérateur supprimé')
  }

  // Vérifier la connexion
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 })
      const isOk = response.status === 200
      console.log(`🔌 Connexion API: ${isOk ? 'OK' : 'KO'}`)
      return isOk
    } catch (error) {
      console.error('❌ Pas de connexion API')
      return false
    }
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient()
