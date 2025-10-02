import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService, type UnifiedSotralLine } from '../src/services/sotralUnifiedService';

const { width, height } = Dimensions.get('window');

// Coordonnées du centre de Lomé, Togo
const LOME_CENTER = {
  latitude: 6.1375,
  longitude: 1.2123,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Arrêts SOTRAL principaux à Lomé
const SOTRAL_STOPS = [
  { id: 1, name: 'Gare Routière', latitude: 6.1375, longitude: 1.2123, lines: [1, 2, 3] },
  { id: 2, name: 'Grand Marché', latitude: 6.1298, longitude: 1.2150, lines: [1, 4] },
  { id: 3, name: 'Tokoin', latitude: 6.1450, longitude: 1.2100, lines: [2, 5] },
  { id: 4, name: 'Aéroport', latitude: 6.1656, longitude: 1.2544, lines: [3] },
  { id: 5, name: 'Port', latitude: 6.1300, longitude: 1.2200, lines: [1] },
  { id: 6, name: 'Université', latitude: 6.1800, longitude: 1.2000, lines: [4] },
  { id: 7, name: 'Bè', latitude: 6.1520, longitude: 1.2380, lines: [2, 3] },
  { id: 8, name: 'Agoè', latitude: 6.1900, longitude: 1.2150, lines: [4, 5] },
  { id: 9, name: 'Adidogomé', latitude: 6.1600, longitude: 1.1950, lines: [5] },
  { id: 10, name: 'Nyékonakpoè', latitude: 6.1250, longitude: 1.2400, lines: [3] },
];

// Couleurs pour chaque ligne
const LINE_COLORS: { [key: number]: string } = {
  1: '#FF6B6B', // Rouge
  2: '#4ECDC4', // Turquoise
  3: '#45B7D1', // Bleu
  4: '#FFA07A', // Orange
  5: '#98D8C8', // Vert
};

export default function MapScreen() {
  const [lines, setLines] = useState<UnifiedSotralLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStop, setSelectedStop] = useState<typeof SOTRAL_STOPS[0] | null>(null);
  const [selectedLine, setSelectedLine] = useState<UnifiedSotralLine | null>(null);
  const [showLinesPanel, setShowLinesPanel] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const mapRef = useRef<MapView>(null);
  const refreshIntervalRef = useRef<any>(null);

  useEffect(() => {
    loadLines();
    
    // Auto-refresh toutes les 30 secondes
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        console.log('[Map] 🔄 Auto-refresh des lignes...');
        loadLines();
      }, 30000); // 30 secondes
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled]);

  const loadLines = async () => {
    try {
      if (!refreshing) setLoading(true);
      console.log('[Map] 📡 Chargement des lignes depuis l\'API...');
      const linesData = await sotralUnifiedService.getLines();
      console.log('[Map] ✅ Lignes chargées:', linesData.length);
      setLines(linesData);
    } catch (error) {
      console.error('[Map] ❌ Erreur chargement lignes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLines();
  };

  const handleStopPress = (stop: typeof SOTRAL_STOPS[0]) => {
    setSelectedStop(stop);
    // Centrer la carte sur l'arrêt
    mapRef.current?.animateToRegion({
      latitude: stop.latitude,
      longitude: stop.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  };

  const handleLineSelect = (line: UnifiedSotralLine) => {
    if (selectedLine?.id === line.id) {
      setSelectedLine(null);
    } else {
      setSelectedLine(line);
      // Filtrer et afficher les arrêts de cette ligne
      const lineStops = SOTRAL_STOPS.filter(stop => stop.lines.includes(line.id));
      if (lineStops.length > 0) {
        // Centrer sur le premier arrêt de la ligne
        mapRef.current?.animateToRegion({
          latitude: lineStops[0].latitude,
          longitude: lineStops[0].longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }, 500);
      }
    }
  };

  const handleSearchFromStop = () => {
    if (selectedStop) {
      router.push({
        pathname: '/(tabs)/search',
        params: {
          from: selectedStop.name,
          focus: 'true'
        }
      });
    }
  };

  const resetView = () => {
    setSelectedStop(null);
    setSelectedLine(null);
    mapRef.current?.animateToRegion(LOME_CENTER, 500);
  };

  // Filtrer les arrêts selon la ligne sélectionnée
  const filteredStops = selectedLine 
    ? SOTRAL_STOPS.filter(stop => stop.lines.includes(selectedLine.id))
    : SOTRAL_STOPS;

  // Générer une couleur dynamique pour chaque ligne
  const getLineColor = (lineId: number): string => {
    if (LINE_COLORS[lineId]) return LINE_COLORS[lineId];
    // Générer une couleur à partir de l'ID
    const hue = (lineId * 137) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Carte du Réseau SOTRAL</Text>
          <Text style={styles.headerSubtitle}>Lomé, Togo</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            style={[styles.autoRefreshButton, autoRefreshEnabled && styles.autoRefreshButtonActive]}
          >
            <Ionicons 
              name={autoRefreshEnabled ? "sync" : "sync-outline"} 
              size={20} 
              color={theme.colors.white} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowLinesPanel(!showLinesPanel)}
            style={styles.menuButton}
          >
            <Ionicons name="list" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={LOME_CENTER}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          showsCompass={true}
          showsScale={true}
        >
          {/* Marqueurs d'arrêts */}
          {filteredStops.map((stop) => {
            const isSelected = selectedStop?.id === stop.id;
            const hasSelectedLine = selectedLine !== null && stop.lines.includes(selectedLine.id);
            
            return (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                title={stop.name}
                description={`Lignes: ${stop.lines.join(', ')}`}
                onPress={() => handleStopPress(stop)}
              >
                <View style={[
                  styles.markerContainer,
                  isSelected ? styles.markerSelected : null,
                  hasSelectedLine ? styles.markerHighlighted : null,
                ]}>
                  <Ionicons 
                    name="bus" 
                    size={isSelected ? 20 : 16} 
                    color={theme.colors.white} 
                  />
                  {stop.lines.length > 1 && (
                    <View style={styles.markerBadge}>
                      <Text style={styles.markerBadgeText}>{stop.lines.length}</Text>
                    </View>
                  )}
                </View>
              </Marker>
            );
          })}

          {/* Lignes de connexion pour la ligne sélectionnée */}
          {selectedLine && filteredStops.length > 1 && (
            <Polyline
              coordinates={filteredStops.map(stop => ({
                latitude: stop.latitude,
                longitude: stop.longitude,
              }))}
              strokeColor={getLineColor(selectedLine.id)}
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>

        {/* Floating buttons */}
        <View style={styles.floatingButtons}>
          {(selectedStop || selectedLine) && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetView}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Lines Panel */}
        {showLinesPanel && (
          <View style={styles.linesPanel}>
            <View style={styles.linesPanelHeader}>
              <View style={styles.linesPanelTitleContainer}>
                <Text style={styles.linesPanelTitle}>Lignes SOTRAL</Text>
                <Text style={styles.linesPanelSubtitle}>{lines.length} lignes actives</Text>
              </View>
              <View style={styles.linesPanelActions}>
                <TouchableOpacity 
                  onPress={handleRefresh}
                  style={styles.refreshIconButton}
                >
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color={refreshing ? theme.colors.primary[600] : theme.colors.secondary[600]} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowLinesPanel(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.secondary[600]} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.linesList} showsVerticalScrollIndicator={false}>
              {lines.length === 0 ? (
                <View style={styles.emptyLinesContainer}>
                  <Ionicons name="bus-outline" size={48} color={theme.colors.secondary[300]} />
                  <Text style={styles.emptyLinesText}>Aucune ligne disponible</Text>
                  <Text style={styles.emptyLinesSubtext}>Les lignes créées par l'admin apparaîtront ici</Text>
                </View>
              ) : (
                lines.map((line) => {
                  const lineStops = SOTRAL_STOPS.filter(stop => stop.lines.includes(line.id));
                  const isSelected = selectedLine?.id === line.id;
                  
                  return (
                    <TouchableOpacity
                      key={line.id}
                      style={[styles.lineItem, isSelected && styles.lineItemSelected]}
                      onPress={() => handleLineSelect(line)}
                    >
                      <View style={[styles.lineColor, { backgroundColor: getLineColor(line.id) }]} />
                      <View style={styles.lineInfo}>
                        <Text style={styles.lineName}>{line.name}</Text>
                        <Text style={styles.lineRoute}>
                          {line.route_from} → {line.route_to}
                        </Text>
                        <Text style={styles.lineStops}>{lineStops.length} arrêts sur la carte</Text>
                      </View>
                      {line.is_active ? (
                        <Ionicons 
                          name={isSelected ? "checkmark-circle" : "chevron-forward"} 
                          size={20} 
                          color={isSelected ? theme.colors.primary[600] : theme.colors.secondary[400]} 
                        />
                      ) : (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Inactive</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* Stop Info Panel */}
        {selectedStop && !showLinesPanel && (
          <View style={styles.stopInfoPanel}>
            <View style={styles.stopInfoHeader}>
              <View style={styles.stopInfoTitle}>
                <Ionicons name="location" size={24} color={theme.colors.primary[600]} />
                <Text style={styles.stopName}>{selectedStop.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedStop(null)}>
                <Ionicons name="close-circle" size={24} color={theme.colors.secondary[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.stopLines}>
              <Text style={styles.stopLinesLabel}>Lignes desservies :</Text>
              <View style={styles.stopLinesContainer}>
                {selectedStop.lines.map((lineNum) => (
                  <View 
                    key={lineNum} 
                    style={[
                      styles.stopLineBadge,
                      { backgroundColor: LINE_COLORS[lineNum] }
                    ]}
                  >
                    <Text style={styles.stopLineBadgeText}>Ligne {lineNum}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchFromStop}
            >
              <Ionicons name="search" size={20} color={theme.colors.white} />
              <Text style={styles.searchButtonText}>Rechercher depuis cet arrêt</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Legend Panel */}
        {!selectedStop && !showLinesPanel && (
          <View style={styles.legendPanel}>
            <View style={styles.legendHeader}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.legendTitle}>Réseau SOTRAL</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{SOTRAL_STOPS.length}</Text>
                <Text style={styles.statLabel}>Arrêts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{lines.length}</Text>
                <Text style={styles.statLabel}>Lignes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons 
                  name={autoRefreshEnabled ? "sync" : "sync-outline"} 
                  size={16} 
                  color={autoRefreshEnabled ? theme.colors.success[600] : theme.colors.secondary[400]} 
                />
                <Text style={styles.statLabel}>Auto-refresh</Text>
              </View>
            </View>
            <Text style={styles.legendHint}>
              Appuyez sur un arrêt pour voir les détails
            </Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.md,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary[900],
    marginLeft: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  // Nouveaux styles pour la carte redesignée
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary[700],
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  markerHighlighted: {
    backgroundColor: theme.colors.secondary[600],
  },
  markerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  floatingButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  linesPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: theme.colors.white,
    ...theme.shadows.lg,
  },
  linesPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
  },
  linesPanelTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
  },
  linesList: {
    flex: 1,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[100],
  },
  lineItemSelected: {
    backgroundColor: theme.colors.primary[50],
  },
  lineColor: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 12,
  },
  lineInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary[900],
  },
  lineStops: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  stopInfoPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  stopInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stopInfoTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
  },
  stopLines: {
    marginBottom: theme.spacing.lg,
  },
  stopLinesLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    marginBottom: theme.spacing.sm,
  },
  stopLinesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stopLineBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stopLineBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: 8,
  },
  searchButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  legendPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  legendTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary[900],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: theme.spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.secondary[200],
  },
  legendHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Nouveaux styles pour la carte dynamique
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  autoRefreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoRefreshButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  linesPanelTitleContainer: {
    flex: 1,
  },
  linesPanelSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  linesPanelActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLinesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  emptyLinesText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary[600],
    marginTop: theme.spacing.md,
  },
  emptyLinesSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[400],
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  lineRoute: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    marginTop: 2,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.secondary[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  inactiveBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
});