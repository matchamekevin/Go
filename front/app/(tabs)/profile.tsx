import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeMode } from '../../src/contexts/ThemeContext';
import { theme } from '../../src/styles/theme';
// @ts-ignore
import * as ExpoRouter from 'expo-router';
const useRouter = ExpoRouter.useRouter;
import HelpFAB from '../../src/components/HelpFAB';
import { apiClient } from '../../src/services/apiClient';

export default function ProfileTab() {
  const { user, logout, updateUserProfile, isLoading } = useAuth();
  const router = useRouter();
  
  // user state (editable) - initialisé avec les données de session
  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'Utilisateur',
    email: user?.email || '',
    phone: user?.phone || '',
    memberSince: 'Membre depuis ' + (user ? new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : ''),
    totalTrips: 0,
    favoriteRoute: 'Aucune route favorite',
  });

  // Synchroniser avec les données utilisateur quand elles changent
  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || 'Utilisateur',
        email: user.email || '',
        phone: user.phone || '',
      }));
      setEditedName(user.name || '');
      setEditedEmail(user.email || '');
      setEditedPhone(user.phone || '');
    }
  }, [user]);

  // UI state for modals/screens
  const [isEditAvatarModalOpen, setEditAvatarModalOpen] = useState(false);
  const [isPersonalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isContactOpen, setContactOpen] = useState(false);
  const [isLegalOpen, setLegalOpen] = useState<{ open: boolean; tab?: 'terms' | 'privacy' }>({ open: false });

  // preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('Français');
  const { mode, setMode, toggleMode } = useThemeMode();

  // handlers for avatar/name edit
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');
  const [contactMessage, setContactMessage] = useState('');

  const profileStats = [
    {
      icon: 'car' as const,
      label: 'Trajets',
      value: userProfile.totalTrips.toString(),
      color: theme.colors.primary[600],
    },
    {
      icon: 'star' as const,
      label: 'Points fidélité',
      value: '1,250',
      color: theme.colors.warning[600],
    },
  ];

  // build menu sections but remove addresses favorites and rate
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
      ],
    },
    {
      title: 'Préférences',
      items: [
        {
          icon: 'notifications-outline' as const,
          label: 'Notifications',
          action: 'notifications',
          hasSwitch: true,
        },
        {
          icon: 'language-outline' as const,
          label: 'Langue',
          action: 'language',
          value: language,
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

  const handleMenuAction = (action: string) => {
  console.log('Menu action tapped:', action);
  // (Alert de debug supprimé)
  switch (action) {
      case 'profile':
        setPersonalInfoOpen(true);
        break;
      case 'payment':
        Alert.alert('Moyens de paiement', 'Écran des moyens de paiement (à implémenter).');
        break;
      case 'notifications':
        setNotificationsEnabled(prev => {
          Alert.alert(
            prev ? 'Notifications désactivées' : 'Notifications activées',
            prev ? 'Vous ne recevrez plus de notifications.' : 'Vous recevrez les notifications importantes.'
          );
          return !prev;
        });
        break;
      case 'language':
        Alert.alert(
          'Choisir la langue',
          '',
          [
            { text: 'Français', onPress: () => setLanguage('Français') },
            { text: 'Anglais', onPress: () => setLanguage('Anglais') },
            { text: 'Español', onPress: () => setLanguage('Español') },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
        break;
      case 'theme':
        toggleMode();
        break;
      case 'help':
        setHelpOpen(true);
        break;
      case 'contact':
        setContactOpen(true);
        break;
      case 'terms':
        setLegalOpen({ open: true, tab: 'terms' });
        break;
      case 'privacy':
        setLegalOpen({ open: true, tab: 'privacy' });
        break;
      default:
        console.log('Unknown action', action);
    }
  };

  const renderMenuItem = (item: any, sectionIndex: number, itemIndex: number) => (
    <Pressable
      key={`${sectionIndex}-${itemIndex}`}
      style={({ pressed }) => [styles.menuItem, pressed ? { opacity: 0.8 } : null]}
      onPress={() => handleMenuAction(item.action)}
  onStartShouldSetResponder={() => true}
  onResponderRelease={() => handleMenuAction(item.action)}
  pointerEvents="auto"
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessible
      accessibilityLabel={item.label}
      importantForAccessibility="yes"
      focusable
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
          <Switch
            value={item.action === 'theme' ? mode === 'dark' : 
                   item.action === 'notifications' ? notificationsEnabled : false}
            onValueChange={(value) => {
              if (item.action === 'theme') {
                toggleMode();
              } else if (item.action === 'notifications') {
                setNotificationsEnabled(value);
                Alert.alert(
                  value ? 'Notifications activées' : 'Notifications désactivées',
                  value ? 'Vous recevrez les notifications importantes.' : 'Vous ne recevrez plus de notifications.'
                );
              }
            }}
            trackColor={{ false: theme.colors.secondary[200], true: theme.colors.primary[600] }}
            thumbColor={theme.colors.white}
          />
        )}
        {item.hasArrow && (
          <Pressable onPress={() => handleMenuAction(item.action)} hitSlop={8} accessibilityRole="button">
            <Ionicons name="chevron-forward" size={16} color={theme.colors.secondary[400]} />
          </Pressable>
        )}
      </View>
  </Pressable>
  );

  const saveEditedName = () => {
    setUserProfile(prev => ({ ...prev, name: editedName }));
    updateUserProfile({ name: editedName });
    setEditAvatarModalOpen(false);
  };

  const savePersonalInfo = async () => {
    try {
      setUserProfile(prev => ({ 
        ...prev, 
        name: editedName, 
        email: editedEmail, 
        phone: editedPhone 
      }));
      
      await updateUserProfile({ 
        name: editedName, 
        email: editedEmail, 
        phone: editedPhone 
      });
      
      setPersonalInfoOpen(false);
      Alert.alert('Succès', 'Informations mises à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour les informations');
    }
  };

  const handleSendContact = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Message vide', 'Veuillez écrire votre message avant d\'envoyer.');
      return;
    }

    const subject = 'Message depuis l\'app Go Transport';
    const body = `Message de: ${userProfile.name} (${userProfile.email})\n\n${contactMessage}`;

    try {
      // appeler l'API backend pour envoyer l'email
  await apiClient.post('/support/contact', { subject, body });
      Alert.alert('Message envoyé', `Votre message a été envoyé à l'équipe support. Nous vous répondrons bientôt.`);
      setContactMessage('');
      setContactOpen(false);
    } catch (error: any) {
      console.error('Erreur envoi message contact:', error);
      
      // Détecter robustement un 404 sur /support/contact via les métadonnées enrichies
      const isContactRoute404 = (
        error?.status === 404 && 
        error?.url && 
        String(error.url).includes('/support/contact')
      );
      
      if (isContactRoute404) {
        Alert.alert(
          'Service indisponible', 
          'Le service de contact n\'est pas encore disponible sur le serveur. Voulez-vous ouvrir votre application mail pour envoyer le message ?', 
          [
            { text: 'Annuler', style: 'cancel' },
            { text: "Ouvrir Mail", onPress: () => {
              const admin = 'matchamegnatikevin894@gmail.com';
              const mailto = `mailto:${admin}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              Linking.openURL(mailto).catch((e) => console.error('Erreur ouverture mailto', e));
            } }
          ]
        );
        return;
      }

      // Autres erreurs
      const msg = error?.message || 'Erreur réseau';
      Alert.alert('Erreur', `Impossible d'envoyer le message: ${msg}`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Se déconnecter', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès.');
              // retourner à l'écran login (remplace la stack pour éviter back)
              router.replace('/login');
            } catch (error) {
              console.error('Erreur de déconnexion:', error);
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          }
        }
      ]
    );
  };

  // Initiales pour l'avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(userProfile.name)}
                </Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <Text style={styles.memberSince}>{userProfile.memberSince}</Text>
            </View>
            
            <TouchableOpacity style={styles.editButton} onPress={() => setEditAvatarModalOpen(true)}>
              <Ionicons name="create-outline" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon} size={24} color={theme.colors.white} />
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
            <View style={styles.menuCard} pointerEvents="box-none">
              {section.items.map((item, itemIndex) => 
                renderMenuItem(item, sectionIndex, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error[600]} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Name Modal */}
        <Modal visible={isEditAvatarModalOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Modifier le nom</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nom"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButtonOutline} 
                  onPress={() => setEditAvatarModalOpen(false)}
                >
                  <Text style={styles.modalButtonTextOutline}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={saveEditedName}
                >
                  <Text style={styles.modalButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Personal Info Modal */}
        <Modal visible={isPersonalInfoOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardLarge}>
              <Text style={styles.modalTitle}>Informations personnelles</Text>
              <TextInput 
                style={styles.input} 
                value={editedName} 
                onChangeText={setEditedName} 
                placeholder="Nom" 
              />
              <TextInput 
                style={styles.input} 
                value={editedEmail} 
                onChangeText={setEditedEmail} 
                placeholder="Email" 
                keyboardType="email-address"
              />
              <TextInput 
                style={styles.input} 
                value={editedPhone} 
                onChangeText={setEditedPhone} 
                placeholder="Téléphone" 
                keyboardType="phone-pad"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButtonOutline} 
                  onPress={() => setPersonalInfoOpen(false)}
                >
                  <Text style={styles.modalButtonTextOutline}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={savePersonalInfo}
                >
                  <Text style={styles.modalButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Contact Modal */}
        <Modal visible={isContactOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardLarge}>
              <Text style={styles.modalTitle}>Nous contacter</Text>
              <Text style={styles.modalText}>
                Décrivez votre problème ou vos suggestions :
              </Text>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top', color: theme.colors.secondary[900], fontSize: theme.typography.fontSize.base }]} 
                value={contactMessage}
                onChangeText={setContactMessage}
                placeholder="Votre message..."
                placeholderTextColor={theme.colors.secondary[500]}
                multiline
                numberOfLines={6}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButtonOutline} 
                  onPress={() => setContactOpen(false)}
                >
                  <Text style={styles.modalButtonTextOutline}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleSendContact}
                >
                  <Text style={styles.modalButtonText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Help / FAQ Modal */}
        <Modal visible={isHelpOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardLarge}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Centre d'aide</Text>
                <TouchableOpacity onPress={() => setHelpOpen(false)}>
                  <Ionicons name="close" size={22} color={theme.colors.secondary[600]} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: theme.spacing.md }}>
                <Text style={styles.legalText}>
                  Ce que fait Go Transport{"\n\n"}
                  Go Transport vous aide à trouver et réserver des trajets inter-urbains et urbains depuis votre téléphone. Principales fonctionnalités :{"\n\n"}
                  • Recherche d'itinéraires et horaires en temps réel.{"\n"}
                  • Achat sécurisé de billets et gestion des réservations.{"\n"}
                  • Affichage et présentation du billet via QR code.{"\n"}
                  • Historique des voyages et suivi des points fidélité.{"\n"}
                  • Gestion de votre compte (profil, moyens de paiement, préférences).{"\n\n"}
                  FAQ et assistance rapide{"\n\n"}
                  Q : Comment réinitialiser mon mot de passe ?{"\n"}
                  R : Allez sur « Mot de passe oublié », saisissez votre email puis suivez le code reçu par email pour réinitialiser votre mot de passe.{"\n\n"}

                  Q : Comment acheter un billet ?{"\n"}
                  R : Recherchez votre trajet, sélectionnez l'horaire désiré, choisissez le nombre de passagers, puis procédez au paiement via les moyens proposés.{"\n\n"}

                  Q : Quels moyens de paiement sont acceptés ?{"\n"}
                  R : Les moyens disponibles sont listés dans « Moyens de paiement ». Les modes varient selon l'opérateur (carte, mobile money, etc.).{"\n\n"}

                  Q : Puis-je annuler ou me faire rembourser ?{"\n"}
                  R : Les politiques d'annulation et de remboursement dépendent de l'opérateur de transport. Contactez le support avec votre numéro de billet pour assistance.{"\n\n"}

                  Q : Comment contacter le support ?{"\n"}
                  R : Utilisez la section « Nous contacter » dans votre profil ou écrivez à notre équipe via l'adresse fournie ; décrivez votre problème et joignez les informations utiles (email, numéro de billet).{"\n\n"}

                  Pour toute question non couverte ici, envoyez-nous un message via le formulaire de contact — nous revenons généralement sous 48h.
                </Text>
              </ScrollView>

              <View style={{ marginTop: theme.spacing.md, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setHelpOpen(false)}>
                  <Text style={styles.modalButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* App Version */}
        {/* Legal Modal */}
        <Modal visible={isLegalOpen.open} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardLarge}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>{isLegalOpen.tab === 'privacy' ? 'Politique de confidentialité' : 'Conditions d\'utilisation'}</Text>
                <TouchableOpacity onPress={() => setLegalOpen({ open: false })}>
                  <Ionicons name="close" size={22} color={theme.colors.secondary[600]} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: theme.spacing.md }}>
                {isLegalOpen.tab === 'privacy' ? (
                  <Text style={styles.legalText}>
                    Politique de confidentialité{"\n\n"}
                    Nous recueillons et utilisons vos données personnelles uniquement pour fournir et améliorer nos services. Les informations collectées peuvent inclure votre nom, adresse e‑mail, numéro de téléphone et données de trajet. Nous ne partageons pas vos données avec des tiers à des fins commerciales sans votre consentement explicite. Vous pouvez demander la suppression ou l'accès à vos données en contactant notre support.
                    {"\n\n"}Cette politique s'applique à l'ensemble des fonctionnalités de l'application Go Transport. Pour toute question relative à la confidentialité, écrivez-nous via la section « Nous contacter ».
                  </Text>
                ) : (
                  <Text style={styles.legalText}>
                    Conditions d'utilisation{"\n\n"}
                    Bienvenue sur Go Transport. En utilisant cette application, vous acceptez nos conditions d'utilisation suivantes : utiliser le service conformément à la loi, fournir des informations exactes, et ne pas abuser des fonctionnalités (fraude, revente de billets, etc.). Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation.
                    {"\n\n"}Les informations fournies par l'application sont données à titre indicatif. Les horaires et tarifs peuvent être modifiés par les opérateurs. Nous déclinons toute responsabilité en cas d'erreurs ou de changements de dernière minute indépendants de notre volonté.
                  </Text>
                )}
              </ScrollView>

              <View style={{ marginTop: theme.spacing.md, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setLegalOpen({ open: false })}>
                  <Text style={styles.modalButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      <HelpFAB />
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
    backgroundColor: theme.colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarText: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    marginBottom: 2,
    opacity: 0.9,
  },
  memberSince: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.8,
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
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  zIndex: 1,
  position: 'relative',
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
  zIndex: 1,
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
  /* Modals & inputs */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalCardLarge: {
    width: '100%',
    maxWidth: 680,
    height: '85%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
  },
  modalText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[700],
    lineHeight: 24,
    letterSpacing: 0.3,
    marginBottom: theme.spacing.md,
  },
  legalText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[700],
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.secondary[900],
    fontSize: theme.typography.fontSize.base,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary[200],
    paddingTop: theme.spacing.md,
  },
  modalButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginLeft: theme.spacing.sm,
  },
  modalButtonOutline: {
    backgroundColor: theme.colors.secondary[100],
    borderWidth: 1,
    borderColor: theme.colors.secondary[400],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  modalButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  modalButtonTextOutline: {
    color: theme.colors.secondary[800],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
