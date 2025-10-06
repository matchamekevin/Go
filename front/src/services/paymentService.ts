/**
 * ✅ SERVICE DE PAIEMENT - NOUVELLE INTÉGRATION
 * Basé sur les endpoints backend réels: /api/payments
 */

import apiClient from './api.client';

export interface Payment {
  id: number;
  user_id: number;
  ticket_type: string;
  amount: number;
  payment_method: 'tmoney' | 'flooz';
  phone_number: string;
  quantity: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  external_transaction_id?: string;
  created_at: string;
}

export interface InitiatePaymentData {
  ticket_type: 'single' | 'day_pass' | 'week_pass' | 'month_pass';
  payment_method: 'tmoney' | 'flooz';
  phone_number: string;
  quantity?: number;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  payment_id?: number;
  transaction_id?: string;
  status?: string;
}

class PaymentService {
  /**
   * Initier un paiement mobile
   * Backend: POST /payments/initiate
   */
  async initiatePayment(data: InitiatePaymentData): Promise<PaymentResult> {
    try {
      const response = await apiClient.initiatePayment(data);
      return {
        success: response.success,
        message: response.message,
        payment_id: response.payment_id,
        transaction_id: response.transaction_id,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur initiation paiement',
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   * Backend: GET /payments/status/:paymentId
   */
  async checkPaymentStatus(paymentId: number): Promise<{
    success: boolean;
    payment?: Payment;
    message?: string;
  }> {
    try {
      const response = await apiClient.checkPaymentStatus(paymentId);
      return {
        success: response.success,
        payment: response.payment,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erreur vérification paiement',
      };
    }
  }

  /**
   * Récupérer l'historique des paiements
   * Backend: GET /payments/history
   */
  async getPaymentHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Payment[]> {
    try {
      const response = await apiClient.getPaymentHistory(params);
      return response.success ? (response.payments || []) : [];
    } catch (error) {
      console.error('Erreur historique paiements:', error);
      return [];
    }
  }

  /**
   * Polling du statut de paiement
   * Vérifie toutes les 3 secondes pendant max 2 minutes
   */
  async pollPaymentStatus(
    paymentId: number,
    onUpdate: (status: string) => void,
    maxAttempts: number = 40
  ): Promise<Payment | null> {
    let attempts = 0;

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        attempts++;

        try {
          const result = await this.checkPaymentStatus(paymentId);

          if (result.success && result.payment) {
            const status = result.payment.status;
            onUpdate(status);

            if (status === 'completed' || status === 'failed' || status === 'cancelled') {
              clearInterval(interval);
              resolve(result.payment);
            }
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            resolve(null);
          }
        } catch (error) {
          console.error('Erreur polling:', error);
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            resolve(null);
          }
        }
      }, 3000); // Vérifier toutes les 3 secondes
    });
  }

  /**
   * Obtenir le prix d'un type de ticket
   */
  getTicketPrice(ticketType: string): number {
    const prices: Record<string, number> = {
      single: 200,
      day_pass: 1000,
      week_pass: 5000,
      month_pass: 15000,
    };
    return prices[ticketType] || 0;
  }

  /**
   * Calculer le montant total
   */
  calculateTotalAmount(ticketType: string, quantity: number = 1): number {
    return this.getTicketPrice(ticketType) * quantity;
  }

  /**
   * Valider un numéro de téléphone mobile (Togo)
   */
  validatePhoneNumber(phone: string): boolean {
    // Format accepté: +228XXXXXXXX ou 8 chiffres
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+228\d{8}|\d{8})$/.test(normalized);
  }

  /**
   * Normaliser un numéro de téléphone
   */
  normalizePhoneNumber(phone: string): string {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    if (normalized.startsWith('00228')) {
      normalized = '+228' + normalized.substring(5);
    } else if (normalized.startsWith('228') && !normalized.startsWith('+')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+') && normalized.length === 8) {
      normalized = '+228' + normalized;
    }
    
    return normalized;
  }

  /**
   * Formater le montant en FCFA
   */
  formatAmount(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  /**
   * Obtenir l'icône de la méthode de paiement
   */
  getPaymentMethodIcon(method: string): string {
    return method === 'tmoney' ? '💳' : '📱';
  }

  /**
   * Obtenir le nom de la méthode de paiement
   */
  getPaymentMethodName(method: string): string {
    return method === 'tmoney' ? 'T-Money' : 'Flooz';
  }
}

const paymentService = new PaymentService();

export default paymentService;
export { PaymentService };
