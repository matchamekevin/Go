-- Si la table n'existe pas déjà, la créer avec les données spécifiques SOTRAL
DO $$
BEGIN
    -- Recréer la table des produits de tickets si elle n'existe pas
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ticket_products'
    ) THEN
        CREATE TABLE ticket_products (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            price INTEGER NOT NULL, -- en FCFA
            rides INTEGER NOT NULL DEFAULT 1, -- nombre de trajets inclus
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insérer les produits SOTRAL selon les tarifs 2024/2025
        INSERT INTO ticket_products (id, name, code, price, rides, is_active) VALUES
        ('T100', 'Ticket unitaire 100 F', 'T100', 100, 1, true),
        ('T150', 'Ticket étudiant 150 F', 'T150', 150, 1, true),
        ('T200', 'Ticket unitaire 200 F', 'T200', 200, 1, true),
        ('T250', 'Ticket unitaire 250 F', 'T250', 250, 1, true),
        ('T300', 'Ticket unitaire 300 F', 'T300', 300, 1, true),
        ('CARNET10_100', 'Carnet 10 × 100 F', 'CARNET10_100', 1000, 10, true),
        ('CARNET10_150', 'Carnet 10 × 150 F (étudiant)', 'CARNET10_150', 1500, 10, true),
        ('CARNET10_200', 'Carnet 10 × 200 F', 'CARNET10_200', 2000, 10, true),
        ('CARNET10_250', 'Carnet 10 × 250 F', 'CARNET10_250', 2500, 10, true),
        ('CARNET10_300', 'Carnet 10 × 300 F', 'CARNET10_300', 3000, 10, true);
        
        RAISE NOTICE 'Table ticket_products créée avec les produits SOTRAL 2024/2025';
    ELSE
        -- Mise à jour des prix si nécessaire
        UPDATE ticket_products SET price = 100 WHERE code = 'T100' AND price <> 100;
        UPDATE ticket_products SET price = 150 WHERE code = 'T150' AND price <> 150;
        UPDATE ticket_products SET price = 200 WHERE code = 'T200' AND price <> 200;
        UPDATE ticket_products SET price = 250 WHERE code = 'T250' AND price <> 250;
        UPDATE ticket_products SET price = 300 WHERE code = 'T300' AND price <> 300;
        
        -- Ajouter les produits manquants
        INSERT INTO ticket_products (id, name, code, price, rides, is_active)
        VALUES
            ('T100', 'Ticket unitaire 100 F', 'T100', 100, 1, true),
            ('T150', 'Ticket étudiant 150 F', 'T150', 150, 1, true),
            ('T200', 'Ticket unitaire 200 F', 'T200', 200, 1, true),
            ('T250', 'Ticket unitaire 250 F', 'T250', 250, 1, true),
            ('T300', 'Ticket unitaire 300 F', 'T300', 300, 1, true),
            ('CARNET10_100', 'Carnet 10 × 100 F', 'CARNET10_100', 1000, 10, true),
            ('CARNET10_150', 'Carnet 10 × 150 F (étudiant)', 'CARNET10_150', 1500, 10, true),
            ('CARNET10_200', 'Carnet 10 × 200 F', 'CARNET10_200', 2000, 10, true),
            ('CARNET10_250', 'Carnet 10 × 250 F', 'CARNET10_250', 2500, 10, true),
            ('CARNET10_300', 'Carnet 10 × 300 F', 'CARNET10_300', 3000, 10, true)
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Table ticket_products mise à jour avec les prix SOTRAL 2024/2025';
    END IF;
    
    -- Table des tickets
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets'
    ) THEN
        CREATE TABLE tickets (
            id VARCHAR(60) PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            product_code VARCHAR(50) NOT NULL REFERENCES ticket_products(code),
            code VARCHAR(100) UNIQUE NOT NULL, -- code à valider/scanner
            status VARCHAR(20) DEFAULT 'unused', -- unused | used | expired
            purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            used_at TIMESTAMP,
            purchase_method VARCHAR(20), -- mobile_money | cash | card | ussd
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Index pour recherches courantes
        CREATE INDEX idx_tickets_user ON tickets(user_id);
        CREATE INDEX idx_tickets_status ON tickets(status);
        CREATE INDEX idx_tickets_code ON tickets(code);
        
        RAISE NOTICE 'Table tickets créée avec succès';
    END IF;
    
    -- Table des validations de tickets (pour audit et statistiques)
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ticket_validations'
    ) THEN
        CREATE TABLE ticket_validations (
            id VARCHAR(60) PRIMARY KEY,
            ticket_id VARCHAR(60) REFERENCES tickets(id),
            validator_id INTEGER REFERENCES users(id),
            validation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            bus_line_id VARCHAR(50), -- référence optionnelle à la ligne de bus
            location_lat FLOAT,
            location_lng FLOAT,
            device_id VARCHAR(100),
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_validations_ticket ON ticket_validations(ticket_id);
        CREATE INDEX idx_validations_validator ON ticket_validations(validator_id);
        
        RAISE NOTICE 'Table ticket_validations créée avec succès';
    END IF;
END $$;
