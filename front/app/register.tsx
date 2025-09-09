import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/styles/theme';
import { AuthService } from '../src/services/authService';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatTgPhone = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    let local = digits;
    if (local.startsWith('228')) local = local.slice(3);
    if (local.startsWith('0') && local.length === 9) local = local.slice(1);
    local = local.slice(0, 8);
    const groups = local.match(/.{1,2}/g) || [];
    return groups.join(' ');
  };

  const normalizePhoneForApi = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    let local = digits;
    if (local.startsWith('228')) local = local.slice(3);
    if (local.startsWith('0') && local.length === 9) local = local.slice(1);
    local = local.slice(0, 8);
    return local ? '+228' + local : '';
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.phone) {
      const digits = formData.phone.replace(/[^0-9]/g, '');
      let local = digits;
      if (local.startsWith('228')) local = local.slice(3);
      if (local.startsWith('0') && local.length === 9) local = local.slice(1);
      if (local.length !== 8) {
        Alert.alert('Numéro invalide', 'Veuillez saisir un numéro togolais valide de 8 chiffres (ex: XX XX XX XX)');
        return;
      }
    }

    setLoading(true);
    try {
      const phoneToSend = formData.phone ? normalizePhoneForApi(formData.phone) : '';
      await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: phoneToSend,
      });

      router.push({ pathname: '/verify-otp', params: { email: formData.email } });
    } catch (err: any) {
      const message = err?.message || (err?.response?.data && err.response.data.message) || "Erreur lors de l'inscription";
      Alert.alert("Erreur d'inscription", message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => router.push('/login');

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <LinearGradient 
              colors={[theme.colors.primary[500], theme.colors.primary[600], theme.colors.primary[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                  <Text style={styles.title}>Créer un compte</Text>
                  <Text style={styles.subtitle}>Rejoignez GoSOTRAL</Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nom complet *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person" size={20} color={theme.colors.secondary[400]} />
                      <TextInput
                        style={styles.input}
                        placeholder="Votre nom complet"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        autoCapitalize="words"
                        placeholderTextColor={theme.colors.secondary[400]}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail" size={20} color={theme.colors.secondary[400]} />
                      <TextInput
                        style={styles.input}
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor={theme.colors.secondary[400]}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Téléphone</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="call" size={20} color={theme.colors.secondary[400]} />
                      <TextInput
                        style={styles.input}
                        placeholder="XX XX XX XX"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: formatTgPhone(text) })}
                        keyboardType="phone-pad"
                        placeholderTextColor={theme.colors.secondary[400]}
                        maxLength={11}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Mot de passe *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed" size={20} color={theme.colors.secondary[400]} />
                      <TextInput
                        style={styles.input}
                        placeholder="Minimum 6 caractères"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        secureTextEntry={!showPassword}
                        placeholderTextColor={theme.colors.secondary[400]}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.secondary[400]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed" size={20} color={theme.colors.secondary[400]} />
                      <TextInput
                        style={styles.input}
                        placeholder="Répétez votre mot de passe"
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        secureTextEntry={!showConfirmPassword}
                        placeholderTextColor={theme.colors.secondary[400]}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                        <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={theme.colors.secondary[400]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.registerButton, loading && styles.registerButtonDisabled]} onPress={handleRegister} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <>
                        <Text style={styles.registerButtonText}>S'inscrire</Text>
                        <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginPrompt}>Déjà un compte ?</Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.loginLink}>Se connecter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.primary[600],
  },
  keyboardView: { flex: 1 },
  gradient: { 
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 25, // Remplace SafeAreaView
  },
  scrollContent: { 
    flexGrow: 1, 
    minHeight: '100%',
    paddingBottom: 40,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 48 : 24, 
    paddingBottom: 24,
  },
  backButton: { 
    padding: 8, 
    marginRight: 12, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  headerContent: { flex: 1 },
  title: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  subtitle: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.85)', 
    marginTop: 6,
    letterSpacing: 0.3,
  },
  formContainer: { 
    flex: 1, 
    paddingHorizontal: 20, 
    justifyContent: 'flex-start', 
    paddingBottom: 24,
  },
  form: { 
    backgroundColor: theme.colors.white, 
    borderRadius: 24,
    padding: 24, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inputContainer: { 
    marginBottom: 20,
  },
  inputLabel: { 
    fontSize: 13, 
    color: theme.colors.secondary[700], 
    fontWeight: '600', 
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.secondary[50], 
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1.5, 
    borderColor: theme.colors.secondary[200] 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: theme.colors.secondary[900], 
    paddingVertical: 12, 
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  eyeButton: { 
    padding: 8,
    marginRight: -4,
  },
  registerButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: theme.colors.primary[600], 
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: { 
    backgroundColor: theme.colors.secondary[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: { 
    fontSize: 17, 
    color: theme.colors.white, 
    fontWeight: '700', 
    marginRight: 8,
    letterSpacing: 0.5,
  },
  loginContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 20,
    marginTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 50 : 25, // Padding pour la zone bottom
  },
  loginPrompt: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.85)', 
    marginRight: 8,
    letterSpacing: 0.3,
  },
  loginLink: { 
    fontSize: 15, 
    color: theme.colors.white, 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
