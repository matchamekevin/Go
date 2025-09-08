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

// Données des tickets selon vos images
const ticketData = [
  // Lignes Ordinaires
  {
    id: '1',
    type: 'ordinaire' as const,
    name: 'LIGNE 1',
    route: 'BIA ↔ Zanguéra',
    price: 200,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    code: 'TKT001'
  },
  {
    id: '2',
    type: 'ordinaire' as const,
    name: 'LIGNE 2',
    route: 'Adétikopé ↔ Rex',
    price: 150,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    via: 'Campus UL',
    achat: 'Kiosque SOTRAL',
    code: 'TKT002'
  },
  {
    id: '3',
    type: 'ordinaire' as const,
    name: 'LIGNE 3',
    route: 'BIA ↔ Ségbé',
    price: 180,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    code: 'TKT003'
  },
  {
    id: '4',
    type: 'ordinaire' as const,
    name: 'LIGNE 4',
    route: 'Rex ↔ Sagboville',
    price: 120,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    code: 'TKT004'
  },
  {
    id: '5',
    type: 'ordinaire' as const,
    name: 'LIGNE 5',
    route: 'DVA ↔ Rex',
    price: 100,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Centre Lomé',
    achat: 'Kiosque SOTRAL',
    code: 'TKT005'
  },
  {
    id: '6',
    type: 'ordinaire' as const,
    name: 'LIGNE 6',
    route: 'BIA ↔ Marché Agoè',
    price: 250,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    destination: 'Agoè-Assiyéyé',
    achat: 'Kiosque SOTRAL',
    code: 'TKT006'
  },
  {
    id: '7',
    type: 'ordinaire' as const,
    name: 'LIGNE 7',
    route: 'BIA ↔ Kpogan',
    price: 200,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    zone: 'Lomé Métropole',
    achat: 'Kiosque SOTRAL',
    code: 'TKT007'
  },
  {
    id: '9',
    type: 'ordinaire' as const,
    name: 'LIGNE 9',
    route: 'Adakpamé ↔ Rex',
    price: 150,
    currency: 'F',
    ticketType: 'Ticket Unitaire',
    via: 'Akodesséwa',
    achat: 'Kiosque SOTRAL',
    code: 'TKT009'
  },
  
  // Lignes Étudiantes
  {
    id: '13',
    type: 'etudiant' as const,
    name: 'LIGNE 13',
    route: 'Fucec Adétikopé ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    destination: 'Université Lomé',
    carte: 'Étudiant requise',
    code: 'TKT013'
  },
  {
    id: '14',
    type: 'etudiant' as const,
    name: 'LIGNE 14',
    route: 'Marché Agoè ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    origine: 'Agoè-Assiyéyé',
    carte: 'Étudiant requise',
    code: 'TKT014'
  },
  {
    id: '15',
    type: 'etudiant' as const,
    name: 'LIGNE 15',
    route: 'Atigangomé ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    destination: 'Université Lomé',
    carte: 'Étudiant requise',
    code: 'TKT015'
  },
  {
    id: '16',
    type: 'etudiant' as const,
    name: 'LIGNE 16',
    route: 'Poste Police ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    destination: 'Université Lomé',
    carte: 'Étudiant requise',
    code: 'TKT016'
  },
  {
    id: '17',
    type: 'etudiant' as const,
    name: 'LIGNE 17',
    route: 'Adjololo ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    destination: 'Université Lomé',
    carte: 'Étudiant requise',
    code: 'TKT017'
  },
  {
    id: '18',
    type: 'etudiant' as const,
    name: 'LIGNE 18',
    route: 'Adakpamé ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    destination: 'Université Lomé',
    carte: 'Étudiant requise',
    code: 'TKT018'
  },
  {
    id: '19',
    type: 'etudiant' as const,
    name: 'LIGNE 19',
    route: 'Akodesséwa Kpota ↔ Campus Nord',
    price: 150,
    currency: 'F',
    ticketType: 'Tarif Étudiant',
    origine: 'Carrefour Kpota',
    carte: 'Étudiant requise',
    code: 'TKT019'
  }
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
});
