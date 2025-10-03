// Version minimale avec validation API pour scanner QR
import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
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

  const handleScan = async ({ data }) => {
    console.log('📱 QR Code détecté:', data);
    await validateTicket(data);
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Erreur', 'Autorisation caméra requise');
        return;
      }
    }
    setCurrentView('scanning');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  



  // Vue Scanner
  if (currentView === 'scanning') {
    return (
      <SafeAreaView style={styles.scanContainer}>
        <View style={styles.scanHeader}>
          <TouchableOpacity onPress={() => setCurrentView('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.scanTitle}>Scanner QR</Text>
        </View>
        
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleScan}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
        </CameraView>
        
        <View style={styles.scanInstructions}>
          <Text style={styles.instructionText}>
            Placez le QR code du ticket dans le cadre
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vue Validation en cours
  if (currentView === 'validating') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#1e7e34" />
          <Text style={styles.loadingText}>Validation en cours...</Text>
          <Text style={styles.loadingSubtext}>Vérification du ticket dans la base de données</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vue Résultat de validation
  if (currentView === 'result' && validationResult) {
    return (
      <SafeAreaView style={[styles.resultContainer, validationResult.isValid ? styles.validBackground : styles.invalidBackground]}>
        <View style={styles.resultContent}>
          <Text style={styles.resultIcon}>
            {validationResult.isValid ? '✅' : '❌'}
          </Text>
          
          <Text style={[styles.resultTitle, validationResult.isValid ? styles.validText : styles.invalidText]}>
            {validationResult.isValid ? 'TICKET VALIDE' : 'TICKET INVALIDE'}
          </Text>
          
          <Text style={styles.resultMessage}>
            {validationResult.message}
          </Text>
          
          <View style={styles.ticketCodeInfo}>
            <Text style={styles.ticketCodeLabel}>Code scanné:</Text>
            <Text style={styles.ticketCodeText}>{validationResult.ticketCode}</Text>
          </View>
          
          {validationResult.ticketInfo && (
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketInfoTitle}>Informations du ticket :</Text>
              <Text style={styles.ticketInfoText}>
                Code: {validationResult.ticketInfo.code || 'N/A'}
              </Text>
              {validationResult.ticketInfo.product_name && (
                <Text style={styles.ticketInfoText}>
                  Produit: {validationResult.ticketInfo.product_name}
                </Text>
              )}
              {validationResult.ticketInfo.route_name && (
                <Text style={styles.ticketInfoText}>
                  Route: {validationResult.ticketInfo.route_name}
                </Text>
              )}
              {validationResult.ticketInfo.used_at && (
                <Text style={styles.ticketInfoText}>
                  Validé le: {formatDate(validationResult.ticketInfo.used_at)}
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.resultActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]} 
              onPress={() => setCurrentView('scanning')}
            >
              <Text style={styles.actionButtonText}>Scanner Autre Ticket</Text>
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
      <SafeAreaView style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <TouchableOpacity onPress={() => setCurrentView('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.historyTitle}>Historique</Text>
          <TouchableOpacity onPress={loadValidationHistory}>
            <Text style={styles.refreshButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.historyScroll} contentContainerStyle={styles.historyScrollContent}>
          <Text style={styles.historySubtitle}>
            {validationHistory.length} validation{validationHistory.length > 1 ? 's' : ''} effectuée{validationHistory.length > 1 ? 's' : ''}
          </Text>

          {validationHistory.length === 0 ? (
            <View style={styles.noHistoryContainer}>
              <Text style={styles.noHistoryIcon}>📋</Text>
              <Text style={styles.noHistoryText}>Aucune validation effectuée</Text>
              <Text style={styles.noHistorySubtext}>
                Les tickets que vous validez apparaîtront ici
              </Text>
            </View>
          ) : (
            validationHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyItemIcon}>
                      {getStatusIcon(item.validation_status)}
                    </Text>
                    <View style={styles.historyItemInfo}>
                      <Text style={styles.historyItemCode}>{item.ticket_code}</Text>
                      <Text style={styles.historyItemDate}>{formatDate(item.validated_at)}</Text>
                    </View>
                  </View>
                  
                  <Text style={[
                    styles.historyItemStatus,
                    { color: getStatusColor(item.validation_status) }
                  ]}>
                    {item.validation_status === 'valid' ? 'VALIDE' : 
                     item.validation_status === 'already_used' ? 'DÉJÀ UTILISÉ' :
                     item.validation_status === 'not_found' ? 'NON TROUVÉ' :
                     item.validation_status === 'unauthorized' ? 'NON AUTORISÉ' :
                     'INVALIDE'}
                  </Text>
                </View>
                
                {(item.product_name || item.route_name || item.ticket_owner_name) && (
                  <View style={styles.historyItemDetails}>
                    {item.product_name && (
                      <Text style={styles.historyItemDetail}>📱 {item.product_name}</Text>
                    )}
                    {item.route_name && (
                      <Text style={styles.historyItemDetail}>🚌 {item.route_name}</Text>
                    )}
                    {item.ticket_owner_name && (
                      <Text style={styles.historyItemDetail}>👤 {item.ticket_owner_name}</Text>
                    )}
                  </View>
                )}
                
                {item.notes && (
                  <Text style={styles.historyItemNotes}>{item.notes}</Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
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
    padding: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e7e34',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#1e7e34',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  scanButtonIcon: {
    fontSize: 48,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#1e7e34',
    borderRadius: 12,
  },
  scanInstructions: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Styles pour l'écran de résultat
  resultContainer: {
    flex: 1,
  },
  validBackground: {
    backgroundColor: '#d4edda',
  },
  invalidBackground: {
    backgroundColor: '#f8d7da',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultIcon: {
    fontSize: 120,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  validText: {
    color: '#155724',
  },
  invalidText: {
    color: '#721c24',
  },
  resultMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  ticketCodeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  ticketCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ticketCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  ticketInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ticketInfoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  resultActions: {
    width: '100%',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryAction: {
    backgroundColor: '#1e7e34',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1e7e34',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryActionText: {
    color: '#1e7e34',
  },
  
  // Styles pour l'écran de chargement
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e7e34',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  

});

registerRootComponent(MinimalScanApp);
export default MinimalScanApp;