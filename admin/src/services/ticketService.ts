import apiClient from './apiClient';
// import apiClient from './apiClient.new';

export interface Ticket {
  id: string;
  userId: string;
  type: string;
  status: string;
  price: number;
  qrCode: string;
  validFrom?: string;
  validUntil?: string;
  activatedAt?: string;
  usedAt?: string;
  createdAt: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketStats {
  total: number;
  active: number;
  used: number;
  expired: number;
  byType: {
    type: string;
    count: number;
  }[];
}

class TicketService {
  /**
   * Récupérer tous les tickets
   */
  async getAllTickets(
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string
  ): Promise<TicketsResponse> {
    try {
      const response = await apiClient.getAllTickets({
        page,
        limit,
        status,
        userId,
      });
      return response;
    } catch (error: any) {
      console.error('Erreur récupération tickets:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de chargement des tickets'
      );
    }
  }

  /**
   * Supprimer un ticket
   */
  async deleteTicket(ticketId: string, reason?: string): Promise<void> {
    try {
      await apiClient.deleteTicket(ticketId, reason);
    } catch (error: any) {
      console.error('Erreur suppression ticket:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de suppression'
      );
    }
  }

  /**
   * Expirer les anciens tickets
   */
  async expireOldTickets(): Promise<{ expired: number }> {
    try {
      const response = await apiClient.expireOldTickets();
      return response;
    } catch (error: any) {
      console.error('Erreur expiration tickets:', error);
      throw new Error(
        error.response?.data?.message || "Erreur d'expiration des tickets"
      );
    }
  }

  /**
   * Récupérer les statistiques des tickets
   */
  async getTicketStats(): Promise<TicketStats> {
    try {
      const response = await apiClient.getTicketStats();
      return response.stats || response;
    } catch (error: any) {
      console.error('Erreur statistiques tickets:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de chargement des statistiques'
      );
    }
  }

  /**
   * Formater le type de ticket
   */
  getTicketTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      single: 'Simple Trajet',
      day: 'Journée',
      week: 'Semaine',
      month: 'Mois',
    };
    return labels[type] || type;
  }

  /**
   * Formater le statut
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      active: 'Actif',
      used: 'Utilisé',
      expired: 'Expiré',
    };
    return labels[status] || status;
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'orange',
      active: 'green',
      used: 'blue',
      expired: 'red',
    };
    return colors[status] || 'gray';
  }

  /**
   * Vérifier si un ticket est expiré
   */
  isExpired(ticket: Ticket): boolean {
    if (!ticket.validUntil) return false;
    return new Date(ticket.validUntil) < new Date();
  }

  /**
   * Formater le prix
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(price);
  }

  /**
   * Formater la date
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default new TicketService();
