import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { UnifiedSotralTicket } from './sotralUnifiedService';
import { DEV_CONFIG, devLog, devError } from '../config/devConfig';

export interface UserTicket {
  id: string;
  type: string;
  route: string;
  date: string;
  time: string;
  price: string;
  seat?: string;
  qrCode?: string;
  status: 'valid' | 'used' | 'expired';
  expiresIn?: string;
}

export interface UserTicketHistory {
  id: string;
  type: string;
  route: string;
  date: string;
  time: string;
  price: string;
  seat?: string;
  status: 'used' | 'expired';
}

export class UserTicketService {
  // Récupérer tous les tickets de l'utilisateur connecté
  static async getMyTickets(): Promise<UnifiedSotralTicket[]> {
    // Force fallback en mode debug
    if (DEV_CONFIG.FORCE_FALLBACK) {
      devLog('UserTicketService', 'Mode fallback forcé activé');
      return [];
    }
    
    try {
      devLog('UserTicketService', 'Récupération des tickets utilisateur...');
      const response = await apiClient.get<ApiResponse<UnifiedSotralTicket[]>>('/sotral/my-tickets');
      
      devLog('UserTicketService', 'Réponse API reçue', {
        success: response.success,
        dataLength: response.data?.length || 0,
        tickets: response.data
      });
      
      if (!response.success) {
        devError('UserTicketService', new Error(response.error || 'API Error'), 'getMyTickets');
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      devError('UserTicketService', error, 'getMyTickets - Network Error');
      // En cas d'erreur API, retourner un tableau vide plutôt que de lancer une erreur
      // pour permettre l'affichage du fallback
      return [];
    }
  }

  // Récupérer les tickets actifs (non utilisés, non expirés)
  static async getActiveTickets(): Promise<UserTicket[]> {
    try {
      devLog('UserTicketService', 'Récupération des tickets actifs...');
      const tickets = await this.getMyTickets();
      
      const activeTickets = tickets
        .filter(ticket => ticket.status === 'active' && ticket.trips_remaining > 0)
        .map(ticket => this.transformToUserTicket(ticket));
        
      devLog('UserTicketService', `Tickets actifs trouvés: ${activeTickets.length}`);
      
      if (activeTickets.length === 0) {
        devLog('UserTicketService', 'Aucun ticket actif trouvé via API');
        return [];
      }
      
      return activeTickets;
    } catch (error) {
      devError('UserTicketService', error, 'getActiveTickets');
      return this.getFallbackActiveTickets();
    }
  }

  // Récupérer l'historique des tickets (TOUS les tickets achetés)
  static async getTicketHistory(): Promise<UserTicketHistory[]> {
    try {
      devLog('UserTicketService', 'Récupération de l\'historique des tickets...');
      const tickets = await this.getMyTickets();
      
      devLog('UserTicketService', `Tickets récupérés de l'API:`, tickets);
      
      // Afficher TOUS les tickets qui ont été payés (ont purchased_at)
      const historyTickets = tickets
        .filter(ticket => ticket.purchased_at) // Tous les tickets achetés
        .map(ticket => this.transformToUserTicketHistory(ticket))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Tri par date décroissante
        
      devLog('UserTicketService', `Tickets historiques trouvés: ${historyTickets.length}`);
      
      if (historyTickets.length === 0) {
        devLog('UserTicketService', 'Aucun historique trouvé via API');
      }
      
      return historyTickets;
    } catch (error) {
      devError('UserTicketService', error, 'getTicketHistory');
      return this.getFallbackTicketHistory();
    }
  }

  // Transformer un ticket backend en UserTicket pour l'affichage
  private static transformToUserTicket(ticket: UnifiedSotralTicket): UserTicket {
    const route = ticket.line_name || `Ligne ${ticket.line_id || '?'}`;
    const type = ticket.ticket_type_name || 'Ticket SOTRAL';
    const date = ticket.purchased_at ? new Date(ticket.purchased_at).toLocaleDateString('fr-FR') : '';
    const time = ticket.purchased_at ? new Date(ticket.purchased_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const price = `${ticket.price_paid_fcfa} FCFA`;

    // Calculer l'expiration basé sur expires_at
    let expiresIn = '';
    if (ticket.expires_at) {
      const expiryDate = new Date(ticket.expires_at);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        expiresIn = `${hours}h ${minutes}min`;
      } else {
        expiresIn = 'Expiré';
      }
    } else {
      expiresIn = `${ticket.trips_remaining} trajet(s) restant(s)`;
    }

    return {
      id: String(ticket.id),
      type,
      route,
      date,
      time,
      price,
      seat: this.generateSeat(),
      qrCode: ticket.qr_code,
      status: 'valid',
      expiresIn
    };
  }

  // Transformer un ticket backend en UserTicketHistory pour l'historique
  private static transformToUserTicketHistory(ticket: UnifiedSotralTicket): UserTicketHistory {
    const route = ticket.line_name || `Ligne ${ticket.line_id || '?'}`;
    const type = ticket.ticket_type_name || 'Ticket SOTRAL';
    const date = ticket.purchased_at ? 
      new Date(ticket.purchased_at).toLocaleDateString('fr-FR') : '';
    const time = ticket.purchased_at ? 
      new Date(ticket.purchased_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const price = `${ticket.price_paid_fcfa} FCFA`;

    // Déterminer le statut basé sur les trajets restants et la date d'expiration
    let status: 'used' | 'expired' = 'used';
    if (ticket.status === 'expired') {
      status = 'expired';
    } else if (ticket.status === 'used') {
      status = 'used';
    } else if (ticket.trips_remaining === 0) {
      status = 'used';
    } else if (ticket.expires_at && new Date(ticket.expires_at) < new Date()) {
      status = 'expired';
    }

    return {
      id: String(ticket.id),
      type,
      route,
      date,
      time,
      price,
      seat: this.generateSeat(),
      status
    };
  }

  // Générer un numéro de siège fictif
  private static generateSeat(): string {
    const letters = ['A', 'B', 'C', 'D'];
    const numbers = Math.floor(Math.random() * 20) + 1;
    const letter = letters[Math.floor(Math.random() * letters.length)];
    return `${numbers}${letter}`;
  }

  // Données de fallback pour les tickets actifs
  private static getFallbackActiveTickets(): UserTicket[] {
    // Plus de données hardcodées - utiliser uniquement les données de l'admin via l'API
    devLog('UserTicketService', 'Aucun ticket actif via API, retour vide');
    return [];
  }

  // Données de fallback pour l'historique
  private static getFallbackTicketHistory(): UserTicketHistory[] {
    // Plus de données hardcodées - utiliser uniquement les données de l'admin via l'API
    devLog('UserTicketService', 'Aucun historique via API, retour vide');
    return [];
  }
}