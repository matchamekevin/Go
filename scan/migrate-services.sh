#!/bin/bash

# 🔄 Script de migration des services SCAN
# Remplace les anciens services par les nouveaux

set -e

SCAN_DIR="/home/connect/kev/Go/scan"
SERVICES_DIR="$SCAN_DIR/src/services"

echo "🔄 Migration des services SCAN..."
echo "📁 Répertoire: $SERVICES_DIR"
echo ""

cd "$SCAN_DIR"

# Fonction de sauvegarde
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "💾 Sauvegarde: $file -> ${file}.backup"
        cp "$file" "${file}.backup"
    fi
}

# Fonction de remplacement
replace_service() {
    local old_file=$1
    local new_file=$2
    
    if [ -f "$new_file" ]; then
        if [ -f "$old_file" ]; then
            backup_file "$old_file"
            echo "🔄 Remplacement: $old_file"
            mv "$new_file" "$old_file"
        else
            echo "➕ Création: $old_file"
            mv "$new_file" "$old_file"
        fi
    else
        echo "⚠️  Fichier non trouvé: $new_file"
    fi
}

# Remplacer les services
echo ""
echo "📦 Remplacement des services..."
replace_service "$SERVICES_DIR/apiClient.ts" "$SERVICES_DIR/apiClient.new.ts"
replace_service "$SERVICES_DIR/scanService.ts" "$SERVICES_DIR/scanService.new.ts"

echo ""
echo "✅ Migration terminée!"
echo ""
echo "📋 Résumé:"
echo "  - apiClient.ts ✅"
echo "  - scanService.ts ✅"
echo ""
echo "💡 Les anciens fichiers sont sauvegardés avec l'extension .backup"
echo ""
echo "🚀 Vous pouvez maintenant tester l'application:"
echo "   cd $SCAN_DIR && npm start"
