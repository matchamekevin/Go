import apiClient from './apiClient.new';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  provider: string;
  status: string;
  phoneNumber: string;
  ticketType: string;
  transactionId?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  count: number;
}

class PaymentService {
  /**
   * Récupérer tous les paiements
   */
  async getAllPayments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentsResponse> {
    try {
      const response = await apiClient.getAllPayments({
        page,
        limit,
        status,
        userId,
        startDate,
        endDate,
      });
      return response;
    } catch (error: any) {
      console.error('Erreur récupération paiements:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de chargement des paiements'
      );
    }
  }

  /**
   * Récupérer le rapport de revenus
   */
  async getRevenueReport(
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<RevenueData[]> {
    try {
      const response = await apiClient.getRevenueReport({
        startDate,
        endDate,
        groupBy,
      });
      return response.data || response;
    } catch (error: any) {
      console.error('Erreur rapport revenus:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de génération du rapport'
      );
    }
  }

  /**
   * Formater le statut
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      initiated: 'Initié',
      completed: 'Complété',
      failed: 'Échoué',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'orange',
      initiated: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
    };
    return colors[status] || 'gray';
  }

  /**
   * Formater le provider
   */
  getProviderLabel(provider: string): string {
    const labels: { [key: string]: string } = {
      tmoney: 'T-Money',
      flooz: 'Flooz',
    };
    return labels[provider] || provider;
  }

  /**
   * Formater le montant
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  }

  /**
   * Formater le numéro de téléphone
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Formater +228XXXXXXXX -> +228 XX XX XX XX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('228')) {
      return `+228 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
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

  /**
   * Calculer le total des revenus
   */
  calculateTotalRevenue(payments: Payment[]): number {
    return payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /**
   * Grouper les paiements par statut
   */
  groupByStatus(payments: Payment[]): { [status: string]: number } {
    return payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number });
  }

  /**
   * Grouper les paiements par provider
   */
  groupByProvider(payments: Payment[]): { [provider: string]: number } {
    return payments.reduce((acc, payment) => {
      acc[payment.provider] = (acc[payment.provider] || 0) + payment.amount;
      return acc;
    }, {} as { [provider: string]: number });
  }
}

export default new PaymentService();
