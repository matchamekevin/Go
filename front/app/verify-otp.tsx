import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/styles/theme';
import { AuthService } from '../src/services/authService';

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer pour le renvoi d'OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Empêcher la saisie de plusieurs caractères

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Passer au champ suivant automatiquement
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code OTP complet');
      return;
    }

    if (!email) {
      Alert.alert('Erreur', 'Email manquant');
      return;
    }

    setLoading(true);
    try {
      await AuthService.verifyOTP(email, otpCode);
      Alert.alert(
        'Succès', 
        'Votre compte a été vérifié avec succès !',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error: any) {
      Alert.alert('Erreur de vérification', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Email manquant');
      return;
    }

    setResendLoading(true);
    try {
      await AuthService.resendOTP(email);
      setResendTimer(60);
      Alert.alert('Succès', 'Un nouveau code OTP a été envoyé à votre email');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.primary[700]]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Vérification</Text>
            <Text style={styles.subtitle}>Code OTP envoyé par email</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.formContainer}>
            {/* Info */}
            <View style={styles.infoContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={40} color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.infoTitle}>Vérifiez votre email</Text>
              <Text style={styles.infoText}>
                Nous avons envoyé un code de vérification à :
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Saisissez le code à 6 chiffres</Text>
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.verifyButtonText}>Vérification...</Text>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Vérifier</Text>
                  <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimer}>
                  Renvoyer dans {resendTimer}s
                </Text>
              ) : (
                <TouchableOpacity 
                  onPress={handleResendOTP}
                  disabled={resendLoading}
                >
                  <Text style={styles.resendButton}>
                    {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[600],
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 25, // Remplace SafeAreaView
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emailText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  otpContainer: {
    marginBottom: theme.spacing.xl,
  },
  otpLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.secondary[200],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    color: theme.colors.secondary[900],
  },
  otpInputFilled: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  verifyButtonDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  verifyButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    marginBottom: theme.spacing.sm,
  },
  resendTimer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[400],
  },
  resendButton: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
