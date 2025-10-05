// Définir la DATABASE_URL avant tout import
process.env.DATABASE_URL = "postgresql://gosotral_user:Ps33lqNo85kEjLVgosFFxcWsCsnt3z3W@dpg-d305h0mr433s73euqgfg-a.oregon-postgres.render.com:5432/gosotral_db";

import { PaymentController } from './src/features/payments/payment.controller';

// Test script pour les paiements
async function testPayments() {
  console.log('🧪 Test des endpoints de paiement...\n');

  const controller = new PaymentController();

  // Simuler une requête pour initier un paiement
  const mockReq = {
    body: {
      ticket_id: 1,
      payment_method: 'mixx',
      phone_number: '+22890123456',
      amount: 500
    }
  };

  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => {
        console.log(`📤 Response ${code}:`, JSON.stringify(data, null, 2));
        return mockRes;
      }
    }),
    json: (data: any) => {
      console.log(`📤 Response:`, JSON.stringify(data, null, 2));
      return mockRes;
    }
  };

  try {
    console.log('1️⃣ Test initiation paiement...');
    await controller.initiatePayment(mockReq as any, mockRes as any);

    console.log('\n2️⃣ Test vérification statut paiement...');
    const mockReqStatus = {
      params: {
        paymentRef: 'PAY_test_ref'
      }
    };
    await controller.checkPaymentStatus(mockReqStatus as any, mockRes as any);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testPayments().catch(console.error);