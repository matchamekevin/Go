import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

interface TicketData {
  id: string;
  type: 'ordinaire' | 'etudiant';
  name: string;
  route: string;
  price: number;
  currency: string;
  ticketType: string;
  zone?: string;
  via?: string;
  destination?: string;
  achat?: string;
  carte?: string;
  origine?: string;
  code?: string;
  showQR?: boolean;
}

interface SOTRALTicketCardProps {
  ticket: TicketData;
  onPress?: (ticket: TicketData) => void;
  showQR?: boolean;
}

const QRCodePlaceholder = ({ ticket }: { ticket: TicketData }) => (
  <View style={styles.qrContainer}>
    <View style={styles.qrCode}>
      {ticket.showQR && ticket.code ? (
        <QRCode
          value={JSON.stringify({
            type: 'ticket',
            code: ticket.code,
            ticket_type: ticket.type,
            line: ticket.name,
            route: ticket.route,
            price: ticket.price,
            issued_at: new Date().toISOString()
          })}
          size={80}
          color="#000000"
          backgroundColor="#ffffff"
        />
      ) : (
        <View style={styles.stripePattern}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={styles.stripe} />
          ))}
        </View>
      )}
    </View>
    <Text style={styles.qrText}>Scanner pour valider</Text>
  </View>
);

export default function SOTRALTicketCard({ ticket, onPress, showQR = false }: SOTRALTicketCardProps) {
  const isEtudiant = ticket.type === 'etudiant';
  
  // Couleurs selon le type
  const cardColors = {
    ordinaire: {
      background: '#E8F5E8', // Vert clair
      header: '#4CAF50', // Vert SOTRAL
      route: '#2196F3', // Bleu pour la ligne
      price: '#FF9800' // Orange pour le prix
    },
    etudiant: {
      background: '#FFF3E0', // Orange clair
      header: '#4CAF50', // Vert SOTRAL (même que ordinaire)
      route: '#FF9800', // Orange pour la ligne étudiante
      price: '#FF9800' // Orange pour le prix
    }
  };

  const colors = cardColors[ticket.type];

  return (
    <TouchableOpacity 
      style={styles.ticketWrapper} 
      onPress={() => onPress?.(ticket)}
      activeOpacity={0.8}
    >
      <View style={[styles.ticketCard, { backgroundColor: colors.background }]}>
        {/* Header avec SOTRAL et prix */}
        <View style={styles.ticketHeader}>
          <View style={styles.sotralContainer}>
            <Text style={[styles.sotralText, { color: colors.header }]}>SOTRAL</Text>
            {isEtudiant && <Text style={styles.iconText}> 🎓</Text>}
          </View>
          <Text style={[styles.priceText, { color: colors.price }]}>
            {ticket.price} {ticket.currency}
          </Text>
        </View>

        {/* Ligne et trajet */}
        <View style={[styles.routeContainer, { backgroundColor: colors.route }]}>
          <Text style={styles.routeNumber}>{ticket.name}</Text>
          <Text style={styles.routePath}>{ticket.route}</Text>
        </View>

        {/* Informations du ticket */}
        <View style={styles.ticketInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{ticket.ticketType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {isEtudiant ? 
                (ticket.destination ? 'Destination:' : 'Origine:') : 
                (ticket.zone ? 'Zone:' : 'Via:')
              }
            </Text>
            <Text style={styles.infoValue}>
              {ticket.destination || ticket.origine || ticket.zone || ticket.via}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {isEtudiant ? 'Carte:' : 'Achat:'}
            </Text>
            <Text style={styles.infoValue}>
              {ticket.carte || ticket.achat}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        <QRCodePlaceholder ticket={{ ...ticket, showQR }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ticketWrapper: {
    width: (width - 30) / 2,
    marginBottom: 15,
    marginHorizontal: 5,
  },
  ticketCard: {
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sotralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sotralText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconText: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  routeNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routePath: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  ticketInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  qrContainer: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  qrCode: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  stripePattern: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    transform: [{ rotate: '45deg' }],
  },
  stripe: {
    height: 2,
    backgroundColor: '#000',
    width: '120%',
    marginLeft: -5,
  },
  qrText: {
    fontSize: 10,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
});
