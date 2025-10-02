import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function DevMenuScreen() {
  const menuItems = [
    {
      title: 'Configuration Réseau',
      subtitle: 'Gérer les endpoints et déploiements',
      route: '/network-config',
      color: '#E91E63',
    },
    {
      title: 'Test Connectivité Réseau',
      subtitle: 'Diagnostiquer les problèmes de connexion API',
      route: '/network-test',
      color: '#FF5722',
    },
    {
      title: 'Health Check Backend',
      subtitle: 'Vérifier l\'état de l\'API backend',
      route: '/health-check',
      color: '#4CAF50',
    },
    {
      title: 'Test Tickets Service',
      subtitle: 'Tester produits, routes, achat et validation',
      route: '/test-tickets',
      color: '#3F51B5',
    },
    {
      title: 'Test Payments Service',
      subtitle: 'Tester mobile money et webhooks',
      route: '/test-payments',
      color: '#FF9800',
    },
    {
      title: 'Test Inscription',
      subtitle: 'Créer un nouveau compte utilisateur',
      route: '/register',
      color: '#9C27B0',
    },
    {
      title: 'Test Connexion',
      subtitle: 'Se connecter avec un compte existant',
      route: '/login',
      color: '#F44336',
    },
    {
      title: 'Application Principale',
      subtitle: 'Interface utilisateur complète avec tabs',
      route: '/(tabs)',
      color: '#2196F3',
    },
  ];

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Développeur</Text>
        <Text style={styles.subtitle}>GoSOTRAL - Tests & Navigation</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { borderLeftColor: item.color }]}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={[styles.menuItemIndicator, { backgroundColor: item.color }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Mode développement activé</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuItemIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
