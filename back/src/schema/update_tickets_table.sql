-- Mettre à jour la table tickets pour ajouter la colonne route_code
DO $$
BEGIN
    -- Vérifier si la colonne route_code existe déjà
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets'
        AND column_name = 'route_code'
    ) THEN
        -- Ajouter la colonne route_code
        ALTER TABLE tickets ADD COLUMN route_code VARCHAR(50);
        
        -- Ajouter la contrainte de clé étrangère
        ALTER TABLE tickets ADD CONSTRAINT fk_tickets_route 
            FOREIGN KEY (route_code) REFERENCES routes(code);
        
        RAISE NOTICE 'Colonne route_code ajoutée à la table tickets';
    ELSE
        RAISE NOTICE 'La colonne route_code existe déjà dans la table tickets';
    END IF;
END $$;
