-- Création du système complet SOTRAL
-- Basé sur les vraies données des lignes de transport urbain de Lomé

-- ==========================================
-- TABLES DE BASE POUR LE SYSTÈME SOTRAL
-- ==========================================

-- Table des catégories de lignes
CREATE TABLE IF NOT EXISTS sotral_line_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes SOTRAL
CREATE TABLE IF NOT EXISTS sotral_lines (
    id SERIAL PRIMARY KEY,
    line_number INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    route_from VARCHAR(100) NOT NULL,
    route_to VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES sotral_line_categories(id),
    distance_km DECIMAL(5,2),
    stops_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(line_number)
);

-- Table des arrêts
CREATE TABLE IF NOT EXISTS sotral_stops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    is_major_stop BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison lignes-arrêts
CREATE TABLE IF NOT EXISTS sotral_line_stops (
    id SERIAL PRIMARY KEY,
    line_id INTEGER REFERENCES sotral_lines(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES sotral_stops(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    direction VARCHAR(10) CHECK (direction IN ('aller', 'retour')) NOT NULL DEFAULT 'aller',
    travel_time_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(line_id, stop_id, direction, sequence_order)
);

-- Table des tarifs par distance
CREATE TABLE IF NOT EXISTS sotral_pricing_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(50) NOT NULL,
    max_distance_km DECIMAL(5,2),
    price_fcfa INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des types de tickets
CREATE TABLE IF NOT EXISTS sotral_ticket_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    price_fcfa INTEGER NOT NULL,
    validity_duration_hours INTEGER, -- NULL pour tickets simples
    max_trips INTEGER DEFAULT 1, -- pour carnets ou abonnements
    is_student_discount BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tickets achetés
CREATE TABLE IF NOT EXISTS sotral_tickets (
    id SERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ticket_type_id INTEGER REFERENCES sotral_ticket_types(id),
    line_id INTEGER REFERENCES sotral_lines(id) ON DELETE SET NULL,
    stop_from_id INTEGER REFERENCES sotral_stops(id) ON DELETE SET NULL,
    stop_to_id INTEGER REFERENCES sotral_stops(id) ON DELETE SET NULL,
    price_paid_fcfa INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'used', 'expired', 'cancelled')) DEFAULT 'active',
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    trips_remaining INTEGER DEFAULT 1,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des validations de tickets
CREATE TABLE IF NOT EXISTS sotral_ticket_validations (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES sotral_tickets(id) ON DELETE CASCADE,
    line_id INTEGER REFERENCES sotral_lines(id),
    stop_id INTEGER REFERENCES sotral_stops(id),
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validator_device_id VARCHAR(100),
    validation_method VARCHAR(20) CHECK (validation_method IN ('qr_scan', 'nfc', 'manual')) DEFAULT 'qr_scan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des horaires de passage
CREATE TABLE IF NOT EXISTS sotral_schedules (
    id SERIAL PRIMARY KEY,
    line_id INTEGER REFERENCES sotral_lines(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES sotral_stops(id) ON DELETE CASCADE,
    direction VARCHAR(10) CHECK (direction IN ('aller', 'retour')) NOT NULL,
    departure_time TIME NOT NULL,
    day_of_week INTEGER, -- 1=Lundi, 7=Dimanche, NULL pour tous les jours
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERTION DES DONNÉES DE BASE
-- ==========================================

-- Catégories de lignes
INSERT INTO sotral_line_categories (name, description) VALUES
('Lignes ordinaires', 'Lignes de transport ordinaire avec tarification par distance'),
('Lignes étudiantes', 'Lignes dédiées aux étudiants avec tarif préférentiel')
ON CONFLICT (name) DO NOTHING;

-- Zones tarifaires SOTRAL
INSERT INTO sotral_pricing_zones (zone_name, max_distance_km, price_fcfa) VALUES
('Zone 1', 5.0, 100),
('Zone 2', 10.0, 150),
('Zone 3', 15.0, 200),
('Zone 4', 20.0, 250),
('Zone 5', 999.0, 300)
ON CONFLICT DO NOTHING;

-- Types de tickets
INSERT INTO sotral_ticket_types (name, code, description, price_fcfa, validity_duration_hours, max_trips, is_student_discount) VALUES
('Ticket simple', 'SIMPLE', 'Ticket pour un trajet simple', 100, 2, 1, false),
('Ticket étudiant', 'STUDENT', 'Ticket étudiant pour un trajet', 100, 2, 1, true),
('Carnet 10 tickets étudiant', 'STUDENT_10', 'Carnet de 10 tickets étudiants', 1000, 168, 10, true),
('Abonnement étudiant annuel', 'STUDENT_YEARLY', 'Abonnement illimité pour étudiants', 6500, 8760, 999999, true)
ON CONFLICT (code) DO NOTHING;

-- Lignes SOTRAL (données réelles fournies par l'utilisateur)
INSERT INTO sotral_lines (line_number, name, route_from, route_to, category_id, distance_km, stops_count) VALUES
-- Lignes ordinaires (tarifs multiples selon distance)
(1, 'Zanguéra ↔ BIA (Centre-ville)', 'Zanguéra', 'BIA (Centre-ville)', 1, 19.468, 7),
(2, 'Adétikopé ↔ REX (front de mer)', 'Adétikopé', 'REX (front de mer)', 1, 24.562, 8),
(3, 'Akato ↔ BIA', 'Akato', 'BIA', 1, 19.268, 9),
(6, 'Agoè-Assiyéyé ↔ BIA', 'Agoè-Assiyéyé', 'BIA', 1, 16.360, 10),
(7, 'Kpogan ↔ BIA', 'Kpogan', 'BIA', 1, 19.758, 11),
(8, 'Djagblé ↔ REX', 'Djagblé', 'REX', 1, 18.949, 12),
(10, 'Legbassito ↔ BIA', 'Legbassito', 'BIA', 1, 24.274, 13),
(11, 'Attiegouvi ↔ REX', 'Attiegouvi', 'REX', 1, 9.543, 14),
(12, 'Entreprise de l''Union ↔ BIA', 'Entreprise de l''Union', 'BIA', 1, 15.366, 15),
-- Lignes étudiantes (tarif unique 100 FCFA)
(13, 'Adétikopé ↔ Campus (Université)', 'Adétikopé', 'Campus (Université)', 2, 17.851, 16),
(14, 'Legbassito ↔ Campus', 'Legbassito', 'Campus', 2, 17.338, 17),
(15, 'Zanguéra ↔ Campus', 'Zanguéra', 'Campus', 2, 13.264, 18),
(16, 'Akato ↔ Campus', 'Akato', 'Campus', 2, 18.058, 19),
(17, 'Adjalolo ↔ Campus', 'Adjalolo', 'Campus', 2, 11.140, 20),
(18, 'Adakpamé ↔ Campus', 'Adakpamé', 'Campus', 2, 13.056, 21),
(19, 'Akodesséwa-Bè ↔ Campus', 'Akodesséwa-Bè', 'Campus', 2, 13.045, 22),
(20, 'Avépozo ↔ Campus', 'Avépozo', 'Campus', 2, 18.071, 23),
(21, 'Entreprise de l''Union ↔ Campus', 'Entreprise de l''Union', 'Campus', 2, 11.045, 24),
(22, 'Djagblé ↔ Campus', 'Djagblé', 'Campus', 2, 16.441, 25)
ON CONFLICT (line_number) DO NOTHING;

-- Arrêts principaux (mis à jour selon les données fournies)
INSERT INTO sotral_stops (name, code, is_major_stop) VALUES
('BIA (Centre-ville)', 'BIA', true),
('REX (front de mer)', 'REX', true),
('Campus Universitaire', 'CAMPUS', true),
('Zanguéra', 'ZANG', true),
('Adétikopé', 'ADET', true),
('Akato', 'AKAT', true),
('Agoè-Assiyéyé', 'AGOE', true),
('Kpogan', 'KPOG', true),
('Djagblé', 'DJAG', true),
('Legbassito', 'LEGB', true),
('Attiegouvi', 'ATTI', true),
('Entreprise de l''Union', 'ENTR', true),
('Adjalolo', 'ADJO', true),
('Adakpamé', 'ADAK', true),
('Akodesséwa-Bè', 'AKOD', true),
('Avépozo', 'AVEP', true)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_sotral_tickets_code ON sotral_tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_sotral_tickets_user ON sotral_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_sotral_tickets_status ON sotral_tickets(status);
CREATE INDEX IF NOT EXISTS idx_sotral_tickets_expires ON sotral_tickets(expires_at);
CREATE INDEX IF NOT EXISTS idx_sotral_validations_ticket ON sotral_ticket_validations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sotral_validations_date ON sotral_ticket_validations(validated_at);
CREATE INDEX IF NOT EXISTS idx_sotral_line_stops_line ON sotral_line_stops(line_id);
CREATE INDEX IF NOT EXISTS idx_sotral_schedules_line_stop ON sotral_schedules(line_id, stop_id);

-- ==========================================
-- FONCTIONS UTILITAIRES
-- ==========================================

-- Fonction pour calculer le tarif selon la distance
CREATE OR REPLACE FUNCTION calculate_sotral_price(distance_km DECIMAL, is_student BOOLEAN DEFAULT false)
RETURNS INTEGER AS $$
DECLARE
    base_price INTEGER;
BEGIN
    -- Pour les étudiants, tarif unique de 100 FCFA
    IF is_student THEN
        RETURN 100;
    END IF;
    
    -- Tarification par zones pour les lignes ordinaires
    IF distance_km <= 5 THEN
        RETURN 100;
    ELSIF distance_km <= 10 THEN
        RETURN 150;
    ELSIF distance_km <= 15 THEN
        RETURN 200;
    ELSIF distance_km <= 20 THEN
        RETURN 250;
    ELSE
        RETURN 300;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un code ticket unique
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'SOT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer les codes tickets
CREATE OR REPLACE FUNCTION set_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_code IS NULL OR NEW.ticket_code = '' THEN
        NEW.ticket_code := generate_ticket_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_code
    BEFORE INSERT ON sotral_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_code();
