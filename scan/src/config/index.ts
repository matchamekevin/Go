// Configuration API pour l'app scan
import { Platform } from 'react-native'

export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Détection automatique de la plateforme pour dev
    if (Platform.OS === 'web') {
      return 'http://localhost:7000'
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:7000'
    } else if (Platform.OS === 'android') {
      // Android Emulator
      return 'http://10.0.2.2:7000'
    }
    
    // Fallback pour appareils physiques
    return 'http://192.168.1.106:7000'
  }
  
  // Production
  return 'https://api.gosotral.com'
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
