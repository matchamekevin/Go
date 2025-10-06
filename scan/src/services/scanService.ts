/**
 * ✅ SERVICE DE SCAN - NOUVELLE INTÉGRATION
 * Service de validation de tickets pour les contrôleurs
 * Backend: POST /tickets/validate
 */

import scannerApiClient from './apiClient.new';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ValidationResult {
  success: boolean;
  message?: string;
  ticket?: {
    id: number;
    ticket_type: string;
    user_name: string;
    validated_at: string;
  };
  used_at?: string;
}

export interface ValidationHistory {
  id: number;
  ticket_id: number;
  user_name: string;
  ticket_type: string;
  validated_at: string;
  status: 'valid' | 'invalid' | 'expired' | 'already_used';
}

export interface ValidationStats {
  today: number;
  total: number;
  success_rate: number;
}

const HISTORY_KEY = 'scan_history';
const STATS_KEY = 'scan_stats';

class ScanService {
  /**
   * Valider un ticket via QR code
   * Backend: POST /tickets/validate
   */
  async validateTicket(qrCode: string): Promise<ValidationResult> {
    try {
      const response = await scannerApiClient.validateTicket(qrCode);

      // Enregistrer dans l'historique local
      if (response.success) {
        await this.saveToHistory({
          ticket_id: response.ticket?.id || 0,
          user_name: response.ticket?.user_name || 'Inconnu',
          ticket_type: response.ticket?.ticket_type || 'unknown',
          validated_at: response.ticket?.validated_at || new Date().toISOString(),
          status: 'valid',
        });

        await this.incrementStats('success');
      } else {
        // Échec de validation (ticket invalide, expiré, etc.)
        await this.incrementStats('failed');
      }

      return {
        success: response.success,
        message: response.message,
        ticket: response.ticket,
        used_at: response.used_at,
      };
    } catch (error: any) {
      await this.incrementStats('failed');
      
      return {
        success: false,
        message: error.message || 'Erreur de validation',
      };
    }
  }

  /**
   * Récupérer l'historique local des validations
   */
  async getLocalHistory(limit: number = 50): Promise<ValidationHistory[]> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      if (!historyJson) return [];

      const history: ValidationHistory[] = JSON.parse(historyJson);
      return history.slice(0, limit);
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }

  /**
   * Récupérer l'historique depuis le serveur
   */
  async getServerHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ValidationHistory[]> {
    try {
      const response = await scannerApiClient.getValidationHistory(params);
      return response.success ? (response.validations || []) : [];
    } catch (error) {
      console.error('Erreur récupération historique serveur:', error);
      return [];
    }
  }

  /**
   * Récupérer les statistiques locales
   */
  async getLocalStats(): Promise<ValidationStats> {
    try {
      const statsJson = await AsyncStorage.getItem(STATS_KEY);
      if (!statsJson) {
        return { today: 0, total: 0, success_rate: 0 };
      }

      return JSON.parse(statsJson);
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return { today: 0, total: 0, success_rate: 0 };
    }
  }

  /**
   * Récupérer les statistiques depuis le serveur
   */
  async getServerStats(): Promise<ValidationStats> {
    try {
      const response = await scannerApiClient.getValidationStats();
      return response.success ? response.stats : { today: 0, total: 0, success_rate: 0 };
    } catch (error) {
      console.error('Erreur récupération stats serveur:', error);
      return { today: 0, total: 0, success_rate: 0 };
    }
  }

  /**
   * Sauvegarder une validation dans l'historique local
   */
  private async saveToHistory(validation: Omit<ValidationHistory, 'id'>) {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      let history: ValidationHistory[] = historyJson ? JSON.parse(historyJson) : [];

      // Ajouter la nouvelle validation
      const newValidation: ValidationHistory = {
        ...validation,
        id: Date.now(),
      };

      history.unshift(newValidation);

      // Garder seulement les 100 dernières
      if (history.length > 100) {
        history = history.slice(0, 100);
      }

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  }

  /**
   * Incrémenter les statistiques
   */
  private async incrementStats(type: 'success' | 'failed') {
    try {
      const stats = await this.getLocalStats();

      stats.total += 1;
      if (type === 'success') {
        stats.today += 1;
      }

      stats.success_rate = stats.total > 0 ? (stats.today / stats.total) * 100 : 0;

      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur mise à jour stats:', error);
    }
  }

  /**
   * Réinitialiser les statistiques du jour
   */
  async resetDailyStats() {
    try {
      const stats = await this.getLocalStats();
      stats.today = 0;
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur reset stats:', error);
    }
  }

  /**
   * Vider l'historique local
   */
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Erreur suppression historique:', error);
    }
  }

  /**
   * Formater le type de ticket
   */
  formatTicketType(type: string): string {
    const types: Record<string, string> = {
      single: 'Simple',
      day_pass: 'Journée',
      week_pass: 'Semaine',
      month_pass: 'Mois',
    };
    return types[type] || type;
  }

  /**
   * Formater la date/heure
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      valid: '✅',
      invalid: '❌',
      expired: '⏰',
      already_used: '🔄',
    };
    return icons[status] || '❓';
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      valid: '#4CAF50',
      invalid: '#F44336',
      expired: '#FF9800',
      already_used: '#2196F3',
    };
    return colors[status] || '#757575';
  }
}

const scanService = new ScanService();

export default scanService;
export { ScanService };
