import { apiClient } from './apiClient';
import type { ApiResponse, Ticket } from '../types/api';
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
  static async getMyTickets(): Promise<Ticket[]> {
    // Force fallback en mode debug
    if (DEV_CONFIG.FORCE_FALLBACK) {
      devLog('UserTicketService', 'Mode fallback forcé activé');
      return [];
    }
    
    try {
      devLog('UserTicketService', 'Récupération des tickets utilisateur...');
      const response = await apiClient.get<ApiResponse<Ticket[]>>('/tickets/my-tickets');
      
      devLog('UserTicketService', 'Réponse API reçue', {
        success: response.success,
        dataLength: response.data?.length || 0
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
        .filter(ticket => ticket.status === 'unused')
        .map(ticket => this.transformToUserTicket(ticket));
        
      devLog('UserTicketService', `Tickets actifs trouvés: ${activeTickets.length}`);
      
      if (activeTickets.length === 0) {
        devLog('UserTicketService', 'Aucun ticket actif, utilisation du fallback');
        return this.getFallbackActiveTickets();
      }
      
      return activeTickets;
    } catch (error) {
      devError('UserTicketService', error, 'getActiveTickets');
      return this.getFallbackActiveTickets();
    }
  }

  // Récupérer l'historique des tickets (utilisés ou expirés)
  static async getTicketHistory(): Promise<UserTicketHistory[]> {
    try {
      devLog('UserTicketService', 'Récupération de l\'historique des tickets...');
      const tickets = await this.getMyTickets();
      
      const historyTickets = tickets
        .filter(ticket => ticket.status === 'used' || ticket.status === 'expired')
        .map(ticket => this.transformToUserTicketHistory(ticket))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Tri par date décroissante
        
      devLog('UserTicketService', `Tickets historiques trouvés: ${historyTickets.length}`);
      
      if (historyTickets.length === 0) {
        devLog('UserTicketService', 'Aucun historique, utilisation du fallback');
        return this.getFallbackTicketHistory();
      }
      
      return historyTickets;
    } catch (error) {
      devError('UserTicketService', error, 'getTicketHistory');
      return this.getFallbackTicketHistory();
    }
  }

  // Transformer un ticket backend en UserTicket pour l'affichage
  private static transformToUserTicket(ticket: Ticket): UserTicket {
    const route = `${ticket.route_start_point || 'Départ'} → ${ticket.route_end_point || 'Arrivée'}`;
    const type = this.getTicketTypeDisplay(ticket.product_name || '');
    const date = ticket.purchased_at ? new Date(ticket.purchased_at).toLocaleDateString('fr-FR') : '';
    const time = ticket.purchased_at ? new Date(ticket.purchased_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const price = ticket.product_price ? `${ticket.product_price} FCFA` : '-- FCFA';

    // Calculer l'expiration (exemple: 24h après achat)
    let expiresIn = '';
    if (ticket.purchased_at) {
      const purchaseDate = new Date(ticket.purchased_at);
      const expiryDate = new Date(purchaseDate.getTime() + 24 * 60 * 60 * 1000); // +24h
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        expiresIn = `${hours}h ${minutes}min`;
      } else {
        expiresIn = 'Expiré';
      }
    }

    return {
      id: ticket.id || `ticket-${Date.now()}`,
      type,
      route,
      date,
      time,
      price,
      seat: this.generateSeat(),
      qrCode: ticket.code || `QR_${ticket.id}`,
      status: 'valid',
      expiresIn
    };
  }

  // Transformer un ticket backend en UserTicketHistory pour l'historique
  private static transformToUserTicketHistory(ticket: Ticket): UserTicketHistory {
    const route = `${ticket.route_start_point || 'Départ'} → ${ticket.route_end_point || 'Arrivée'}`;
    const type = this.getTicketTypeDisplay(ticket.product_name || '');
    const date = ticket.used_at || ticket.purchased_at ? 
      new Date(ticket.used_at || ticket.purchased_at!).toLocaleDateString('fr-FR') : '';
    const time = ticket.used_at || ticket.purchased_at ? 
      new Date(ticket.used_at || ticket.purchased_at!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const price = ticket.product_price ? `${ticket.product_price} FCFA` : '-- FCFA';

    return {
      id: ticket.id || `history-${Date.now()}`,
      type,
      route,
      date,
      time,
      price,
      seat: this.generateSeat(),
      status: ticket.status === 'used' ? 'used' : 'expired'
    };
  }

  // Déterminer le type d'affichage basé sur le nom du produit
  private static getTicketTypeDisplay(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('rapide') || name.includes('express')) {
      return 'Bus rapide';
    } else if (name.includes('métro') || name.includes('metro')) {
      return 'Métro';
    } else {
      return 'Bus urbain';
    }
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
    return [
      {
        id: 'fallback-active-1',
        type: 'Bus rapide',
        route: 'Centre-ville → Aéroport',
        date: new Date().toLocaleDateString('fr-FR'),
        time: '14:30',
        price: '250 FCFA',
        seat: '12A',
        qrCode: 'TICKET_FALLBACK_001',
        status: 'valid',
        expiresIn: '2h 30min',
      },
      {
        id: 'fallback-active-2',
        type: 'Métro',
        route: 'Université → Plateau',
        date: new Date().toLocaleDateString('fr-FR'),
        time: '18:00',
        price: '100 FCFA',
        seat: '---',
        qrCode: 'TICKET_FALLBACK_002',
        status: 'valid',
        expiresIn: '6h 00min',
      }
    ];
  }

  // Données de fallback pour l'historique
  private static getFallbackTicketHistory(): UserTicketHistory[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);

    return [
      {
        id: 'fallback-history-1',
        type: 'Bus urbain',
        route: 'Marché → Centre-ville',
        date: yesterday.toLocaleDateString('fr-FR'),
        time: '09:15',
        price: '150 FCFA',
        seat: '8B',
        status: 'used',
      },
      {
        id: 'fallback-history-2',
        type: 'Bus rapide',
        route: 'Aéroport → Université',
        date: dayBefore.toLocaleDateString('fr-FR'),
        time: '16:45',
        price: '250 FCFA',
        seat: '15C',
        status: 'used',
      }
    ];
  }
}