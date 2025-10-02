import React, { useState, useEffect, useRef } from 'react';
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
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService, UnifiedSotralTicket } from '../src/services/sotralUnifiedService';
import { useToast } from '../src/contexts/ToastContext';

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
  const [lineDetails, setLineDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ticketCardRef = useRef<View>(null);
  const { showToast } = useToast();

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
      
      // Récupérer les détails de la ligne pour afficher le trajet complet
      if (assignResult.ticket?.line_id) {
        try {
          const lines = await sotralUnifiedService.getLines();
          const line = lines.find(l => l.id === assignResult.ticket?.line_id);
          if (line) {
            setLineDetails(line);
          }
        } catch (error) {
          console.error('[TicketGenerated] Erreur récupération ligne:', error);
        }
      }
      
      // Afficher le toast de succès
      showToast('Paiement réussi ! Votre ticket est prêt', 'success', 3000, 'top');
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
    if (!generatedTicket || !ticketCardRef.current) return;

    try {
      // Attendre que le rendu soit complet
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capturer le ticket en image avec result: 'tmpfile' pour éviter les coupures
      const uri = await captureRef(ticketCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      await Share.share({
        url: uri,
        message: `🎫 Ticket SOTRAL - Ligne ${generatedTicket.line_id}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
      showToast('Erreur lors du partage', 'error', 3000, 'top');
    }
  };

  const handleDownloadTicket = async () => {
    if (!generatedTicket || !ticketCardRef.current) return;

    try {
      // Vérifier d'abord les permissions existantes
      const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // Si pas de permission, la demander
      if (existingStatus !== 'granted') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès à la galerie est nécessaire pour enregistrer votre ticket. Veuillez autoriser l\'accès dans les paramètres de l\'application.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Attendre que le rendu soit complet
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturer le ticket en image avec result: 'tmpfile' pour la qualité complète
      const uri = await captureRef(ticketCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Sauvegarder dans la galerie
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      // Essayer de créer/récupérer l'album SOTRAL Tickets
      try {
        const album = await MediaLibrary.getAlbumAsync('SOTRAL Tickets');
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('SOTRAL Tickets', asset, false);
        }
      } catch (albumError) {
        // Si erreur avec l'album, le fichier est quand même sauvegardé dans la galerie principale
        console.log('[TicketGenerated] Image sauvegardée dans la galerie principale');
      }
      
      showToast('Ticket enregistré dans la galerie', 'success', 3000, 'top');
    } catch (error) {
      console.error('[TicketGenerated] Erreur téléchargement complète:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('[TicketGenerated] Message d\'erreur:', errorMessage);
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorMessage.includes('3301')) {
        Alert.alert(
          'Permission requise',
          'Impossible d\'enregistrer le ticket dans la galerie.\n\nVeuillez autoriser l\'accès à la galerie dans les paramètres de votre téléphone :\nParamètres > Applications > GoSOTRAL > Autorisations > Photos',
          [{ text: 'Compris' }]
        );
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d\'enregistrer le ticket. Vous pouvez utiliser le bouton "Partager" pour sauvegarder votre ticket.',
          [{ text: 'OK' }]
        );
      }
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
        {/* Ticket Card - avec ref pour capture - Wrapper avec backgroundColor pour capture complète */}
        <View style={styles.captureWrapper}>
          <View ref={ticketCardRef} style={styles.ticketCard} collapsable={false}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketInfo}>
              <View style={styles.transportBadge}>
                <Text style={styles.transportBadgeText}>SOTRAL</Text>
              </View>
              <Text style={styles.routeText}>
                Ligne {generatedTicket.line_id}
              </Text>
              {lineDetails && (
                <Text style={styles.routeDetails}>
                  {lineDetails.route_from} → {lineDetails.route_to}
                </Text>
              )}
            </View>
          </View>

          {/* QR Code en haut */}
          <View style={styles.qrSection}>
            <QRCode
              value={generatedTicket.qr_code}
              size={180}
              color={theme.colors.secondary[900]}
              backgroundColor={theme.colors.white}
            />
          </View>

          {/* Informations du ticket */}
          <View style={styles.ticketInfoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="pricetag" size={20} color={theme.colors.primary[600]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Code</Text>
                  <Text style={styles.infoValue}>{generatedTicket.ticket_code}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="refresh" size={20} color={theme.colors.primary[600]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Trajets restants</Text>
                  <Text style={styles.infoValue}>{generatedTicket.trips_remaining}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="cash" size={20} color={theme.colors.primary[600]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Prix payé</Text>
                  <Text style={styles.infoValue}>{generatedTicket.price_paid_fcfa} FCFA</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={theme.colors.primary[600]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Valable jusqu'au</Text>
                  <Text style={styles.infoValue}>
                    {new Date(generatedTicket.expires_at || '').toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
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
                onPress={handleDownloadTicket}
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
                <Text style={styles.footerButtonText}>Acheter un ticket</Text>
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
  captureWrapper: {
    backgroundColor: 'transparent',
    padding: theme.spacing.xs,
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

  ticketCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'visible', // Important pour la capture complète
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
  routeDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    marginTop: 4,
  },

  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[100],
  },
  ticketInfoSection: {
    padding: theme.spacing.lg,
  },
  infoRow: {
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
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