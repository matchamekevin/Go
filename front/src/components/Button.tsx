import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false, 
  variant = 'primary',
  size = 'medium'
}: ButtonProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return styles.buttonPrimary;
      case 'secondary': return styles.buttonSecondary;
      case 'danger': return styles.buttonDanger;
      default: return styles.buttonPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return styles.buttonSmall;
      case 'medium': return styles.buttonMedium;
      case 'large': return styles.buttonLarge;
      default: return styles.buttonMedium;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary': return styles.buttonTextPrimary;
      case 'secondary': return styles.buttonTextSecondary;
      case 'danger': return styles.buttonTextDanger;
      default: return styles.buttonTextPrimary;
    }
  };

  const buttonStyle = [
    styles.button,
    getVariantStyle(),
    getSizeStyle(),
    disabled && styles.buttonDisabled,
  ];

  const textStyle = [
    styles.buttonText,
    getTextStyle(),
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#ffffff' : '#007AFF'} 
          size="small" 
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    borderColor: '#E5E5E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#007AFF',
  },
  buttonTextDanger: {
    color: '#ffffff',
  },
});
