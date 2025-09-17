// Utilitaire pour obtenir l'adresse IP locale pour le développement
export const getLocalDeviceIP = (): string => {
  try {
    // En production ou si on ne peut pas détecter, utiliser localhost
    const platform = require('react-native').Platform;
    
    if (platform.OS === 'android') {
      // Android Emulator: utilise 10.0.2.2 pour accéder à la machine hôte
      return '10.0.2.2';
    } else if (platform.OS === 'ios') {
      // iOS Simulator: utilise l'IP réelle de la machine hôte
      // En développement, cela devrait être l'IP du réseau local
      return '192.168.1.184'; // Remplacer par l'IP de votre machine
    } else if (platform.OS === 'web') {
      // Web: utilise localhost
      return 'localhost';
    }
    
    // Fallback
    return 'localhost';
  } catch (error) {
    console.warn('Erreur détection plateforme, utilisation de localhost');
    return 'localhost';
  }
};

// Configuration pour différents environnements
export const getApiBaseUrl = (apiHost?: string, apiPort?: number): string => {
  const host = apiHost || getLocalDeviceIP();
  const port = apiPort || 7000;
  return `http://${host}:${port}`;
};

// Fonction pour tester la connectivité
export const testConnectivity = async (baseUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};
