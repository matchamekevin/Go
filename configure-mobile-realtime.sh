#!/bin/bash

# Configuration de l'adresse IP pour la synchronisation temps réel mobile
echo "🔧 Configuration de la synchronisation temps réel pour l'app mobile"
echo "================================================================="

# Détecter l'adresse IP locale
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip route get 1 | awk '{print $7; exit}')
fi

echo "📱 Adresse IP détectée: $LOCAL_IP"
echo ""

# Demander confirmation ou modification
read -p "Utiliser cette adresse IP ($LOCAL_IP) pour la synchronisation temps réel ? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    read -p "Entrez l'adresse IP de votre machine de développement: " LOCAL_IP
fi

echo "✅ Configuration: http://$LOCAL_IP:3000"
echo ""

# Mettre à jour les fichiers avec la nouvelle adresse IP
echo "📝 Mise à jour des fichiers..."

# MyTicketsScreen.tsx
sed -i "s|baseUrl: 'http://[^']*'|baseUrl: 'http://$LOCAL_IP:3000'|g" /home/connect/kev/Go/front/src/screens/MyTicketsScreen.tsx

# ProductsScreen.tsx
sed -i "s|baseUrl: 'http://[^']*'|baseUrl: 'http://$LOCAL_IP:3000'|g" /home/connect/kev/Go/front/src/screens/ProductsScreen.tsx

echo "✅ Fichiers mis à jour !"
echo ""

# Instructions pour l'utilisateur
echo "📋 Prochaines étapes:"
echo "1. Assurez-vous que votre téléphone et votre ordinateur sont sur le même réseau WiFi"
echo "2. Démarrez le backend: cd back && npm run dev"
echo "3. Lancez l'app mobile sur votre téléphone"
echo "4. Ouvrez l'interface admin dans un navigateur"
echo "5. Modifiez une ligne SOTRAL dans l'admin"
echo "6. Vérifiez que l'app mobile se met à jour automatiquement"
echo ""

echo "🔍 Pour tester manuellement:"
echo "curl http://$LOCAL_IP:3000/realtime/clients-count"
echo ""

echo "⚠️  Note: Si vous changez de réseau, relancez ce script pour mettre à jour l'adresse IP."