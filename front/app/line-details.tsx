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
import { sotralUnifiedService, UnifiedSotralLine } from '../src/services/sotralUnifiedService';

export default function LineDetailsScreen() {
  const { lineId } = useLocalSearchParams<{ lineId: string }>();
  const router = useRouter();

  const [line, setLine] = useState<UnifiedSotralLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Pour l'instant, nous simulons le chargement des détails de la ligne
      // Dans un vrai scénario, nous aurions une API pour récupérer les détails complets
      const lineData = await sotralUnifiedService.getLineById(id);

      if (lineData) {
        setLine(lineData);
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

    // Naviguer vers l'écran de confirmation de paiement
    router.push({
      pathname: '/payment-confirmation',
      params: { lineId: line.id.toString() }
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
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueToPayment}
          >
            <Text style={styles.continueButtonText}>Continuer vers le paiement</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
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