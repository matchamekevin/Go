// Configuration API pour l'app scan
import { Platform } from 'react-native'

export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Utilise l'URL de production même en développement
    return 'https://go-j2rr.onrender.com'
  }
  
  // Production
  return 'https://go-j2rr.onrender.com'
}

export const Config = {
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: 10000,
  
  // Clés de stockage
  storageKeys: {
    token: 'scan_token',
    operator: 'scan_operator',
  },
  
  // Configuration du scanner
  scanner: {
    scanInterval: 1000,
    vibrationEnabled: true,
    soundEnabled: true,
  },
  
  // Mode debug
  debug: __DEV__,
} as const
