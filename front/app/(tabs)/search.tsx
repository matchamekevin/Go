import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../src/styles/theme';

export default function SearchTab() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('Aujourd\'hui');
  const [passengerCount, setPassengerCount] = useState(1);

  const popularLocations = [
    'Centre-ville', 'Aéroport', 'Université', 'Marché central', 
    'Gare routière', 'Plateau', 'Zone industrielle', 'Hôpital'
  ];

  const searchResults = [
    {
      id: 1,
      type: 'Bus rapide',
      company: 'SOTRAL Express',
      departure: '08:30',
      arrival: '09:15',
      duration: '45 min',
      price: '2500 FCFA',
      seats: 12,
      rating: 4.8,
    },
    {
      id: 2,
      type: 'Bus urbain',
      company: 'Transport City',
      departure: '09:00',
      arrival: '09:30',
      duration: '30 min',
      price: '1500 FCFA',
      seats: 8,
      rating: 4.5,
    },
    {
      id: 3,
      type: 'Métro',
      company: 'Metro Line 1',
      departure: '09:15',
      arrival: '09:35',
      duration: '20 min',
      price: '1000 FCFA',
      seats: 25,
      rating: 4.9,
    },
  ];

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // TicketsTab logic importé
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const activeTickets = [
    {
      id: 1,
      type: 'Bus rapide',
      route: 'Centre-ville → Aéroport',
      date: '2025-09-08',
      time: '14:30',
      price: '2500 FCFA',
      seat: '12A',
      qrCode: 'TICKET_001_2025090814',
      status: 'valid',
      expiresIn: '2h 30min',
    },
    {
      id: 2,
      type: 'Métro',
      route: 'Université → Plateau',
      date: '2025-09-08',
      time: '18:00',
      price: '1000 FCFA',
      seat: '---',
      qrCode: 'TICKET_002_2025090818',
      status: 'valid',
      expiresIn: '6h 00min',
    },
  ];
  const historyTickets = [
    {
      id: 3,
      type: 'Bus urbain',
      route: 'Marché → Centre-ville',
      date: '2025-09-07',
      time: '09:15',
      price: '1500 FCFA',
      seat: '8B',
      status: 'used',
    },
    {
      id: 4,
      type: 'Bus rapide',
      route: 'Aéroport → Université',
      date: '2025-09-06',
      time: '16:45',
      price: '2500 FCFA',
      seat: '15C',
      status: 'used',
    },
    {
      id: 5,
      type: 'Métro',
      route: 'Plateau → Gare routière',
      date: '2025-09-05',
      time: '12:30',
      price: '1000 FCFA',
      seat: '---',
      status: 'used',
    },
  ];
  const renderActiveTicket = (ticket: any) => (
    <View key={ticket.id} style={styles.ticketCard}>
      {/* Ticket Header */}
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <View style={styles.transportBadge}>
            <Text style={styles.transportBadgeText}>{ticket.type}</Text>
          </View>
          <Text style={styles.routeText}>{ticket.route}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Actif</Text>
        </View>
      </View>
      {/* Ticket Body */}
      <View style={styles.ticketBody}>
        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{ticket.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Heure</Text>
              <Text style={styles.detailValue}>{ticket.time}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Prix</Text>
              <Text style={styles.detailValue}>{ticket.price}</Text>
            </View>
            {ticket.seat !== '---' && (
              <View style={styles.detailItem}>
                <Ionicons name="car-sport" size={16} color={theme.colors.secondary[500]} />
                <Text style={styles.detailLabel}>Siège</Text>
                <Text style={styles.detailValue}>{ticket.seat}</Text>
              </View>
            )}
          </View>
        </View>
        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={ticket.qrCode}
            size={100}
            color={theme.colors.secondary[900]}
            backgroundColor={theme.colors.white}
          />
        </View>
      </View>
      {/* Ticket Footer */}
      <View style={styles.ticketFooter}>
        <View style={styles.expiryInfo}>
          <Ionicons name="time-outline" size={16} color={theme.colors.warning[600]} />
          <Text style={styles.expiryText}>Expire dans {ticket.expiresIn}</Text>
        </View>
        <TouchableOpacity style={styles.showButton}>
          <Text style={styles.showButtonText}>Présenter</Text>
          <Ionicons name="expand" size={16} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      </View>
      {/* Ticket perforation */}
      <View style={styles.perforation}>
        {Array.from({ length: 15 }).map((_, index) => (
          <View key={index} style={styles.perforationDot} />
        ))}
      </View>
    </View>
  );
  const renderHistoryTicket = (ticket: any) => (
    <View key={ticket.id} style={styles.historyTicketCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyRoute}>{ticket.route}</Text>
          <Text style={styles.historyType}>{ticket.type}</Text>
        </View>
        <View style={styles.historyStatus}>
          <Text style={styles.historyPrice}>{ticket.price}</Text>
          <Text style={styles.historyDate}>{ticket.date} • {ticket.time}</Text>
        </View>
      </View>
      <View style={styles.usedBadge}>
        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success[600]} />
        <Text style={styles.usedText}>Utilisé</Text>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rechercher un trajet</Text>
          <Text style={styles.headerSubtitle}>Trouvez le transport idéal</Text>
        </View>
        {/* Search Form */}
        {/* ...existing code... */}
        {/* Popular Locations */}
        {/* ...existing code... */}
        {/* Search Results */}
        {/* ...existing code... */}
        {/* Billets actifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes billets actifs</Text>
          {activeTickets.length > 0 ? (
            activeTickets.map(renderActiveTicket)
          ) : (
            <Text style={{color: theme.colors.secondary[400]}}>Aucun billet actif</Text>
          )}
        </View>
        {/* Historique des billets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des billets</Text>
          {historyTickets.length > 0 ? (
            historyTickets.map(renderHistoryTicket)
          ) : (
            <Text style={{color: theme.colors.secondary[400]}}>Aucun historique</Text>
          )}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
  header: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
  },
  searchCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  locationInputs: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary[300],
    marginRight: theme.spacing.md,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  locationInput: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
  },
  swapButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  optionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginHorizontal: theme.spacing.sm,
    flex: 1,
  },
  passengerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  counterButton: {
    padding: theme.spacing.sm,
  },
  passengerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginHorizontal: theme.spacing.sm,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  searchButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  locationChip: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },
  locationChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  resultCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  transportInfo: {
    flex: 1,
  },
  transportType: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  transportTypeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  companyName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    marginLeft: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timePoint: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  locationText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  journeyLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    position: 'relative',
  },
  journeyDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
  },
  journeyPath: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.primary[200],
  },
  durationText: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xs,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {},
  price: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  seatsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  bookButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
  /* Styles importés depuis tickets.tsx pour l'affichage des billets */
  ticketCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[100],
  },
  ticketInfo: {},
  transportBadge: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  transportBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  routeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success[500],
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  ticketBody: {
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  ticketDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
    marginLeft: 20,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary[100],
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  showButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  showButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.xs,
  },
  perforation: {
    position: 'absolute',
    top: '50%',
    left: -5,
    right: -5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    transform: [{ translateY: -5 }],
  },
  perforationDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary[50],
  },
  historyTicketCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyRoute: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  historyType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  historyStatus: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  historyDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[400],
    marginTop: 2,
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
  },
  usedText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: 2,
  },
});
