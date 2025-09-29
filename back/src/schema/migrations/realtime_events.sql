-- Table pour stocker les événements temps réel
CREATE TABLE IF NOT EXISTS realtime_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(type);
CREATE INDEX IF NOT EXISTS idx_realtime_events_timestamp ON realtime_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_events_user_id ON realtime_events(user_id);

-- Index GIN pour les recherches dans le JSON
CREATE INDEX IF NOT EXISTS idx_realtime_events_data ON realtime_events USING GIN(data);