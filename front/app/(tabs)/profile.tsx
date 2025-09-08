import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';

export default function ProfileTab() {
  const user = {
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+225 07 12 34 56 78',
    memberSince: 'Membre depuis Mars 2024',
    totalTrips: 127,
    totalSaved: '45,000 FCFA',
    favoriteRoute: 'Centre-ville → Université',
  };

  const profileStats = [
    {
      icon: 'car' as const,
      label: 'Trajets',
      value: user.totalTrips.toString(),
      color: theme.colors.primary[600],
    },
    {
      icon: 'wallet' as const,
      label: 'Économisé',
      value: user.totalSaved,
      color: theme.colors.success[600],
    },
    {
      icon: 'star' as const,
      label: 'Points fidélité',
      value: '1,250',
      color: theme.colors.warning[600],
    },
  ];

  const menuSections = [
    {
      title: 'Compte',
      items: [
        {
          icon: 'person-outline' as const,
          label: 'Informations personnelles',
          action: 'profile',
          hasArrow: true,
        },
        {
          icon: 'card-outline' as const,
          label: 'Moyens de paiement',
          action: 'payment',
          hasArrow: true,
        },
        {
          icon: 'location-outline' as const,
          label: 'Adresses favorites',
          action: 'addresses',
          hasArrow: true,
        },
      ],
    },
    {
      title: 'Préférences',
      items: [
        {
          icon: 'notifications-outline' as const,
          label: 'Notifications',
          action: 'notifications',
          hasArrow: true,
        },
        {
          icon: 'language-outline' as const,
          label: 'Langue',
          action: 'language',
          value: 'Français',
          hasArrow: true,
        },
        {
          icon: 'moon-outline' as const,
          label: 'Thème sombre',
          action: 'theme',
          hasSwitch: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline' as const,
          label: 'Centre d\'aide',
          action: 'help',
          hasArrow: true,
        },
        {
          icon: 'chatbubble-outline' as const,
          label: 'Nous contacter',
          action: 'contact',
          hasArrow: true,
        },
        {
          icon: 'star-outline' as const,
          label: 'Noter l\'application',
          action: 'rate',
          hasArrow: true,
        },
      ],
    },
    {
      title: 'Légal',
      items: [
        {
          icon: 'document-text-outline' as const,
          label: 'Conditions d\'utilisation',
          action: 'terms',
          hasArrow: true,
        },
        {
          icon: 'shield-outline' as const,
          label: 'Politique de confidentialité',
          action: 'privacy',
          hasArrow: true,
        },
      ],
    },
  ];

  const renderMenuItem = (item: any, sectionIndex: number, itemIndex: number) => (
    <TouchableOpacity
      key={`${sectionIndex}-${itemIndex}`}
      style={styles.menuItem}
      onPress={() => console.log(`Action: ${item.action}`)}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon} size={20} color={theme.colors.secondary[600]} />
        </View>
        <Text style={styles.menuItemText}>{item.label}</Text>
      </View>
      
      <View style={styles.menuItemRight}>
        {item.value && (
          <Text style={styles.menuItemValue}>{item.value}</Text>
        )}
        {item.hasSwitch && (
          <View style={styles.switch}>
            <View style={styles.switchThumb} />
          </View>
        )}
        {item.hasArrow && (
          <Ionicons name="chevron-forward" size={16} color={theme.colors.secondary[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.memberSince}>{user.memberSince}</Text>
            </View>
            
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => 
                renderMenuItem(item, sectionIndex, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error[600]} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
    ...theme.shadows.sm,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.secondary[600],
    borderRadius: theme.borderRadius.full,
    padding: 6,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    marginBottom: 2,
  },
  memberSince: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  menuCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.medium,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    marginRight: theme.spacing.sm,
  },
  switch: {
    width: 40,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary[200],
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: theme.spacing.sm,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    alignSelf: 'flex-start',
    ...theme.shadows.sm,
  },
  logoutSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.error[100],
    ...theme.shadows.sm,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.error[600],
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  versionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[400],
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
