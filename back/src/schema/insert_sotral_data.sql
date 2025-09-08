-- Script de migration pour insérer les données SOTRAL réelles
-- À exécuter après avoir créé les tables avec create_transport_tables.sql

-- Vérifier si les lignes existent déjà pour éviter les doublons
DO $$
BEGIN
    -- Compter le nombre de lignes existantes
    IF (SELECT COUNT(*) FROM bus_lines) = 0 THEN
        -- Insérer les vraies lignes SOTRAL L1-L19
        INSERT INTO bus_lines (id, name, code, route_start, route_end, route_stops, base_price, estimated_duration, is_active) VALUES
        (1, 'Ligne L1', 'L1', 'BIA', 'Zanguéra', 'BIA,Kowetas,Cacavelli,Gbényédzi,Adidogome,Zanguéra', 200, 45, true),
        (2, 'Ligne L2', 'L2', 'Adétikopé', 'Rex', 'Adétikopé,Légbassito,Djidjolé,Agbalepédogan,Rex', 150, 35, true),
        (3, 'Ligne L3', 'L3', 'Campus Nord', 'Agoè', 'Campus Nord,Lycée de Lomé,CHU Tokoin,Bè Apédokoè,Agoè', 200, 50, true),
        (4, 'Ligne L4', 'L4', 'Assiyéyé', 'WARCA', 'Assiyéyé,Novissi,Tokoin Tamégbé,Bè-Centre,WARCA', 150, 40, true),
        (5, 'Ligne L5', 'L5', 'Aflao Gakli', 'Port', 'Aflao Gakli,Ablogamé,Adidogome,Wogba,Port de Lomé', 200, 55, true),
        (6, 'Ligne L6', 'L6', 'Casablanca', 'Baguida', 'Casablanca,2 Février,Kodjoviakopé,Agoe Zongo,Baguida', 300, 60, true),
        (7, 'Ligne L7', 'L7', 'Hédzranawoé', 'Agbalépédogan', 'Hédzranawoé,Légbassito,Djidjolé,Casablanca,Agbalépédogan', 200, 45, true),
        (8, 'Ligne L8', 'L8', 'Tokoin Casablanca', 'Séminaire', 'Tokoin Casablanca,Nukafu,Adidogomé,Campus Univ,Séminaire', 250, 50, true),
        (9, 'Ligne L9', 'L9', 'Adidogomé', 'Port Autonome', 'Adidogomé,Gbényédzi,Hanoukopé,Bè Apédokoè,Port Autonome', 200, 40, true),
        (10, 'Ligne L10', 'L10', 'Agoè Zongo', 'Tokoin Hôpital', 'Agoè Zongo,Casablanca,2 Février,Tokoin Tamégbé,Tokoin Hôpital', 200, 45, true),
        (11, 'Ligne L11', 'L11', 'Légbassito', 'Wogba', 'Légbassito,Hédzranawoé,Adidogomé,Hanoukopé,Wogba', 200, 50, true),
        (12, 'Ligne L12', 'L12', 'Bè Apédokoè', 'Campus Nord', 'Bè Apédokoè,CHU Tokoin,Lycée de Lomé,Nukafu,Campus Nord', 200, 40, true),
        (13, 'Ligne L13', 'L13', 'Djidjolé', 'Port de Lomé', 'Djidjolé,Casablanca,Hanoukopé,Bè-Centre,Port de Lomé', 250, 55, true),
        (14, 'Ligne L14', 'L14', 'Novissi', 'Séminaire', 'Novissi,Tokoin Tamégbé,Nukafu,Campus Univ,Séminaire', 250, 50, true),
        (15, 'Ligne L15', 'L15', 'Agbalepédogan', 'Wogba', 'Agbalepédogan,Rex,Bè-Centre,Hanoukopé,Wogba', 200, 45, true),
        (16, 'Ligne L16', 'L16', 'Kodjoviakopé', 'CHU Tokoin', 'Kodjoviakopé,Casablanca,2 Février,Lycée de Lomé,CHU Tokoin', 250, 50, true),
        (17, 'Ligne L17', 'L17', 'Baguida', 'Campus Univ', 'Baguida,Agoè Zongo,Adidogomé,Nukafu,Campus Univ', 300, 65, true),
        (18, 'Ligne L18', 'L18', 'WARCA', 'Adidogomé', 'WARCA,Bè-Centre,Hanoukopé,Gbényédzi,Adidogomé', 200, 40, true),
        (19, 'Ligne L19', 'L19', 'Rex', 'Aflao Gakli', 'Rex,Agbalepédogan,Bè Apédokoè,Ablogamé,Aflao Gakli', 250, 45, true);

        RAISE NOTICE 'Lignes SOTRAL L1-L19 insérées avec succès';
    ELSE
        RAISE NOTICE 'Les lignes existent déjà, insertion ignorée';
    END IF;

    -- Vérifier et insérer les produits de tickets SOTRAL 2024
    IF (SELECT COUNT(*) FROM ticket_products) = 0 THEN
        INSERT INTO ticket_products (id, name, code, price, rides, is_active) VALUES
        (1, 'Ticket Urbain 100F', 'T100', 100, 1, true),
        (2, 'Ticket Étudiant 150F', 'T150', 150, 1, true),
        (3, 'Ticket Standard 200F', 'T200', 200, 1, true),
        (4, 'Ticket Confort 250F', 'T250', 250, 1, true),
        (5, 'Ticket Premium 300F', 'T300', 300, 1, true),
        (6, 'Carnet Urbain (10 tickets)', 'CARNET_T100', 900, 10, true),
        (7, 'Carnet Standard (10 tickets)', 'CARNET_T200', 1800, 10, true);

        RAISE NOTICE 'Produits de tickets SOTRAL 2024 insérés avec succès';
    ELSE
        RAISE NOTICE 'Les produits de tickets existent déjà, insertion ignorée';
    END IF;

    -- Insérer quelques trajets d'exemple pour chaque ligne active
    IF (SELECT COUNT(*) FROM trips) = 0 THEN
        -- Trajets pour aujourd'hui et demain avec horaires réalistes
        INSERT INTO trips (bus_line_id, departure_time, arrival_time, available_seats, total_seats, price, status)
        SELECT 
            bl.id,
            CURRENT_DATE + INTERVAL '1 day' + (h.hour || ' hours')::interval,
            CURRENT_DATE + INTERVAL '1 day' + (h.hour || ' hours')::interval + (bl.estimated_duration || ' minutes')::interval,
            45, -- sièges disponibles
            50, -- total sièges
            bl.base_price,
            'scheduled'
        FROM bus_lines bl
        CROSS JOIN (
            VALUES (6), (7), (8), (10), (12), (14), (16), (18), (20) -- Heures de départ
        ) AS h(hour)
        WHERE bl.is_active = true
        LIMIT 150; -- Limiter à 150 trajets pour éviter la surcharge

        RAISE NOTICE 'Trajets d''exemple insérés avec succès';
    ELSE
        RAISE NOTICE 'Les trajets existent déjà, insertion ignorée';
    END IF;

END $$;
