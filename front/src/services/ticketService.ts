import { apiClient } from './apiClient';
import type { ApiResponse, TicketProduct, Route, Ticket, TicketPurchase, TicketValidation } from '../types/api';

export class TicketService {
  // Récupérer tous les produits de tickets
  static async getAllProducts(): Promise<TicketProduct[]> {
    const response = await apiClient.get<ApiResponse<TicketProduct[]>>('/tickets/products');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des produits');
    }
    return response.data || [];
  }

  // Récupérer tous les trajets
  static async getAllRoutes(): Promise<Route[]> {
    const response = await apiClient.get<ApiResponse<Route[]>>('/tickets/routes');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des trajets');
    }
    return response.data || [];
  }

  // Récupérer les trajets par catégorie de prix
  static async getRoutesByCategory(category: string): Promise<Route[]> {
    const response = await apiClient.get<ApiResponse<Route[]>>(`/tickets/routes/category/${category}`);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des trajets');
    }
    return response.data || [];
  }

  // Acheter un ticket (nécessite authentification)
  static async purchaseTicket(purchase: TicketPurchase): Promise<Ticket> {
    const response = await apiClient.post<ApiResponse<Ticket>>('/tickets/purchase', purchase);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de l\'achat du ticket');
    }
    return response.data!;
  }

  // Récupérer les tickets de l'utilisateur connecté
  static async getMyTickets(): Promise<Ticket[]> {
    const response = await apiClient.get<ApiResponse<Ticket[]>>('/tickets/my-tickets');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération de vos tickets');
    }
    return response.data || [];
  }

  // Valider un ticket (pour les contrôleurs)
  static async validateTicket(validation: TicketValidation): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/tickets/validate', validation);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la validation du ticket');
    }
    return response.data;
  }

  // Récupérer les statistiques des tickets (admin)
  static async getTicketStats(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/tickets/stats');
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des statistiques');
    }
    return response.data;
  }

  // Récupérer l'URL du QR code d'un ticket
  static getTicketQRCodeUrl(ticketCode: string): string {
    return `${apiClient['client'].defaults.baseURL}/tickets/${ticketCode}/qrcode`;
  }

  // Test: récupérer les tickets d'un utilisateur par ID (dev seulement)
  static async getUserTicketsById(userId: number): Promise<Ticket[]> {
    const response = await apiClient.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}`);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de la récupération des tickets utilisateur');
    }
    return response.data || [];
  }
}
