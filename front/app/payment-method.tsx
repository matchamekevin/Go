import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';

type PaymentMethod = 'mixx' | 'flooz';

export default function PaymentMethodScreen() {
  const { lineId, ticketId, quantity } = useLocalSearchParams<{
    lineId: string;
    ticketId: string;
    quantity: string;
  }>();
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

const paymentMethods = [
  {
    id: 'mixx',
    name: 'Mixx by YAS',
    icon: 'wallet',
    color: '#1E40AF',
    logoUrl: 'https://cb2mixx.yas.tg/assets/logo%20Mixx%20by%20yas-pLAT.svg',
    logo: 'M',
    description: 'Paiement mobile via Mixx by YAS',
  },
  {
    id: 'flooz',
    name: 'Flooz',
    icon: 'cash',
    color: '#059669',
    logoUrl: 'https://moov-africa.tg/wp-content/uploads/2020/01/flooz-logo.png',
    logo: 'F',
    description: 'Paiement mobile via Flooz',
  },
];  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method as PaymentMethod);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un moyen de paiement');
      return;
    }

    // Naviguer vers la saisie du code de paiement
    router.push({
      pathname: '/payment-code',
      params: {
        lineId,
        ticketId,
        quantity,
        paymentMethod: selectedMethod,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Moyen de paiement</Text>
            <Text style={styles.headerSubtitle}>
              {quantity} ticket{parseInt(quantity) > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        {/* Supprimé selon la demande utilisateur */}

        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard,
                index === 0 && styles.firstMethodCard, // Espace supplémentaire pour Mixx by YAS
              ]}
              onPress={() => handleMethodSelect(method.id)}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodIcon}>
                  <Text style={styles.methodLogo}>{method.logo}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
                <View style={styles.selectionIndicator}>
                  {selectedMethod === method.id ? (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary[600]} />
                  ) : (
                    <View style={styles.unselectedCircle} />
                  )}
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.methodDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="shield-checkmark" size={16} color={theme.colors.success[500]} />
                  <Text style={styles.detailText}>Paiement sécurisé</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color={theme.colors.secondary[500]} />
                  <Text style={styles.detailText}>Traitement instantané</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Notice */}
        {/* Supprimé selon la demande utilisateur */}

        {/* Continue Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMethod && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedMethod}
          >
            <Text style={styles.continueButtonText}>
              Continuer avec {selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.name : '...'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => {
              Alert.alert(
                'Besoin d\'aide ?',
                'Si vous n\'avez pas de compte mobile money, vous pouvez payer en espèces auprès des guichets SOTRAL.',
                [{ text: 'Compris' }]
              );
            }}
          >
            <Ionicons name="help-circle" size={16} color={theme.colors.primary[600]} />
            <Text style={styles.helpButtonText}>Paiement alternatif</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
  header: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
  },
  instructionCard: {
    // Supprimé
  },
  instructionContent: {
    // Supprimé
  },
  instructionTitle: {
    // Supprimé
  },
  instructionText: {
    // Supprimé
  },
  methodsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  methodCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  firstMethodCard: {
    marginTop: theme.spacing.lg, // Espace supplémentaire en haut pour Mixx by YAS
  },
  selectedMethodCard: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  methodLogo: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  methodDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
  },
  selectionIndicator: {
    marginLeft: theme.spacing.md,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.secondary[300],
  },
  methodDetails: {
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    marginLeft: theme.spacing.sm,
  },
  securityCard: {
    // Supprimé
  },
  securityContent: {
    // Supprimé
  },
  securityTitle: {
    // Supprimé
  },
  securityText: {
    // Supprimé
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  disabledButton: {
    backgroundColor: theme.colors.secondary[300],
  },
  continueButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  helpButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});