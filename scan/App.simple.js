// Version ultra-simplifiée pour tester - Sans expo-router
import { registerRootComponent } from 'expo';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  console.log('🚀 GoSOTRAL Scan - Version Simplifiée');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎫 GoSOTRAL Scan</Text>
        <Text style={styles.subtitle}>Application de Contrôle</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>✅ Application démarrée avec succès</Text>
          <Text style={styles.infoText}>📱 Version simplifiée sans router</Text>
          <Text style={styles.infoText}>🔗 API: https://go-j2rr.onrender.com</Text>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Scanner QR Code</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Si vous voyez cet écran, l'app fonctionne ! 🎉
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
  infoBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    marginTop: 20,
  },
});

registerRootComponent(App);
export default App;
