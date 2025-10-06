#!/bin/bash

# Script de migration des services admin
# Remplace les anciens services par les nouveaux

echo "🚀 Migration des services ADMIN..."
echo ""

# Dossier des services
SERVICES_DIR="./src/services"

# Compteur
SUCCESS=0
FAILED=0

# Fonction pour migrer un fichier
migrate_file() {
    local filename=$1
    local new_file="${SERVICES_DIR}/${filename}.new.ts"
    local target_file="${SERVICES_DIR}/${filename}.ts"
    local backup_file="${SERVICES_DIR}/${filename}.backup"

    if [ -f "$new_file" ]; then
        # Backup de l'ancien fichier s'il existe
        if [ -f "$target_file" ]; then
            echo "  📦 Backup: ${filename}.ts → ${filename}.backup"
            cp "$target_file" "$backup_file"
        fi

        # Déplacement du nouveau fichier
        echo "  ✅ Migration: ${filename}.new.ts → ${filename}.ts"
        mv "$new_file" "$target_file"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Fichier non trouvé: $new_file"
        FAILED=$((FAILED + 1))
    fi
}

# Création du dossier services si nécessaire
if [ ! -d "$SERVICES_DIR" ]; then
    echo "📁 Création du dossier $SERVICES_DIR"
    mkdir -p "$SERVICES_DIR"
fi

# Migration des fichiers
echo "📝 Migration des fichiers..."
migrate_file "apiClient"
migrate_file "authService"
migrate_file "dashboardService"
migrate_file "userService"
migrate_file "ticketService"
migrate_file "paymentService"
migrate_file "sotralService"
migrate_file "index"

echo ""
echo "======================================"
echo "✅ Migration terminée!"
echo "======================================"
echo "Succès: $SUCCESS fichiers"
echo "Échecs: $FAILED fichiers"
echo ""

if [ $SUCCESS -gt 0 ]; then
    echo "📚 Services migrés:"
    echo "  - apiClient.ts (client API complet)"
    echo "  - authService.ts (authentification admin)"
    echo "  - dashboardService.ts (statistiques)"
    echo "  - userService.ts (gestion utilisateurs)"
    echo "  - ticketService.ts (gestion tickets)"
    echo "  - paymentService.ts (gestion paiements)"
    echo "  - sotralService.ts (gestion SOTRAL)"
    echo "  - index.ts (exports centralisés)"
    echo ""
    echo "💡 Les anciens fichiers sont sauvegardés avec l'extension .backup"
fi

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "⚠️  Certains fichiers n'ont pas pu être migrés."
    echo "Vérifiez que les fichiers .new.ts existent."
fi

echo ""
echo "🎯 Prochaines étapes:"
echo "  1. Vérifier que les imports sont corrects dans vos composants"
echo "  2. Tester la connexion admin"
echo "  3. Démarrer l'admin: npm run dev"
echo ""
