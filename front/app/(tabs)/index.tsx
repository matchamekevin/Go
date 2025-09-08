import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeTab() {
  const quickActions = [
    {
      id: 1,
      title: 'Acheter un billet',
      subtitle: 'Ticket bus, metro',
      icon: 'ticket' as const,
      color: theme.colors.primary[600],
      bgColor: theme.colors.primary[50],
    },
    {
      id: 2,
      title: 'Recharger carte',
      subtitle: 'Carte transport',
      icon: 'card' as const,
      color: theme.colors.success[600],
      bgColor: theme.colors.success[50],
    },
    {
      id: 3,
      title: 'Mes trajets',
      subtitle: 'Historique',
      icon: 'time' as const,
      color: theme.colors.warning[600],
      bgColor: theme.colors.warning[50],
    },
    {
      id: 4,
      title: 'Support',
      subtitle: 'Aide & contact',
      icon: 'help-circle' as const,
      color: theme.colors.secondary[600],
      bgColor: theme.colors.secondary[100],
    },
  ];

  const popularRoutes = [
    {
      id: 1,
      from: 'Centre-ville',
      to: 'Aéroport',
      price: '2500 FCFA',
      duration: '45 min',
      type: 'Bus rapide',
    },
    {
      id: 2,
      from: 'Université',
      to: 'Marché central',
      price: '1500 FCFA',
      duration: '25 min',
      type: 'Bus urbain',
    },
    {
      id: 3,
      from: 'Gare routière',
      to: 'Plateau',
      price: '1000 FCFA',
      duration: '20 min',
      type: 'Métro',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec gradient */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Bonjour</Text>
              <Text style={styles.userName}>Utilisateur</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color={theme.colors.white} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
          
          {/* Wallet Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletTitle}>Solde transport</Text>
              <Ionicons name="wallet" size={20} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.walletAmount}>15,000 FCFA</Text>
            <TouchableOpacity style={styles.addMoneyButton}>
              <Ionicons name="add" size={16} color={theme.colors.white} />
              <Text style={styles.addMoneyText}>Recharger</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trajets populaires</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {popularRoutes.map((route) => (
            <TouchableOpacity key={route.id} style={styles.routeCard}>
              <View style={styles.routeInfo}>
                <View style={styles.routeHeader}>
                  <View style={styles.routePoints}>
                    <Text style={styles.routeFrom}>{route.from}</Text>
                    <View style={styles.routeArrow}>
                      <Ionicons name="arrow-forward" size={16} color={theme.colors.secondary[400]} />
                    </View>
                    <Text style={styles.routeTo}>{route.to}</Text>
                  </View>
                  <Text style={styles.routePrice}>{route.price}</Text>
                </View>
                <View style={styles.routeDetails}>
                  <View style={styles.routeTag}>
                    <Text style={styles.routeTagText}>{route.type}</Text>
                  </View>
                  <Text style={styles.routeDuration}>{route.duration}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary[300]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Voyage terminé</Text>
              <Text style={styles.activitySubtitle}>Centre-ville → Université</Text>
              <Text style={styles.activityTime}>Il y a 2 heures</Text>
            </View>
            <Text style={styles.activityAmount}>-1,500 FCFA</Text>
          </View>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary[600]} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Recharge effectuée</Text>
              <Text style={styles.activitySubtitle}>Mobile Money</Text>
              <Text style={styles.activityTime}>Hier à 14:30</Text>
            </View>
            <Text style={styles.activityAmount}>+10,000 FCFA</Text>
          </View>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greeting: {},
  greetingText: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: theme.typography.fontWeight.normal,
  },
  userName: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.full,
  },
  walletCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  walletTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  walletAmount: {
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
  },
  addMoneyText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    textAlign: 'center',
    marginTop: 2,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  routeInfo: {
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  routePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeFrom: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  routeArrow: {
    marginHorizontal: theme.spacing.sm,
  },
  routeTo: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  routePrice: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTag: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  routeTagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  routeDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  activityIcon: {
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  activitySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[400],
    marginTop: 2,
  },
  activityAmount: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
