import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>GoSOTRAL Scan</Text>
        <Text style={styles.subtitle}>Contrôle des Tickets</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>👋 Bienvenue Contrôleur</Text>
          <Text style={styles.welcomeText}>
            Utilisez cette application pour scanner et valider les tickets des passagers SOTRAL.
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/scanner')}
          >
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionTitle}>Scanner QR Code</Text>
            <Text style={styles.actionSubtitle}>Valider un ticket passager</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.actionIcon}>�</Text>
            <Text style={styles.actionTitle}>Historique</Text>
            <Text style={styles.actionSubtitle}>Voir les scans effectués</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>📈 Statistiques du Jour</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Tickets Scannés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#28a745' }]}>22</Text>
              <Text style={styles.statLabel}>Valides</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#dc3545' }]}>2</Text>
              <Text style={styles.statLabel}>Invalides</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0 • GoSOTRAL 2024</Text>
        <Text style={styles.footerText}>Contrôle Sécurisé des Tickets</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  actionsSection: {
    marginBottom: 25,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primaryButton: {
    borderColor: '#0066cc',
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    borderColor: '#e9ecef',
    backgroundColor: '#ffffff',
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  statsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
});
