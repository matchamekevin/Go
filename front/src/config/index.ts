// Configuration de l'environnement

// URL de base de l'API selon l'environnement
export const getApiBaseUrl = (): string => {
  // Runtime override via Expo env (EXPO_PUBLIC_API_URL)
  // @ts-ignore
  const expoEnv = process?.env?.EXPO_PUBLIC_API_URL;
  if (expoEnv) {
    try {
      const platform = require('react-native').Platform;
      if (platform.OS === 'android' && /localhost(:\d+)?$/i.test(expoEnv)) {
        const adjusted = expoEnv.replace('localhost', '10.0.2.2');
        console.warn('[Config] EXPO_PUBLIC_API_URL pointe vers localhost sur Android. Utilisation de', adjusted);
        return adjusted;
      }
    } catch (_) {}
    return expoEnv;
  }

  if (__DEV__) {
    // Détection automatique de la plateforme
    const platform = require('react-native').Platform;
    
    if (platform.OS === 'web') {
      // Web : utilise l'URL de production
      return 'https://go-j2rr.onrender.com';
    } else if (platform.OS === 'ios') {
      // iOS Simulator : utilise l'URL de production
      return 'https://go-j2rr.onrender.com';
    } else if (platform.OS === 'android') {
      // Android Emulator : utilise l'URL de production
      console.log('[Config] Platform Android dev -> utilisation de https://go-j2rr.onrender.com');
      return 'https://go-j2rr.onrender.com';
    }
    
    // Appareil physique: utilise l'URL de production
    console.log('[Config] Appareil physique détecté: utilisation de l\'URL de production.');
    return 'https://go-j2rr.onrender.com';
  }
  
  // En production, utilisez l'URL de votre serveur de production
  // Runtime override (web): window.__API_URL__ can be injected into the HTML
  try {
    // @ts-ignore
    const runtime = (typeof window !== 'undefined' && (window as any).__API_URL__) as string | undefined;
    if (runtime && runtime.length > 0) return runtime;
  } catch (e) {
    // ignore
  }

  // Build-time override via environment (if your build pipeline injects REACT_APP_API_URL or VITE_API_URL)
  // @ts-ignore
  const buildTime = process?.env?.REACT_APP_API_URL || process?.env?.VITE_API_URL;
  if (buildTime) return buildTime;

  return 'https://api.gosotral.com';
};

// Configuration générale
export const Config = {
  apiBaseUrl: getApiBaseUrl(),
  // Timeout pour les requêtes API : augmenté à 30s pour les réseaux lents
  apiTimeout: 15000, // Réduit de 30s à 15s pour éviter les timeouts trop longs
  
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
