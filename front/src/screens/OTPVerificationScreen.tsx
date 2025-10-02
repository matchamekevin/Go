import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthService } from '../services/authService';

interface OTPVerificationScreenProps {
  route: {
    params: {
      email: string;
    };
  };
  navigation: any;
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Countdown pour le renvoi d'OTP
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir un code de 6 chiffres');
      return;
    }

    console.log('[OTPVerification] 🚀 Starting OTP verification for:', email);
    setLoading(true);

    try {
      console.log('[OTPVerification] 📡 Calling AuthService.verifyOTP...');
      await AuthService.verifyOTP(email, otp.trim());

      console.log('[OTPVerification] ✅ OTP verification successful');
      Alert.alert(
        'Succès',
        'Votre compte a été vérifié avec succès !',
        [
          {
            text: 'Continuer',
            onPress: () => {
              // Naviguer vers l'écran de connexion ou le profil
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.log('[OTPVerification] ❌ OTP verification failed:', error);
      Alert.alert('Erreur', error.message || 'Code de vérification invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    console.log('[OTPVerification] 🔄 Resending OTP for:', email);
    setResendLoading(true);

    try {
      await AuthService.resendOTP(email);
      console.log('[OTPVerification] ✅ OTP resent successfully');
      Alert.alert('Succès', 'Un nouveau code a été envoyé à votre email');
      setCountdown(60); // Reset countdown
    } catch (error: any) {
      console.log('[OTPVerification] ❌ Failed to resend OTP:', error);
      Alert.alert('Erreur', 'Impossible de renvoyer le code. Réessayez plus tard.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Un code de 6 chiffres a été envoyé à
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Code de vérification</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(text) => {
              // Only allow digits and limit to 6 characters
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 6) {
                setOtp(cleaned);
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            textAlign="center"
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Vérifier</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={countdown > 0 || resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#3F51B5" />
              ) : countdown > 0 ? (
                <Text style={styles.resendDisabledText}>
                  Renvoyer dans {countdown}s
                </Text>
              ) : (
                <Text style={styles.resendLinkText}>Renvoyer le code</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F51B5',
    marginTop: 5,
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#3F51B5',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#3F51B5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resendLinkText: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: '600',
  },
  resendDisabledText: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default OTPVerificationScreen;