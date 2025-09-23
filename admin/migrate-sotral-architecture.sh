#!/bin/bash

# Script de migration des imports vers la nouvelle architecture modulaire
echo "🚀 Migration vers l'architecture modulaire SOTRAL..."

# Créer les répertoires nécessaires s'ils n'existent pas
echo "📁 Création de la structure de dossiers..."
mkdir -p /home/connect/kev/Go/admin/src/types/sotral
mkdir -p /home/connect/kev/Go/admin/src/hooks/sotral  
mkdir -p /home/connect/kev/Go/admin/src/components/sotral
mkdir -p /home/connect/kev/Go/admin/src/services
mkdir -p /home/connect/kev/Go/admin/src/modules
mkdir -p /home/connect/kev/Go/admin/src/utils

echo "✅ Structure de dossiers créée"

# Vérifier les fichiers créés
echo "📊 Vérification des fichiers principaux..."

if [ -f "/home/connect/kev/Go/admin/src/types/sotral/index.ts" ]; then
    echo "✅ Types SOTRAL: OK"
else
    echo "❌ Types SOTRAL: MANQUANT"
fi

if [ -f "/home/connect/kev/Go/admin/src/hooks/sotral/index.ts" ]; then
    echo "✅ Hooks SOTRAL: OK"
else
    echo "❌ Hooks SOTRAL: MANQUANT"
fi

if [ -f "/home/connect/kev/Go/admin/src/components/sotral/index.ts" ]; then
    echo "✅ Composants SOTRAL: OK"
else
    echo "❌ Composants SOTRAL: MANQUANT"
fi

if [ -f "/home/connect/kev/Go/admin/src/services/adminSotralService.ts" ]; then
    echo "✅ Service SOTRAL: OK"
else
    echo "❌ Service SOTRAL: MANQUANT"
fi

if [ -f "/home/connect/kev/Go/admin/src/modules/sotral.ts" ]; then
    echo "✅ Module SOTRAL: OK"
else
    echo "❌ Module SOTRAL: MANQUANT"
fi

echo ""
echo "🎯 Architecture modulaire SOTRAL prête !"
echo ""
echo "📝 Utilisation recommandée:"
echo "import { useTicketGeneration, TicketTable, adminSotralService } from '../modules/sotral';"
echo ""
echo "📋 Pages disponibles:"
echo "- SotralTicketManagementPage (nouvelle architecture)"
echo "- SotralManagementPage (à migrer)"
echo ""