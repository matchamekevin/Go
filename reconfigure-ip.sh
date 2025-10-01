#!/bin/bash

# Script de reconfiguration automatique de l'IP pour la synchronisation temps réel
echo "🔄 Reconfiguration automatique de l'IP réseau"
echo "============================================="

# Détecter automatiquement l'adresse IP locale
echo "🔍 Détection de l'adresse IP locale..."

# Essayer différentes méthodes pour obtenir l'IP
LOCAL_IP=""
for interface in $(ls /sys/class/net/ | grep -v lo); do
    IP=$(ip addr show $interface | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1)
    if [ ! -z "$IP" ] && [[ $IP =~ ^192\.168\.|^172\.|^10\. ]]; then
        LOCAL_IP=$IP
        break
    fi
done

# Fallback si la méthode ci-dessus ne marche pas
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

# Vérifier que nous avons une IP valide
if [ -z "$LOCAL_IP" ]; then
    echo "❌ Impossible de détecter l'adresse IP locale"
    echo "   Vérifiez votre connexion réseau"
    exit 1
fi

echo "✅ Adresse IP détectée: $LOCAL_IP"

# Tester la connectivité
echo "🌐 Test de connectivité..."
if ping -c 1 -W 2 $LOCAL_IP > /dev/null 2>&1; then
    echo "✅ Adresse IP accessible"
else
    echo "⚠️  Adresse IP détectée mais non accessible"
    echo "   Cela peut être normal si vous testez depuis un autre appareil"
fi

# Mettre à jour les fichiers de configuration
echo "📝 Mise à jour de la configuration..."

# Fichiers mobiles
sed -i "s|baseUrl: 'http://[^']*'|baseUrl: 'http://$LOCAL_IP:7000'|g" /home/connect/kev/Go/front/src/screens/MyTicketsScreen.tsx
sed -i "s|baseUrl: 'http://[^']*'|baseUrl: 'http://$LOCAL_IP:7000'|g" /home/connect/kev/Go/front/src/screens/ProductsScreen.tsx

echo "✅ Configuration mise à jour !"
echo ""
echo "📋 Résumé:"
echo "=========="
echo "Adresse IP configurée: $LOCAL_IP"
echo "Port: 7000"
echo "URL complète: http://$LOCAL_IP:7000"
echo ""
echo "🎯 Pour utiliser:"
echo "1. Démarrez le backend: cd back && node dist/server.js"
echo "2. Sur votre téléphone: utilisez http://$LOCAL_IP:7000"
echo "3. L'app mobile se connectera automatiquement"
echo ""
echo "🔄 Si vous changez de réseau, relancez simplement:"
echo "   ./reconfigure-ip.sh"