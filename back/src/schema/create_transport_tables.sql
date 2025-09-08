-- Création des tables pour le système de transport GoSOTRAL

-- Table des lignes de bus
CREATE TABLE IF NOT EXISTS bus_lines (
    id VARCHAR(50) PRIMARY KEY,
    line_name VARCHAR(100) NOT NULL,
    line_code VARCHAR(20) UNIQUE,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_duration INTEGER NOT NULL, -- en minutes
    is_active BOOLEAN DEFAULT true,
    bus_stops TEXT, -- JSON array des arrêts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des trajets
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(50) PRIMARY KEY,
    bus_line_id VARCHAR(50) REFERENCES bus_lines(id),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL DEFAULT 30,
    total_seats INTEGER NOT NULL DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    trip_id VARCHAR(50) REFERENCES trips(id),
    seat_numbers TEXT NOT NULL, -- JSON array des numéros de sièges
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    passenger_email VARCHAR(100),
    qr_code TEXT,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    mobile_money_phone VARCHAR(20),
    mobile_money_operator VARCHAR(10),
    mobile_money_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test
INSERT INTO bus_lines (id, line_name, line_code, from_city, to_city, base_price, estimated_duration, bus_stops) VALUES
('BL001', 'Lomé - Kpalimé', 'LK01', 'Lomé', 'Kpalimé', 2500.00, 120, '["Grand Marché", "Gare Routière", "Tsévié", "Kpalimé Centre"]'),
('BL002', 'Lomé - Sokodé', 'LS01', 'Lomé', 'Sokodé', 4500.00, 240, '["Grand Marché", "Gare Routière", "Atakpamé", "Sokodé Centre"]'),
('BL003', 'Lomé - Kara', 'LKA01', 'Lomé', 'Kara', 6000.00, 360, '["Grand Marché", "Gare Routière", "Atakpamé", "Sokodé", "Kara Centre"]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO trips (id, bus_line_id, departure_time, arrival_time, price, available_seats, total_seats, status) VALUES
('T001', 'BL001', '2025-09-02 08:00:00', '2025-09-02 10:00:00', 2500.00, 28, 30, 'scheduled'),
('T002', 'BL001', '2025-09-02 14:00:00', '2025-09-02 16:00:00', 2500.00, 30, 30, 'scheduled'),
('T003', 'BL002', '2025-09-02 09:00:00', '2025-09-02 13:00:00', 4500.00, 25, 30, 'scheduled'),
('T004', 'BL003', '2025-09-02 07:00:00', '2025-09-02 13:00:00', 6000.00, 30, 30, 'scheduled')
ON CONFLICT (id) DO NOTHING;
