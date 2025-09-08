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

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

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
      <Text style={styles.title}>Mes tickets</Text>
      
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginVertical: 20,
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
