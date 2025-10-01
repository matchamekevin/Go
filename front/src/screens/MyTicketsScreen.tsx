import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ticket } from '../types/api';
import { TicketService } from '../services/ticketService';
import TicketCard from '../components/TicketCard';
import { useSotralRealtime } from '../hooks/useSotralRealtime';

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Hook pour la synchronisation temps réel
  const { isConnected } = useSotralRealtime({
    baseUrl: 'http://192.168.1.100:3000', // À adapter selon votre configuration réseau
    clientId: 'mobile_tickets_screen',
    onTicketDeleted: (data) => {
      console.log('🎫 Ticket deleted in realtime:', data);
      // Recharger les tickets quand un ticket est supprimé
      loadTickets();
    },
    onAnyEvent: (event) => {
      console.log('📱 Realtime event in tickets screen:', event);
    }
  });

  const loadTickets = async () => {
    try {
      // Pour le développement, on utilise un ID utilisateur test
      // En production, cela viendrait du token d'authentification
      const ticketsData = await TicketService.getUserTicketsById(1);
      setTickets(ticketsData);
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Erreur lors du chargement de vos tickets'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const toggleTicketQR = (ticketCode: string) => {
    setSelectedTicket(selectedTicket === ticketCode ? null : ticketCode);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de vos tickets...</Text>
      </View>
    );
  }

  const getTicketStats = () => {
    const unused = tickets.filter(t => t.status === 'unused').length;
    const used = tickets.filter(t => t.status === 'used').length;
    const expired = tickets.filter(t => t.status === 'expired').length;
    return { unused, used, expired, total: tickets.length };
  };

  const stats = getTicketStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes tickets</Text>
        <View style={styles.realtimeIndicator}>
          <View style={[styles.realtimeDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' }]} />
          <Text style={styles.realtimeText}>
            {isConnected ? 'Synchronisation active' : 'Synchronisation hors ligne'}
          </Text>
        </View>
      </View>
      
      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.unused}</Text>
          <Text style={styles.statLabel}>Valides</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.used}</Text>
          <Text style={styles.statLabel}>Utilisés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.expired}</Text>
          <Text style={styles.statLabel}>Expirés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id || item.code || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => item.code && toggleTicketQR(item.code)}>
            <TicketCard
              ticket={item}
              showQR={selectedTicket === item.code}
            />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucun ticket</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore acheté de tickets.{'\n'}
              Consultez nos produits pour en acheter.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  realtimeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
