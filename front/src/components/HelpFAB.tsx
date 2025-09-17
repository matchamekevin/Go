import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

function normalizeNumber(n: string) {
  if (!n) return '';
  const digits = n.replace(/\D/g, '');
  // If short local number (8 or less), assume Senegal +221 as fallback
  if (digits.length <= 8) return `221${digits}`;
  return digits;
}

export default function HelpFAB() {
  const { user } = useAuth();

  const supportRaw = '70 47 24 36';
  const supportDigits = normalizeNumber(supportRaw);

  const handlePress = async () => {
    const userPhone = user?.phone || '';
    const userDigits = userPhone ? normalizeNumber(userPhone) : '';

    const message = `Bonjour, j'aimerais de l'aide avec mon compte. Mon numéro: ${userPhone || 'non renseigné'}`;

    // Build wa.me url to open chat with support and prefill message containing user's phone
    let url = '';
    if (supportDigits) {
      url = `https://wa.me/${supportDigits}?text=${encodeURIComponent(message)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    // If user phone is missing, confirm before opening
    if (!userPhone) {
      Alert.alert(
        'Numéro manquant',
        'Votre numéro de téléphone n\'est pas renseigné dans votre profil. Voulez-vous contacter le support sans numéro pré-rempli ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => Linking.openURL(url).catch(() => Alert.alert('Impossible', 'Impossible d\'ouvrir WhatsApp')) },
        ]
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        // try api.whatsapp.com fallback
        const fallback = supportDigits ? `https://api.whatsapp.com/send?phone=${supportDigits}&text=${encodeURIComponent(message)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        await Linking.openURL(fallback);
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      console.warn('[HelpFAB] error opening URL', e);
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp sur cet appareil');
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Contacter le support"
        style={styles.fab}
        onPress={handlePress}
      >
        <Ionicons name="help-circle" size={28} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});
