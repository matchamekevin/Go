-- Configuration des trajets SOTRAL pour Lomé, Togo
DO $$
BEGIN
    -- Créer la table des trajets si elle n'existe pas
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'routes'
    ) THEN
        CREATE TABLE routes (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            start_point VARCHAR(100) NOT NULL,
            end_point VARCHAR(100) NOT NULL,
            distance_km FLOAT,
            duration_minutes INTEGER,
            price_category VARCHAR(10) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            stops JSONB,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Table routes créée avec succès';
    END IF;
    
    -- Insérer les trajets SOTRAL de Lomé
    INSERT INTO routes (id, name, code, start_point, end_point, distance_km, duration_minutes, price_category, stops, is_active)
    VALUES
        -- Lignes principales (100 FCFA)
        ('R1', 'Adidogomé - Bè', 'ADIDO-BE', 'Adidogomé', 'Bè', 12.5, 45, 'T100', 
         '["Adidogomé", "Nukafu", "GTA", "Colombe de la Paix", "Camp GP", "Bè"]', true),
        
        ('R2', 'Agbalépédo - Port', 'AGBA-PORT', 'Agbalépédo', 'Port', 10.8, 40, 'T100', 
         '["Agbalépédo", "Limousine", "Gbossimé", "Douane", "Port"]', true),
        
        ('R3', 'Gbonvié - Akodessewa', 'GBON-AKOD', 'Gbonvié', 'Akodessewa', 15.2, 55, 'T150', 
         '["Gbonvié", "Sagboville", "Adidogomé", "Souroukou", "Akodessewa"]', true),
        
        -- Lignes intermédiaires (150-200 FCFA)
        ('R4', 'Agoè - Université', 'AGOE-UNIV', 'Agoè', 'Université de Lomé', 8.7, 30, 'T150', 
         '["Agoè", "Koshigan", "Adidogomé", "Campus", "Université"]', true),
        
        ('R5', 'Avedji - Marché d''Adawlato', 'AVED-ADAW', 'Avedji', 'Marché d''Adawlato', 11.3, 45, 'T200', 
         '["Avedji", "Avénou", "Octaviano", "Dékon", "Adawlato"]', true),
        
        -- Lignes longues (250-300 FCFA)
        ('R6', 'Aéroport - Agoe Assiyéyé', 'AERO-AGOE', 'Aéroport International de Lomé', 'Agoe Assiyéyé', 18.5, 65, 'T250', 
         '["Aéroport", "Bè", "Akodessewa", "Kégué", "Agoè Assiyéyé"]', true),
        
        ('R7', 'Baguida - Centre-ville', 'BAGU-CENT', 'Baguida', 'Centre-ville', 22.4, 75, 'T300', 
         '["Baguida", "Zone Portuaire", "Bè", "Gbényedji", "Centre-ville"]', true),
        
        ('R8', 'Zanguéra - Bè', 'ZANG-BE', 'Zanguéra', 'Bè', 20.1, 70, 'T300', 
         '["Zanguéra", "Zongo", "Doulassamé", "Nyékonakpoè", "Bè"]', true)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Trajets SOTRAL insérés ou mis à jour avec succès';
END $$;
