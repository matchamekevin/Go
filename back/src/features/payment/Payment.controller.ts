import { Request, Response } from 'express';
import { PaymentRepository } from './Payment.repository';
import crypto from 'crypto';
import { Config } from '../../enviroment/env.config';
import { TicketRepository } from '../tickets/Ticket.repository';

export class PaymentController {
  /**
   * Webhook de validation de paiement.
   * Contrat d'entrée attendu (body JSON):
   * {
   *   external_id: string,      // id de transaction PSP (idempotence)
   *   user_id: number,          // utilisateur concerné
   *   product_code: string,     // produit (ex: T100, CARNET10_200)
   *   route_code?: string,      // trajet choisi
   *   quantity?: number,        // nombre de tickets à générer (par défaut 1)
   *   amount: number,           // montant payé
   *   currency?: string,        // FCFA par défaut
   *   status: 'completed'|'failed'|'pending',
   *   meta?: object             // payload additionnel brut du PSP
   * }
   */
  static async webhook(req: Request, res: Response) {
    try {
      // Sécurité: vérifier la signature HMAC si disponible
      const secret = Config.pspWebhookSecret;
      const signature = req.headers['x-psp-signature'] as string | undefined;
      if (secret) {
        if (!signature) return res.status(401).json({ success: false, error: 'Missing signature' });
        const payload = JSON.stringify(req.body || {});
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        if (signature !== expected) return res.status(401).json({ success: false, error: 'Invalid signature' });
      }
      const {
        external_id,
        user_id,
        product_code,
        route_code,
        quantity,
        amount,
        currency,
        status,
        meta
      } = req.body || {};

      if (!external_id || !user_id || !product_code || typeof amount !== 'number') {
        return res.status(400).json({ success: false, error: 'Champs requis manquants' });
      }

      // Vérifier idempotence (ne pas retraiter un webhook déjà vu)
      const existing = await PaymentRepository.findReceiptByExternalId(external_id);
      if (existing) {
        return res.status(200).json({ success: true, data: { alreadyProcessed: true } });
      }

      // Enregistrer le reçu de paiement
      const receipt = await PaymentRepository.createReceipt({
        external_id,
        user_id,
        amount,
        currency: currency || 'FCFA',
        status: status || 'completed',
        meta: meta || {}
      });

      // Si paiement validé, générer les tickets
      let generated: any[] = [];
      if ((status || 'completed') === 'completed') {
        const qty = Math.max(1, parseInt(String(quantity || 1), 10));
        for (let i = 0; i < qty; i++) {
          const t = await TicketRepository.createTicket({
            user_id: Number(user_id),
            product_code,
            route_code: route_code || null,
            status: 'unused',
            purchase_method: 'mobile_money',
            metadata: { receipt_external_id: external_id }
          });
          // Générer un payload QR (léger) et le stocker dans metadata
          const qrPayload = {
            type: 'ticket',
            code: t.code,
            user_id: t.user_id,
            product_code: t.product_code,
            route_code: t.route_code || null,
            issued_at: t.purchased_at
          };
          await TicketRepository.updateTicketMetadataMerge(String(t.code), { qr: qrPayload });
          generated.push(t);
        }
      }

      return res.status(200).json({ success: true, data: { receipt, tickets: generated } });
    } catch (error) {
      console.error('[PaymentController.webhook] error:', error);
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static async getReceiptByExternalId(req: Request, res: Response) {
    try {
      const { externalId } = req.params;
      const receipt = await PaymentRepository.findReceiptByExternalId(externalId);
      if (!receipt) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: receipt });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}