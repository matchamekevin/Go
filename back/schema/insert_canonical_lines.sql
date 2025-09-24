-- Insert or update canonical SOTRAL lines
-- Assumes a table named sotral_lines (adjust name if different)
BEGIN;

-- Each row: id, line_number, name, route_from, route_to, category_id, distance_km, stops_count, is_active
INSERT INTO sotral_lines (id, line_number, name, route_from, route_to, category_id, distance_km, stops_count, is_active)
VALUES
  (1, 1, 'Zanguéra ↔ BIA (Centre-ville)', 'Zanguéra', 'BIA', 1, 19.4, 68, true),
  (2, 2, 'Adétikopé ↔ REX (front de mer)', 'Adétikopé', 'REX', 1, 24.5, 62, true),
  (3, 3, 'Akato ↔ BIA', 'Akato', 'BIA', 1, 19.2, 68, true),
  (6, 6, 'Agoè-Assiyéyé ↔ BIA', 'Agoè-Assiyéyé', 'BIA', 1, 16.3, 60, true),
  (7, 7, 'Kpogan ↔ BIA', 'Kpogan', 'BIA', 1, 19.7, 58, true),
  (8, 8, 'Djagblé ↔ REX', 'Djagblé', 'REX', 1, 18.9, 49, true),
  (10, 10, 'Legbassito ↔ BIA', 'Legbassito', 'BIA', 1, 24.2, 74, true),
  (11, 11, 'Attiegouvi ↔ REX', 'Attiegouvi', 'REX', 1, 9.5, 43, true),
  (12, 12, 'Entreprise de l''Union ↔ BIA', 'Entreprise de l''Union', 'BIA', 1, 15.3, 66, true),
  (13, 13, 'Adétikopé ↔ Campus (Université)', 'Adétikopé', 'Campus', 1, 17.8, 51, true),
  (14, 14, 'Legbassito ↔ Campus', 'Legbassito', 'Campus', 1, 17.3, 38, true),
  (15, 15, 'Zanguéra ↔ Campus', 'Zanguéra', 'Campus', 1, 13.2, 64, true),
  (16, 16, 'Akato ↔ Campus', 'Akato', 'Campus', 1, 18.0, 58, true),
  (17, 17, 'Adjalolo ↔ Campus', 'Adjalolo', 'Campus', 1, 11.1, 40, true),
  (18, 18, 'Adakpamé ↔ Campus', 'Adakpamé', 'Campus', 1, 13.0, 56, true),
  (19, 19, 'Akodesséwa-Bè ↔ Campus', 'Akodesséwa-Bè', 'Campus', 1, 13.0, 45, true),
  (20, 20, 'Avépozo ↔ Campus', 'Avépozo', 'Campus', 1, 18.0, 71, true),
  (21, 21, 'Entreprise de l''Union ↔ Campus', 'Entreprise de l''Union', 'Campus', 1, 11.0, 45, true),
  (22, 22, 'Djagblé ↔ Campus', 'Djagblé', 'Campus', 1, 16.4, 41, true)
ON CONFLICT (line_number) DO UPDATE SET
  name = EXCLUDED.name,
  route_from = EXCLUDED.route_from,
  route_to = EXCLUDED.route_to,
  category_id = EXCLUDED.category_id,
  distance_km = EXCLUDED.distance_km,
  stops_count = EXCLUDED.stops_count,
  is_active = EXCLUDED.is_active;

COMMIT;
