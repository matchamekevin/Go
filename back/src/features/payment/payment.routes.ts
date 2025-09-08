import { Router } from 'express';
import { PaymentController } from './Payment.controller';

const router = Router();

// Webhook de validation paiement (appelé par le PSP)
router.post('/webhook', PaymentController.webhook);

// Endpoint optionnel pour vérifier un reçu par id externe (dev/test)
router.get('/receipts/:externalId', PaymentController.getReceiptByExternalId);

export default router;