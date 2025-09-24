import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../src/styles/theme';
import HelpFAB from '../../src/components/HelpFAB';
import { UserTicketService, type UserTicket, type UserTicketHistory } from '../../src/services/userTicketService';
import { SearchService, type SearchResult } from '../../src/services/searchService';
import { SotralMobileService } from '../../services/sotral-service';
import type { SotralTicket } from '../../src/types/api';

export default function SearchTab() {
  // Capturer le paramètre focus envoyé depuis Home
  const { focus, focusTs, activeTab: paramsActiveTab } = useLocalSearchParams<{ focus?: string; focusTs?: string; activeTab?: string }>();
  const searchInputRef = useRef<TextInput | null>(null);
  const scrollRef = useRef<any>(null);
  const historySectionY = useRef<number | null>(null);

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('Aujourd\'hui');
  const [passengerCount, setPassengerCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsState, setSearchResultsState] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const MIN_QUERY_LENGTH = 1; // déclencher dès 1 caractère

  const popularLocations = React.useMemo(() => [
    'Centre-ville', 'Aéroport', 'Université', 'Marché central', 
    'Gare routière', 'Plateau', 'Zone industrielle', 'Hôpital'
  ], []);

  const searchResults = [
    {
      id: 1,
      type: 'Bus rapide',
      company: 'SOTRAL Express',
      departure: '08:30',
      arrival: '09:15',
      duration: '45 min',
      price: '2500 FCFA',
      seats: 12,
      rating: 4.8,
    },
    {
      id: 2,
      type: 'Bus urbain',
      company: 'Transport City',
      departure: '09:00',
      arrival: '09:30',
      duration: '30 min',
      price: '1500 FCFA',
      seats: 8,
      rating: 4.5,
    },
    {
      id: 3,
      type: 'Métro',
      company: 'Metro Line 1',
      departure: '09:15',
      arrival: '09:35',
      duration: '20 min',
      price: '1000 FCFA',
      seats: 25,
      rating: 4.9,
    },
  ];

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = async () => {
    const q = (searchQuery || `${fromLocation} → ${toLocation}`).trim();
    if (!q) return;
    await performSearch(q);
  };

  // Fonction réutilisable pour effectuer la recherche et gérer l'état
  const performSearch = React.useCallback(async (q: string) => {
    const myRequestId = ++requestIdRef.current;
    try {
      setSearchError(null);
      setSearchLoading(true);
      // don't clear results immediately to avoid flicker

      const resultsRaw = await SearchService.searchRoutes(q);
      // ignore if a newer request started
      if (myRequestId !== requestIdRef.current) return;
      const results = Array.isArray(resultsRaw) ? resultsRaw : [];

      // Prioritize items whose 'from', 'to' or 'company' start with the query (prefix-match)
      const qStart = q.split(/→|-/)[0].trim().toLowerCase();
      const isPrefix = (it: any) => {
        if (!qStart) return false;
        const f = (it.from || '').toString().toLowerCase();
        const t = (it.to || '').toString().toLowerCase();
        const c = (it.company || '').toString().toLowerCase();
        return f.startsWith(qStart) || t.startsWith(qStart) || c.startsWith(qStart);
      };

      const prefixMatches = results.filter(isPrefix);
      const otherMatches = results.filter((r) => !isPrefix(r));

      let finalResults: any[] = [...prefixMatches, ...otherMatches];

      // If no API results, try local popularLocations that start with the query
      if (finalResults.length === 0) {
        const local = popularLocations.filter((loc) => loc.toLowerCase().startsWith(qStart));
        if (local.length > 0) {
          finalResults = local.map((loc, idx) => ({
            id: `suggest-${idx}`,
            type: 'Suggestion',
            company: '',
            departure: '',
            arrival: '',
            duration: '',
            price: '',
            seats: 0,
            rating: 0,
            from: loc,
            to: '',
          }));
        }
      }

      if (myRequestId === requestIdRef.current) {
        setSearchResultsState(finalResults as SearchResult[]);
      }
    } catch (e: any) {
      // if stale request, ignore
      if (myRequestId !== requestIdRef.current) return;
      console.error('[SearchTab] Erreur recherche:', e);
      setSearchError(e?.message || 'Erreur lors de la recherche');
    } finally {
      if (myRequestId === requestIdRef.current) setSearchLoading(false);
    }
  }, [popularLocations]);

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

  // Debounced live search: lance la recherche automatiquement quand l'utilisateur tape
  useEffect(() => {
    const q = (searchQuery || `${fromLocation} → ${toLocation}`).trim();
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      // clear results when too short
      requestIdRef.current += 1; // cancel any pending
      setSearchResultsState([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const handle = setTimeout(() => {
      performSearch(q);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery, fromLocation, toLocation, performSearch]);

  // TicketsTab logic intégré avec API
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [activeTickets, setActiveTickets] = useState<UserTicket[]>([]);
  const [historyTickets, setHistoryTickets] = useState<UserTicketHistory[]>([]);
  const [availableTickets, setAvailableTickets] = useState<SotralTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Charger les tickets depuis l'API
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setTicketsLoading(true);

        // Charger les tickets actifs, l'historique et les tickets disponibles en parallèle
        const [activeData, historyData, availableResult] = await Promise.all([
          UserTicketService.getActiveTickets().catch(() => []),
          UserTicketService.getTicketHistory().catch(() => []),
          SotralMobileService.getGeneratedTickets().catch(() => ({ success: false, data: [] })),
        ]);

        setActiveTickets(activeData);
        setHistoryTickets(historyData);
        // Cast to SotralTicket[] since we know the structure matches
        setAvailableTickets(availableResult.success ? availableResult.data as SotralTicket[] : []);
      } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
      } finally {
        setTicketsLoading(false);
      }
    };

    loadTickets();
  }, []);
  const renderActiveTicket = (ticket: UserTicket) => (
    <View key={ticket.id} style={styles.ticketCard}>
      {/* Ticket Header */}
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <View style={styles.transportBadge}>
            <Text style={styles.transportBadgeText}>{ticket.type}</Text>
          </View>
          <Text style={styles.routeText}>{ticket.route}</Text>
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
              <Ionicons name="calendar" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{ticket.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Heure</Text>
              <Text style={styles.detailValue}>{ticket.time}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Prix</Text>
              <Text style={styles.detailValue}>{ticket.price}</Text>
            </View>
            {ticket.seat && ticket.seat !== '---' && (
              <View style={styles.detailItem}>
                <Ionicons name="car-sport" size={16} color={theme.colors.secondary[500]} />
                <Text style={styles.detailLabel}>Siège</Text>
                <Text style={styles.detailValue}>{ticket.seat}</Text>
              </View>
            )}
          </View>
        </View>
        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={ticket.qrCode || `TICKET_${ticket.id}`}
            size={100}
            color={theme.colors.secondary[900]}
            backgroundColor={theme.colors.white}
          />
        </View>
      </View>
      {/* Ticket Footer */}
      <View style={styles.ticketFooter}>
        <View style={styles.expiryInfo}>
          <Ionicons name="time-outline" size={16} color={theme.colors.warning[600]} />
          <Text style={styles.expiryText}>
            {ticket.expiresIn ? `Expire dans ${ticket.expiresIn}` : 'Valide'}
          </Text>
        </View>
        <TouchableOpacity style={styles.showButton}>
          <Text style={styles.showButtonText}>Présenter</Text>
          <Ionicons name="expand" size={16} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      </View>
      {/* Ticket perforation */}
      <View style={styles.perforation}>
        {Array.from({ length: 15 }).map((_, index) => (
          <View key={index} style={styles.perforationDot} />
        ))}
      </View>
    </View>
  );

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

  const renderAvailableTicket = (ticket: SotralTicket) => (
    <View key={ticket.id} style={styles.ticketCard}>
      {/* Ticket Header */}
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <View style={styles.transportBadge}>
            <Text style={styles.transportBadgeText}>SOTRAL</Text>
          </View>
          <Text style={styles.routeText}>
            {(ticket as any).line_name || `Ligne ${ticket.line_id}`}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Disponible</Text>
        </View>
      </View>
      {/* Ticket Body */}
      <View style={styles.ticketBody}>
        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Code</Text>
              <Text style={styles.detailValue}>{ticket.ticket_code}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="refresh" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Trajets</Text>
              <Text style={styles.detailValue}>{ticket.trips_remaining}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color={theme.colors.secondary[500]} />
              <Text style={styles.detailLabel}>Prix</Text>
              <Text style={styles.detailValue}>{ticket.price_paid_fcfa} FCFA</Text>
            </View>
            {ticket.expires_at && (
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color={theme.colors.secondary[500]} />
                <Text style={styles.detailLabel}>Expire</Text>
                <Text style={styles.detailValue}>
                  {new Date(ticket.expires_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={ticket.qr_code}
            size={100}
            color={theme.colors.secondary[900]}
            backgroundColor={theme.colors.white}
          />
        </View>
      </View>
      {/* Ticket Footer */}
      <View style={styles.ticketFooter}>
        <View style={styles.expiryInfo}>
          <Ionicons name="time-outline" size={16} color={theme.colors.warning[600]} />
          <Text style={styles.expiryText}>Généré par l'admin</Text>
        </View>
        <TouchableOpacity style={styles.showButton}>
          <Text style={styles.showButtonText}>Acheter</Text>
          <Ionicons name="card" size={16} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      </View>
      {/* Ticket perforation */}
      <View style={styles.perforation}>
        {Array.from({ length: 15 }).map((_, index) => (
          <View key={index} style={styles.perforationDot} />
        ))}
      </View>
    </View>
  );
  // Si on arrive avec activeTab=history, basculer et scroller vers la section historique
  useEffect(() => {
    if (paramsActiveTab === 'history') {
      setActiveTab('history');
      // attendre que la layout soit calculée, puis scroller
      setTimeout(() => {
        if (historySectionY.current != null && scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
          scrollRef.current.scrollTo({ y: historySectionY.current, animated: true });
        }
      }, 250);
    }
  }, [paramsActiveTab, focusTs]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={r => { scrollRef.current = r; }} showsVerticalScrollIndicator={false}>
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
          {/* Search results panel */}
          <View style={styles.searchResultsCard}>
            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            ) : searchError ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Erreur: {searchError}</Text>
              </View>
            ) : searchResultsState.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun résultat. Essayez une autre requête</Text>
              </View>
            ) : (
              searchResultsState.map((r) => (
                <TouchableOpacity key={r.id} style={styles.resultCard} onPress={() => {
                  // Préremplir les champs from/to et naviguer vers les résultats détaillés si nécessaire
                  setFromLocation(r.from);
                  setToLocation(r.to);
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
            )}
          </View>
        </View>
        {/* Popular Locations */}
        {/* ...existing code... */}
        {/* Search Results */}
        {/* ...existing code... */}
        {/* Billets actifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes billets actifs</Text>
          {ticketsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement de vos billets...</Text>
            </View>
          ) : activeTickets.length > 0 ? (
            activeTickets.map(renderActiveTicket)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket-outline" size={48} color={theme.colors.secondary[300]} />
              <Text style={styles.emptyText}>Aucun billet actif</Text>
              <Text style={styles.emptySubtext}>Vos prochains voyages apparaîtront ici</Text>
            </View>
          )}
        </View>

        {/* Tickets disponibles (générés par admin) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billets disponibles SOTRAL</Text>
          {ticketsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des tickets disponibles...</Text>
            </View>
          ) : availableTickets.length > 0 ? (
            availableTickets.map(renderAvailableTicket)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bus" size={48} color={theme.colors.secondary[300]} />
              <Text style={styles.emptyText}>Aucun ticket disponible</Text>
              <Text style={styles.emptySubtext}>Les tickets générés par l'admin apparaîtront ici</Text>
            </View>
          )}
        </View>
        
        {/* Historique des billets */}
        <View style={styles.section} onLayout={e => { historySectionY.current = e.nativeEvent.layout.y; }}>
          <Text style={styles.sectionTitle}>Historique des billets</Text>
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
  searchCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
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
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
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
  /* Styles importés depuis tickets.tsx pour l'affichage des billets */
  ticketCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
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
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary[100],
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  showButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  showButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.xs,
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
  searchResultsCard: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
});
