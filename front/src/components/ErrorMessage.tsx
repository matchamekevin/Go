import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface ErrorMessageProps {
  message: string | null;
  style?: any;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, style }) => {
  if (!message) return null;
  return (
    <View style={[{
      marginBottom: 16,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }, style]}>
      <Ionicons name="alert-circle" size={18} color={theme.colors.error[600]} style={{ marginRight: 6 }} />
      <Text style={{ color: theme.colors.error[600], fontWeight: '600', fontSize: 15 }}>{message}</Text>
    </View>
  );
};

export default ErrorMessage;
