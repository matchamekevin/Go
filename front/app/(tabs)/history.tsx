import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import HelpFAB from '../../src/components/HelpFAB';
import { UserTicketService, type UserTicketHistory } from '../../src/services/userTicketService';

export default function HistoryTab() {
  const [historyTickets, setHistoryTickets] = useState<UserTicketHistory[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger l'historique des tickets
  const loadHistoryTickets = async () => {
    try {
      setTicketsLoading(true);
      const historyData = await UserTicketService.getTicketHistory().catch(() => []);
      setHistoryTickets(historyData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setTicketsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistoryTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistoryTickets();
  };

  const renderHistoryTicket = (ticket: UserTicketHistory) => (
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
        <Ionicons
          name={ticket.status === 'expired' ? "time-outline" : "checkmark-circle"}
          size={14}
          color={ticket.status === 'expired' ? theme.colors.warning[600] : theme.colors.success[600]}
        />
        <Text style={[
          styles.usedText,
          { color: ticket.status === 'expired' ? theme.colors.warning[600] : theme.colors.success[600] }
        ]}>
          {ticket.status === 'expired' ? 'Expiré' : 'Utilisé'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historique des billets</Text>
          <Text style={styles.headerSubtitle}>Vos voyages passés</Text>
        </View>

        {/* Historique des billets */}
        <View style={styles.section}>
          {ticketsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement de l'historique...</Text>
            </View>
          ) : historyTickets.length > 0 ? (
            historyTickets.map(renderHistoryTicket)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={48} color={theme.colors.secondary[300]} />
              <Text style={styles.emptyText}>Aucun historique</Text>
              <Text style={styles.emptySubtext}>Vos voyages passés apparaîtront ici</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      <HelpFAB />
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
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
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
  loadingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[500],
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[400],
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});