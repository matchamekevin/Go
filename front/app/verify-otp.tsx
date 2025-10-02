import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FeedbackMessage from '../src/components/FeedbackMessage';
import { useAuth } from '../src/contexts/AuthContext';
import { theme } from '../src/styles/theme';
import AuthLayout from '../src/components/AuthLayout';

export default function VerifyOTPScreen() {
  const { email, autoResend } = useLocalSearchParams<{ email: string; autoResend?: string }>();
  const { verifyOTP, resendOTP, getOTPFromAPI } = useAuth();

  // Constants
  const MAX_ATTEMPTS = 5;
  const COOLDOWN_SECONDS = 30;
  const INITIAL_RESEND_SECONDS = 25; // nouveau délai initial
  const RESEND_INCREMENT = 5; // chaque renvoi ajoute 5s

  // State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [getCodeLoading, setGetCodeLoading] = useState(false); // Nouveau state pour récupération du code
  // resendTimer représente le temps restant avant qu'on puisse renvoyer
  const [resendTimer, setResendTimer] = useState(INITIAL_RESEND_SECONDS);
  // persistResendSeconds garde le délai actuel qui sera augmenté après chaque renvoi
  const [persistResendSeconds, setPersistResendSeconds] = useState(INITIAL_RESEND_SECONDS);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Refs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const focusFirst = () => requestAnimationFrame(() => inputRefs.current[0]?.focus());

  // Envoi automatique d'OTP si autoResend=true (depuis login d'un compte non vérifié)
  useEffect(() => {
    if (autoResend === 'true' && email && !resendLoading) {
      console.log('[VerifyOTP] Auto-resend OTP triggered for:', email);
      handleAutoResendOTP();
    }
  }, [autoResend, email]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const c = setTimeout(() => setCooldown(cPrev => cPrev - 1), 1000);
      return () => clearTimeout(c);
    }
  }, [cooldown]);

  const submitCode = async (otpCode: string) => {
    if (cooldown > 0) { setErrorMsg(`Attendez ${cooldown}s avant de réessayer`); return; }
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email) { setErrorMsg('Email manquant'); return; }
    if (otpCode.length !== 6) { setErrorMsg('Code incomplet'); focusFirst(); return; }

    setLoading(true);
    try {
      await verifyOTP(email, otpCode);
      setSuccessMsg('Compte vérifié ! Redirection...');
      setTimeout(() => router.replace('/login'), 1200);
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.error || 'OTP invalide';
      setErrorMsg(msg);
      setAttempts(a => {
        const next = a + 1;
        if (next >= MAX_ATTEMPTS) {
          setCooldown(COOLDOWN_SECONDS);
          return 0; // reset attempts after triggering cooldown
        }
        return next;
      });
      setOtp(['', '', '', '', '', '']);
      focusFirst();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // If user pastes full code
    if (value.length === 6 && /^[0-9]{6}$/.test(value)) {
      submitCode(value);
      return;
    }
    if (value.length > 1) return; // ignore multi chars (non numeric paste)
    setOtp(prev => {
      const clone = [...prev];
      clone[index] = value;
      return clone;
    });
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerifyOTP = () => submitCode(otp.join(''));

  const handleResendOTP = async () => {
    if (!email) { setErrorMsg('Email manquant'); return; }
    setResendLoading(true);
    try {
      await resendOTP(email);
      // augmenter le délai pour la prochaine opération
      const next = persistResendSeconds + RESEND_INCREMENT;
      setPersistResendSeconds(next);
      // démarrer le timer courant avec la valeur courante (avant incrément) pour respecter UX attendu
      setResendTimer(persistResendSeconds);
      setSuccessMsg('Nouveau code envoyé');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erreur envoi code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleAutoResendOTP = async () => {
    if (!email) { setErrorMsg('Email manquant'); return; }
    setResendLoading(true);
    try {
      await resendOTP(email);
      // Ne pas incrémenter le timer pour l'envoi automatique initial
      setResendTimer(persistResendSeconds);
      setSuccessMsg('Code de vérification envoyé automatiquement');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erreur envoi code automatique');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGetOTPCode = async () => {
    if (!email) { setErrorMsg('Email manquant'); return; }
    setGetCodeLoading(true);
    setErrorMsg(null);
    try {
      const otpCode = await getOTPFromAPI(email);
      setOtp(otpCode.split(''));
      setSuccessMsg(`Code récupéré: ${otpCode}`);
      // Auto-submit après un court délai
      setTimeout(() => {
        submitCode(otpCode);
      }, 1500);
    } catch (e: any) {
      setErrorMsg('Impossible de récupérer le code. Vérifiez que vous êtes inscrit.');
    } finally {
      setGetCodeLoading(false);
    }
  };

  return (
    <AuthLayout topInset={12}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/login')}
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

            {/* Feedback messages */}
            {errorMsg && (
              <FeedbackMessage
                variant="error"
                message={errorMsg}
                onClose={() => setErrorMsg(null)}
              />
            )}
            {successMsg && (
              <FeedbackMessage
                variant="success"
                message={successMsg}
                onClose={() => setSuccessMsg(null)}
              />
            )}

            {/* Cooldown info */}
            {cooldown > 0 && !successMsg && (
              <Text style={{ textAlign: 'center', color: theme.colors.secondary[600], marginBottom: theme.spacing.sm }}>
                Attendez {cooldown}s avant une nouvelle tentative
              </Text>
            )}

            {/* Attempts info (optional) */}
            {cooldown === 0 && attempts > 0 && attempts < MAX_ATTEMPTS && !successMsg && (
              <Text style={{ textAlign: 'center', color: theme.colors.secondary[500], marginBottom: theme.spacing.sm }}>
                Tentatives: {attempts}/{MAX_ATTEMPTS}
              </Text>
            )}

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Saisissez le code à 6 chiffres</Text>
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null
                    ]}
                    value={digit}
                    onChangeText={value => handleOtpChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, (loading || cooldown > 0) && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading || cooldown > 0}
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

            {/* Get Code Button - Solution temporaire */}
            <TouchableOpacity
              style={[styles.getCodeButton, getCodeLoading && styles.getCodeButtonDisabled]}
              onPress={handleGetOTPCode}
              disabled={getCodeLoading}
            >
              {getCodeLoading ? (
                <Text style={styles.getCodeButtonText}>Récupération...</Text>
              ) : (
                <>
                  <Ionicons name="code" size={20} color={theme.colors.primary[600]} />
                  <Text style={styles.getCodeButtonText}>Récupérer le code</Text>
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
  justifyContent: 'flex-start',
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
  padding: theme.spacing.xl,
  marginBottom: theme.spacing.lg,
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
  getCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.sm,
  },
  getCodeButtonDisabled: {
    backgroundColor: theme.colors.secondary[100],
    borderColor: theme.colors.secondary[300],
  },
  getCodeButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
});
