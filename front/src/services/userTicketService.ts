import { apiClient } from './apiClient';
import type { ApiResponse, Ticket } from '../types/api';
import { DEV_CONFIG, devLog, devError } from '../config/devConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  status: 'used' | 'expired' | 'valid';
  qrCode?: string;
  ticket_code?: string;
}

export class UserTicketService {
  // Récupérer tous les tickets de l'utilisateur connecté
  static async getMyTickets(): Promise<Ticket[]> {
    try {
      devLog('UserTicketService', 'Récupération des tickets utilisateur...');
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        devLog('UserTicketService', 'Aucun token trouvé, utilisateur non authentifié');
        return [];
      }
      const response = await apiClient.get<ApiResponse<Ticket[]>>('/tickets/my-tickets',{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Réponse API brute:', response);

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
        devLog('UserTicketService', 'Aucun ticket actif trouvé via API');
        return [];
      }
      
      return activeTickets;
    } catch (error) {
      devError('UserTicketService', error, 'getActiveTickets');
      return []
    }
  }

  // Récupérer l'historique des tickets (utilisés ou expirés)
  static async getTicketHistory(): Promise<Ticket[]> {
    try {
      devLog('UserTicketService', 'Récupération de l\'historique des tickets...');
      const tickets = await this.getMyTickets();
      console.log('Tickets récupérés pour l\'historique:', tickets);
      const historyTickets = tickets
      return tickets
    } catch (error) {
      devError('UserTicketService', error, 'getTicketHistory');
      return []
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
      qrCode: ticket.sotral_qr_code || ticket.qr_code || ticket.code || '',
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
      status: ticket.status === 'used' ? 'used' : 'expired',
      qrCode: ticket.sotral_qr_code || ticket.qr_code || ticket.code || ''
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


}