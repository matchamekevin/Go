import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { scanService } from '../src/services/scanService';

interface ScanResult {
  success: boolean;
  ticket?: {
    id: string;
    type: string;
    user: string;
    route?: string;
    validUntil: string;
  };
  message: string;
}

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Éviter les scans multiples rapides
    const now = Date.now();
    if (now - lastScanTime < 2000) return;
    setLastScanTime(now);

    setIsScanning(false);
    setIsValidating(true);

    try {
      // Feedback haptique
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('Scan QR Code:', data);
      
      // Validation du ticket via l'API
      const result: ScanResult = await scanService.validateTicket(data);
      
      if (result.success) {
        // Ticket valide - feedback positif
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate([0, 200, 100, 200]);
        
        Alert.alert(
          '✅ Ticket Valide',
          `Type: ${result.ticket?.type}\nUtilisateur: ${result.ticket?.user}\nValidité: ${result.ticket?.validUntil}`,
          [
            {
              text: 'Scanner Suivant',
              onPress: () => setIsScanning(true),
            },
            {
              text: 'Retour',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Ticket invalide - feedback négatif
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Vibration.vibrate([0, 500, 200, 500]);
        
        Alert.alert(
          '❌ Ticket Invalide',
          result.message,
          [
            {
              text: 'Scanner Autre',
              onPress: () => setIsScanning(true),
            },
            {
              text: 'Retour',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        '⚠️ Erreur de Connexion',
        'Impossible de valider le ticket. Vérifiez votre connexion.',
        [
          {
            text: 'Réessayer',
            onPress: () => setIsScanning(true),
          },
          {
            text: 'Retour',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setIsValidating(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.text}>Chargement de la caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>📸 Autorisation Caméra</Text>
          <Text style={styles.permissionText}>
            L'application a besoin d'accéder à la caméra pour scanner les codes QR des tickets.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser la Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner QR Code</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.corner} style={[styles.corner, styles.topLeft]} />
              <View style={styles.corner} style={[styles.corner, styles.topRight]} />
              <View style={styles.corner} style={[styles.corner, styles.bottomLeft]} />
              <View style={styles.corner} style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.instructions}>
        {isValidating ? (
          <View style={styles.validatingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.validatingText}>Validation en cours...</Text>
          </View>
        ) : isScanning ? (
          <Text style={styles.instructionText}>
            Placez le code QR du ticket dans le cadre
          </Text>
        ) : (
          <Text style={styles.instructionText}>
            Scan interrompu - Appuyez sur "Scanner" pour reprendre
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isScanning ? styles.stopButton : styles.startButton]}
          onPress={() => setIsScanning(!isScanning)}
          disabled={isValidating}
        >
          <Text style={styles.controlButtonText}>
            {isScanning ? '⏸️ Pause' : '▶️ Scanner'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
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
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#0066cc',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructions: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  validatingContainer: {
    alignItems: 'center',
  },
  validatingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  controls: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  secondaryButtonText: {
    color: '#0066cc',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
});
