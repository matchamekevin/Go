import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';
import { PaymentService } from '../src/services/paymentService';
import type { PaymentWebhook } from '../src/types/api';

export default function TestPaymentsScreen() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [phone, setPhone] = useState('90123456');
  const [operator, setOperator] = useState('MTN');
  const [externalId, setExternalId] = useState('');
  const [lastPaymentId, setLastPaymentId] = useState('');

  const testInitiatePayment = async () => {
    if (!amount || !phone) {
      Alert.alert('Erreur', 'Veuillez remplir le montant et le téléphone');
      return;
    }

    setLoading(true);
    try {
      const payment = await PaymentService.initiateMobileMoneyPayment(
        parseInt(amount),
        phone,
        operator
      );

      setLastPaymentId(payment.external_id);
      setExternalId(payment.external_id);

      Alert.alert(
        'Paiement initié',
        `ID: ${payment.external_id}\n\nInstructions:\n${payment.instructions}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur Payment', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCheckStatus = async () => {
    if (!externalId) {
      Alert.alert('Erreur', 'Veuillez saisir un ID externe ou initier un paiement');
      return;
    }

    setLoading(true);
    try {
      const status = await PaymentService.checkPaymentStatus(externalId);
      Alert.alert(
        'Statut du paiement',
        `Statut: ${status.status}\nMessage: ${status.message}`
      );
    } catch (error: any) {
      Alert.alert('Erreur Status', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetReceipt = async () => {
    if (!externalId) {
      Alert.alert('Erreur', 'Veuillez saisir un ID externe');
      return;
    }

    setLoading(true);
    try {
      const receipt = await PaymentService.getReceiptByExternalId(externalId);
      Alert.alert(
        'Reçu trouvé',
        JSON.stringify(receipt, null, 2),
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur Receipt', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSimulateWebhook = async () => {
    if (!externalId) {
      Alert.alert('Erreur', 'Veuillez saisir un ID externe');
      return;
    }

    setLoading(true);
    try {
      const webhook: PaymentWebhook = {
        external_id: externalId,
        amount: parseInt(amount),
        currency: 'XOF',
        status: 'success',
        payment_method: 'mobile_money',
        ticket_purchase: {
          product_code: 'STD_TICKET',
          route_code: 'LOME_KARA',
          quantity: 1,
          purchase_method: 'mobile_money',
          payment_details: { external_id: externalId }
        }
      };

      const result = await PaymentService.simulatePaymentWebhook(webhook);
      Alert.alert(
        'Webhook simulé',
        JSON.stringify(result, null, 2),
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur Webhook', error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTestId = () => {
    const testId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    setExternalId(testId);
    setLastPaymentId(testId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Test Payments Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration du test</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Montant (FCFA):</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="1000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone (8 chiffres):</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="90123456"
              maxLength={8}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Opérateur:</Text>
            <View style={styles.operatorButtons}>
              {['MTN', 'MOOV', 'TOGOCEL'].map((op) => (
                <TouchableOpacity
                  key={op}
                  style={[
                    styles.operatorButton,
                    operator === op && styles.operatorButtonActive
                  ]}
                  onPress={() => setOperator(op)}
                >
                  <Text style={[
                    styles.operatorText,
                    operator === op && styles.operatorTextActive
                  ]}>
                    {op}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ID Externe (pour tests):</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={externalId}
                onChangeText={setExternalId}
                placeholder="TEST_1234567890_abc123"
              />
              <TouchableOpacity style={styles.generateButton} onPress={generateTestId}>
                <Ionicons name="refresh" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests de base</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={testInitiatePayment} disabled={loading}>
            <Ionicons name="play" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Initier Paiement Mobile Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={testCheckStatus} disabled={loading}>
            <Ionicons name="time" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Vérifier Statut Paiement</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={testGetReceipt} disabled={loading}>
            <Ionicons name="receipt" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Récupérer Reçu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests avancés</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: theme.colors.success[600] }]} 
            onPress={testSimulateWebhook} 
            disabled={loading}
          >
            <Ionicons name="flash" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Simuler Webhook Success</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info de session</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Configuration actuelle:</Text>
            <Text style={styles.infoItem}>• Montant: {amount} FCFA</Text>
            <Text style={styles.infoItem}>• Téléphone: +228 {phone}</Text>
            <Text style={styles.infoItem}>• Opérateur: {operator}</Text>
            {lastPaymentId && (
              <Text style={styles.infoItem}>• Dernier ID: {lastPaymentId}</Text>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Instructions:</Text>
            <Text style={styles.infoItem}>1. Configurez le montant et téléphone</Text>
            <Text style={styles.infoItem}>2. Initiez un paiement mobile money</Text>
            <Text style={styles.infoItem}>3. Vérifiez le statut du paiement</Text>
            <Text style={styles.infoItem}>4. Simulez un webhook de succès</Text>
            <Text style={styles.infoItem}>5. Récupérez le reçu généré</Text>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
    backgroundColor: theme.colors.white,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.secondary[900],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondary[900],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.secondary[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: theme.colors.primary[600],
    padding: 12,
    borderRadius: 8,
  },
  operatorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  operatorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.secondary[300],
    backgroundColor: theme.colors.white,
  },
  operatorButtonActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  operatorText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondary[600],
  },
  operatorTextActive: {
    color: theme.colors.white,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    marginBottom: 6,
  },
  infoItem: {
    fontSize: 12,
    color: theme.colors.secondary[600],
    marginBottom: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
