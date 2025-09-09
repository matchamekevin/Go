import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';
import { useAuth } from '../src/contexts/AuthContext';

export default function WelcomeScreen() {
  // Removed auto-redirect, only button click will navigate.
  const { isAuthenticated, isLoading } = useAuth();

  const handleGetStarted = () => {
    // If still checking auth, do nothing (or show loader in future)
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      // Force login when the user is not authenticated
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary[500], theme.colors.primary[600], theme.colors.secondary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
          {/* Header avec logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="bus" size={48} color={theme.colors.white} />
              </View>
              <Text style={styles.logoText}>GoSOTRAL</Text>
              <Text style={styles.tagline}>Transport intelligent</Text>
            </View>
          </View>

          {/* Illustration centrale */}
          <View style={[styles.illustrationContainer, { flex: 1.2 }]}>
            <View style={[styles.phoneFrame, { width: 160, height: 160 }]}>
              <View style={styles.phoneScreen}>
                <View style={styles.ticketPreview}>
                  <Ionicons name="qr-code" size={36} color={theme.colors.primary[600]} />
                  <Text style={[styles.ticketText, { fontSize: 9 }]}>Billet numérique</Text>
                </View>
              </View>
            </View>
            {/* Points décoratifs avec animation */}
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
          </View>

          {/* Points forts */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={24} color={theme.colors.white} />
                <Text style={styles.featureText}>Rapide</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={24} color={theme.colors.white} />
                <Text style={styles.featureText}>Sécurisé</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="phone-portrait" size={24} color={theme.colors.white} />
                <Text style={styles.featureText}>Mobile</Text>
              </View>
            </View>
          </View>

          {/* Appel à l'action */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
              <Text style={styles.ctaText}>Commencer</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
            <Text style={styles.skipText}>
              Découvrez le transport intelligent du Togo
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  illustrationContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: theme.spacing.lg,
  },
  phoneFrame: {
    width: 200,
    height: 360,
    backgroundColor: theme.colors.white,
    borderRadius: 28,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketPreview: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  ticketText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.full,
  },
  circle1: {
    width: 70,
    height: 70,
    top: 40,
    left: 20,
  },
  circle2: {
    width: 90,
    height: 90,
    bottom: 60,
    right: 10,
  },
  circle3: {
    width: 50,
    height: 50,
    top: 180,
    right: 40,
  },
  featuresContainer: {
    flex: 0.5,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.medium,
  },
  ctaContainer: {
    flex: 0.8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: theme.spacing.xxl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xl * 1.5,
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: theme.typography.fontSize.lg + 1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginRight: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.3,
  },
});
