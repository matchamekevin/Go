import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Mock data based on the SOTRAL tickets from images
const mockTicketData = [
  // Lignes Ordinaires
  {
    id: 1,
    type: 'ordinaire',
    name: 'LIGNE 1',
    route: 'BIA ↔ Zanguéra',
    price: 200,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 2,
    type: 'ordinaire',
    name: 'LIGNE 2',
    route: 'Adétikopé ↔ Rex',
    price: 150,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Campus UL',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 3,
    type: 'ordinaire',
    name: 'LIGNE 3',
    route: 'BIA ↔ Ségbé',
    price: 180,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 4,
    type: 'ordinaire',
    name: 'LIGNE 4',
    route: 'Rex ↔ Sagboville',
    price: 120,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 5,
    type: 'ordinaire',
    name: 'LIGNE 5',
    route: 'DVA ↔ Rex',
    price: 100,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Centre Lomé',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 6,
    type: 'ordinaire',
    name: 'LIGNE 6',
    route: 'BIA ↔ Marché Agoè',
    price: 250,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Agoè-Assiyéyé',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 7,
    type: 'ordinaire',
    name: 'LIGNE 7',
    route: 'BIA ↔ Kpogan',
    price: 200,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  {
    id: 9,
    type: 'ordinaire',
    name: 'LIGNE 9',
    route: 'Adakpamé ↔ Rex',
    price: 150,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Akodesséwa',
    achat: 'Kiosque SOTRAL',
    color: '#2196F3',
    bgColor: '#E3F2FD'
  },
  // Lignes Étudiantes
  {
    id: 13,
    type: 'etudiant',
    name: 'LIGNE 13',
    route: 'Fucec Adétikopé ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Université Lomé',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  },
  {
    id: 14,
    type: 'etudiant',
    name: 'LIGNE 14',
    route: 'Marché Agoè ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Agoè-Assiyéyé',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  },
  {
    id: 15,
    type: 'etudiant',
    name: 'LIGNE 15',
    route: 'Atigangomé ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Université Lomé',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  },
  {
    id: 16,
    type: 'etudiant',
    name: 'LIGNE 16',
    route: 'Poste Police ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Université Lomé',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  },
  {
    id: 17,
    type: 'etudiant',
    name: 'LIGNE 17',
    route: 'Adjololo ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Université Lomé',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  },
  {
    id: 18,
    type: 'etudiant',
    name: 'LIGNE 18',
    route: 'Adakpamé ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Université Lomé',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  },
  {
    id: 19,
    type: 'etudiant',
    name: 'LIGNE 19',
    route: 'Akodesséwa Kpota ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    zone: 'Carrefour Kpota',
    achat: 'Étudiant requise',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🎓'
  }
];

const QRCodePlaceholder = () => (
  <View style={styles.qrContainer}>
    <View style={styles.qrCode}>
      {/* Pattern de rayures diagonales comme dans l'image */}
      <View style={styles.stripePattern}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.stripe} />
        ))}
      </View>
    </View>
    <Text style={styles.qrText}>Scanner pour valider</Text>
  </View>
);

const TicketCard = ({ ticket, onPress }) => {
  const isEtudiant = ticket.type === 'etudiant';

  return (
    <TouchableOpacity style={styles.ticketWrapper} onPress={() => onPress(ticket)}>
      <View style={[styles.ticketCard, { backgroundColor: ticket.bgColor }]}>
        {/* Header avec logo SOTRAL et prix */}
        <View style={styles.ticketHeader}>
          <View style={styles.sotralContainer}>
            <Text style={styles.sotralText}>SOTRAL</Text>
            {isEtudiant && <Text style={styles.iconText}> 🎓</Text>}
          </View>
          <Text style={styles.priceText}>{ticket.price} {ticket.currency}</Text>
        </View>

        {/* Ligne et trajet */}
        <View style={[styles.routeContainer, { backgroundColor: ticket.color }]}>
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
              {isEtudiant ? 'Destination:' : (ticket.zone ? 'Zone:' : 'Via:')}
            </Text>
            <Text style={styles.infoValue}>{ticket.zone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {isEtudiant ? 'Carte:' : 'Achat:'}
            </Text>
            <Text style={styles.infoValue}>{ticket.achat}</Text>
          </View>
        </View>

        {/* QR Code */}
        <QRCodePlaceholder />
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title, bgColor = '#3F51B5', icon }) => (
  <View style={[styles.sectionHeader, { backgroundColor: bgColor }]}>
    {icon && <Text style={styles.sectionIcon}>{icon}</Text>}
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default function App() {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleTicketPress = (ticket) => {
    setSelectedTicket(ticket);
    Alert.alert(
      `Ticket ${ticket.name}`,
      `Route: ${ticket.route}\nPrix: ${ticket.price} ${ticket.currency}\nType: ${ticket.ticketType}`,
      [
        { text: 'Acheter', style: 'default' },
        { text: 'Fermer', style: 'cancel' }
      ]
    );
  };

  const ordinaryTickets = mockTicketData.filter(t => t.type === 'ordinaire');
  const studentTickets = mockTicketData.filter(t => t.type === 'etudiant');

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor="#3F51B5" />
      <StatusBar backgroundColor="#3F51B5" barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Lignes Ordinaires */}
        <SectionHeader
          title="🚌 Lignes Ordinaires"
          bgColor="#3F51B5"
        />

        <View style={styles.ticketsGrid}>
          {ordinaryTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={handleTicketPress}
            />
          ))}
        </View>

        {/* Section Lignes Étudiantes */}
        <SectionHeader
          title="🎓 Lignes Étudiantes (vers Campus UL Nord)"
          bgColor="#FF6F00"
          icon="🎓"
        />

        <View style={styles.ticketsGrid}>
          {studentTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={handleTicketPress}
            />
          ))}
        </View>

        {/* Espace en bas */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  ticketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  ticketWrapper: {
    width: (width - 30) / 2,
    marginBottom: 15,
    marginHorizontal: 5,
  },
  ticketCard: {
    borderRadius: 15,
    padding: 15,
    margin: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sotralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sotralText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  iconText: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  routeContainer: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  routeNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  routePath: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  ticketInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  qrCode: {
    width: 60,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripePattern: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    transform: [{ rotate: '45deg' }],
  },
  stripe: {
    flex: 1,
    backgroundColor: '#333',
    marginHorizontal: 1,
  },
  qrText: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  bottomSpace: {
    height: 50,
  },
});
