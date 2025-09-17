import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

interface AuthLayoutProps {
  children: React.ReactNode;
  showGradient?: boolean;
  topInset?: number;
}

export default function AuthLayout({ children, showGradient = true, topInset = 0 }: AuthLayoutProps) {
  // allow optional per-screen top inset to fine-tune spacing above the content
  // (useful for auth screens where we want different header spacing)
  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: topInset }
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {showGradient ? (
          <LinearGradient
            colors={[theme.colors.primary[600], theme.colors.primary[700]]}
            style={styles.gradient}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={styles.plainBackground}>
            {content}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[600],
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  plainBackground: {
    flex: 1,
    backgroundColor: theme.colors.primary[600],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: theme.spacing.lg,
  },
});
