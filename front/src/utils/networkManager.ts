import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetworkConfig {
  endpoints: string[];
  current: string | null;
  lastChecked: number;
  checkInterval: number; // en millisecondes
}

const STORAGE_KEY = '@network_config';
const DEFAULT_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

class NetworkManager {
  private config: NetworkConfig = {
    endpoints: [
  // Développement local prioritaire pour les tests
  'http://localhost:7000',               // ✅ Localhost first for development (priorité 1)
  'http://127.0.0.1:7000',               // iOS simulator (priorité 2)
  'http://10.0.2.2:7000',                // Android emulator (priorité 3)
  'http://192.168.1.184:7000',           // IP réseau local (priorité 4)
  // Production cloud
  'https://go-j2rr.onrender.com',        // Render production (priorité 5)
  // Autres clouds (placeholders / futurs)
  'https://backend-api-production.up.railway.app',  // Railway (à venir)
  // Tu peux ajouter d'autres URLs via l'interface Configuration Réseau
    ],
    current: null,
    lastChecked: 0,
    checkInterval: DEFAULT_CHECK_INTERVAL,
  };

  private isChecking = false;

  async init(): Promise<void> {
  // Charger (et fusionner) la configuration sauvegardée
  await this.loadConfig();

  // S'assurer que l'endpoint de production Render est présent et prioritaire
  await this.ensureProductionEndpoint('https://go-j2rr.onrender.com');
    
    // Vérifier si on doit tester les endpoints
    const now = Date.now();
    const shouldCheck = !this.config.current || 
                       (now - this.config.lastChecked) > this.config.checkInterval;
    
    if (shouldCheck) {
      await this.findBestEndpoint();
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        // Fusion intelligente des endpoints (union, priorité aux nouveaux par défaut en tête)
        const savedEndpoints: string[] = Array.isArray(parsedConfig.endpoints) ? parsedConfig.endpoints : [];
        const merged = Array.from(new Set([
          ...this.config.endpoints, // garde l'ordre des defaults (Render d'abord)
          ...savedEndpoints,
        ]));
        this.config = { ...this.config, ...parsedConfig, endpoints: merged };
      }
    } catch (error) {
      console.log('[NetworkManager] Impossible de charger la config:', error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.log('[NetworkManager] Impossible de sauver la config:', error);
    }
  }

  async findBestEndpoint(): Promise<string | null> {
    if (this.isChecking) {
      // Retourner l'endpoint actuel si une vérification est déjà en cours
      return this.config.current;
    }

    this.isChecking = true;
    console.log('[NetworkManager] Recherche du meilleur endpoint...');

    try {
      // Tester les endpoints en parallèle pour la vitesse
      const tests = this.config.endpoints.map(async (endpoint) => {
        try {
          const startTime = Date.now();
          
          // Créer un controller pour annuler la requête après timeout
          const timeout = endpoint.startsWith('https://') ? 15000 : 5000; // 15s pour HTTPS, 5s pour HTTP
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          const response = await fetch(`${endpoint}/health`, {
            method: 'GET',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const responseTime = Date.now() - startTime;
            return { endpoint, responseTime, success: true };
          }
        } catch (error) {
          console.log(`[NetworkManager] ${endpoint} non disponible:`, error instanceof Error ? error.message : error);
        }
        return { endpoint, responseTime: Infinity, success: false };
      });

      const results = await Promise.all(tests);
      
      // Prendre le plus rapide qui fonctionne
      const workingEndpoints = results
        .filter(r => r.success)
        .sort((a, b) => a.responseTime - b.responseTime);

      if (workingEndpoints.length > 0) {
        const best = workingEndpoints[0];
        console.log(`[NetworkManager] Meilleur endpoint trouvé: ${best.endpoint} (${best.responseTime}ms)`);
        
        this.config.current = best.endpoint;
        this.config.lastChecked = Date.now();
        await this.saveConfig();
        
        return best.endpoint;
      } else {
        console.warn('[NetworkManager] Aucun endpoint disponible');
        return null;
      }
    } finally {
      this.isChecking = false;
    }
  }

  async getCurrentEndpoint(): Promise<string | null> {
    if (!this.config.current) {
      await this.findBestEndpoint();
    }
    return this.config.current;
  }

  async forceRefresh(): Promise<string | null> {
    this.config.lastChecked = 0;
    return await this.findBestEndpoint();
  }

  async addEndpoint(endpoint: string): Promise<void> {
    if (!this.config.endpoints.includes(endpoint)) {
      this.config.endpoints.unshift(endpoint); // Ajouter en premier pour le prioriser
      await this.saveConfig();
      console.log(`[NetworkManager] Endpoint ajouté: ${endpoint}`);
    }
  }

  private async ensureProductionEndpoint(endpoint: string): Promise<void> {
    // En développement, ne pas forcer la production en première position
    // seulement s'assurer qu'elle est dans la liste
    if (!this.config.endpoints.includes(endpoint)) {
      this.config.endpoints.push(endpoint); // Ajouter à la fin, pas en premier
      await this.saveConfig();
      console.log('[NetworkManager] Endpoint production ajouté:', endpoint);
    }
  }

  async removeEndpoint(endpoint: string): Promise<void> {
    const index = this.config.endpoints.indexOf(endpoint);
    if (index > -1) {
      this.config.endpoints.splice(index, 1);
      if (this.config.current === endpoint) {
        this.config.current = null;
      }
      await this.saveConfig();
      console.log(`[NetworkManager] Endpoint supprimé: ${endpoint}`);
    }
  }

  getConfig(): NetworkConfig {
    return { ...this.config };
  }

  async testEndpoint(endpoint: string): Promise<boolean> {
    try {
      const timeout = endpoint.startsWith('https://') ? 10000 : 5000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const networkManager = new NetworkManager();
