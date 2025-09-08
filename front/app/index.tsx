import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';

export default function WelcomeScreen() {
  useEffect(() => {
    // Auto-redirect vers les tabs après 3 secondes ou sur tap
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8', '#1E40AF']}
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
        <View style={styles.illustrationContainer}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              <View style={styles.ticketPreview}>
                <Ionicons name="qr-code" size={60} color={theme.colors.primary[600]} />
                <Text style={styles.ticketText}>Billet numérique</Text>
              </View>
            </View>
          </View>
          
          {/* Points décoratifs */}
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
        </View>

        {/* Features highlights */}
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

        {/* Call to action */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
            <Text style={styles.ctaText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.primary[600]} />
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            Ou appuyez n'importe où pour continuer
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
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  phoneFrame: {
    width: 200,
    height: 360,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: 8,
    ...theme.shadows.lg,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.xl,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.full,
  },
  circle1: {
    width: 60,
    height: 60,
    top: 50,
    left: 30,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 80,
    right: 20,
  },
  circle3: {
    width: 40,
    height: 40,
    top: 200,
    right: 50,
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  ctaText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[600],
    marginRight: theme.spacing.sm,
  },
  skipText: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
