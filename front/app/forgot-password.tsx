import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';
import { AuthService } from '../src/services/authService';
import FeedbackMessage from '../src/components/FeedbackMessage';
import AuthLayout from '../src/components/AuthLayout';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const lockRef = useRef(false);

  const handleForgotPassword = async () => {
    if (loading || lockRef.current) return; // anti double tap
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email) {
      setErrorMsg('Veuillez saisir votre adresse email');
      return;
    }
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setErrorMsg('Veuillez saisir une adresse email valide');
      return;
    }

    lockRef.current = true;
    setLoading(true);
    try {
      await AuthService.forgotPassword(emailTrimmed.toLowerCase());
      setSuccessMsg('Code envoyé ! Vérifiez votre boîte mail.');
      // Navigation différée pour laisser voir le message
      setTimeout(() => {
        router.push({ pathname: '/reset-password', params: { email: emailTrimmed } });
      }, 800);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
      lockRef.current = false;
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>Récupérez votre compte</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
              <View style={[styles.formContainer, { marginBottom: theme.spacing.xl }] }>
                {/* Info */}
                <View style={styles.infoContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={40} color={theme.colors.primary[600]} />
                  </View>
                  <Text style={styles.infoTitle}>Réinitialiser votre mot de passe</Text>
                  <Text style={styles.infoText}>
                    Saisissez votre adresse email et nous vous enverrons un code pour réinitialiser votre mot de passe.
                  </Text>
                </View>

                {/* Messages */}
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

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Adresse email</Text>
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
                    />
                  </View>
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={styles.sendButtonText}>Envoi en cours...</Text>
                  ) : (
                    <>
                      <Text style={styles.sendButtonText}>Envoyer le code</Text>
                      <Ionicons name="send" size={20} color={theme.colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Back to Login */}
              <View style={{ alignItems: 'center', paddingTop: theme.spacing.md }}>
                <Text style={styles.loginRow}>
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Text style={styles.loginLinkInline} onPress={handleBackToLogin}>
                    Se connecter
                  </Text>
                </Text>
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
    justifyContent: 'space-between',
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
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    textAlign: 'center',
    lineHeight: 24,
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
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  sendButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginPrompt: {
    fontSize: theme.typography.fontSize.base,
  color: 'rgba(255, 255, 255, 0.9)',
  marginRight: theme.spacing.xs,
  lineHeight: 20,
  },
  loginLink: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    textDecorationLine: 'underline',
  lineHeight: 20,
  marginLeft: theme.spacing.xs,
  },
  loginRow: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  loginLinkInline: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
});
