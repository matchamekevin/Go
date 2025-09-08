import pool from '../../shared/database/client';
import { Payment } from './Payment.model';

export const PaymentRepository = {
  // Placeholder repository - implement payment database operations here
  async findById(id: number): Promise<Payment | null> {
    // Implementation needed
    return null;
  },

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    // Implementation needed
    throw new Error('Payment creation not yet implemented');
  },

  // Enregistrements des reçus de paiement pour idempotence des webhooks
  async ensureReceiptTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_receipts (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(150) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(20) DEFAULT 'FCFA',
        status VARCHAR(20) NOT NULL,
        meta JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_payment_receipts_external ON payment_receipts(external_id);
      `);
  },

  async findReceiptByExternalId(externalId: string) {
    await this.ensureReceiptTable();
    const res = await pool.query('SELECT * FROM payment_receipts WHERE external_id = $1 LIMIT 1', [externalId]);
    return res.rows[0] || null;
  },

  async createReceipt(data: { external_id: string; user_id: number; amount: number; currency?: string; status: string; meta?: any }) {
    await this.ensureReceiptTable();
    const res = await pool.query(
      `INSERT INTO payment_receipts (external_id, user_id, amount, currency, status, meta)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (external_id) DO NOTHING
       RETURNING *`,
      [data.external_id, data.user_id, data.amount, data.currency || 'FCFA', data.status, data.meta || {}]
    );
    if (res.rows[0]) return res.rows[0];
    // Si conflit, renvoyer l’existant
    const existing = await this.findReceiptByExternalId(data.external_id);
    return existing;
  }
};