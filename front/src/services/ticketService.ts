/**
 * ✅ SERVICE DE GESTION DES TICKETS - NOUVELLE INTÉGRATION
 * Basé sur les endpoints backend réels: /api/tickets
 */

import apiClient from './api.client';

export interface Ticket {
  id: number;
  user_id: number;
  ticket_type: 'single' | 'day_pass' | 'week_pass' | 'month_pass';
  qr_code: string;
  status: 'active' | 'used' | 'expired';
  expires_at: string;
  activated_at?: string;
  used_at?: string;
  created_at: string;
}

export interface TicketStats {
  total: number;
  active: number;
  used: number;
  expired: number;
}

class TicketService {
  /**
   * Récupérer mes tickets
   * Backend: GET /tickets
   */
  async getMyTickets(params?: {
    status?: 'active' | 'used' | 'expired';
    limit?: number;
    offset?: number;
  }): Promise<Ticket[]> {
    try {
      const response = await apiClient.getMyTickets(params);
      return response.success ? (response.tickets || []) : [];
    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      return [];
    }
  }

  /**
   * Récupérer un ticket spécifique
   * Backend: GET /tickets/:ticketId
   */
  async getTicketById(ticketId: number): Promise<Ticket | null> {
    try {
      const response = await apiClient.getTicketById(ticketId);
      return response.success ? response.ticket : null;
    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      return null;
    }
  }

  /**
   * Activer un ticket
   * Backend: POST /tickets/:ticketId/activate
   */
  async activateTicket(ticketId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.activateTicket(ticketId);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur activation',
      };
    }
  }

  /**
   * Récupérer les statistiques des tickets
   * Backend: GET /tickets/stats
   */
  async getTicketStats(): Promise<TicketStats> {
    try {
      const response = await apiClient.getTicketStats();
      if (response.success && response.stats) {
        return response.stats;
      }
      return { total: 0, active: 0, used: 0, expired: 0 };
    } catch (error) {
      console.error('Erreur stats tickets:', error);
      return { total: 0, active: 0, used: 0, expired: 0 };
    }
  }

  /**
   * Récupérer les tickets actifs
   */
  async getActiveTickets(): Promise<Ticket[]> {
    return this.getMyTickets({ status: 'active' });
  }

  /**
   * Récupérer l'historique des tickets
   */
  async getTicketHistory(): Promise<Ticket[]> {
    return this.getMyTickets({ status: 'used', limit: 50 });
  }

  /**
   * Vérifier si un ticket est expiré
   */
  isTicketExpired(ticket: Ticket): boolean {
    if (ticket.status === 'expired') return true;
    const expiresAt = new Date(ticket.expires_at);
    return expiresAt < new Date();
  }

  /**
   * Formater le type de ticket
   */
  formatTicketType(type: string): string {
    const types: Record<string, string> = {
      single: 'Ticket Simple',
      day_pass: 'Pass Journée',
      week_pass: 'Pass Semaine',
      month_pass: 'Pass Mois',
    };
    return types[type] || type;
  }

  /**
   * Obtenir le prix d'un ticket
   */
  getTicketPrice(type: string): number {
    const prices: Record<string, number> = {
      single: 200,
      day_pass: 1000,
      week_pass: 5000,
      month_pass: 15000,
    };
    return prices[type] || 0;
  }
}

const ticketService = new TicketService();

export default ticketService;
export { TicketService };
