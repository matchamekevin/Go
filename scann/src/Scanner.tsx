import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

export default function Scanner() {
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Pas encore scanné');
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setText('Scanning...');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('Type: ' + type + '\nDonnées: ' + data);

    try {
      const response = await fetch('https://go-j2rr.onrender.com/tickets/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_code: data }),
      });

      const result = await response.json();

      if (response.ok) {
        setText('Ticket scanné avec succès: ' + JSON.stringify(result));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setText('Erreur: ' + (result.message || 'Erreur inconnue'));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      setText('Erreur de réseau: ' + (error instanceof Error ? error.message : String(error)));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!isPermissionGranted) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>Pas d'accès à la caméra</Text>
        <Button title={'Autoriser la Caméra'} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <CameraView
          style={styleSheet.camStyle}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "code128"] }}
          onBarcodeScanned={scanned ? undefined : async ({ data, type }) => {
            setScanned(true);
            setText('Scanning...');

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
              const response = await fetch('https://go-j2rr.onrender.com/tickets/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticket_code: data }),
              });
              const result = await response.json();
              if (response.ok) {
                setText('Ticket scanné avec succès: ' + JSON.stringify(result));
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                setText('Erreur: ' + (result.message || 'Erreur inconnue'));
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            } catch (error) {
              setText('Erreur de réseau: ' + (error instanceof Error ? error.message : String(error)));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          }}
        />
      </View>
      <Text style={styles.maintext}>{text}</Text>
      {scanned && (
        <Button 
          title={'Scanner à nouveau ?'} 
          onPress={() => setScanned(false)} 
          color='tomato' 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato',
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
});

const styleSheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 20
    },
    camStyle: {
        position: 'absolute',
        width: 300,
        height: 300
    }
});