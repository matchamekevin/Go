import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '../src/services/apiClient';
import { networkManager } from '../src/utils/networkManager';

export default function NetworkConfigPage() {
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<string>('');
  const [newEndpoint, setNewEndpoint] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNetworkConfig();
  }, []);

  const loadNetworkConfig = async () => {
    try {
      const config = await apiClient.getNetworkConfig();
      setEndpoints(config.endpoints);
      setCurrentEndpoint(config.current || 'Aucun');
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error);
    }
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    const results: Record<string, boolean> = {};
    
    for (const endpoint of endpoints) {
      try {
        const isWorking = await networkManager.testEndpoint(endpoint);
        results[endpoint] = isWorking;
      } catch {
        results[endpoint] = false;
      }
    }
    
    setTestResults(results);
    setLoading(false);
  };

  const addNewEndpoint = async () => {
    if (!newEndpoint.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une URL valide');
      return;
    }

    try {
      await apiClient.addEndpoint(newEndpoint.trim());
      setNewEndpoint('');
      await loadNetworkConfig();
      Alert.alert('Succès', 'Endpoint ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'endpoint');
    }
  };

  const refreshNetwork = async () => {
    setRefreshing(true);
    try {
      await apiClient.refreshEndpoints();
      await loadNetworkConfig();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rafraîchir la configuration');
    }
    setRefreshing(false);
  };

  const testSingleEndpoint = async (endpoint: string) => {
    setTestResults(prev => ({ ...prev, [endpoint]: false }));
    
    try {
      const isWorking = await networkManager.testEndpoint(endpoint);
      setTestResults(prev => ({ ...prev, [endpoint]: isWorking }));
      
      if (isWorking) {
        Alert.alert('Test réussi', `${endpoint} est accessible`);
      } else {
        Alert.alert('Test échoué', `${endpoint} n'est pas accessible`);
      }
    } catch {
      setTestResults(prev => ({ ...prev, [endpoint]: false }));
      Alert.alert('Test échoué', `Erreur lors du test de ${endpoint}`);
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshNetwork} />
      }
    >
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 8,
              marginRight: 15,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>← Retour</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', flex: 1 }}>
            Configuration Réseau
          </Text>
        </View>

        {/* Current Endpoint */}
        <View style={{
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#e0e0e0',
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
            Endpoint Actuel
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: currentEndpoint === 'Aucun' ? '#ff6b6b' : '#4caf50',
            fontFamily: 'monospace'
          }}>
            {currentEndpoint}
          </Text>
        </View>

        {/* Add New Endpoint */}
        <View style={{
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#e0e0e0',
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Ajouter un Endpoint
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              fontFamily: 'monospace',
            }}
            placeholder="https://ton-app.onrender.com"
            value={newEndpoint}
            onChangeText={setNewEndpoint}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#4caf50',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={addNewEndpoint}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Ajouter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Actions */}
        <View style={{
          flexDirection: 'row',
          marginBottom: 20,
          gap: 10,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              padding: 12,
              borderRadius: 8,
              flex: 1,
              alignItems: 'center',
            }}
            onPress={testAllEndpoints}
            disabled={loading}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {loading ? 'Test en cours...' : 'Tester Tous'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#ff9500',
              padding: 12,
              borderRadius: 8,
              flex: 1,
              alignItems: 'center',
            }}
            onPress={refreshNetwork}
            disabled={refreshing}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Endpoints List */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e0e0e0',
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          }}>
            Endpoints Configurés ({endpoints.length})
          </Text>
          
          {endpoints.map((endpoint, index) => {
            const isActive = endpoint === currentEndpoint;
            const testResult = testResults[endpoint];
            
            return (
              <View
                key={index}
                style={{
                  padding: 15,
                  borderBottomWidth: index < endpoints.length - 1 ? 1 : 0,
                  borderBottomColor: '#e0e0e0',
                  backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isActive ? '#4caf50' : 
                                   testResult === true ? '#4caf50' :
                                   testResult === false ? '#ff6b6b' : '#bbb',
                    marginRight: 8,
                  }} />
                  <Text style={{ 
                    flex: 1, 
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}>
                    {endpoint}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#007AFF',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 4,
                    }}
                    onPress={() => testSingleEndpoint(endpoint)}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Tester</Text>
                  </TouchableOpacity>
                  
                  {isActive && (
                    <View style={{
                      backgroundColor: '#4caf50',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 4,
                    }}>
                      <Text style={{ color: 'white', fontSize: 12 }}>ACTIF</Text>
                    </View>
                  )}
                  
                  {testResult === true && (
                    <View style={{
                      backgroundColor: '#4caf50',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 4,
                    }}>
                      <Text style={{ color: 'white', fontSize: 12 }}>✓ OK</Text>
                    </View>
                  )}
                  
                  {testResult === false && (
                    <View style={{
                      backgroundColor: '#ff6b6b',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 4,
                    }}>
                      <Text style={{ color: 'white', fontSize: 12 }}>✗ KO</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: '#fff3cd',
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
          borderWidth: 1,
          borderColor: '#ffeaa7',
        }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
            💡 Instructions
          </Text>
          <Text style={{ fontSize: 12, lineHeight: 18, color: '#6c757d' }}>
            • Ajoutez vos URLs de déploiement (Render, Railway, etc.){'\n'}
            • L'app choisira automatiquement le meilleur endpoint{'\n'}
            • Testez régulièrement pour vérifier la connectivité{'\n'}
            • Rafraîchissez pour forcer une nouvelle détection
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
