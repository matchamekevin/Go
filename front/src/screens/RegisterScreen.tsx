import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { AuthService } from '../services/authService';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Erreur', 'L\'email est requis');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }
    if (!password) {
      Alert.alert('Erreur', 'Le mot de passe est requis');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Le numéro de téléphone est requis');
      return;
    }

    console.log('[RegisterScreen] 🚀 Starting registration attempt');
    console.log('[RegisterScreen] 📧 Email:', email.trim());
    console.log('[RegisterScreen] 👤 Name:', name.trim());
    console.log('[RegisterScreen] 📞 Phone:', phone.trim());

    setLoading(true);
    try {
      console.log('[RegisterScreen] 📡 Calling AuthService.register...');
      const result = await AuthService.register({
        email: email.trim(),
        name: name.trim(),
        password,
        phone: phone.trim(),
      });

      console.log('[RegisterScreen] ✅ Registration successful:', result);
      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé. Vous allez recevoir un code de vérification par email.',
        [
          {
            text: 'Continuer',
            onPress: () => {
              // Naviguer vers l'écran de vérification OTP
              navigation.navigate('OTPVerification', { email: email.trim() });
            },
          },
        ]
      );
    } catch (error: any) {
      console.log('[RegisterScreen] ❌ Registration failed:', error);
      console.log('[RegisterScreen] 💥 Error message:', error.message);
      console.log('[RegisterScreen] 🔍 Error type:', error.constructor.name);

      // Afficher le message d'erreur exact pour le debug
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte GoSOTRAL</Text>

          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone (+228 XX XX XX XX)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.info}>
            En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#3F51B5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    lineHeight: 16,
  },
});

export default RegisterScreen;
