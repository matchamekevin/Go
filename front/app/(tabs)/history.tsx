import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserTicketService } from '../../src/services/userTicketService';
import type { UserTicketHistory } from '../../src/services/userTicketService';
import { theme } from '../../src/styles/theme';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HistoryTab() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [historyTickets, setHistoryTickets] = useState<UserTicketHistory[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger l'historique des tickets
  const loadHistoryTickets = async () => {
    try {
      setTicketsLoading(true);
      
      if (!isAuthenticated) {
        setHistoryTickets([]);
        return;
      }
      
      const historyData = await UserTicketService.getTicketHistory().catch(() => []);
      setHistoryTickets(historyData);
    } catch (error) {
      console.error('[History] Erreur lors du chargement de l\'historique:', error);
    } finally {
      setTicketsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadHistoryTickets();
    }
  }, [authLoading, isAuthenticated]);

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
          {ticket.qrCode && (
            <Text style={styles.historyQrCode}>Code: {ticket.qrCode.substring(0, 12)}...</Text>
          )}
        </View>
        <View style={styles.historyStatus}>
          <Text style={styles.historyPrice}>{ticket.price}</Text>
          <Text style={styles.historyDate}>{ticket.date} • {ticket.time}</Text>
        </View>
      </View>

      {/* Informations de validation si disponibles */}
      {ticket.validatedAt && (
        <View style={styles.validationInfo}>
          <View style={styles.validationHeader}>
            <Ionicons name="scan-outline" size={16} color={theme.colors.primary[600]} />
            <Text style={styles.validationTitle}>Validation</Text>
          </View>
          <Text style={styles.validationText}>
            Validé le {ticket.validatedAt}
          </Text>
          {ticket.validatedBy && (
            <Text style={styles.validationText}>
              Par: {ticket.validatedBy}
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.usedBadge}>
        <Ionicons
          name={
            ticket.status === 'expired' ? "time-outline" : 
            ticket.status === 'used' ? "checkmark-circle" : 
            "ellipse-outline"
          }
          size={14}
          color={
            ticket.status === 'expired' ? theme.colors.warning[600] : 
            ticket.status === 'used' ? theme.colors.success[600] : 
            theme.colors.primary[400]
          }
        />
        <Text style={[
          styles.usedText,
          { 
            color: ticket.status === 'expired' ? theme.colors.warning[600] : 
                   ticket.status === 'used' ? theme.colors.success[600] : 
                   theme.colors.primary[400]
          }
        ]}>
          {ticket.status === 'expired' ? 'Expiré' : 
           ticket.status === 'used' ? 'Utilisé' : 
           'Non utilisé'}
        </Text>
      </View>
    </View>
  );

  // Écran de connexion requise si non authentifié
  if (!authLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historique des billets</Text>
          <Text style={styles.headerSubtitle}>Vos voyages passés</Text>
        </View>
        
        <View style={styles.authRequiredContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={theme.colors.primary[600]} />
          <Text style={styles.authRequiredTitle}>Connexion requise</Text>
          <Text style={styles.authRequiredText}>
            Vous devez être connecté pour consulter l'historique de vos achats.
          </Text>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={20} color={theme.colors.white} />
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContainer}>
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary[600]]}
          tintColor={theme.colors.primary[600]}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historique des billets</Text>
          <Text style={styles.headerSubtitle}>Vos voyages passés</Text>
          {user && (
            <Text style={styles.userInfo}>Connecté : {user.email}</Text>
          )}
        </View>

        {/* Historique des billets */}
        <View style={styles.section}>
          {ticketsLoading || authLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
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
      </View>
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
  // Styles pour l'écran de connexion requise
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  authRequiredTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  authRequiredText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  loginButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  registerButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
    width: '100%',
  },
  registerButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  userInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: theme.spacing.xs,
  },
  // Nouveaux styles pour les informations de validation
  historyQrCode: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[400],
    fontFamily: 'monospace',
    marginTop: 2,
  },
  validationInfo: {
    backgroundColor: theme.colors.secondary[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary[400],
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  validationTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    marginLeft: theme.spacing.xs,
  },
  validationText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    lineHeight: 16,
  },
});