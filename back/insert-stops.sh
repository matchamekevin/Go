#!/bin/bash

# Script pour insérer les arrêts SOTRAL manuellement si nécessaire

echo "🗺️ Vérification et insertion des arrêts SOTRAL..."

# Vérifier si DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL n'est pas définie"
    exit 1
fi

# Vérifier si la table sotral_stops existe
TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sotral_stops');" 2>/dev/null || echo "false")

if [ "$TABLE_EXISTS" != " t" ]; then
    echo "❌ La table sotral_stops n'existe pas. Lancez d'abord l'initialisation complète."
    exit 1
fi

# Compter les arrêts existants
STOP_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM sotral_stops;" 2>/dev/null || echo "0")

echo "📊 Nombre d'arrêts existants: $STOP_COUNT"

if [ "$STOP_COUNT" -eq 0 ]; then
    echo "🔧 Insertion des arrêts SOTRAL..."

    psql "$DATABASE_URL" -c "
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
    " 2>/dev/null

    if [ $? -eq 0 ]; then
        NEW_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM sotral_stops;" 2>/dev/null || echo "0")
        echo "✅ $NEW_COUNT arrêts insérés avec succès!"
    else
        echo "❌ Erreur lors de l'insertion des arrêts"
        exit 1
    fi
else
    echo "✅ Les arrêts existent déjà ($STOP_COUNT arrêts trouvés)"
fi

echo "🎯 Arrêts SOTRAL vérifiés!"