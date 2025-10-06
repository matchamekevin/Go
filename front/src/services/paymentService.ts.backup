import { apiClient } from './apiClient';
import type { ApiResponse, PaymentWebhook } from '../types/api';

export class PaymentService {
  // Simuler un webhook de paiement (pour les tests)
  static async simulatePaymentWebhook(webhook: PaymentWebhook): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/payment/webhook', webhook);
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors du traitement du paiement');
    }
    return response.data;
  }

  // Récupérer un reçu de paiement par ID externe
  static async getReceiptByExternalId(externalId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/payment/receipts/${externalId}`);
    if (!response.success) {
      throw new Error(response.error || 'Reçu de paiement introuvable');
    }
    return response.data;
  }

  // Initier un paiement mobile money (simulation)
  static async initiateMobileMoneyPayment(amount: number, phone: string, operator: string = 'MTN'): Promise<{
    external_id: string;
    payment_url?: string;
    instructions: string;
  }> {
    // Génération d'un ID externe unique
    const external_id = `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulation d'une réponse de PSP
    return {
      external_id,
      payment_url: `https://psp.example.com/pay/${external_id}`,
      instructions: `Composer *123*${amount}*${external_id}# pour confirmer le paiement de ${amount} FCFA via ${operator}`
    };
  }

  // Vérifier le statut d'un paiement
  static async checkPaymentStatus(externalId: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    message: string;
  }> {
    try {
      const receipt = await this.getReceiptByExternalId(externalId);
      return {
        status: 'success',
        message: 'Paiement confirmé'
      };
    } catch (error) {
      // Si pas de reçu trouvé, le paiement est encore en attente ou a échoué
      return {
        status: 'pending',
        message: 'Paiement en cours de traitement'
      };
    }
  }
}
