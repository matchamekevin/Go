import { Request, Response } from "express";
import { PaymentRepository } from "./Payment.repository";
import crypto from "crypto";
import { Config } from "../../enviroment/env.config";
import { TicketRepository } from "../tickets/Ticket.repository";
import axios from "axios";

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
      const signature = req.headers["x-psp-signature"] as string | undefined;
      if (secret) {
        if (!signature)
          return res
            .status(401)
            .json({ success: false, error: "Missing signature" });
        const payload = JSON.stringify(req.body || {});
        const expected = crypto
          .createHmac("sha256", secret)
          .update(payload)
          .digest("hex");
        if (signature !== expected)
          return res
            .status(401)
            .json({ success: false, error: "Invalid signature" });
      }
      const { external_id, amount, currency, status } = req.body || {};

      if (!external_id || typeof amount !== "number") {
        return res
          .status(400)
          .json({ success: false, error: "Champs requis manquants" });
      }

      // Retrouver la pré-commande (receipt) via external_id
      const receipt =
        await PaymentRepository.findReceiptByExternalId(external_id);
      if (!receipt) {
        return res
          .status(404)
          .json({ success: false, error: "Reçu de paiement introuvable" });
      }

      // Vérifier idempotence (ne pas retraiter un webhook déjà vu)
      if (receipt.status === "completed") {
        return res
          .status(200)
          .json({ success: true, data: { alreadyProcessed: true } });
      }

      // Mettre à jour le reçu de paiement
      await PaymentRepository.createReceipt({
        external_id,
        user_id: receipt.user_id,
        amount,
        currency: currency || "FCFA",
        status: status || "completed",
        meta: receipt.meta || {},
      });

      // Générer les tickets à partir des infos meta de la pré-commande
      let generated: any[] = [];
      if ((status || "completed") === "completed") {
        const { product_code, line_id, quantity } = receipt.meta || {};
        const qty = Math.max(1, parseInt(String(quantity || 1), 10));
        for (let i = 0; i < qty; i++) {
          const t = await TicketRepository.createTicket({
            user_id: Number(receipt.user_id),
            product_code,
            line_id: line_id || null,
            status: "unused",
            purchase_method: "mobile_money",
            metadata: { receipt_external_id: external_id },
          });
          // Générer un payload QR (léger) et le stocker dans metadata
          const qrPayload = {
            type: "ticket",
            code: t.code,
            user_id: t.user_id,
            product_code: t.product_code,
            line_id: t.line_id || null,
            issued_at: t.purchased_at,
          };
          await TicketRepository.updateTicketMetadataMerge(String(t.code), {
            qr: qrPayload,
          });
          generated.push(t);
        }
      }

      return res
        .status(200)
        .json({ success: true, data: { receipt, tickets: generated } });
    } catch (error) {
      console.error("[PaymentController.webhook] error:", error);
      return res
        .status(500)
        .json({ success: false, error: (error as Error).message });
    }
  }

  static async getReceiptByExternalId(req: Request, res: Response) {
    try {
      const { externalId } = req.params;
      const receipt =
        await PaymentRepository.findReceiptByExternalId(externalId);
      if (!receipt)
        return res.status(404).json({ success: false, error: "Not found" });
      return res.json({ success: true, data: receipt });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: (error as Error).message });
    }
  }

  // Initialisation du paiement CinetPay
  static async initCinetPay(req: Request, res: Response) {
    try {
      const {
        amount,
        currency,
        description,
        return_url,
        notify_url,
        product_code,
        line_id,
        quantity,
      } = req.body;

      // Debug: vérifier la valeur reçue
      console.log(
        "[PaymentController.initCinetPay] line_id reçu:",
        line_id,
        "type:",
        typeof line_id,
      );

      // Contrôle strict AVANT toute requête SQL
      if (!line_id || isNaN(Number(line_id)) || Number(line_id) <= 0) {
        console.log(
          "[PaymentController.initCinetPay] line_id invalide, envoi d'erreur",
        );
        return res.status(400).json({
          success: false,
          error:
            "Ligne invalide ou manquante (line_id doit être un entier positif)",
        });
      }

      // Extraire les infos du user depuis le token (middleware)
      const user = (req as any).user;
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "Utilisateur non authentifié" });
      }

      // Vérifier que le produit existe
      const product = await TicketRepository.getProductByCode(product_code);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: "Produit de ticket non trouvé" });
      }

      // Vérifier que le trajet existe s'il est spécifié
      // Vérification que line_id est bien fourni et est un nombre
      if (!line_id || isNaN(Number(line_id))) {
        return res.status(400).json({
          success: false,
          error: "Ligne invalide ou manquante",
        });
      }
      let line = null;
      line = await TicketRepository.getLineById(Number(line_id));
      if (!line) {
        return res
          .status(404)
          .json({ success: false, error: "Ligne non trouvée" });
      }
      // Vérification de la disponibilité
      const available = await TicketRepository.countAvailableTickets(
        Number(line_id),
      );
      if (available < (quantity || 1)) {
        return res.status(400).json({
          success: false,
          error: "Pas assez de tickets disponibles pour cette ligne",
        });
      }

      const API_KEY = Config.cinetpay.apiKey;
      const SITE_ID = Config.cinetpay.siteId;
      const url = "https://api-checkout.cinetpay.com/v2/payment";
      const transaction_id =
        "TICKET-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

      // Enregistre la pré-commande dans payment_receipts
      await PaymentRepository.createReceipt({
        external_id: transaction_id,
        user_id: user.id,
        amount,
        currency: currency || "XOF",
        status: "pending",
        meta: {
          product_code,
          line_id,
          quantity,
        },
      });

      const payload = {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id,
        amount,
        currency: currency || "XOF",
        description: description || "Achat ticket GoSOTRAL",
        return_url,
        notify_url,
        customer_name: user.name || "",
        customer_surname: "",
        customer_email: user.email || "",
        customer_phone_number: user.phone || "",
        channels: "ALL",
        lang: "fr",
      };

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.code === "201") {
        return res.json({
          success: true,
          data: { payment_url: response.data.data.payment_url, transaction_id },
        });
      } else {
        return res
          .status(400)
          .json({ success: false, error: response.data.description });
      }
    } catch (error) {
      console.error("[PaymentController.initCinetPay] error:", error);
      return res
        .status(500)
        .json({ success: false, error: (error as Error).message });
    }
  }
}
