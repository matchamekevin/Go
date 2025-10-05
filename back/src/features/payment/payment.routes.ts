import { Router } from "express";
import { PaymentController } from "./Payment.controller";
import { authMiddleware } from "../../shared/midddleawers/auth.middleware";

const router = Router();

// Initialisation du paiement CinetPay (protégée par JWT)
router.post("/init", authMiddleware, PaymentController.initCinetPay);

// Endpoint de retour après paiement CinetPay (return_url)
router.get("/return", PaymentController.paymentReturn);

// Webhook de validation paiement (appelé par le PSP)
router.post("/webhook", PaymentController.webhook);

// Endpoint pour vérifier le statut d'un paiement
router.get("/status/:transaction_id", PaymentController.checkPaymentStatus);

// Endpoint optionnel pour vérifier un reçu par id externe (dev/test)
router.get("/receipts/:externalId", PaymentController.getReceiptByExternalId);

// Endpoint de test pour simuler un webhook (dev/test uniquement)
router.post("/webhook/test", async (req, res) => {
  try {
    console.log("[TEST WEBHOOK] Simulation d'un webhook CinetPay");

    // Données de test simulant un paiement réussi
    const testWebhookData = {
      external_id: req.body.external_id || "TEST-WEBHOOK-" + Date.now(),
      amount: req.body.amount || 100,
      currency: req.body.currency || "XOF",
      status: req.body.status || "completed",
      ...req.body,
    };

    console.log("[TEST WEBHOOK] Données simulées:", testWebhookData);

    // Appeler le vrai webhook avec les données de test
    const webhookReq = {
      ...req,
      body: testWebhookData,
      headers: { ...req.headers },
    };

    await PaymentController.webhook(webhookReq as any, res);
  } catch (error) {
    console.error("[TEST WEBHOOK] Erreur:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
