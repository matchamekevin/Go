#!/bin/bash

# 🔄 Script de migration des services FRONT
# Remplace les anciens services par les nouveaux

set -e

FRONT_DIR="/home/connect/kev/Go/front"
SERVICES_DIR="$FRONT_DIR/src/services"

echo "🔄 Migration des services FRONT..."
echo "📁 Répertoire: $SERVICES_DIR"
echo ""

cd "$FRONT_DIR"

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

# Sauvegarder l'ancien authService qui a des problèmes
if [ -f "$SERVICES_DIR/authService.ts" ]; then
    echo "🗑️  Suppression de l'ancien authService corrompu..."
    rm -f "$SERVICES_DIR/authService.ts"
fi

# Remplacer les services
echo ""
echo "📦 Remplacement des services..."
replace_service "$SERVICES_DIR/authService.ts" "$SERVICES_DIR/authService.new.ts"
replace_service "$SERVICES_DIR/ticketService.ts" "$SERVICES_DIR/ticketService.new.ts"
replace_service "$SERVICES_DIR/paymentService.ts" "$SERVICES_DIR/paymentService.new.ts"
replace_service "$SERVICES_DIR/sotralService.ts" "$SERVICES_DIR/sotralService.new.ts"
replace_service "$SERVICES_DIR/index.ts" "$SERVICES_DIR/index.new.ts"

echo ""
echo "✅ Migration terminée!"
echo ""
echo "📋 Résumé:"
echo "  - authService.ts ✅"
echo "  - ticketService.ts ✅"
echo "  - paymentService.ts ✅"
echo "  - sotralService.ts ✅"
echo "  - index.ts ✅"
echo ""
echo "💡 Les anciens fichiers sont sauvegardés avec l'extension .backup"
echo ""
echo "🚀 Vous pouvez maintenant tester l'application:"
echo "   cd $FRONT_DIR && npm start"
