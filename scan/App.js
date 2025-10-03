// Version minimale avec validation API pour scanner QR
import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';

function MinimalScanApp() {
  console.log('🔬 MINIMAL SCAN APP - Démarrage');
  
  const [currentView, setCurrentView] = useState('home'); // 'home', 'scanning', 'validating', 'result'
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const API_BASE_URL = 'https://go-j2rr.onrender.com';
  const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzAsImVtYWlsIjoidmFsaWRhdG9yQHRlc3QuY29tIiwibmFtZSI6IlZhbGlkYXRvciBUZXN0Iiwicm9sZSI6InZhbGlkYXRvciIsImlhdCI6MTc1OTQ4NjA3MiwiZXhwIjoxNzYwMDkwODcyfQ.OZ8PyElEljKBixXkZ-IIHB0W9T6mi2QLHhJtDJqUxJA';

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const validateTicket = async (ticketCode) => {
    console.log('🎫 Validation du ticket:', ticketCode);
    setCurrentView('validating');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/validate`, {
        ticket_code: ticketCode
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        timeout: 10000
      });
      
      console.log('✅ Réponse API:', response.data);
      
      if (response.data.success) {
        setValidationResult({
          isValid: true,
          message: 'Ticket Valide ✅',
          ticketInfo: response.data.data,
          ticketCode: ticketCode
        });
      } else {
        setValidationResult({
          isValid: false,
          message: response.data.error || 'Ticket Invalide ❌',
          ticketCode: ticketCode
        });
      }
      setCurrentView('result');
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      
      let errorMessage = 'Erreur de validation';
      if (error.response?.status === 401) {
        errorMessage = 'Non autorisé - Token requis';
      } else if (error.response?.status === 403) {
        errorMessage = 'Accès refusé - Permission validateur requise';
      } else if (error.response?.status === 404) {
        errorMessage = 'Ticket non trouvé';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Ticket déjà utilisé ou invalide';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout - Serveur lent';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Pas de connexion internet';
      }
      
      setValidationResult({
        isValid: false,
        message: errorMessage + ' ❌',
        ticketCode: ticketCode
      });
      setCurrentView('result');
    }
  };

  const handleBarcodeScanned = ({ type, data }) => {
    console.log('📱 QR Code scanné:', data);
    
    try {
      // Essayer de parser comme JSON d'abord
      const parsedData = JSON.parse(data);
      if (parsedData.code) {
        validateTicket(parsedData.code);
        return;
      }
    } catch (e) {
      // Si ce n'est pas du JSON, utiliser la donnée brute
    }
    
    // Utiliser la donnée brute comme code de ticket
    validateTicket(data);
  };

  const startScan = () => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }
    setCurrentView('scanning');
  };

  // Vue Scanner
  if (currentView === 'scanning') {
    return (
      <SafeAreaView style={styles.scanContainer}>
        <View style={styles.scanHeader}>
          <TouchableOpacity onPress={() => setCurrentView('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.scanTitle}>Scanner QR Code</Text>
        </View>
        
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        />
        
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstruction}>
            Placez le QR code du ticket dans le cadre
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vue Validation en cours
  if (currentView === 'validating') {
    return (
      <SafeAreaView style={styles.validatingContainer}>
        <View style={styles.validatingContent}>
          <ActivityIndicator size="large" color="#1e7e34" />
          <Text style={styles.validatingText}>Validation en cours...</Text>
          <Text style={styles.validatingSubtext}>Vérification du ticket</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vue Résultat
  if (currentView === 'result') {
    return (
      <SafeAreaView style={styles.resultContainer}>
        <View style={styles.resultContent}>
          <View style={[
            styles.resultHeader,
            { backgroundColor: validationResult?.isValid ? '#d4edda' : '#f8d7da' }
          ]}>
            <Text style={styles.resultIcon}>
              {validationResult?.isValid ? '✅' : '❌'}
            </Text>
            <Text style={[
              styles.resultMessage,
              { color: validationResult?.isValid ? '#155724' : '#721c24' }
            ]}>
              {validationResult?.message}
            </Text>
          </View>
          
          <View style={styles.resultDetails}>
            <Text style={styles.resultDetailTitle}>Détails du ticket</Text>
            <Text style={styles.resultDetailItem}>
              Code: {validationResult?.ticketCode}
            </Text>
            
            {validationResult?.isValid && validationResult?.ticketInfo && (
              <>
                <Text style={styles.resultDetailItem}>
                  Produit: {validationResult.ticketInfo.product_code}
                </Text>
                <Text style={styles.resultDetailItem}>
                  Statut: {validationResult.ticketInfo.status}
                </Text>
                <Text style={styles.resultDetailItem}>
                  Validé le: {formatDate(validationResult.ticketInfo.used_at)}
                </Text>
              </>
            )}
          </View>
          
          <View style={styles.resultActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]} 
              onPress={() => setCurrentView('scanning')}
            >
              <Text style={styles.actionButtonText}>Scanner Autre</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]} 
              onPress={() => setCurrentView('home')}
            >
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Retour Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Vue Accueil
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎫 GoSOTRAL Scan</Text>
        <Text style={styles.subtitle}>Validation de Tickets SOTRAL</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.scanButton} onPress={startScan}>
          <Text style={styles.scanButtonIcon}>📱</Text>
          <Text style={styles.scanButtonText}>Scanner QR Code</Text>
        </TouchableOpacity>
        
        <Text style={styles.info}>
          Scannez les QR codes des tickets SOTRAL pour les valider.
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
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e7e34',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#28a745',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanButtonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
  
  // Styles pour le scanner
  scanContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    color: '#1e7e34',
    fontSize: 16,
    fontWeight: '600',
  },
  scanTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  
  // Styles pour la validation
  validatingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatingContent: {
    alignItems: 'center',
    padding: 40,
  },
  validatingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e7e34',
    marginTop: 20,
  },
  validatingSubtext: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 10,
  },
  
  // Styles pour les résultats
  resultContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  resultContent: {
    flex: 1,
    padding: 20,
  },
  resultHeader: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
  },
  resultIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  resultMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultDetails: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultDetailItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    paddingLeft: 10,
  },
  resultActions: {
    gap: 15,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#28a745',
  },
  secondaryAction: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryActionText: {
    color: '#ffffff',
  },
});

registerRootComponent(MinimalScanApp);
export default MinimalScanApp;
