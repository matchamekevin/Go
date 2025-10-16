import React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../styles/theme";

interface AuthLayoutProps {
  children: React.ReactNode;
  showGradient?: boolean;
  topInset?: number;
}

export default function AuthLayout({
  children,
  showGradient = true,
  topInset = 0,
}: AuthLayoutProps) {
  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingTop: topInset }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      // Améliore le scroll sur Android quand le clavier est ouvert
      nestedScrollEnabled={true}
      // Permet au scroll de s'ajuster automatiquement au clavier
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      // Garde le contenu visible quand le clavier apparaît
      maintainVisibleContentPosition={
        Platform.OS === "android"
          ? {
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 100,
            }
          : undefined
      }
    >
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        enabled
      >
        {showGradient ? (
          <LinearGradient
            colors={[theme.colors.primary[600], theme.colors.primary[700]]}
            style={styles.gradient}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={styles.plainBackground}>{content}</View>
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
    paddingBottom: Platform.OS === "android" ? 40 : theme.spacing.lg,
  },
});
