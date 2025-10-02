import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService, UnifiedSotralLine, UnifiedSotralTicket } from '../src/services/sotralUnifiedService';

export default function PaymentConfirmationScreen() {
  const { lineId } = useLocalSearchParams<{ lineId: string }>();
  const router = useRouter();

  const [line, setLine] = useState<UnifiedSotralLine | null>(null);
  const [availableTickets, setAvailableTickets] = useState<UnifiedSotralTicket[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lineId) {
      loadLineAndTickets(parseInt(lineId));
    }
  }, [lineId]);

  const loadLineAndTickets = async (id: number, isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      // Charger les détails de la ligne
      const lineData = await sotralUnifiedService.getLineById(id);
      if (!lineData) {
        setError('Ligne non trouvée');
        return;
      }
      setLine(lineData);

      // Charger les tickets disponibles pour cette ligne
      const tickets = await sotralUnifiedService.getTicketsByLine(id);
      setAvailableTickets(tickets);

    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (lineId) {
      loadLineAndTickets(parseInt(lineId), true);
    }
  };

  const handleRetry = () => {
    if (lineId) {
      loadLineAndTickets(parseInt(lineId));
    }
  };

  const getSelectedTicket = (): UnifiedSotralTicket | null => {
    // Pour l'instant, on prend le premier ticket disponible
    // Dans un vrai scénario, on pourrait avoir une sélection de type de ticket
    return availableTickets.length > 0 ? availableTickets[0] : null;
  };

  const calculateTotalPrice = (): number => {
    const ticket = getSelectedTicket();
    const qty = parseInt(quantity) || 1;
    return ticket ? ticket.price_paid_fcfa * qty : 0;
  };

  const handleQuantityChange = (text: string) => {
    // Ne permettre que les chiffres
    const numericValue = text.replace(/[^0-9]/g, '');
    const numValue = parseInt(numericValue) || 1;

    // Limiter à la quantité disponible
    const maxQuantity = availableTickets.length;
    const finalValue = Math.min(numValue, maxQuantity);

    setQuantity(finalValue.toString());
  };

  const adjustQuantity = (delta: number) => {
    const currentQty = parseInt(quantity) || 1;
    const newQty = Math.max(1, Math.min(currentQty + delta, availableTickets.length));
    setQuantity(newQty.toString());
  };

  const handleContinueToPaymentMethod = () => {
    const ticket = getSelectedTicket();
    const qty = parseInt(quantity);

    if (!ticket) {
      Alert.alert('Erreur', 'Aucun ticket disponible pour cette ligne');
      return;
    }

    if (qty < 1) {
      Alert.alert('Erreur', 'Veuillez saisir une quantité valide');
      return;
    }

    if (qty > availableTickets.length) {
      Alert.alert('Erreur', 'Quantité demandée supérieure au stock disponible');
      return;
    }

    // Naviguer vers la sélection du moyen de paiement
    router.push({
      pathname: '/payment-method',
      params: {
        lineId: lineId,
        ticketId: ticket.id.toString(),
        quantity: qty.toString()
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="hourglass" size={48} color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Préparation du paiement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !line) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error[500]} />
          <Text style={styles.errorText}>{error || 'Erreur de chargement'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedTicket = getSelectedTicket();
  const totalPrice = calculateTotalPrice();
  const qty = parseInt(quantity);

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Confirmation de paiement</Text>
            <Text style={styles.headerSubtitle}>Ligne {line.line_number}</Text>
          </View>
        </View>

        {/* Line Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.lineInfo}>
            <View style={styles.lineBadge}>
              <Ionicons name="bus" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.lineBadgeText}>SOTRAL</Text>
            </View>
            <Text style={styles.lineName}>{line.name}</Text>
            <Text style={styles.lineRoute}>
              {line.route_from} → {line.route_to}
            </Text>
          </View>
        </View>

        {/* Ticket Selection */}
        {selectedTicket && (
          <View style={styles.ticketCard}>
            <Text style={styles.sectionTitle}>Type de ticket sélectionné</Text>
            <View style={styles.ticketInfo}>
              <View style={styles.ticketDetails}>
                <Text style={styles.ticketCode}>{selectedTicket.ticket_code}</Text>
                <Text style={styles.ticketType}>
                  {selectedTicket.trips_remaining} trajet{selectedTicket.trips_remaining > 1 ? 's' : ''}
                </Text>
                <Text style={styles.ticketPrice}>
                  {selectedTicket.price_paid_fcfa} FCFA par ticket
                </Text>
              </View>
              <View style={styles.ticketStatus}>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                  <Text style={styles.statusText}>Disponible</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quantity Selection */}
        <View style={styles.quantityCard}>
          <Text style={styles.sectionTitle}>Nombre de tickets</Text>

          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustQuantity(-1)}
              disabled={qty <= 1}
            >
              <Ionicons
                name="remove"
                size={24}
                color={qty <= 1 ? theme.colors.secondary[300] : theme.colors.primary[600]}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
              maxLength={2}
              selectTextOnFocus
            />

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustQuantity(1)}
              disabled={qty >= availableTickets.length}
            >
              <Ionicons
                name="add"
                size={24}
                color={qty >= availableTickets.length ? theme.colors.secondary[300] : theme.colors.primary[600]}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.quantityInfo}>
            {availableTickets.length} ticket{availableTickets.length > 1 ? 's' : ''} disponible{availableTickets.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {qty} ticket{qty > 1 ? 's' : ''} × {selectedTicket?.price_paid_fcfa || 0} FCFA
            </Text>
            <Text style={styles.priceValue}>
              {selectedTicket ? (selectedTicket.price_paid_fcfa * qty) : 0} FCFA
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{totalPrice} FCFA</Text>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.continueButton, (!selectedTicket || qty < 1) && styles.disabledButton]}
            onPress={handleContinueToPaymentMethod}
            disabled={!selectedTicket || qty < 1}
          >
            <Text style={styles.continueButtonText}>
              Continuer vers le paiement
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            En continuant, vous acceptez les conditions générales de vente
          </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    marginTop: theme.spacing.md,
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
  header: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  lineInfo: {
    alignItems: 'center',
  },
  lineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  lineBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  lineName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  lineRoute: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDetails: {
    flex: 1,
  },
  ticketCode: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  ticketType: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    marginBottom: theme.spacing.xs,
  },
  ticketPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  ticketStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  quantityCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
  },
  quantityInput: {
    width: 80,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
  },
  quantityInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[700],
  },
  priceValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.secondary[200],
    marginVertical: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  disabledButton: {
    backgroundColor: theme.colors.secondary[300],
  },
  continueButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  disclaimerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});