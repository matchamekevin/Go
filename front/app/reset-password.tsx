import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../src/styles/theme';
import { AuthService } from '../src/services/authService';
import FeedbackMessage from '../src/components/FeedbackMessage';
import AuthLayout from '../src/components/AuthLayout';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      await AuthService.verifyResetOTP(email, otpCode);
      setStep('password');
    } catch (error: any) {
      Alert.alert('Erreur de vérification', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const otpCode = otp.join('');
    if (!email || otpCode.length !== 6) {
      Alert.alert('Erreur', 'Données manquantes');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPasswordWithOTP(email, otpCode, newPassword);
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé avec succès !',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
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
      await AuthService.forgotPassword(email);
      setResendTimer(60);
      Alert.alert('Succès', 'Un nouveau code a été envoyé à votre email');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setResendLoading(false);
    }
  };

  const renderOTPStep = () => (
    <>
      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.infoTitle}>Vérifiez votre code</Text>
        <Text style={styles.infoText}>
          Nous avons envoyé un code de réinitialisation à :
        </Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        <Text style={styles.otpLabel}>Code de vérification</Text>
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
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.actionButtonText}>Vérification...</Text>
        ) : (
          <>
            <Text style={styles.actionButtonText}>Vérifier le code</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
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
    </>
  );

  const renderPasswordStep = () => (
    <>
      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="key" size={40} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.infoTitle}>Nouveau mot de passe</Text>
        <Text style={styles.infoText}>
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </Text>
      </View>

      {/* Password Inputs */}
      <View style={styles.passwordContainer}>
        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.secondary[400]} />
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caractères"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.colors.secondary[400]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.secondary[400]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.secondary[400]} />
            <TextInput
              style={styles.input}
              placeholder="Répétez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={theme.colors.secondary[400]}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.secondary[400]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.actionButtonText}>Réinitialisation...</Text>
        ) : (
          <>
            <Text style={styles.actionButtonText}>Réinitialiser</Text>
            <Ionicons name="checkmark" size={20} color={theme.colors.white} />
          </>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <AuthLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 'password' ? setStep('otp') : router.back())}
          >
                <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <Text style={styles.title}>
                  {step === 'otp' ? 'Vérification' : 'Nouveau mot de passe'}
                </Text>
                <Text style={styles.subtitle}>
                  {step === 'otp' ? 'Étape 1 sur 2' : 'Étape 2 sur 2'}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.formContainer}>
                {step === 'otp' ? renderOTPStep() : renderPasswordStep()}
              </View>
            </View>
        </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: theme.spacing.xl,
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
  passwordContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  actionButtonDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  actionButtonText: {
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
