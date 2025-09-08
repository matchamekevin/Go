-- Ajout des tables manquantes pour mobile money et tickets virtuels

-- Table des paiements mobile money (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS mobile_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(60) REFERENCES tickets(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  provider TEXT NOT NULL CHECK (provider IN ('yass','flooz')),
  phone_number TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  external_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  failure_reason TEXT,
  webhook_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des configurations de paiement
CREATE TABLE IF NOT EXISTS payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('yass','flooz')),
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_sandbox BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes sur mobile_payments
CREATE INDEX IF NOT EXISTS idx_mobile_payments_status ON mobile_payments(status);
CREATE INDEX IF NOT EXISTS idx_mobile_payments_transaction_id ON mobile_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_mobile_payments_phone ON mobile_payments(phone_number);
CREATE INDEX IF NOT EXISTS idx_mobile_payments_provider ON mobile_payments(provider);

-- Configuration par défaut pour Yass et Flooz (sandbox)
INSERT INTO payment_configs (provider, api_key, api_secret, webhook_url, is_sandbox, active) VALUES
('yass', 'YASS_SANDBOX_KEY', 'YASS_SANDBOX_SECRET', 'https://api.gosotral.com/api/transport/payments/webhook', TRUE, TRUE),
('flooz', 'FLOOZ_SANDBOX_KEY', 'FLOOZ_SANDBOX_SECRET', 'https://api.gosotral.com/api/transport/payments/webhook', TRUE, TRUE)
ON CONFLICT DO NOTHING;
