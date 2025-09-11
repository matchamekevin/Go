import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../src/styles/theme';
import { AuthService } from '../src/services/authService';
import AuthLayout from '../src/components/AuthLayout';
import { useToast } from '../src/contexts/ToastContext';
import { normalizeErrorMessage, mapAuthErrorToFriendly } from '../src/utils/normalizeError';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendDelay, setResendDelay] = useState(20); // délai initial en secondes; +5s à chaque clic
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { showToast } = useToast();

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (resendTimer > 0) {
      t = setTimeout(() => setResendTimer((s) => Math.max(0, s - 1)), 1000);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [resendTimer]);

  const focusNext = (index: number) => {
    if (index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value) focusNext(index);
  };

  const handleOtpKey = (index: number, nativeKey: string) => {
    if (nativeKey === 'Backspace' && !otp[index]) focusPrev(index);
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    const code = otp.join('');
    if (code.length !== 6) {
  console.log('[ResetPwd] verify - missing code');
  try { console.log('[ResetPwd] showToast ->', 'Veuillez saisir le code à 6 chiffres'); } catch {}
  try { showToast('Veuillez saisir le code à 6 chiffres', 'error', 4000, 'top'); } catch {}
      return;
    }
    if (!email) {
      setErrorMsg('Email manquant');
      return;
    }
    setLoading(true);
    try {
      await AuthService.verifyResetOTP(email, code);
  try { console.log('[ResetPwd] showToast ->', 'Code validé. Choisissez un nouveau mot de passe.'); } catch {}
  try { showToast('Code validé. Choisissez un nouveau mot de passe.', 'success', 3000, 'top'); } catch {}
  setErrorMsg(null);
  setStep('password');
    } catch (e: any) {
  const normal = normalizeErrorMessage(e?.response?.data || e?.message || e);
  const friendly = mapAuthErrorToFriendly(normal);
  try { console.log('[ResetPwd] showToast ->', friendly || 'Erreur lors de la validation du code'); } catch {}
  try { showToast(friendly || 'Erreur lors de la validation du code', 'error', 5000, 'top'); } catch {}
  setErrorMsg(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    const code = otp.join('');
    if (!email || code.length !== 6) {
      setErrorMsg('Données manquantes');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPasswordWithOTP(email, code, newPassword);
  try { console.log('[ResetPwd] showToast ->', 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.'); } catch {}
  try { showToast('Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.', 'success', 3500, 'top'); } catch {}
  setErrorMsg(null);
  router.push('/login');
    } catch (e: any) {
  const normal = normalizeErrorMessage(e?.response?.data || e?.message || e);
  const friendly = mapAuthErrorToFriendly(normal);
  try { console.log('[ResetPwd] showToast ->', friendly || 'Impossible de réinitialiser le mot de passe'); } catch {}
  try { showToast(friendly || 'Impossible de réinitialiser le mot de passe', 'error', 5000, 'top'); } catch {}
  setErrorMsg(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Email manquant');
      return;
    }
    setResendLoading(true);
    try {
      await AuthService.forgotPassword(email);
  // lancer le timer avec le délai courant, puis l'augmenter de 5s pour le prochain clic
  setResendTimer(resendDelay);
  setResendDelay((d) => d + 5);
  try { console.log('[ResetPwd] showToast ->', 'Code renvoyé. Vérifiez votre email.'); } catch {}
  try { showToast('Code renvoyé. Vérifiez votre email.', 'success', 3500, 'top'); } catch {}
  setErrorMsg(null);
    } catch (e: any) {
  const normal = normalizeErrorMessage(e?.response?.data || e?.message || e);
  const friendly = mapAuthErrorToFriendly(normal);
  try { console.log('[ResetPwd] showToast ->', friendly || 'Impossible de renvoyer le code'); } catch {}
  try { showToast(friendly || 'Impossible de renvoyer le code', 'error', 5000, 'top'); } catch {}
  setErrorMsg(null);
    } finally {
      setResendLoading(false);
    }
  };

  const renderOtp = () => (
    <>
      <View style={styles.infoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.infoTitle}>Vérifiez votre code</Text>
        <Text style={styles.infoText}>Nous avons envoyé un code de réinitialisation à :</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      <View style={styles.otpContainer}>
        <Text style={styles.otpLabel}>Code de vérification</Text>
        <View style={styles.otpInputContainer}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { inputRefs.current[i] = r; }}
              value={digit}
              onChangeText={(v) => handleOtpChange(i, v)}
              onKeyPress={({ nativeEvent }) => handleOtpKey(i, nativeEvent.key)}
              keyboardType="numeric"
              maxLength={1}
              style={[styles.otpInput, digit ? styles.otpInputFilled : undefined]}
              selectTextOnFocus
            />
          ))}
        </View>
      </View>

  {/* inline error removed; using toast for errors */}

      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={styles.actionButtonText}>{loading ? 'Vérification...' : 'Vérifier le code'}</Text>
        {!loading && <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
        {resendTimer > 0 ? (
          <Text style={styles.resendTimer}>Renvoyer dans {resendTimer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
            <Text style={styles.resendButton}>{resendLoading ? 'Envoi...' : 'Renvoyer le code'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderPassword = () => (
    <>
      <View style={styles.infoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="key" size={40} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.infoTitle}>Nouveau mot de passe</Text>
        <Text style={styles.infoText}>Choisissez un nouveau mot de passe sécurisé pour votre compte.</Text>
      </View>

  {/* inline error removed; using toast for errors */}

      <View style={styles.passwordContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={18} color={theme.colors.secondary[400]} />
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caractères"
              placeholderTextColor={theme.colors.secondary[400]}
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={theme.colors.secondary[400]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={18} color={theme.colors.secondary[400]} />
            <TextInput
              style={styles.input}
              placeholder="Répétez votre mot de passe"
              placeholderTextColor={theme.colors.secondary[400]}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)} style={styles.eyeButton}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color={theme.colors.secondary[400]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.actionButtonText}>{loading ? 'Réinitialisation...' : 'Réinitialiser'}</Text>
        {!loading && <Ionicons name="checkmark" size={18} color={theme.colors.white} />}
      </TouchableOpacity>
    </>
  );

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 'password' ? setStep('otp') : router.replace('/login'))}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{step === 'otp' ? 'Vérification' : 'Nouveau mot de passe'}</Text>
            <Text style={styles.subtitle}>{step === 'otp' ? 'Étape 1 sur 2' : 'Étape 2 sur 2'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.formContainer}>{step === 'otp' ? renderOtp() : renderPassword()}</View>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  backButton: { padding: theme.spacing.sm, marginRight: theme.spacing.md },
  headerContent: { flex: 1 },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  subtitle: { fontSize: theme.typography.fontSize.base, color: 'rgba(255,255,255,0.8)', marginTop: theme.spacing.xs },
  content: { flex: 1, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  infoContainer: { alignItems: 'center', marginBottom: theme.spacing.xl },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoTitle: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.secondary[900], marginBottom: theme.spacing.sm },
  infoText: { fontSize: theme.typography.fontSize.base, color: theme.colors.secondary[600], textAlign: 'center', marginBottom: theme.spacing.sm },
  emailText: { fontSize: theme.typography.fontSize.base, color: theme.colors.primary[600], fontWeight: theme.typography.fontWeight.semibold },
  otpContainer: { marginBottom: theme.spacing.xl },
  otpLabel: { fontSize: theme.typography.fontSize.sm, color: theme.colors.secondary[700], fontWeight: theme.typography.fontWeight.semibold, textAlign: 'center', marginBottom: theme.spacing.lg },
  otpInputContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm },
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
    marginHorizontal: 4,
  },
  otpInputFilled: { borderColor: theme.colors.primary[600], backgroundColor: theme.colors.primary[50] },
  passwordContainer: { marginBottom: theme.spacing.xl },
  inputContainer: { marginBottom: theme.spacing.md },
  inputLabel: { fontSize: theme.typography.fontSize.sm, color: theme.colors.secondary[700], fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing.sm },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondary[50], borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.secondary[200] },
  input: { flex: 1, fontSize: theme.typography.fontSize.base, color: theme.colors.secondary[900], paddingVertical: theme.spacing.sm, marginLeft: theme.spacing.sm },
  eyeButton: { padding: theme.spacing.xs },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary[600], borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, marginBottom: theme.spacing.lg, ...theme.shadows.md },
  actionButtonDisabled: { backgroundColor: theme.colors.secondary[300] },
  actionButtonText: { fontSize: theme.typography.fontSize.base, color: theme.colors.white, fontWeight: theme.typography.fontWeight.semibold, marginRight: theme.spacing.sm },
  resendContainer: { alignItems: 'center' },
  resendText: { fontSize: theme.typography.fontSize.sm, color: theme.colors.secondary[600], marginBottom: theme.spacing.sm },
  resendTimer: { fontSize: theme.typography.fontSize.sm, color: theme.colors.secondary[400] },
  resendButton: { fontSize: theme.typography.fontSize.sm, color: theme.colors.primary[600], fontWeight: theme.typography.fontWeight.semibold, textDecorationLine: 'underline' },
});
