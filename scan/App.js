// Version simplifiée SANS expo-router pour tester
import { registerRootComponent } from 'expo';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  console.log('🚀 GoSOTRAL Scan - Test Version Simplifiée');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎫 GoSOTRAL Scan</Text>
        <Text style={styles.subtitle}>Application de Contrôle</Text>
        <Text style={styles.success}>✅ Application démarrée avec succès !</Text>
        <Text style={styles.info}>Si vous voyez cet écran, l'app fonctionne ! 🎉</Text>
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 40,
  },
  success: {
    fontSize: 16,
    color: '#28a745',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

registerRootComponent(App);
export default App;
