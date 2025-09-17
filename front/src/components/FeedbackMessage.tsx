import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export type FeedbackVariant = 'error' | 'success' | 'info' | 'warning';

interface Props {
  message: string;
  onClose?: () => void;
  variant?: FeedbackVariant;
  dense?: boolean;
}

const ICONS: Record<FeedbackVariant, keyof typeof Ionicons.glyphMap> = {
  error: 'warning',
  success: 'checkmark-circle',
  info: 'information-circle',
  warning: 'alert-circle',
};

export const FeedbackMessage: React.FC<Props> = ({ message, onClose, variant = 'info', dense }) => {
  if (!message) return null;

  return (
    <View style={[styles.container, styles[variant], dense && styles.dense]}>
      <Ionicons
        name={ICONS[variant]}
        size={18}
        color={
          variant === 'error'
            ? theme.colors.error[600]
            : variant === 'success'
              ? theme.colors.success[600]
              : variant === 'warning'
                ? theme.colors.warning[600]
                : theme.colors.primary[600]
        }
        style={styles.icon}
      />
      <Text style={[styles.text, variant === 'error' && styles.textError]} numberOfLines={3}>
        {message}
      </Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color={theme.colors.secondary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
  },
  dense: {
    paddingVertical: 6,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    lineHeight: 18,
    fontWeight: theme.typography.fontWeight.medium,
  },
  textError: {
  color: theme.colors.error[600],
  },
  closeBtn: {
    paddingHorizontal: 2,
  },
  error: {
  backgroundColor: theme.colors.error[50],
  borderColor: theme.colors.error[100],
  },
  success: {
  backgroundColor: theme.colors.success[50],
  borderColor: theme.colors.success[100],
  },
  info: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  warning: {
  backgroundColor: theme.colors.warning[50],
  borderColor: theme.colors.warning[100],
  },
});

export default FeedbackMessage;
