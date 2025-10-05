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
      console.log(
        "[PaymentController.webhook] DÉBUT - Données reçues:",
        JSON.stringify(req.body, null, 2),
      );
      console.log(
        "[PaymentController.webhook] Headers:",
        JSON.stringify(req.headers, null, 2),
      );

      // Sécurité: vérifier la signature HMAC si disponible
      const secret = Config.pspWebhookSecret;
      const signature = req.headers["x-psp-signature"] as string | undefined;
      if (secret) {
        if (!signature) {
          console.log("[PaymentController.webhook] Signature manquante !");
          return res
            .status(401)
            .json({ success: false, error: "Missing signature" });
        }
        const payload = JSON.stringify(req.body || {});
        const expected = crypto
          .createHmac("sha256", secret)
          .update(payload)
          .digest("hex");
        if (signature !== expected) {
          console.log("[PaymentController.webhook] Signature invalide !");
          return res
            .status(401)
            .json({ success: false, error: "Invalid signature" });
        }
      }
      // Mapping CinetPay -> interne
      const external_id = req.body.external_id || req.body.cpm_trans_id;
      const amount = Number(req.body.amount || req.body.cpm_amount);
      const currency = req.body.currency || req.body.cpm_currency;
      const status =
        req.body.status ||
        (req.body.cpm_error_message === "SUCCES" ? "completed" : "failed");

      console.log("[PaymentController.webhook] Mapping CinetPay:", {
        external_id,
        amount,
        currency,
        status,
      });

      if (!external_id || typeof amount !== "number" || isNaN(amount)) {
        console.log("[PaymentController.webhook] Champs requis manquants !", {
          external_id,
          amount,
        });
        return res
          .status(400)
          .json({ success: false, error: "Champs requis manquants" });
      }

      // Retrouver la pré-commande (receipt) via external_id
      const receipt =
        await PaymentRepository.findReceiptByExternalId(external_id);
      if (!receipt) {
        console.log(
          "[PaymentController.webhook] Reçu de paiement introuvable pour external_id:",
          external_id,
        );
        return res
          .status(404)
          .json({ success: false, error: "Reçu de paiement introuvable" });
      }

      // Vérifier idempotence (ne pas retraiter un webhook déjà vu)
      if (receipt.status === "completed") {
        console.log(
          "[PaymentController.webhook] Webhook déjà traité pour external_id:",
          external_id,
        );
        return res
          .status(200)
          .json({ success: true, data: { alreadyProcessed: true } });
      }

      // Mettre à jour le reçu de paiement
      console.log(
        "[PaymentController.webhook] Mise à jour du reçu de paiement pour external_id:",
        external_id,
        "avec status:",
        status,
      );
      await PaymentRepository.createReceipt({
        external_id,
        user_id: receipt.user_id,
        amount,
        currency: currency || "FCFA",
        status: status || "completed",
        meta: receipt.meta || {},
      });
      console.log("[PaymentController.webhook] Reçu de paiement mis à jour !");

      // Assigner les tickets disponibles à l'utilisateur (au lieu d'en créer de nouveaux)
      let generated: any[] = [];
      if ((status || "completed") === "completed") {
        const { product_code, line_id, quantity } = receipt.meta || {};
        const qty = Math.max(1, parseInt(String(quantity || 1), 10));

        console.log("[PaymentController.webhook] Receipt meta:", receipt.meta);
        console.log("[PaymentController.webhook] Paramètres extraction:");
        console.log("  - product_code:", product_code);
        console.log("  - line_id:", line_id, "type:", typeof line_id);
        console.log("  - quantity:", quantity, "-> qty:", qty);
        console.log(
          "  - user_id:",
          receipt.user_id,
          "type:",
          typeof receipt.user_id,
        );

        try {
          console.log(
            "[PaymentController.webhook] Appel assignAvailableTickets avec:",
          );
          console.log("  - line_id (Number):", Number(line_id));
          console.log("  - user_id (Number):", Number(receipt.user_id));
          console.log("  - quantity:", qty);
          console.log("  - product_code:", product_code);

          // Assigner les tickets existants disponibles à l'utilisateur
          const assignedTickets = await TicketRepository.assignAvailableTickets(
            Number(line_id),
            Number(receipt.user_id),
            qty,
            external_id,
          );

          generated = assignedTickets;

          console.log(
            `[PaymentController.webhook] SUCCESS: ${assignedTickets.length} tickets assignés à l'utilisateur ${receipt.user_id}`,
          );
          console.log(
            "[PaymentController.webhook] Tickets assignés détails:",
            assignedTickets,
          );
        } catch (error) {
          console.error(
            "[PaymentController.webhook] Erreur lors de l'assignation des tickets:",
            error,
          );
          throw new Error(
            `Impossible d'assigner les tickets: ${(error as Error).message}`,
          );
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

      // Construire les URLs de callback automatiquement si non fournies
      const baseUrl = Config.baseUrl || "http://localhost:3000";
      const finalReturnUrl = return_url || `${baseUrl}/api/payment/return`;
      const finalNotifyUrl = notify_url || `${baseUrl}/api/payment/webhook`;

      const payload = {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id,
        amount,
        currency: currency || "XOF",
        description: description || "Achat ticket GoSOTRAL",
        return_url: finalReturnUrl,
        notify_url: finalNotifyUrl,
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

  // Endpoint de retour après paiement CinetPay (return_url)
  static async paymentReturn(req: Request, res: Response) {
    try {
      const { transaction_id, token } = req.query;

      console.log("[PaymentController.paymentReturn] Paramètres reçus:", {
        transaction_id,
        token,
        query: req.query,
      });

      if (!transaction_id) {
        return res.status(400).json({
          success: false,
          error: "ID de transaction manquant",
        });
      }

      // Récupérer le reçu de paiement
      const receipt = await PaymentRepository.findReceiptByExternalId(
        transaction_id as string,
      );

      if (!receipt) {
        return res.status(404).json({
          success: false,
          error: "Transaction non trouvée",
        });
      }

      // Vérifier le statut du paiement via l'API CinetPay
      const API_KEY = Config.cinetpay.apiKey;
      const SITE_ID = Config.cinetpay.siteId;
      const checkUrl = "https://api-checkout.cinetpay.com/v2/payment/check";

      const checkPayload = {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id: transaction_id as string,
      };

      const checkResponse = await axios.post(checkUrl, checkPayload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log(
        "[PaymentController.paymentReturn] Réponse CinetPay:",
        checkResponse.data,
      );

      const paymentData = checkResponse.data.data;
      const isSuccess =
        checkResponse.data.code === "00" && paymentData?.status === "ACCEPTED";

      // Retourner une réponse JSON avec le statut
      return res.json({
        success: true,
        data: {
          transaction_id,
          status: isSuccess ? "success" : "failed",
          amount: paymentData?.amount || receipt.amount,
          currency: paymentData?.currency || receipt.currency,
          message: isSuccess
            ? "Paiement réussi! Vos tickets ont été assignés."
            : "Paiement échoué ou en attente.",
          receipt_status: receipt.status,
          cinetpay_status: paymentData?.status || "UNKNOWN",
        },
      });
    } catch (error) {
      console.error("[PaymentController.paymentReturn] Erreur:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la vérification du paiement",
      });
    }
  }

  // Endpoint pour vérifier le statut d'un paiement
  static async checkPaymentStatus(req: Request, res: Response) {
    try {
      const { transaction_id } = req.params;

      if (!transaction_id) {
        return res.status(400).json({
          success: false,
          error: "ID de transaction requis",
        });
      }

      // Récupérer le reçu de paiement depuis notre base
      const receipt =
        await PaymentRepository.findReceiptByExternalId(transaction_id);

      if (!receipt) {
        return res.status(404).json({
          success: false,
          error: "Transaction non trouvée",
        });
      }

      // Vérifier le statut actuel via l'API CinetPay
      const API_KEY = Config.cinetpay.apiKey;
      const SITE_ID = Config.cinetpay.siteId;
      const checkUrl = "https://api-checkout.cinetpay.com/v2/payment/check";

      const checkPayload = {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id: transaction_id,
      };

      let cinetpayStatus = null;
      try {
        const checkResponse = await axios.post(checkUrl, checkPayload, {
          headers: { "Content-Type": "application/json" },
        });
        cinetpayStatus = checkResponse.data;
      } catch (apiError) {
        console.warn(
          "[PaymentController.checkPaymentStatus] Erreur API CinetPay:",
          apiError,
        );
      }

      // Récupérer les tickets associés si le paiement est complété
      let tickets = [];
      if (receipt.status === "completed") {
        try {
          const ticketResults =
            await TicketRepository.getTicketsByExternalId(transaction_id);
          tickets = ticketResults;
        } catch (ticketError) {
          console.warn(
            "[PaymentController.checkPaymentStatus] Erreur récupération tickets:",
            ticketError,
          );
        }
      }

      return res.json({
        success: true,
        data: {
          transaction_id,
          local_status: receipt.status,
          amount: receipt.amount,
          currency: receipt.currency,
          user_id: receipt.user_id,
          meta: receipt.meta,
          created_at: receipt.created_at,
          cinetpay_status: cinetpayStatus?.data?.status || null,
          cinetpay_code: cinetpayStatus?.code || null,
          tickets_count: tickets.length,
          tickets: tickets,
        },
      });
    } catch (error) {
      console.error("[PaymentController.checkPaymentStatus] Erreur:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la vérification du statut",
      });
    }
  }
}
