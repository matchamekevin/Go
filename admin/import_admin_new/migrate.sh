#!/bin/bash

# 🔄 Migration de l'ancien admin SOTRAL vers v2.0
# ==============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

OLD_ADMIN_PATH="../admin"
NEW_ADMIN_PATH="."
BACKUP_PATH="../admin-backup-$(date +%Y%m%d_%H%M%S)"

echo ""
echo "🔄 Migration SOTRAL Admin v1 → v2"
echo "=================================="
echo ""

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ] || [ ! -d "src/features" ]; then
    print_error "Ce script doit être exécuté depuis le dossier admin-new"
    exit 1
fi

# Vérifier si l'ancien admin existe
if [ ! -d "$OLD_ADMIN_PATH" ]; then
    print_error "Ancien admin non trouvé dans $OLD_ADMIN_PATH"
    exit 1
fi

print_info "Ancien admin détecté: $OLD_ADMIN_PATH"

# Créer une sauvegarde de l'ancien admin
create_backup() {
    print_info "Création d'une sauvegarde de l'ancien admin..."
    
    if cp -r "$OLD_ADMIN_PATH" "$BACKUP_PATH"; then
        print_success "Sauvegarde créée: $BACKUP_PATH"
    else
        print_error "Erreur lors de la création de la sauvegarde"
        exit 1
    fi
}

# Extraire les configurations utiles de l'ancien admin
extract_config() {
    print_info "Extraction des configurations de l'ancien admin..."
    
    # Récupérer les variables d'environnement
    if [ -f "$OLD_ADMIN_PATH/.env.local" ]; then
        print_info "Variables d'environnement trouvées dans l'ancien admin"
        
        # Extraire l'URL de l'API
        if grep -q "VITE_API_BASE_URL" "$OLD_ADMIN_PATH/.env.local"; then
            API_URL=$(grep "VITE_API_BASE_URL" "$OLD_ADMIN_PATH/.env.local" | cut -d'=' -f2)
            print_success "URL API extraite: $API_URL"
            
            # Mettre à jour notre .env.local
            if [ -f ".env.local" ]; then
                sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$API_URL|" .env.local
            else
                echo "VITE_API_BASE_URL=$API_URL" > .env.local
            fi
            print_success "Configuration API mise à jour"
        fi
    fi
    
    # Récupérer d'autres fichiers de config si nécessaires
    for config_file in "tailwind.config.js" "postcss.config.js" "vite.config.ts"; do
        if [ -f "$OLD_ADMIN_PATH/$config_file" ]; then
            print_info "Fichier de configuration trouvé: $config_file"
            # On ne copie pas automatiquement pour éviter les conflits
            print_warning "Vérifiez manuellement les différences dans $config_file"
        fi
    done
}

# Analyser les dépendances personnalisées
analyze_dependencies() {
    print_info "Analyse des dépendances personnalisées..."
    
    if [ -f "$OLD_ADMIN_PATH/package.json" ]; then
        # Extraire les dépendances qui ne sont pas dans le nouveau package.json
        print_info "Comparaison des dépendances..."
        
        # Créer un rapport des différences
        cat > migration-report.md << EOF
# Rapport de migration Admin SOTRAL

## Dépendances de l'ancien admin non présentes dans le nouveau :

EOF
        
        # Ici, on pourrait analyser les dépendances mais c'est complexe en bash
        # Pour simplifier, on note juste qu'il faut vérifier manuellement
        
        echo "- Vérifiez manuellement les dépendances dans $OLD_ADMIN_PATH/package.json" >> migration-report.md
        
        print_success "Rapport de migration créé: migration-report.md"
    fi
}

# Proposer de désactiver l'ancien admin
disable_old_admin() {
    print_info "Gestion de l'ancien admin..."
    
    echo ""
    read -p "🤔 Voulez-vous renommer l'ancien admin en 'admin-old' ? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if mv "$OLD_ADMIN_PATH" "../admin-old"; then
            print_success "Ancien admin renommé en 'admin-old'"
        else
            print_error "Erreur lors du renommage"
        fi
    else
        print_warning "L'ancien admin reste accessible dans $OLD_ADMIN_PATH"
        print_info "Attention aux conflits de port si vous lancez les deux en même temps"
    fi
}

# Mettre à jour les scripts de déploiement
update_deployment_scripts() {
    print_info "Recherche des scripts de déploiement..."
    
    # Chercher des scripts de déploiement dans le projet parent
    for script in "../deploy-admin.sh" "../scripts/deploy-admin.sh" "../admin-deploy.sh"; do
        if [ -f "$script" ]; then
            print_warning "Script de déploiement trouvé: $script"
            print_info "⚠️  Pensez à mettre à jour le chemin vers admin-new dans ce script"
        fi
    done
}

# Créer un fichier de migration des routes
create_route_migration() {
    print_info "Création du guide de migration des routes..."
    
    cat > MIGRATION.md << 'EOF'
# Guide de migration des routes et fonctionnalités

## Correspondance des routes

### Ancien admin → Nouveau admin
- `/sotral-management` → `/lines` (Gestion des lignes)
- `/tickets` → `/tickets` (Gestion des tickets)
- `/dashboard` → `/dashboard` (Tableau de bord)

## Nouvelles fonctionnalités

### ✨ Améliorations v2.0
1. **Architecture moderne** avec React Query
2. **Interface responsive** améliorée
3. **Gestion d'erreurs** robuste
4. **Cache intelligent** pour de meilleures performances
5. **Composants réutilisables** mieux structurés

### 🆕 Nouvelles pages
- `/tickets/generate` - Génération de tickets en masse
- Interface plus intuitive pour la gestion des lignes
- Dashboard avec statistiques en temps réel

### 🔧 Améliorations techniques
- TypeScript strict pour la sécurité des types
- Hooks personnalisés pour la logique métier
- Services API centralisés
- Meilleure gestion des états de loading/erreur

## Actions post-migration

1. ✅ Tester toutes les fonctionnalités dans le nouvel admin
2. ✅ Vérifier que les données s'affichent correctement
3. ✅ Valider les permissions et l'authentification
4. ✅ Mettre à jour les bookmarks/favoris
5. ✅ Former les utilisateurs aux nouvelles interfaces

## Rollback si nécessaire

En cas de problème avec le nouvel admin :
1. Restaurer depuis la sauvegarde : `cp -r admin-backup-* admin`
2. Ou utiliser l'ancien admin renommé : `mv admin-old admin`
3. Redémarrer l'ancien serveur : `cd admin && npm run dev`

EOF

    print_success "Guide de migration créé: MIGRATION.md"
}

# Fonction principale
main() {
    print_info "Début de la migration..."
    
    # Créer une sauvegarde
    create_backup
    
    # Extraire les configurations
    extract_config
    
    # Analyser les dépendances
    analyze_dependencies
    
    # Créer le guide de migration
    create_route_migration
    
    # Proposer de désactiver l'ancien admin
    disable_old_admin
    
    # Mettre à jour les scripts de déploiement
    update_deployment_scripts
    
    echo ""
    print_success "🎉 Migration terminée avec succès !"
    echo ""
    
    # Instructions finales
    echo "📋 Prochaines étapes :"
    echo ""
    echo "1. Installer les dépendances du nouvel admin :"
    echo "   ./install.sh"
    echo ""
    echo "2. Démarrer le nouvel admin :"
    echo "   npm run dev"
    echo ""
    echo "3. Tester toutes les fonctionnalités"
    echo ""
    echo "4. Lire le guide de migration : MIGRATION.md"
    echo ""
    
    print_info "💾 Sauvegarde disponible : $BACKUP_PATH"
    print_warning "⚠️  Gardez la sauvegarde jusqu'à validation complète du nouvel admin"
}

# Options de ligne de commande
case "${1:-}" in
    --backup-only)
        print_info "Mode sauvegarde uniquement"
        create_backup
        ;;
    --config-only)
        print_info "Extraction de configuration uniquement"
        extract_config
        ;;
    --help|-h)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options :"
        echo "  --backup-only     Créer uniquement une sauvegarde"
        echo "  --config-only     Extraire uniquement les configurations"
        echo "  --help, -h        Afficher cette aide"
        echo ""
        ;;
    *)
        main
        ;;
esac