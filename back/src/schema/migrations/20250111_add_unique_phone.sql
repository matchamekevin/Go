-- Migration pour ajouter une contrainte d'unicité sur le numéro de téléphone
-- Date: 2025-01-11
-- Description: Empêche l'inscription de plusieurs comptes avec le même numéro de téléphone

-- Étape 1: Identifier et supprimer les doublons existants (si il y en a)
-- Garder seulement l'utilisateur le plus récent pour chaque numéro dupliqué
WITH duplicates AS (
  SELECT id, phone,
         ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at DESC) as rn
  FROM users
  WHERE phone IS NOT NULL AND phone != ''
)
DELETE FROM users
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Étape 2: Ajouter l'index unique sur le numéro de téléphone
-- Cela empêchera les doublons futurs
ALTER TABLE users
ADD CONSTRAINT unique_phone
UNIQUE (phone);

-- Étape 3: Ajouter un index pour améliorer les performances des recherches par téléphone
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Étape 4: Ajouter un commentaire sur la table pour documenter la contrainte
COMMENT ON CONSTRAINT unique_phone ON users IS 'Garantit l''unicité des numéros de téléphone pour éviter les comptes multiples';
