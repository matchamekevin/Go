import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import SOTRALTicketCard from '../components/SOTRALTicketCard';

const { width } = Dimensions.get('window');

// Type pour les tickets
interface Ticket {
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

// Données des tickets - maintenant gérées par l'admin via l'API backend
const ticketData: Ticket[] = [
  // Plus de données hardcodées - tous les tickets viennent de l'admin via SotralMobileService.getGeneratedTickets()
];

const SectionHeader = ({ title, bgColor = '#3F51B5', icon }: {
  title: string;
  bgColor?: string;
  icon?: string;
}) => (
  <View style={[styles.sectionHeader, { backgroundColor: bgColor }]}>
    {icon && <Text style={styles.sectionIcon}>{icon}</Text>}
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default function TicketShowcaseScreen() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleTicketPress = (ticket: any) => {
    setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id);
  };

  const ordinaryTickets = ticketData.filter(t => t.type === 'ordinaire');
  const studentTickets = ticketData.filter(t => t.type === 'etudiant');

  // Si pas de données hardcodées, afficher un message
  if (ticketData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" backgroundColor="#3F51B5" />
        <StatusBar backgroundColor="#3F51B5" barStyle="light-content" />
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Tickets gérés par l'admin</Text>
          <Text style={styles.emptySubtitle}>
            Tous les tickets sont maintenant créés et gérés par l'administrateur via le panneau d'administration.
            Les données s'affichent dans l'onglet Recherche.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor="#3F51B5" />
      <StatusBar backgroundColor="#3F51B5" barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Lignes Ordinaires */}
        <SectionHeader
          title="Lignes Ordinaires"
          bgColor="#3F51B5"
          icon="🚌"
        />
        <View style={styles.ticketsGrid}>
          {ordinaryTickets.map((ticket) => (
            <SOTRALTicketCard
              key={ticket.id}
              ticket={{
                ...ticket,
                showQR: selectedTicket === ticket.id
              }}
              onPress={handleTicketPress}
            />
          ))}
        </View>

        {/* Section Lignes Étudiantes */}
        <SectionHeader
          title="Lignes Étudiantes (vers Campus UL Nord)"
          bgColor="#3F51B5"
          icon="🎓"
        />
        <View style={styles.ticketsGrid}>
          {studentTickets.map((ticket) => (
            <SOTRALTicketCard
              key={ticket.id}
              ticket={{
                ...ticket,
                showQR: selectedTicket === ticket.id
              }}
              onPress={handleTicketPress}
            />
          ))}
        </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
