import { Router } from "express";
import { PaymentController } from "./Payment.controller";
import { authMiddleware } from "../../shared/midddleawers/auth.middleware";

const router = Router();

// Initialisation du paiement CinetPay (protégée par JWT)
router.post("/init", authMiddleware, PaymentController.initCinetPay);

// Webhook de validation paiement (appelé par le PSP)
router.post("/webhook", PaymentController.webhook);

// Endpoint optionnel pour vérifier un reçu par id externe (dev/test)
router.get("/receipts/:externalId", PaymentController.getReceiptByExternalId);

export default router;
