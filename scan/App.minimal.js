// Version minimale sans Expo Router pour tester le scanner QR
import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';

function MinimalScanApp() {
  console.log('🔬 MINIMAL SCAN APP - Démarrage');
  
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleScan = async ({ data }) => {
    console.log('📱 QR Code détecté:', data);
    setScanning(false);
    
    Alert.alert(
      '🎫 QR Code Scanné',
      `Code: ${data}\n\n(Validation API sera ajoutée ensuite)`,
      [
        { text: 'Scanner autre', onPress: () => setScanning(true) },
        { text: 'Fermer', style: 'cancel' }
      ]
    );
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Erreur', 'Autorisation caméra requise');
        return;
      }
    }
    setScanning(true);
  };

  if (scanning) {
    return (
      <SafeAreaView style={styles.scanContainer}>
        <View style={styles.scanHeader}>
          <TouchableOpacity onPress={() => setScanning(false)}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎫 GoSOTRAL Scan</Text>
        <Text style={styles.subtitle}>Validation de Tickets - Version Minimale</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.scanButton} onPress={startScan}>
          <Text style={styles.scanButtonIcon}>📱</Text>
          <Text style={styles.scanButtonText}>Scanner QR Code</Text>
        </TouchableOpacity>
        
        <Text style={styles.info}>
          Version de test pour valider le fonctionnement du scanner QR
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
    color: '#0066cc',
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
    backgroundColor: '#0066cc',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#0066cc',
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
    borderColor: '#0066cc',
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
});

registerRootComponent(MinimalScanApp);
export default MinimalScanApp;