import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';

export default function SearchTab() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('Aujourd\'hui');
  const [passengerCount, setPassengerCount] = useState(1);

  const popularLocations = [
    'Centre-ville', 'Aéroport', 'Université', 'Marché central', 
    'Gare routière', 'Plateau', 'Zone industrielle', 'Hôpital'
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rechercher un trajet</Text>
          <Text style={styles.headerSubtitle}>Trouvez le transport idéal</Text>
        </View>

        {/* Search Form */}
        <View style={styles.searchCard}>
          {/* From/To Inputs */}
          <View style={styles.locationInputs}>
            <View style={styles.inputContainer}>
              <View style={styles.locationDot} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Départ</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="D'où partez-vous ?"
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  placeholderTextColor={theme.colors.secondary[400]}
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
              <Ionicons name="swap-vertical" size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <View style={[styles.locationDot, { backgroundColor: theme.colors.primary[600] }]} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Arrivée</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Où allez-vous ?"
                  value={toLocation}
                  onChangeText={setToLocation}
                  placeholderTextColor={theme.colors.secondary[400]}
                />
              </View>
            </View>
          </View>

          {/* Date and Passengers */}
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionButton}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.optionText}>{selectedDate}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.secondary[400]} />
            </TouchableOpacity>

            <View style={styles.passengerCounter}>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => setPassengerCount(Math.max(1, passengerCount - 1))}
              >
                <Ionicons name="remove" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
              <Text style={styles.passengerText}>{passengerCount} passager{passengerCount > 1 ? 's' : ''}</Text>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={() => setPassengerCount(passengerCount + 1)}
              >
                <Ionicons name="add" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color={theme.colors.white} />
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinations populaires</Text>
          <View style={styles.locationsGrid}>
            {popularLocations.map((location, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.locationChip}
                onPress={() => setToLocation(location)}
              >
                <Text style={styles.locationChipText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Results */}
        {(fromLocation || toLocation) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de recherche</Text>
            {searchResults.map((result) => (
              <TouchableOpacity key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.transportInfo}>
                    <View style={styles.transportType}>
                      <Text style={styles.transportTypeText}>{result.type}</Text>
                    </View>
                    <Text style={styles.companyName}>{result.company}</Text>
                  </View>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={12} color={theme.colors.warning[500]} />
                    <Text style={styles.ratingText}>{result.rating}</Text>
                  </View>
                </View>

                <View style={styles.timeInfo}>
                  <View style={styles.timePoint}>
                    <Text style={styles.timeText}>{result.departure}</Text>
                    <Text style={styles.locationText}>Départ</Text>
                  </View>
                  
                  <View style={styles.journeyLine}>
                    <View style={styles.journeyDot} />
                    <View style={styles.journeyPath} />
                    <View style={styles.journeyDot} />
                    <Text style={styles.durationText}>{result.duration}</Text>
                  </View>
                  
                  <View style={styles.timePoint}>
                    <Text style={styles.timeText}>{result.arrival}</Text>
                    <Text style={styles.locationText}>Arrivée</Text>
                  </View>
                </View>

                <View style={styles.resultFooter}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.price}>{result.price}</Text>
                    <Text style={styles.seatsText}>{result.seats} places restantes</Text>
                  </View>
                  <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Réserver</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[500],
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
});
