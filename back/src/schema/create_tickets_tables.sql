-- Tables pour la gestion des tickets urbains SOTRAL

-- Produits de tickets (optionnel: on peut aussi servir depuis le code)
CREATE TABLE IF NOT EXISTS ticket_products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    price INTEGER NOT NULL, -- en FCFA
    rides INTEGER NOT NULL DEFAULT 1, -- nombre de trajets inclus
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets détenus par les utilisateurs (un enregistrement par trajet utilisable)
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(60) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_code VARCHAR(50) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL, -- code à valider/scanner
    status VARCHAR(20) DEFAULT 'unused', -- unused | used | expired
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    purchase_method VARCHAR(20), -- mobile_money | cash | card | ussd
    metadata JSONB
);

-- Index pour recherches courantes
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Seed des vrais produits SOTRAL selon tarifs 2024
INSERT INTO ticket_products (id, name, code, price, rides)
VALUES
('T100', 'Ticket unitaire 100 F', 'T100', 100, 1),
('T150', 'Ticket unitaire 150 F (étudiant)', 'T150', 150, 1),
('T200', 'Ticket unitaire 200 F', 'T200', 200, 1),
('T250', 'Ticket unitaire 250 F', 'T250', 250, 1),
('T300', 'Ticket unitaire 300 F', 'T300', 300, 1),
('CARNET10_100', 'Carnet 10 x 100 F', 'CARNET10_100', 1000, 10),
('CARNET10_150', 'Carnet 10 x 150 F (étudiant)', 'CARNET10_150', 1500, 10),
('CARNET10_200', 'Carnet 10 x 200 F', 'CARNET10_200', 2000, 10),
('CARNET10_250', 'Carnet 10 x 250 F', 'CARNET10_250', 2500, 10),
('CARNET10_300', 'Carnet 10 x 300 F', 'CARNET10_300', 3000, 10)
ON CONFLICT (id) DO NOTHING;
