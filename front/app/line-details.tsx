import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService, UnifiedSotralLine, UnifiedSotralTicket } from '../src/services/sotralUnifiedService';

export default function LineDetailsScreen() {
  const { lineId } = useLocalSearchParams<{ lineId: string }>();
  const router = useRouter();

  const [line, setLine] = useState<UnifiedSotralLine | null>(null);
  const [tickets, setTickets] = useState<UnifiedSotralTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (lineId) {
      loadLineDetails(parseInt(lineId));
    }
  }, [lineId]);

  const loadLineDetails = async (id: number, isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      // Charger les détails de la ligne
      const lineData = await sotralUnifiedService.getLineById(id);

      if (lineData) {
        setLine(lineData);
        console.log('[LineDetails] Ligne chargée:', lineData.name, '- ID:', lineData.id);
        
        // Charger les tickets disponibles pour cette ligne
        try {
          console.log('[LineDetails] Chargement des tickets pour la ligne ID:', id);
          const ticketsData = await sotralUnifiedService.getTicketsByLine(id);
          setTickets(ticketsData);
          console.log(`[LineDetails] ✅ ${ticketsData.length} tickets chargés pour la ligne ${lineData.name}`);
          
          if (ticketsData.length > 0) {
            console.log('[LineDetails] Premier ticket:', ticketsData[0].ticket_code, '- Prix:', ticketsData[0].price_paid_fcfa, 'FCFA');
          } else {
            console.warn('[LineDetails] ⚠️ Aucun ticket disponible pour cette ligne');
          }
        } catch (ticketsErr) {
          console.error('[LineDetails] ❌ Erreur chargement tickets:', ticketsErr);
          // Ne pas bloquer l'affichage de la ligne si les tickets ne se chargent pas
          setTickets([]);
        }
      } else {
        setError('Ligne non trouvée');
      }
    } catch (err) {
      console.error('Erreur chargement ligne:', err);
      setError('Erreur lors du chargement des détails de la ligne');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (lineId) {
      loadLineDetails(parseInt(lineId), true);
    }
  };

  const handleRetry = () => {
    if (lineId) {
      loadLineDetails(parseInt(lineId));
    }
  };

  const handleContinueToPayment = () => {
    if (!line) return;

    // Vérifier s'il y a des tickets disponibles
    if (tickets.length === 0) {
      Alert.alert(
        'Aucun ticket disponible',
        'Il n\'y a actuellement aucun ticket disponible pour cette ligne. Veuillez réessayer plus tard.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Utiliser le premier ticket disponible
    const firstTicket = tickets[0];

    // Naviguer vers l'écran de sélection de moyen de paiement
    router.push({
      pathname: '/payment-method',
      params: { 
        lineId: line.id.toString(),
        ticketId: firstTicket.id.toString(),
        quantity: quantity.toString()
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Chargement des détails de la ligne...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !line) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="bus" size={64} color={theme.colors.secondary[300]} />
          <Text style={styles.errorText}>{error || 'Ligne non trouvée'}</Text>
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
            <Text style={styles.headerTitle}>Détails de la ligne</Text>
            <Text style={styles.headerSubtitle}>Ligne {line.line_number}</Text>
          </View>
        </View>

        {/* Line Info Card */}
        <View style={styles.lineCard}>
          <View style={styles.lineHeader}>
            <View style={styles.lineBadge}>
              <Ionicons name="bus" size={24} color={theme.colors.primary[600]} />
              <Text style={styles.lineBadgeText}>SOTRAL</Text>
            </View>
            <View style={styles.lineStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.lineDetails}>
            <Text style={styles.lineName}>{line.name}</Text>
            <Text style={styles.lineRoute}>
              {line.route_from} → {line.route_to}
            </Text>
          </View>

          {/* Route Information */}
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>Informations du trajet</Text>

            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <View style={styles.pointDot} />
                <View style={styles.pointInfo}>
                  <Text style={styles.pointLabel}>Départ</Text>
                  <Text style={styles.pointValue}>{line.route_from}</Text>
                </View>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.routePoint}>
                <View style={[styles.pointDot, styles.arrivalDot]} />
                <View style={styles.pointInfo}>
                  <Text style={styles.pointLabel}>Arrivée</Text>
                  <Text style={styles.pointValue}>{line.route_to}</Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="map" size={20} color={theme.colors.secondary[500]} />
                <Text style={styles.infoText}>Distance: {line.distance_km || 'N/A'} km</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={theme.colors.secondary[500]} />
                <Text style={styles.infoText}>Durée: {line.duration_minutes || 'N/A'} min</Text>
              </View>
            </View>
          </View>

          {/* Category Info */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Catégorie tarifaire</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {line.category?.name || `Catégorie ${line.category_id}`}
              </Text>
            </View>
            {line.category?.description && (
              <Text style={styles.categoryDescription}>
                {line.category.description}
              </Text>
            )}
          </View>

          {/* Price Info */}
          <View style={styles.priceSection}>
            <Text style={styles.sectionTitle}>Tarif</Text>
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Prix par ticket</Text>
                <Text style={styles.priceValue}>{line.price_fcfa || 0} FCFA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quantity Selector & Total */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={24} color={quantity <= 1 ? theme.colors.secondary[300] : theme.colors.primary[600]} />
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Text style={styles.quantityLabel}>ticket{quantity > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= 10 && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.min(10, quantity + 1))}
              disabled={quantity >= 10}
            >
              <Ionicons name="add" size={24} color={quantity >= 10 ? theme.colors.secondary[300] : theme.colors.primary[600]} />
            </TouchableOpacity>
          </View>

          {/* Total Price */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalPrice}>{(line.price_fcfa || 0) * quantity} FCFA</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.continueButton, tickets.length === 0 && styles.disabledButton]}
            onPress={handleContinueToPayment}
            disabled={tickets.length === 0}
          >
            <Text style={styles.continueButtonText}>
              {tickets.length === 0 ? 'Aucun ticket disponible' : 'Continuer vers le paiement'}
            </Text>
            {tickets.length > 0 && (
              <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
            )}
          </TouchableOpacity>
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
  lineCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  lineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  lineBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  lineStatus: {
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
  lineDetails: {
    marginBottom: theme.spacing.xl,
  },
  lineName: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  lineRoute: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[600],
  },
  routeSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  routeInfo: {
    marginBottom: theme.spacing.lg,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  pointDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
    marginRight: theme.spacing.md,
  },
  arrivalDot: {
    backgroundColor: theme.colors.success[500],
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginBottom: theme.spacing.xs,
  },
  pointValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.secondary[200],
    marginLeft: 5,
  },
  additionalInfo: {
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[700],
    marginLeft: theme.spacing.sm,
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  categoryDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    lineHeight: 20,
  },
  priceSection: {
    marginBottom: theme.spacing.lg,
  },
  priceCard: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  quantityContainer: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: theme.colors.secondary[100],
  },
  quantityDisplay: {
    marginHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  quantityLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    marginTop: theme.spacing.xs,
  },
  totalCard: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.medium,
  },
  totalPrice: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
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
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});