import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ToastProvider } from '../src/contexts/ToastContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // Nous laissons la landing (`index`) comme premier écran pour que les reloads
  // en développement affichent la page d'accueil sans redirection automatique.

  // We always render the Stack to avoid remounting screens during auth checks.
  // When `isLoading` is true we show a light overlay instead of replacing the whole tree.

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="box-none">
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={{ marginTop: 8 }}>Chargement...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20000,
  },
  loadingBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
