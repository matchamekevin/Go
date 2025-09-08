#!/bin/bash

# Script d'installation pour NVM et Node.js 18
# Ce script installe NVM, Node.js 18 et npm pour le projet GoSOTRAL

set -e # Arrêter en cas d'erreur

echo "=== Début de l'installation de l'environnement de développement ==="

# Vérifier si NVM est déjà installé
if [ -d "$HOME/.nvm" ]; then
  echo "NVM est déjà installé. Mise à jour..."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
  nvm --version
else
  echo "Installation de NVM..."
  # Installer NVM
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

  # Configurer NVM
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  echo "NVM installé avec succès!"
fi

# Installer Node.js 18
echo "Installation de Node.js 18..."
nvm install 18

# Utiliser Node.js 18
echo "Configuration de Node.js 18 comme version par défaut..."
nvm use 18

# Vérifier les installations
echo "=== Vérification des installations ==="
echo "Version de Node.js: $(node --version)"
echo "Version de npm: $(npm --version)"

# Vérifier Docker
if command -v docker &> /dev/null; then
  echo "Docker est installé: $(docker --version)"
else
  echo "Docker n'est pas installé. Voulez-vous l'installer? (o/n)"
  read -r response
  if [[ "$response" =~ ^[oO]$ ]]; then
    echo "Installation de Docker..."
    # Installer les prérequis
    sudo apt update
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

    # Ajouter la clé GPG officielle de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    # Ajouter le dépôt Docker
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    # Installer Docker
    sudo apt update
    sudo apt install -y docker-ce docker-compose

    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker ${USER}

    echo "Docker installé avec succès! Veuillez vous déconnecter et vous reconnecter pour que les changements de groupe prennent effet."
  else
    echo "Installation de Docker ignorée."
  fi
fi

echo "=== Installation terminée! ==="
echo "Pour que tous les changements prennent effet, veuillez fermer et rouvrir votre terminal,"
echo "ou exécuter la commande suivante:"
echo ""
echo "source ~/.bashrc"
echo ""
echo "Ensuite, vous pourrez lancer le projet avec ./start-all.sh"
