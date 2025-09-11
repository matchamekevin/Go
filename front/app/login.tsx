import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';
import { useAuth } from '../src/contexts/AuthContext';
import { AuthService } from '../src/services/authService';
import { normalizeErrorMessage, mapAuthErrorToFriendly } from '../src/utils/normalizeError';
// ToastOverlay rendered globally via ToastProvider
import { useToast } from '../src/contexts/ToastContext';
// ErrorMessage removed; using global toast only
import AuthLayout from '../src/components/AuthLayout';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const { showToast } = useToast();
  const [showUnverifiedActions, setShowUnverifiedActions] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    console.log('[Login] errorMsg state changed ->', errorMsg);
  }, [errorMsg]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
        const normal = normalizeErrorMessage(error?.response?.data || error?.message || error);
        let friendly = mapAuthErrorToFriendly(normal);
        // Fallback : si la normalisation retourne un message générique technique, remplacer par un message clair
        try {
          const n = String(normal || '').toLowerCase();
          if (n.includes('requête invalide') || n.includes('request failed') || n.includes('request invalid') || /status code 400/.test(n) || /timeout/.test(n)) {
            friendly = 'Email ou mot de passe incorrect. Vérifiez vos informations et réessayez.';
          }
        } catch {}
        if (friendly.toLowerCase().includes('compte non vérifié')) {
          setShowUnverifiedActions(true);
        } else {
          setShowUnverifiedActions(false);
        }
  console.log('[Login] setting errorMsg (normal/friendly):', normal, '/', friendly);
  setErrorMsg(friendly);
  try { showToast(friendly, 'error', 8000, 'top'); } catch {}
  // Ne pas naviguer ici : laisser l'utilisateur sur la page de connexion sans remount inutile.
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <>
    <AuthLayout>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="bus" size={48} color={theme.colors.white} />
              </View>
              <Text style={styles.logoText}>GoSOTRAL</Text>
              <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={20} color={theme.colors.secondary[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="votre@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={theme.colors.secondary[400]}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      // move focus to password - but simple approach: nothing for now
                    }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color={theme.colors.secondary[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={theme.colors.secondary[400]}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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


              {/* inline error removed; toast will show messages */}

              {showUnverifiedActions && (
                <View style={styles.inlineActions}>
                  <TouchableOpacity
                    disabled={resending}
                    onPress={async () => {
                      if (!email) return;
                      setResending(true);
                      try {
                        await AuthService.resendOTP(email);
                        setErrorMsg('Code renvoyé. Vérifiez votre email.');
                      } catch (e:any) {
                        setErrorMsg('Erreur lors de l\'envoi du code.');
                      } finally {
                        setResending(false);
                      }
                    }}
                    style={[styles.smallBtn, resending && styles.smallBtnDisabled]}
                  >
                    <Text style={styles.smallBtnText}>{resending ? 'Envoi...' : 'Renvoyer le code'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (!email) return;
                      router.push({ pathname: '/verify-otp', params: { email } });
                    }}
                    style={styles.outlineLink}
                  >
                    <Text style={styles.outlineLinkText}>Vérifier maintenant</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Forgot Password */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                    <Ionicons name="arrow-forward" size={20} color={theme.colors.primary[600]} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerPrompt}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </AuthLayout>
  {/* debug overlay removed */}
  {/* ToastOverlay is rendered globally by ToastProvider */}
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  form: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
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
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  loginButtonDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  loginButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
  },
  registerPrompt: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: theme.spacing.sm,
  },
  registerLink: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  inlineActions: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  smallBtn: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
  },
  smallBtnDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  smallBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  outlineLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  outlineLinkText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
