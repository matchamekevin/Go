import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';
import { testConnectivity } from '../src/utils/network';

type TestResult = { url: string; status: 'testing' | 'success' | 'failed' };

export default function NetworkTestScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testUrls = [
    'http://192.168.1.184:7000', // IP réseau local (ta machine)
    'http://10.0.2.2:7000',      // Android emulator
    'http://127.0.0.1:7000',     // iOS simulator
    'http://localhost:7000',      // Web/fallback
  ];

  const testAllConnections = async () => {
    setLoading(true);
    let testResults: TestResult[] = testUrls.map(url => ({ url, status: 'testing' }));
    setResults(testResults);

    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      
      try {
        console.log(`[NetworkTest] Testing ${url}...`);
        const isAvailable = await testConnectivity(url);
        
        testResults = [...testResults];
        testResults[i] = {
          url,
          status: isAvailable ? 'success' : 'failed'
        };
        
        setResults(testResults);
        
        if (isAvailable) {
          console.log(`[NetworkTest] ✅ ${url} is available`);
        } else {
          console.log(`[NetworkTest] ❌ ${url} is not available`);
        }
      } catch (error) {
        console.log(`[NetworkTest] ❌ ${url} failed:`, error);
        testResults = [...testResults];
        testResults[i] = { url, status: 'failed' };
        setResults(testResults);
      }

      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
  };

  const testSingleUrl = async (url: string) => {
    try {
      setLoading(true);
      const isAvailable = await testConnectivity(url);
      
      Alert.alert(
        'Test de connectivité',
        `${url}\n\nStatut: ${isAvailable ? '✅ Disponible' : '❌ Non disponible'}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', `Impossible de tester ${url}\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <ActivityIndicator size="small" color={theme.colors.primary[600]} />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />;
      case 'failed':
        return <Ionicons name="close-circle" size={24} color={theme.colors.error[600]} />;
      default:
        return <Ionicons name="help-circle" size={24} color={theme.colors.secondary[400]} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return theme.colors.success[50];
      case 'failed':
        return theme.colors.error[50];
      case 'testing':
        return theme.colors.secondary[50];
      default:
        return theme.colors.white;
    }
  };

  useEffect(() => {
    // Test automatique au chargement
    testAllConnections();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Test de Connectivité Réseau</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>URLs testées automatiquement</Text>
          <Text style={styles.description}>
            Test de connectivité vers le backend sur différentes adresses
          </Text>

          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={testAllConnections}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Retester Toutes les URLs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résultats des tests</Text>
          
          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun test effectué</Text>
            </View>
          ) : (
            results.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.resultItem, { backgroundColor: getStatusColor(result.status) }]}
                onPress={() => testSingleUrl(result.url)}
                disabled={loading}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.resultUrl}>{result.url}</Text>
                  <Text style={styles.resultDescription}>
                    {result.url.includes('192.168.1.184') && 'IP réseau local'}
                    {result.url.includes('10.0.2.2') && 'Android Emulator'}
                    {result.url.includes('127.0.0.1') && 'iOS Simulator'}
                    {result.url.includes('localhost') && 'Web/Localhost'}
                  </Text>
                </View>
                <View style={styles.resultStatus}>
                  {getStatusIcon(result.status)}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de debug</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Configuration actuelle:</Text>
            <Text style={styles.infoItem}>• IP Machine: 192.168.1.184</Text>
            <Text style={styles.infoItem}>• Port Backend: 7000</Text>
            <Text style={styles.infoItem}>• Android: utilise 10.0.2.2</Text>
            <Text style={styles.infoItem}>• iOS: utilise IP réseau local</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Solutions si connexion échoue:</Text>
            <Text style={styles.infoItem}>1. Vérifier que le backend tourne (docker-compose up)</Text>
            <Text style={styles.infoItem}>2. Vérifier l'IP de la machine (hostname -I)</Text>
            <Text style={styles.infoItem}>3. Tester manuellement: curl http://IP:7000/health</Text>
            <Text style={styles.infoItem}>4. Vérifier le firewall de la machine</Text>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Test en cours...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
    backgroundColor: theme.colors.white,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.secondary[600],
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.secondary[500],
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },
  resultContent: {
    flex: 1,
  },
  resultUrl: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.secondary[900],
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    color: theme.colors.secondary[600],
  },
  resultStatus: {
    marginLeft: 12,
  },
  infoBox: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 12,
    color: theme.colors.secondary[600],
    marginBottom: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.white,
    fontSize: 16,
    marginTop: 12,
  },
});
