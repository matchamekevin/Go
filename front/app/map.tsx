import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService, type UnifiedSotralLine } from '../src/services/sotralUnifiedService';

const { width, height } = Dimensions.get('window');

// Coordonnées approximatives de Lomé, Togo
const LOME_COORDS = {
  latitude: 6.1375,
  longitude: 1.2123,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Points SOTRAL simulés à Lomé (à remplacer par données réelles)
const SOTRAL_STOPS = [
  { id: 1, name: 'Gare Centrale', latitude: 6.1375, longitude: 1.2123, line: 'Ligne 1' },
  { id: 2, name: 'Marché Kpota', latitude: 6.1420, longitude: 1.2180, line: 'Ligne 2' },
  { id: 3, name: 'Aéroport', latitude: 6.1650, longitude: 1.2540, line: 'Ligne 3' },
  { id: 4, name: 'Port Autonome', latitude: 6.1300, longitude: 1.2200, line: 'Ligne 1' },
  { id: 5, name: 'Université de Lomé', latitude: 6.1800, longitude: 1.2000, line: 'Ligne 4' },
  { id: 6, name: 'Hôpital de Tokoin', latitude: 6.1450, longitude: 1.2100, line: 'Ligne 2' },
];

export default function MapScreen() {
  const [lines, setLines] = useState<UnifiedSotralLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = async () => {
    try {
      const linesData = await sotralUnifiedService.getLines();
      setLines(linesData);
    } catch (error) {
      console.error('Erreur chargement lignes:', error);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Carte SOTRAL Lomé</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={{
            latitude: 6.1375, // Centre de Lomé
            longitude: 1.2123,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
        >
          {/* Points SOTRAL */}
          {SOTRAL_STOPS.map((stop) => (
            <Marker
              key={stop.id}
              coordinate={{
                latitude: stop.latitude,
                longitude: stop.longitude,
              }}
              title={stop.name}
              description={`Ligne ${stop.line}`}
              onPress={() => {
                // Navigation vers la recherche avec cette ligne
                router.push({
                  pathname: '/(tabs)/search',
                  params: {
                    from: stop.name,
                    lineId: stop.id.toString(),
                    focus: 'true'
                  }
                });
              }}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="bus" size={16} color={theme.colors.white} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Info Panel */}
        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary[600]} />
            <Text style={styles.infoTitle}>Carte Interactive</Text>
          </View>
          <Text style={styles.infoText}>
            Appuyez sur un point SOTRAL pour commencer votre trajet depuis cet arrêt.
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{SOTRAL_STOPS.length}</Text>
              <Text style={styles.statLabel}>Arrêts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{lines.length}</Text>
              <Text style={styles.statLabel}>Lignes</Text>
            </View>
          </View>
        </View>
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
});