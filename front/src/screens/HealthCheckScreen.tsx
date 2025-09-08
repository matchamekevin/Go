import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { apiClient } from '../services/apiClient';
import { Config } from '../config';
import Button from '../components/Button';

export default function HealthCheckScreen() {
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [apiUrl, setApiUrl] = useState(Config.apiBaseUrl);

  const performHealthCheck = async () => {
    setLoading(true);
    try {
      console.log('Testing API URL:', apiUrl);
      const response = await apiClient.healthCheck() as { backend: string; database: string };
      console.log('Health check response:', response);
      
      setStatus('success');
      setLastCheck(new Date().toLocaleString());
      
      Alert.alert(
        'Santé de l\'API',
        `Backend: ${response.backend}\nBase de données: ${response.database}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Health check error:', error);
      setStatus('error');
      setLastCheck(new Date().toLocaleString());
      
      const errorMessage = error instanceof Error ? error.message : 'Impossible de se connecter au serveur';
      console.error('Full error:', errorMessage);
      
      Alert.alert(
        'Erreur de connexion',
        `${errorMessage}\n\nURL testée: ${apiUrl}\nPlateforme: ${Platform.OS}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success': return 'Connecté';
      case 'error': return 'Déconnecté';
      default: return 'Non testé';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>État de la connexion</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {lastCheck && (
        <Text style={styles.lastCheckText}>
          Dernière vérification: {lastCheck}
        </Text>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Configuration API</Text>
        <Text style={styles.infoText}>
          URL: {apiUrl}
        </Text>
        <Text style={styles.infoText}>
          Plateforme: {Platform.OS}
        </Text>
        <Text style={styles.infoText}>
          Timeout: {Config.apiTimeout}ms
        </Text>
        <Text style={styles.infoText}>
          Debug mode: {Config.debug ? 'Oui' : 'Non'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Vérification..." : "Tester la connexion"}
          onPress={performHealthCheck}
          disabled={loading}
          loading={loading}
        />
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Aide au dépannage</Text>
        <Text style={styles.helpText}>
          • Plateforme détectée: {Platform.OS}{'\n'}
          • URL utilisée: {apiUrl}{'\n'}
          • Vérifiez que le serveur backend est démarré{'\n'}
          • Pour Android: utilisez 10.0.2.2 (émulateur) ou IP locale (appareil){'\n'}
          • Pour iOS: utilisez localhost (simulateur) ou IP locale (appareil)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lastCheckText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  helpContainer: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
