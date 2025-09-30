import { Request, Response } from 'express';
import pool from '../../shared/database/client';

export class PaymentController {
  /**
   * Initier un paiement mobile
   */
  async initiatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { ticket_id, payment_method, phone_number, amount } = req.body;

      console.log(`[PaymentController] Initiation paiement ${payment_method} pour ticket ${ticket_id}`);

      // Validation des données
      if (!ticket_id || !payment_method || !phone_number || !amount) {
        res.status(400).json({
          success: false,
          error: 'Données de paiement incomplètes'
        });
        return;
      }

      if (!['mixx', 'flooz'].includes(payment_method)) {
        res.status(400).json({
          success: false,
          error: 'Méthode de paiement non supportée'
        });
        return;
      }

      // Vérifier que le ticket existe et est disponible
      const ticketQuery = `
        SELECT id, ticket_code, status, price_paid_fcfa
        FROM sotral_tickets
        WHERE id = $1 AND status = 'active'
      `;
      const ticketResult = await pool.query(ticketQuery, [ticket_id]);

      if (ticketResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Ticket non trouvé ou non disponible'
        });
        return;
      }

      const ticket = ticketResult.rows[0];

      // Vérifier que le montant correspond
      if (ticket.price_paid_fcfa !== amount) {
        res.status(400).json({
          success: false,
          error: 'Montant incorrect'
        });
        return;
      }

      // Générer une référence de paiement unique
      const paymentRef = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Créer l'entrée de paiement en attente
      const insertPaymentQuery = `
        INSERT INTO sotral_payments (
          payment_ref,
          ticket_id,
          payment_method,
          phone_number,
          amount,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
      `;

      await pool.query(insertPaymentQuery, [
        paymentRef,
        ticket_id,
        payment_method,
        phone_number,
        amount
      ]);

      console.log(`[PaymentController] Paiement initié avec référence ${paymentRef}`);

      // Simuler l'appel à l'API de paiement mobile
      // En production, ceci serait remplacé par des appels réels aux APIs Mixx/Flooz
      const paymentResponse = await this.simulateMobilePaymentAPI(payment_method, phone_number, amount, paymentRef);

      res.json({
        success: true,
        data: {
          payment_ref: paymentRef,
          status: 'pending',
          payment_url: paymentResponse.payment_url
        }
      });
    } catch (error: any) {
      console.error('[PaymentController] Erreur initiation paiement:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentRef } = req.params;

      console.log(`[PaymentController] Vérification statut paiement ${paymentRef}`);

      // Récupérer les informations de paiement
      const paymentQuery = `
        SELECT p.*, t.ticket_code, t.price_paid_fcfa, t.status as ticket_status
        FROM sotral_payments p
        LEFT JOIN sotral_tickets t ON p.ticket_id = t.id
        WHERE p.payment_ref = $1
      `;
      const paymentResult = await pool.query(paymentQuery, [paymentRef]);

      if (paymentResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Paiement non trouvé'
        });
        return;
      }

      const payment = paymentResult.rows[0];

      // Simuler la vérification du statut auprès du provider de paiement
      // En production, ceci vérifierait le vrai statut via l'API du provider
      const currentStatus = await this.simulatePaymentStatusCheck(paymentRef, payment.status);

      // Mettre à jour le statut si nécessaire
      if (currentStatus !== payment.status) {
        const updateQuery = `
          UPDATE sotral_payments
          SET status = $1, updated_at = NOW()
          WHERE payment_ref = $2
        `;
        await pool.query(updateQuery, [currentStatus, paymentRef]);

        // Si le paiement est réussi, mettre à jour le ticket
        if (currentStatus === 'completed') {
          await this.completeTicketPurchase(payment.ticket_id, paymentRef);
        }
      }

      // Récupérer le ticket mis à jour si le paiement est réussi
      let ticket = null;
      if (currentStatus === 'completed') {
        const ticketQuery = `
          SELECT * FROM sotral_tickets WHERE id = $1
        `;
        const ticketResult = await pool.query(ticketQuery, [payment.ticket_id]);
        ticket = ticketResult.rows[0];
      }

      const response: {
        success: true;
        data: {
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          ticket?: any;
        };
      } = {
        success: true,
        data: {
          status: currentStatus,
          ticket: ticket
        }
      };

      res.json(response);
    } catch (error: any) {
      console.error('[PaymentController] Erreur vérification paiement:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Simuler l'appel à l'API de paiement mobile (remplacer par appels réels en production)
   */
  private async simulateMobilePaymentAPI(
    method: string,
    phoneNumber: string,
    amount: number,
    paymentRef: string
  ): Promise<{ payment_url?: string }> {
    console.log(`[PaymentController] Simulation API ${method} pour ${phoneNumber}, montant: ${amount} FCFA`);

    // Simulation d'un appel API
    // En production, intégrer avec les vraies APIs:
    // - Mixx by YAS: https://api.yas.tg/payments/initiate
    // - Flooz: https://api.flooz.tg/payments/initiate

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler latence réseau

    // Simuler succès 80% du temps pour les tests
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      return {
        payment_url: `https://payment.${method}.tg/pay/${paymentRef}`
      };
    } else {
      throw new Error(`Erreur API ${method}`);
    }
  }

  /**
   * Simuler la vérification du statut de paiement
   */
  private async simulatePaymentStatusCheck(
    paymentRef: string,
    currentStatus: string
  ): Promise<'pending' | 'completed' | 'failed' | 'cancelled'> {
    console.log(`[PaymentController] Simulation vérification statut ${paymentRef}`);

    // En production, appeler l'API du provider pour vérifier le vrai statut
    await new Promise(resolve => setTimeout(resolve, 500));

    // Logique de simulation pour les tests
    if (currentStatus === 'completed') {
      return 'completed';
    }

    // Simuler progression: pending -> completed (70%), failed (20%), cancelled (10%)
    const random = Math.random();
    if (random < 0.7) {
      return 'completed';
    } else if (random < 0.9) {
      return 'failed';
    } else {
      return 'cancelled';
    }
  }

  /**
   * Finaliser l'achat du ticket après paiement réussi
   */
  private async completeTicketPurchase(ticketId: number, paymentRef: string): Promise<void> {
    console.log(`[PaymentController] Finalisation achat ticket ${ticketId} avec paiement ${paymentRef}`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mettre à jour le statut du ticket
      const updateTicketQuery = `
        UPDATE sotral_tickets
        SET
          status = 'used',
          payment_method = 'mobile_money',
          payment_reference = $2,
          updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateTicketQuery, [ticketId, paymentRef]);

      // Mettre à jour le paiement
      const updatePaymentQuery = `
        UPDATE sotral_payments
        SET status = 'completed', updated_at = NOW()
        WHERE payment_ref = $1
      `;
      await client.query(updatePaymentQuery, [paymentRef]);

      await client.query('COMMIT');
      console.log(`[PaymentController] Ticket ${ticketId} acheté avec succès`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[PaymentController] Erreur finalisation achat:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}