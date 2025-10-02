import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/styles/theme';
import { sotralUnifiedService } from '../src/services/sotralUnifiedService';

type PaymentMethod = 'mixx' | 'flooz';

export default function PaymentCodeScreen() {
  const {
    lineId,
    ticketId,
    quantity,
    paymentMethod
  } = useLocalSearchParams<{
    lineId: string;
    ticketId: string;
    quantity: string;
    paymentMethod: string;
  }>();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Charger les détails du ticket pour afficher le prix
    if (ticketId) {
      loadTicketDetails();
    }
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      if (!ticketId) {
        console.warn('Aucun ticketId fourni');
        return;
      }

      console.log('Chargement des détails pour le ticket ID:', ticketId);

      // Récupérer les détails du ticket spécifique depuis l'API
      const ticket = await sotralUnifiedService.getTicketById(parseInt(ticketId));

      if (ticket) {
        setTicketDetails({
          price: ticket.price_paid_fcfa,
          code: ticket.ticket_code,
        });
        console.log(`Prix du ticket chargé: ${ticket.price_paid_fcfa} FCFA`);
      } else {
        console.warn('Ticket non trouvé, utilisation du prix par défaut');
        setTicketDetails({
          price: 500, // Prix par défaut si ticket non trouvé
          code: 'TICKET-UNKNOWN',
        });
      }
    } catch (error) {
      console.error('Erreur chargement ticket:', error);
      // En cas d'erreur, utiliser un prix par défaut
      setTicketDetails({
        price: 500,
        code: 'TICKET-ERROR',
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Recharger les détails du ticket
    loadTicketDetails();
    // Simuler un délai de chargement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatPhoneNumber = (text: string) => {
    // Ne garder que les chiffres
    const cleaned = text.replace(/\D/g, '');

    // Formatter pour le Togo (ex: 9X XXX XXX)
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\s/g, '');
    return digitsOnly.length === 8 && (digitsOnly.startsWith('9') || digitsOnly.startsWith('7') || digitsOnly.startsWith('2'));
  };

  const handlePayment = async () => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Numéro invalide',
        'Veuillez saisir un numéro de téléphone togolais valide (ex: 9X XXX XXX)'
      );
      return;
    }

    if (!paymentCode.trim()) {
      Alert.alert('Code requis', 'Veuillez saisir votre code de paiement');
      return;
    }

    if (paymentCode.length < 4) {
      Alert.alert('Code trop court', 'Le code de paiement doit contenir au moins 4 caractères');
      return;
    }

    setIsProcessing(true);

    try {
      // Simuler le processus de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simuler une validation de paiement réussie
      const success = Math.random() > 0.2; // 80% de succès

      if (success) {
        // Naviguer vers l'écran de ticket généré (replace pour empêcher retour arrière)
        router.replace({
          pathname: '/ticket-generated',
          params: {
            lineId,
            ticketId,
            quantity,
            paymentMethod,
            phoneNumber: cleanPhone,
            transactionId: `TXN_${Date.now()}`,
          }
        });
      } else {
        Alert.alert(
          'Paiement échoué',
          'Le paiement n\'a pas pu être traité. Vérifiez votre code et solde, puis réessayez.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: () => setIsProcessing(false) }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du paiement. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case 'mixx':
        return {
          name: 'Mixx',
          logo: '🏦',
          instructions: 'Entrez votre numéro Mixx et votre code secret à 4 chiffres'
        };
      case 'flooz':
        return {
          name: 'Flooz',
          logo: '💰',
          instructions: 'Entrez votre numéro Flooz et votre code secret à 4 chiffres'
        };
      default:
        return {
          name: 'Mobile Money',
          logo: '📱',
          instructions: 'Entrez votre numéro et code de paiement'
        };
    }
  };

  const methodInfo = getPaymentMethodInfo(paymentMethod || '');
  const totalAmount = ticketDetails ? (ticketDetails.price * parseInt(quantity || '1')) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Code de paiement</Text>
            <Text style={styles.headerSubtitle}>
              {quantity} ticket{parseInt(quantity || '1') > 1 ? 's' : ''} - {totalAmount} FCFA
            </Text>
          </View>
        </View>

        {/* Payment Method Info */}
        <View style={styles.methodCard}>
          <View style={styles.methodHeader}>
            <Text style={styles.methodLogo}>{methodInfo.logo}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{methodInfo.name}</Text>
              <Text style={styles.methodInstructions}>{methodInfo.instructions}</Text>
            </View>
          </View>
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Numéro de téléphone</Text>
          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+228</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="9X XXX XXX"
              placeholderTextColor={theme.colors.secondary[600]}
              keyboardType="phone-pad"
              maxLength={11} // 2 + 1 + 3 + 1 + 3 = 10 caractères avec espaces
              editable={!isProcessing}
            />
          </View>
          <Text style={styles.inputHelper}>
            Numéro {methodInfo.name} valide au Togo
          </Text>
        </View>

        {/* Payment Code Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Code de paiement</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.secondary[400]} />
            <TextInput
              style={styles.codeInput}
              value={paymentCode}
              onChangeText={setPaymentCode}
              placeholder="••••"
              placeholderTextColor={theme.colors.secondary[600]}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              editable={!isProcessing}
            />
          </View>
          <Text style={styles.inputHelper}>
            Code secret de votre compte {methodInfo.name}
          </Text>
        </View>

        {/* Amount Summary */}
        <View style={styles.amountCard}>
          <Text style={styles.amountTitle}>Montant à débiter</Text>
          <Text style={styles.amountValue}>{totalAmount} FCFA</Text>
          <Text style={styles.amountDetails}>
            {quantity} ticket{parseInt(quantity || '1') > 1 ? 's' : ''} × {ticketDetails?.price || 0} FCFA
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              isProcessing && styles.processingButton,
              (!phoneNumber.trim() || !paymentCode.trim()) && styles.disabledButton,
            ]}
            onPress={handlePayment}
            disabled={isProcessing || !phoneNumber.trim() || !paymentCode.trim()}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="card" size={20} color={theme.colors.white} />
                <Text style={styles.payButtonText}>
                  Payer {totalAmount} FCFA
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
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
  methodCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLogo: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  methodInstructions: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  countryCode: {
    backgroundColor: theme.colors.secondary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  countryCodeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  phoneInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
  },
  codeInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    marginLeft: theme.spacing.sm,
  },
  inputHelper: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: theme.spacing.xs,
  },
  amountCard: {
    backgroundColor: theme.colors.primary[50],
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  amountTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[700],
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  amountDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
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
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  processingButton: {
    backgroundColor: theme.colors.secondary[400],
  },
  disabledButton: {
    backgroundColor: theme.colors.secondary[300],
  },
  payButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});