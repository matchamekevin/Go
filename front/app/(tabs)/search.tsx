import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../src/styles/theme';
import HelpFAB from '../../src/components/HelpFAB';
import MobilePaymentModal from '../../src/components/MobilePaymentModal';
import { sotralUnifiedService, UnifiedSotralLine, UnifiedSotralTicket, UnifiedSearchData } from '../../src/services/sotralUnifiedService';
import { useAutoRefresh } from '../../src/hooks/useAutoRefresh';

export default function SearchTab() {
  // Capturer le paramètre focus envoyé depuis Home
  const { focus, focusTs } = useLocalSearchParams<{ focus?: string; focusTs?: string }>();
  const router = useRouter();
  const searchInputRef = useRef<TextInput | null>(null);

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('Aujourd\'hui');
  const [passengerCount, setPassengerCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [allLines, setAllLines] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const MIN_QUERY_LENGTH = 1; // déclencher dès 1 caractère

  const popularLocations = React.useMemo(() => {
    // Les emplacements populaires viennent maintenant de l'admin via l'API
    // Cette liste sera remplacée par des données dynamiques de l'admin
    return [];
  }, []);

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = () => {
    // Le filtrage se fait automatiquement via getFilteredLines
    console.log('[SearchTab] Recherche:', searchQuery);
  };

  // Fonction pour charger toutes les lignes SOTRAL disponibles
  const loadAllLines = React.useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setSearchError(null);
        setSearchLoading(true);
      }
      console.log('[SearchTab] Chargement de toutes les lignes SOTRAL...');

      const searchData: UnifiedSearchData = await sotralUnifiedService.search('');
      const results = searchData.searchResults;

      console.log('[SearchTab] Lignes SOTRAL chargées:', results.length);
      setAllLines(results);
      
      // Effacer l'erreur si le chargement réussit
      if (searchError && !silent) {
        setSearchError(null);
      }
    } catch (e: any) {
      console.error('[SearchTab] Erreur chargement lignes:', e);
      // N'afficher l'erreur que si ce n'est pas un refresh silencieux
      if (!silent) {
        setSearchError(e?.message || 'Erreur lors du chargement');
        setAllLines([]);
      }
    } finally {
      if (!silent) {
        setSearchLoading(false);
      }
    }
  }, [searchError]);

  // Fonction pour filtrer les lignes localement
  const getFilteredLines = React.useCallback(() => {
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      // Pas de recherche, retourner toutes les lignes
      return allLines;
    }

    // Filtrer les lignes en fonction de la recherche
    return allLines.filter((line) => {
      const from = (line.from || '').toString().toLowerCase();
      const to = (line.to || '').toString().toLowerCase();
      const company = (line.company || '').toString().toLowerCase();
      const type = (line.type || '').toString().toLowerCase();
      
      return from.includes(query) || 
             to.includes(query) || 
             company.includes(query) ||
             type.includes(query);
    });
  }, [allLines, searchQuery]);

  // Focus le champ de recherche si on a reçu focus=true depuis Home
  useEffect(() => {
    // focusTs changes on each navigation push from Home, so use it to retrigger focus
    if (focus === 'true' && searchInputRef.current) {
      try {
        searchInputRef.current.focus();
      } catch (e) {
        console.warn('[SearchTab] impossible de focus via ref', e);
      }
    }
  }, [focus, focusTs]);

  // Calculer les lignes filtrées (se met à jour automatiquement quand searchQuery change)
  const filteredLines = getFilteredLines();

  const [selectedLine, setSelectedLine] = useState<UnifiedSotralLine | null>(null);
  const [lineTickets, setLineTickets] = useState<UnifiedSotralTicket[]>([]);
  const [lineTicketsLoading, setLineTicketsLoading] = useState(false);
  
  // État pour le modal de paiement
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState<UnifiedSotralTicket | null>(null);

  // Gérer le succès du paiement
  const handlePaymentSuccess = (purchasedTicket: UnifiedSotralTicket) => {
    console.log('[SearchTab] Paiement réussi pour ticket:', purchasedTicket.ticket_code);

    // Mettre à jour la liste des tickets
    setLineTickets(prev => prev.filter(t => t.id !== purchasedTicket.id));

    // Afficher un message de succès
    Alert.alert(
      'Achat réussi !',
      `Votre ticket ${purchasedTicket.ticket_code} a été acheté avec succès.`,
      [{ text: 'OK' }]
    );
  };

  // Charger toutes les lignes au démarrage
  useEffect(() => {
    loadAllLines();
  }, [loadAllLines]);



  // Rafraîchissement automatique des données (en arrière-plan, sans indicateur visuel)
  useAutoRefresh({
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    onRefresh: async () => {
      console.log('[SearchTab] Rafraîchissement automatique en arrière-plan...');
      // Mode silencieux : pas d'indicateur de chargement
      await loadAllLines(true);
    },
    enabled: true,
  });



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rechercher un trajet</Text>
          <Text style={styles.headerSubtitle}>Trouvez le transport idéal</Text>
        </View>
        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.secondary[500]} />
            <TextInput
              ref={r => { searchInputRef.current = r; }}
              style={styles.searchInput}
              placeholder="Rechercher un trajet, lieu ou compagnie"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              placeholderTextColor={theme.colors.secondary[400]}
              autoFocus={focus === 'true'}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchAction}>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Search Results */}
        <>
          {/* Popular Locations */}
          {/* ...existing code... */}
          {/* Search Results */}
          {/* ...existing code... */}

          {/* Lignes SOTRAL disponibles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim() ? `Résultats de recherche (${filteredLines.length})` : 'Lignes SOTRAL disponibles'}
            </Text>
            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Chargement des lignes...</Text>
              </View>
            ) : searchError ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Erreur: {searchError}</Text>
              </View>
            ) : filteredLines.length > 0 ? (
              filteredLines.map((r) => (
                <TouchableOpacity key={r.id} style={styles.resultCard} onPress={() => {
                  // Naviguer vers les détails de la ligne selon le nouveau flux MVC
                  if (r.line) {
                    router.push({
                      pathname: '/line-details',
                      params: { lineId: r.line.id.toString() }
                    });
                  } else {
                    // Créer une ligne basique si pas disponible
                    router.push({
                      pathname: '/line-details',
                      params: { lineId: r.id }
                    });
                  }
                }}>
                  <View style={styles.resultHeader}>
                    <View style={styles.transportInfo}>
                      <View style={styles.transportType}>
                        <Text style={styles.transportTypeText}>{r.type}</Text>
                      </View>
                      <Text style={styles.companyName}>{r.company || 'Opérateur inconnu'}</Text>
                    </View>
                    <View>
                      <Text style={styles.price}>{r.price}</Text>
                    </View>
                  </View>
                  <View style={styles.timeInfo}>
                    <View style={styles.timePoint}>
                      <Text style={styles.timeText}>{r.from}</Text>
                      <Text style={styles.locationText}>Départ</Text>
                    </View>
                    <View style={styles.journeyLine} />
                    <View style={styles.timePoint}>
                      <Text style={styles.timeText}>{r.to}</Text>
                      <Text style={styles.locationText}>Arrivée</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="bus" size={48} color={theme.colors.secondary[300]} />
                <Text style={styles.emptyText}>Aucune ligne disponible</Text>
                <Text style={styles.emptySubtext}>Les lignes SOTRAL apparaîtront ici</Text>
              </View>
            )}
          </View>
        </>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de paiement mobile */}
      <MobilePaymentModal
        visible={paymentModalVisible}
        ticket={selectedTicketForPayment}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

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
  searchCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  locationInputs: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary[300],
    marginRight: theme.spacing.md,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  locationInput: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
  },
  swapButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  optionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginHorizontal: theme.spacing.sm,
    flex: 1,
  },
  passengerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  counterButton: {
    padding: theme.spacing.sm,
  },
  passengerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginHorizontal: theme.spacing.sm,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  searchButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
  },
  searchAction: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary[600],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  locationChip: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },
  locationChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  resultCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  transportInfo: {
    flex: 1,
  },
  transportType: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  transportTypeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  companyName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    marginLeft: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timePoint: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  locationText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  journeyLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    position: 'relative',
  },
  journeyDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
  },
  journeyPath: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.primary[200],
  },
  durationText: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xs,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {},
  price: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  seatsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  bookButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
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
  searchResultsCard: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: 0,
    paddingBottom: theme.spacing.sm,
  },
});
