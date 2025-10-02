-- Création de la table des paiements SOTRAL
CREATE TABLE IF NOT EXISTS sotral_payments (
    id SERIAL PRIMARY KEY,
    payment_ref VARCHAR(255) UNIQUE NOT NULL,
    ticket_id INTEGER NOT NULL REFERENCES sotral_tickets(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('mixx', 'flooz')),
    phone_number VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_sotral_payments_payment_ref ON sotral_payments(payment_ref);
CREATE INDEX IF NOT EXISTS idx_sotral_payments_ticket_id ON sotral_payments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sotral_payments_status ON sotral_payments(status);
CREATE INDEX IF NOT EXISTS idx_sotral_payments_created_at ON sotral_payments(created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_sotral_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sotral_payments_updated_at
    BEFORE UPDATE ON sotral_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_sotral_payments_updated_at();