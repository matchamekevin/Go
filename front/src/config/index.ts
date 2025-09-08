// Configuration de l'environnement

// URL de base de l'API selon l'environnement
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Détection automatique de la plateforme
    const platform = require('react-native').Platform;
    
    if (platform.OS === 'web') {
      // Web : utilise localhost
      return 'http://localhost:7001';
    } else if (platform.OS === 'ios') {
      // iOS Simulator : utilise localhost
      return 'http://localhost:7001';
    } else if (platform.OS === 'android') {
      // Android Emulator : utilise l'IP spéciale pour accéder à la machine hôte
      return 'http://10.0.2.2:7001';
    }
    
    // Fallback pour appareils physiques: utilise l'IP locale détectée
    // Remplacez si nécessaire par l'IP de votre machine
    return 'http://192.168.1.184:7001';
  }
  
  // En production, utilisez l'URL de votre serveur de production
  return 'https://api.gosotral.com';
};

// Configuration générale
export const Config = {
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: 10000,
  
  // Clés de stockage local
  storageKeys: {
    token: 'gosotral_token',
    user: 'gosotral_user',
    lastSync: 'gosotral_last_sync',
  },
  
  // Configuration de l'authentification
  auth: {
    tokenExpirationBuffer: 5 * 60 * 1000, // 5 minutes en millisecondes
    maxRetryAttempts: 3,
  },
  
  // Configuration des tickets
  tickets: {
    refreshInterval: 30 * 1000, // 30 secondes
    qrCodeSize: 150,
  },
  
  // Configuration des paiements
  payments: {
    supportedMethods: ['mobile_money', 'card', 'ussd'] as const,
    defaultMethod: 'mobile_money' as const,
    pollingInterval: 5 * 1000, // 5 secondes
    maxPollingAttempts: 60, // 5 minutes maximum d'attente
  },
  
  // Mode debug
  debug: __DEV__,
} as const;

export type PaymentMethod = typeof Config.payments.supportedMethods[number];
