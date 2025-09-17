/**
 * Configuration de développement pour les services
 * Permet de basculer entre API réelle et données de fallback
 */

export const DEV_CONFIG = {
  // Force l'utilisation des données de fallback (pour debug sans serveur)
  FORCE_FALLBACK: true, // Activé temporairement pour tester sans serveur
  
  // Timeout pour les appels API avant basculement fallback
  API_TIMEOUT: 5000,
  
  // Logs détaillés pour les services
  ENABLE_SERVICE_LOGS: true,
  
  // Mode développement pour les données mockées enrichies
  MOCK_DATA_MODE: 'realistic', // 'minimal' | 'realistic' | 'extensive'
  
  // Configuration réseau
  NETWORK: {
    // Retry automatique en cas d'échec
    AUTO_RETRY: true,
    MAX_RETRIES: 2,
    
    // Fallback immédiat si pas de réseau
    OFFLINE_FALLBACK: true
  }
};

// Helper pour logger en mode développement
export const devLog = (service: string, message: string, data?: any) => {
  if (DEV_CONFIG.ENABLE_SERVICE_LOGS) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${service}] ${message}`, data ? data : '');
  }
};

// Helper pour gérer les erreurs de développement
export const devError = (service: string, error: any, context?: string) => {
  console.error(`[DEV ERROR] [${service}]${context ? ` ${context}` : ''}:`, error);
  
  // En développement, afficher plus de détails
  if (__DEV__) {
    console.error('Stack trace:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });
  }
};