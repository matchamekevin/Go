import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { sotralUnifiedService, UnifiedSotralTicket } from '../services/sotralUnifiedService';

interface MobilePaymentModalProps {
  visible: boolean;
  ticket: UnifiedSotralTicket | null;
  onClose: () => void;
  onPaymentSuccess: (ticket: UnifiedSotralTicket) => void;
}

export default function MobilePaymentModal({
  visible,
  ticket,
  onClose,
  onPaymentSuccess
}: MobilePaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'mixx' | 'flooz' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled' | null>(null);

  const resetModal = () => {
    setSelectedMethod(null);
    setPhoneNumber('');
    setIsProcessing(false);
    setPaymentRef(null);
    setPaymentStatus(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Validation basique pour les numéros togolais
    const cleanNumber = number.replace(/\s+/g, '');
    const phoneRegex = /^(\+228|00228)?[9][0-9]{7}$/;
    return phoneRegex.test(cleanNumber);
  };

  const initiatePayment = async () => {
    if (!ticket || !selectedMethod || !phoneNumber) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement et saisir votre numéro de téléphone');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone togolais valide (format: +228XXXXXXXXX ou 9XXXXXXXX)');
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`[MobilePaymentModal] Initiation paiement ${selectedMethod} pour ticket ${ticket.id}`);

      const result = await sotralUnifiedService.initiateMobilePayment({
        ticketId: ticket.id,
        paymentMethod: selectedMethod,
        phoneNumber: phoneNumber.trim(),
        amount: ticket.price_paid_fcfa
      });

      if (result.success && result.paymentRef) {
        setPaymentRef(result.paymentRef);
        setPaymentStatus('pending');

        // Commencer la vérification du statut
        checkPaymentStatus(result.paymentRef);
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error: any) {
      console.error('[MobilePaymentModal] Erreur paiement:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (ref: string) => {
    try {
      const result = await sotralUnifiedService.checkPaymentStatus(ref);

      if (result.success) {
        setPaymentStatus(result.status);

        if (result.status === 'completed' && result.ticket) {
          Alert.alert(
            'Paiement réussi !',
            'Votre ticket a été acheté avec succès.',
            [
              {
                text: 'OK',
                onPress: () => {
                  onPaymentSuccess(result.ticket!);
                  handleClose();
                }
              }
            ]
          );
        } else if (result.status === 'failed') {
          Alert.alert('Paiement échoué', 'Le paiement n\'a pas pu être traité. Veuillez réessayer.');
          resetModal();
        } else if (result.status === 'pending') {
          // Continuer à vérifier toutes les 3 secondes
          setTimeout(() => checkPaymentStatus(ref), 3000);
        }
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la vérification du paiement');
      }
    } catch (error: any) {
      console.error('[MobilePaymentModal] Erreur vérification:', error);
      Alert.alert('Erreur', 'Erreur lors de la vérification du statut du paiement');
    }
  };

  if (!ticket) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Paiement Mobile</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.secondary[500]} />
            </TouchableOpacity>
          </View>

          {/* Ticket Info */}
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketCode}>Ticket: {ticket.ticket_code}</Text>
            <Text style={styles.ticketPrice}>{ticket.price_paid_fcfa} FCFA</Text>
          </View>

          {/* Payment Status */}
          {paymentStatus && (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                paymentStatus === 'completed' && styles.statusCompleted,
                paymentStatus === 'pending' && styles.statusPending,
                paymentStatus === 'failed' && styles.statusFailed
              ]}>
                <Ionicons
                  name={
                    paymentStatus === 'completed' ? 'checkmark-circle' :
                    paymentStatus === 'pending' ? 'time' : 'close-circle'
                  }
                  size={20}
                  color={
                    paymentStatus === 'completed' ? theme.colors.success[600] :
                    paymentStatus === 'pending' ? theme.colors.warning[600] :
                    theme.colors.error[600]
                  }
                />
                <Text style={[
                  styles.statusText,
                  paymentStatus === 'completed' && styles.statusTextCompleted,
                  paymentStatus === 'pending' && styles.statusTextPending,
                  paymentStatus === 'failed' && styles.statusTextFailed
                ]}>
                  {paymentStatus === 'completed' ? 'Paiement réussi' :
                   paymentStatus === 'pending' ? 'Paiement en cours...' :
                   'Paiement échoué'}
                </Text>
              </View>
              {paymentRef && (
                <Text style={styles.paymentRef}>Référence: {paymentRef}</Text>
              )}
            </View>
          )}

          {/* Payment Methods */}
          {!paymentStatus && (
            <>
              <Text style={styles.sectionTitle}>Choisir une méthode de paiement</Text>

              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    selectedMethod === 'mixx' && styles.paymentMethodSelected
                  ]}
                  onPress={() => setSelectedMethod('mixx')}
                >
                  <View style={styles.methodIcon}>
                    <Ionicons name="phone-portrait" size={24} color={theme.colors.primary[600]} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>Mixx by YAS</Text>
                    <Text style={styles.methodDescription}>Paiement mobile YAS</Text>
                  </View>
                  {selectedMethod === 'mixx' && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary[600]} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    selectedMethod === 'flooz' && styles.paymentMethodSelected
                  ]}
                  onPress={() => setSelectedMethod('flooz')}
                >
                  <View style={styles.methodIcon}>
                    <Ionicons name="phone-portrait" size={24} color={theme.colors.secondary[600]} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>Flooz</Text>
                    <Text style={styles.methodDescription}>Paiement mobile Flooz</Text>
                  </View>
                  {selectedMethod === 'flooz' && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.secondary[600]} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Phone Number Input */}
              {selectedMethod && (
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="+228XXXXXXXXX ou 9XXXXXXXX"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                  <Text style={styles.phoneHint}>
                    Saisissez votre numéro {selectedMethod === 'mixx' ? 'YAS' : 'Flooz'}
                  </Text>
                </View>
              )}

              {/* Payment Button */}
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!selectedMethod || !phoneNumber || isProcessing) && styles.payButtonDisabled
                ]}
                onPress={initiatePayment}
                disabled={!selectedMethod || !phoneNumber || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <>
                    <Text style={styles.payButtonText}>
                      Payer {ticket.price_paid_fcfa} FCFA
                    </Text>
                    <Ionicons name="card" size={20} color={theme.colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Loading indicator for status checks */}
          {paymentStatus === 'pending' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>
                Vérification du paiement en cours...
              </Text>
              <Text style={styles.loadingSubtext}>
                Veuillez confirmer le paiement sur votre téléphone
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  ticketInfo: {
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  ticketCode: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  ticketPrice: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
  },
  statusCompleted: {
    backgroundColor: theme.colors.success[50],
  },
  statusPending: {
    backgroundColor: theme.colors.warning[50],
  },
  statusFailed: {
    backgroundColor: theme.colors.error[50],
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
  statusTextCompleted: {
    color: theme.colors.success[600],
  },
  statusTextPending: {
    color: theme.colors.warning[600],
  },
  statusTextFailed: {
    color: theme.colors.error[600],
  },
  paymentRef: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  paymentMethods: {
    marginBottom: theme.spacing.lg,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    borderColor: theme.colors.primary[300],
    backgroundColor: theme.colors.primary[50],
  },
  methodIcon: {
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  methodDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: theme.spacing.xs,
  },
  phoneInputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: theme.colors.secondary[300],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
  },
  phoneHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    marginTop: theme.spacing.xs,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  payButtonDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  payButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginRight: theme.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});