// Version de test ultra simple pour identifier l'erreur
import { registerRootComponent } from 'expo';
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

function SimpleTestApp() {
  console.log('🧪 TEST APP - Démarrage simple sans Expo Router');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Test GoSOTRAL</Text>
        <Text style={styles.subtitle}>Version de test simplifiée</Text>
        <Text style={styles.message}>
          Si ce texte s'affiche sans erreur, 
          le problème vient d'Expo Router ou des assets.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: '#343a40',
    textAlign: 'center',
    lineHeight: 20,
  },
});

registerRootComponent(SimpleTestApp);
export default SimpleTestApp;