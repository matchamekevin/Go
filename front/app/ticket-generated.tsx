import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService, UnifiedSotralTicket } from '../src/services/sotralUnifiedService';

/**
 * Écran de ticket généré après paiement réussi
 * 
 * IMPORTANT : Cette page est une fin de parcours
 * - Le retour arrière est BLOQUÉ (navigation via router.replace)
 * - Le bouton retour physique Android est intercepté
 * - L'utilisateur doit utiliser "Nouveau ticket" ou "Mes tickets" pour continuer
 * - Le ticket est déjà attribué à l'utilisateur et dans son historique
 */
export default function TicketGeneratedScreen() {
  const {
    lineId,
    ticketId,
    quantity,
    paymentMethod,
    phoneNumber,
    transactionId
  } = useLocalSearchParams<{
    lineId: string;
    ticketId: string;
    quantity: string;
    paymentMethod: string;
    phoneNumber: string;
    transactionId: string;
  }>();
  const router = useRouter();

  const [generatedTicket, setGeneratedTicket] = useState<UnifiedSotralTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateTicket();
  }, []);

  // Bloquer le bouton retour physique (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Empêcher le retour arrière - afficher un message informatif
      Alert.alert(
        'Paiement terminé',
        'Votre ticket a été généré avec succès. Le processus de paiement est terminé.\n\nUtilisez "Nouveau ticket" pour effectuer un nouvel achat ou "Voir mes tickets" pour consulter votre historique.',
        [
          { text: 'Nouveau ticket', onPress: handleNewPurchase },
          { text: 'Mes tickets', onPress: handleViewMyTickets },
          { text: 'Rester ici', style: 'cancel' }
        ]
      );
      return true; // Bloquer le retour
    });

    return () => backHandler.remove();
  }, []);

  const generateTicket = async () => {
    try {
      setLoading(true);

      console.log('[TicketGenerated] Attribution du ticket existant à l\'utilisateur...');
      console.log('[TicketGenerated] Paramètres:', { lineId, ticketId, quantity, paymentMethod, phoneNumber, transactionId });

      // Attribuer le ticket généré par l'admin à l'utilisateur
      const assignResult = await sotralUnifiedService.assignTicketToUser({
        ticketId: parseInt(ticketId || '0'),
        paymentMethod: paymentMethod,
        paymentReference: transactionId,
        phoneNumber: phoneNumber
      });

      if (!assignResult.success || !assignResult.ticket) {
        console.error('[TicketGenerated] Erreur attribution ticket:', assignResult.error);
        throw new Error(assignResult.error || 'Impossible d\'attribuer le ticket');
      }

      console.log('[TicketGenerated] ✅ Ticket attribué avec succès:', assignResult.ticket.ticket_code);

      // Le ticket est maintenant dans l'historique de l'utilisateur
      setGeneratedTicket(assignResult.ticket);
    } catch (error) {
      console.error('Erreur génération ticket:', error);
      Alert.alert('Erreur', 'Impossible de générer le ticket');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Recharger le ticket généré
    generateTicket();
    // Simuler un délai de chargement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleShareTicket = async () => {
    if (!generatedTicket) return;

    try {
      const message = `🎫 Ticket SOTRAL\nCode: ${generatedTicket.ticket_code}\nLigne: ${generatedTicket.line_id}\nPrix: ${generatedTicket.price_paid_fcfa} FCFA\nValable jusqu'au: ${new Date(generatedTicket.expires_at || '').toLocaleDateString('fr-FR')}`;

      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleViewMyTickets = () => {
    // Naviguer vers l'écran des tickets de l'utilisateur (replace pour vider la pile)
    router.replace('/(tabs)/history');
  };

  const handleNewPurchase = () => {
    // Retourner à la recherche pour un nouvel achat (replace pour vider la pile)
    router.replace('/(tabs)/search');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="ticket" size={48} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Génération de votre ticket...</Text>
          <Text style={styles.loadingSubtext}>Veuillez patienter</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!generatedTicket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error[500]} />
          <Text style={styles.errorText}>Erreur de génération</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={generateTicket}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Success Header */}
            <View style={styles.successHeader}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success[500]} />
              <Text style={styles.successTitle}>Paiement réussi !</Text>
              <Text style={styles.successSubtitle}>Votre ticket est prêt</Text>
            </View>

        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketInfo}>
              <View style={styles.transportBadge}>
                <Text style={styles.transportBadgeText}>SOTRAL</Text>
              </View>
              <Text style={styles.routeText}>
                Ligne {generatedTicket.line_id}
              </Text>
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
                  <Ionicons name="pricetag" size={16} color={theme.colors.secondary[500]} />
                  <Text style={styles.detailLabel}>Code</Text>
                  <Text style={styles.detailValue}>{generatedTicket.ticket_code}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="refresh" size={16} color={theme.colors.secondary[500]} />
                  <Text style={styles.detailLabel}>Trajets</Text>
                  <Text style={styles.detailValue}>{generatedTicket.trips_remaining}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="cash" size={16} color={theme.colors.secondary[500]} />
                  <Text style={styles.detailLabel}>Prix</Text>
                  <Text style={styles.detailValue}>{generatedTicket.price_paid_fcfa} FCFA</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color={theme.colors.secondary[500]} />
                  <Text style={styles.detailLabel}>Expire</Text>
                  <Text style={styles.detailValue}>
                    {new Date(generatedTicket.expires_at || '').toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode
                value={generatedTicket.qr_code}
                size={120}
                color={theme.colors.secondary[900]}
                backgroundColor={theme.colors.white}
              />
            </View>
          </View>

          {/* Transaction Info */}
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>Détails de la transaction</Text>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Méthode:</Text>
              <Text style={styles.transactionValue}>
                {paymentMethod === 'mixx' ? 'Mixx by Afriland First Bank' : 'Flooz'}
              </Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Téléphone:</Text>
              <Text style={styles.transactionValue}>{phoneNumber}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Transaction:</Text>
              <Text style={styles.transactionValue}>{transactionId}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Date:</Text>
              <Text style={styles.transactionValue}>
                {new Date().toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>

          {/* Ticket perforation */}
          <View style={styles.perforation}>
            {Array.from({ length: 15 }).map((_, index) => (
              <View key={index} style={styles.perforationDot} />
            ))}
          </View>
        </View>

            {/* Action Buttons - Seulement Partager et Télécharger */}
            <View style={styles.popupActions}>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={handleShareTicket}
              >
                <Ionicons name="share-social" size={24} color={theme.colors.white} />
                <Text style={styles.popupButtonText}>Partager</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.popupButton, styles.downloadButton]}
                onPress={() => Alert.alert('Téléchargement', 'Fonctionnalité bientôt disponible')}
              >
                <Ionicons name="download" size={24} color={theme.colors.white} />
                <Text style={styles.popupButtonText}>Télécharger</Text>
              </TouchableOpacity>
            </View>

            {/* Fermer et Aller à l'historique */}
            <View style={styles.popupFooter}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleViewMyTickets}
              >
                <Text style={styles.footerButtonText}>Voir mes tickets</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleNewPurchase}
              >
                <Text style={styles.footerButtonText}>Nouveau ticket</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  popup: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    maxWidth: 450,
    width: '100%',
    maxHeight: '90%',
    ...theme.shadows.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.md,
  },
  loadingSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    marginTop: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  successHeader: {
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: theme.spacing.md,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.success[600],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  successSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.success[600],
  },
  ticketCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
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
  transactionInfo: {
    backgroundColor: theme.colors.secondary[50],
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary[100],
  },
  transactionTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  transactionLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
  },
  transactionValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.medium,
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
  actionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
  instructionCard: {
    backgroundColor: theme.colors.primary[50],
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  instructionTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  instructionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    lineHeight: 18,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
  popupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  popupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xs,
  },
  downloadButton: {
    backgroundColor: theme.colors.secondary[600],
  },
  popupButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  popupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary[100],
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  footerButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
});