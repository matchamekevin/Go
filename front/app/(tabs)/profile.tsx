import React, { useState } from 'react';
import { useThemeMode } from '../../src/contexts/ThemeContext';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';

export default function ProfileTab() {
  // user state (editable)
  const [user, setUser] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+225 07 12 34 56 78',
    memberSince: 'Membre depuis Mars 2024',
    totalTrips: 127,
    favoriteRoute: 'Centre-ville → Université',
  });

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

  const profileStats = [
    {
      icon: 'car' as const,
      label: 'Trajets',
      value: user.totalTrips.toString(),
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
    <TouchableOpacity
      key={`${sectionIndex}-${itemIndex}`}
      style={styles.menuItem}
      onPress={() => handleMenuAction(item.action)}
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
          <Ionicons name="chevron-forward" size={16} color={theme.colors.secondary[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  // handlers for avatar/name edit
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedPhone, setEditedPhone] = useState(user.phone);
  const [contactMessage, setContactMessage] = useState('');
  const saveEditedName = () => {
    setUser(prev => ({ ...prev, name: editedName }));
    setEditAvatarModalOpen(false);
  };

  const savePersonalInfo = () => {
    setUser(prev => ({ ...prev, name: editedName, email: editedEmail, phone: editedPhone }));
    setPersonalInfoOpen(false);
  };

  const handleSendContact = () => {
    if (!contactMessage.trim()) {
      Alert.alert('Message vide', 'Veuillez écrire votre message avant d\'envoyer.');
      return;
    }
    
    // Simuler l'envoi du message vers l'admin
    const adminEmail = 'matchamegnatikevin894@gmail.com';
    const subject = 'Message depuis l\'app Go Transport';
    const body = `Message de: ${user.name} (${user.email})\n\n${contactMessage}`;
    
    console.log(`Envoi email vers: ${adminEmail}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Corps: ${body}`);
    
    Alert.alert('Message envoyé', `Votre message a été envoyé à l'équipe support. Nous vous répondrons bientôt.`);
    setContactMessage('');
    setContactOpen(false);
  };

  const languageOptions = ['Français', 'Anglais', 'Español'];
  const selectLanguage = (lang: string) => {
    setLanguage(lang);
  };

  const signOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Se déconnecter', 
          style: 'destructive',
          onPress: () => {
            // Ici vous pouvez ajouter la logique de déconnexion réelle
            // Par exemple: AsyncStorage.removeItem('userToken')
            console.log('User logged out');
            Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès.');
          }
        }
      ]
    );
  };

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
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.memberSince}>{user.memberSince}</Text>
            </View>
            
            <TouchableOpacity style={styles.editButton} onPress={() => setEditAvatarModalOpen(true)}>
              <Ionicons name="create-outline" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}> 
                  <Ionicons name={stat.icon} size={20} color={theme.colors.white} />
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
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error[600]} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
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
                <TouchableOpacity onPress={() => setEditAvatarModalOpen(false)} style={styles.modalButtonOutline}>
                  <Text style={[styles.modalButtonText, { color: theme.colors.secondary[700] }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEditedName} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isPersonalInfoOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardLarge}>
              <Text style={styles.modalTitle}>Informations personnelles</Text>
              <TextInput style={styles.input} value={editedName} onChangeText={setEditedName} placeholder="Nom" />
              <TextInput style={styles.input} value={editedEmail} onChangeText={setEditedEmail} placeholder="Email" />
              <TextInput style={styles.input} value={editedPhone} onChangeText={setEditedPhone} placeholder="Téléphone" />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setPersonalInfoOpen(false)} style={styles.modalButtonOutline}>
                  <Text style={[styles.modalButtonText, { color: theme.colors.secondary[700] }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={savePersonalInfo} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isHelpOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardLarge, { padding: 0, backgroundColor: theme.colors.white }]}>
              <View style={{ padding: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.secondary[200] }}>
                <Text style={[styles.modalTitle, { marginBottom: 0, paddingVertical: 0, borderBottomWidth: 0 }]}>
                  Centre d'aide
                </Text>
              </View>
              <ScrollView 
                style={{ 
                  flex: 1, 
                  backgroundColor: theme.colors.secondary[50], 
                  margin: theme.spacing.lg,
                  borderRadius: theme.borderRadius.xl,
                  borderWidth: 1,
                  borderColor: theme.colors.secondary[200]
                }}
                contentContainerStyle={{ padding: theme.spacing.xl }}
              >
                <Text style={[styles.modalText, { lineHeight: 24 }]}>
                  Bienvenue dans le centre d'aide. Retrouvez ici les réponses aux questions fréquentes et des conseils pour utiliser l'application Go Transport.
                  {'\n\n'}- Comment réserver un trajet ?
                  {'\n'}- Comment modifier mes informations ?
                  {'\n'}- Comment contacter le support ?
                  {'\n\n'}Pour toute autre question, contactez-nous via la section "Nous contacter".
                </Text>
              </ScrollView>
              <View style={[styles.modalActions, { 
                backgroundColor: theme.colors.white, 
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.secondary[200],
                marginTop: 0
              }]}>
                <TouchableOpacity
                  onPress={() => setHelpOpen(false)}
                  style={[styles.modalButton, {
                    backgroundColor: theme.colors.primary[600],
                    paddingVertical: theme.spacing.md,
                    width: '100%',
                    alignItems: 'center',
                    marginLeft: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    ...theme.shadows.sm
                  }]}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalButtonText, { 
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.lg
                  }]}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isContactOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardLarge, { padding: 0, backgroundColor: theme.colors.white }]}>
              <View style={{ padding: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.secondary[200] }}>
                <Text style={[styles.modalTitle, { marginBottom: 0, paddingVertical: 0, borderBottomWidth: 0 }]}>
                  Nous contacter
                </Text>
              </View>
              <ScrollView 
                style={{ 
                  flex: 1, 
                  backgroundColor: theme.colors.secondary[50], 
                  margin: theme.spacing.lg,
                  borderRadius: theme.borderRadius.xl,
                  borderWidth: 1,
                  borderColor: theme.colors.secondary[200]
                }}
                contentContainerStyle={{ padding: theme.spacing.xl }}
              >
                <Text style={[styles.modalText, { marginBottom: theme.spacing.lg }]}>
                  Notre équipe support est là pour vous aider. Décrivez votre problème ou votre question ci-dessous :
                </Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.colors.white,
                    minHeight: 120,
                    textAlignVertical: 'top',
                    ...theme.shadows.sm
                  }]}
                  multiline
                  numberOfLines={6}
                  value={contactMessage}
                  onChangeText={setContactMessage}
                  placeholder="Écrivez votre message ici..."
                  placeholderTextColor={theme.colors.secondary[500]}
                />
                <View style={{ flexDirection: 'row', marginTop: theme.spacing.md }}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.secondary[600]} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalText, { fontSize: theme.typography.fontSize.sm, flex: 1 }]}>
                    Notre équipe support vous répondra dans les plus brefs délais à partir de : matchamegnatikevin894@gmail.com
                  </Text>
                </View>
              </ScrollView>
              <View style={[styles.modalActions, { 
                backgroundColor: theme.colors.white, 
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.secondary[200],
                marginTop: 0
              }]}>
                <TouchableOpacity
                  onPress={() => setContactOpen(false)}
                  style={[styles.modalButtonOutline, {
                    flex: 1,
                    marginRight: theme.spacing.sm,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }]}
                >
                  <Text style={[styles.modalButtonText, { 
                    color: theme.colors.secondary[700],
                    fontSize: theme.typography.fontSize.lg
                  }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSendContact}
                  style={[styles.modalButton, {
                    flex: 1,
                    backgroundColor: theme.colors.primary[600],
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...theme.shadows.sm
                  }]}
                >
                  <Ionicons name="send" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalButtonText, { 
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.lg
                  }]}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isLegalOpen.open} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardLarge, { padding: 0, backgroundColor: theme.colors.white }]}> 
              <View style={{ padding: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.secondary[200] }}>
                <Text style={[styles.modalTitle, { marginBottom: 0, paddingVertical: 0, borderBottomWidth: 0 }]}>
                  {isLegalOpen.tab === 'terms' ? "Conditions d'utilisation" : 'Politique de confidentialité'}
                </Text>
              </View>
              <ScrollView 
                style={{ 
                  flex: 1, 
                  backgroundColor: theme.colors.secondary[50], 
                  margin: theme.spacing.lg,
                  borderRadius: theme.borderRadius.xl,
                  borderWidth: 1,
                  borderColor: theme.colors.secondary[200]
                }} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ padding: theme.spacing.xl }}
              >
                <Text style={[styles.modalText, { lineHeight: 24 }]}> 
                  {isLegalOpen.tab === 'terms'
                    ? `CONDITIONS GÉNÉRALES D'UTILISATION\n\nGo Transport App\n\n1. ACCEPTATION DES CONDITIONS\n\nEn téléchargeant, installant et utilisant l'application Go Transport, vous acceptez d'être lié par les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.\n\n2. DESCRIPTION DU SERVICE\n\nGo Transport est une application mobile qui permet la réservation et l'achat de billets de transport en commun (bus, métro, train) en Côte d'Ivoire. L'application facilite la planification de trajets et le paiement dématérialisé.\n\n3. INSCRIPTION ET COMPTE UTILISATEUR\n\n• Vous devez fournir des informations exactes et complètes lors de l'inscription\n• Vous êtes responsable de la confidentialité de vos identifiants\n• Un seul compte par personne est autorisé\n• Vous devez avoir au moins 16 ans pour utiliser l'application\n\n4. UTILISATION DU SERVICE\n\n• L'application est destinée à un usage personnel et non commercial\n• Il est interdit de revendre les billets achetés via l'application\n• Vous devez présenter votre billet (QR code) lors du contrôle\n• Les billets sont nominatifs et non transférables\n\n5. PAIEMENTS ET REMBOURSEMENTS\n\n• Les paiements sont sécurisés et traités par nos partenaires certifiés\n• Les remboursements sont possibles selon les conditions de chaque transporteur\n• Les annulations doivent être effectuées au moins 2h avant le départ\n\n6. RESPONSABILITÉ\n\nGo Transport agit comme intermédiaire entre les utilisateurs et les compagnies de transport. Nous ne sommes pas responsables des retards, annulations ou incidents survenus pendant le voyage.\n\n7. PROPRIÉTÉ INTELLECTUELLE\n\nTous les éléments de l'application (design, logos, textes, images) sont protégés par les droits de propriété intellectuelle et appartiennent à Go Transport.\n\n8. MODIFICATIONS\n\nCes conditions peuvent être modifiées à tout moment. Les utilisateurs seront informés des changements importants par notification dans l'application.\n\n9. RÉSILIATION\n\nVous pouvez supprimer votre compte à tout moment. Nous nous réservons le droit de suspendre ou supprimer les comptes en cas de violation de ces conditions.\n\n10. CONTACT\n\nPour toute question concernant ces conditions, contactez-nous à : matchamegnatikevin894@gmail.com\n\nDernière mise à jour : 9 septembre 2025`
                    : `POLITIQUE DE CONFIDENTIALITÉ\n\nGo Transport App\n\n1. COLLECTE DES DONNÉES\n\nNous collectons les informations suivantes :\n• Informations d'identification : nom, prénom, email, téléphone\n• Données de localisation : pour proposer les trajets pertinents\n• Historique des voyages : pour améliorer votre expérience\n• Données de paiement : traitées de manière sécurisée par nos partenaires\n• Données techniques : type d'appareil, version de l'app, logs d'utilisation\n\n2. UTILISATION DES DONNÉES\n\nVos données personnelles sont utilisées pour :\n• Fournir et améliorer nos services de transport\n• Traiter vos réservations et paiements\n• Vous envoyer des notifications importantes\n• Assurer la sécurité et prévenir la fraude\n• Analyser l'utilisation pour améliorer l'application\n• Vous proposer des offres personnalisées (avec votre consentement)\n\n3. PARTAGE DES DONNÉES\n\nNous ne vendons jamais vos données personnelles. Nous pouvons les partager uniquement avec :\n• Les compagnies de transport pour honorer vos réservations\n• Nos prestataires de paiement sécurisé\n• Les autorités si requis par la loi\n• Nos partenaires techniques (avec anonymisation des données)\n\n4. STOCKAGE ET SÉCURITÉ\n\n• Vos données sont stockées sur des serveurs sécurisés\n• Nous utilisons le chiffrement SSL/TLS pour toutes les transmissions\n• L'accès aux données est strictement contrôlé et audité\n• Les données de paiement ne sont jamais stockées sur nos serveurs\n• Nous conservons vos données pendant 3 ans après la dernière utilisation\n\n5. VOS DROITS\n\nConformément au RGPD et aux lois locales, vous avez le droit de :\n• Accéder à vos données personnelles\n• Corriger des informations inexactes\n• Supprimer votre compte et vos données\n• Limiter le traitement de vos données\n• Récupérer vos données dans un format portable\n• Retirer votre consentement à tout moment\n\n6. COOKIES ET TECHNOLOGIES SIMILAIRES\n\nL'application utilise des technologies de suivi pour améliorer votre expérience. Vous pouvez gérer ces préférences dans les paramètres de votre appareil.\n\n7. TRANSFERTS INTERNATIONAUX\n\nVos données peuvent être traitées dans d'autres pays où opèrent nos prestataires, toujours avec un niveau de protection équivalent.\n\n8. MODIFICATIONS DE LA POLITIQUE\n\nNous vous informerons de toute modification importante de cette politique par notification dans l'application.\n\n9. CONTACT\n\nPour exercer vos droits ou pour toute question sur cette politique :\nEmail : matchamegnatikevin894@gmail.com\nDélégué à la protection des données : dpo@gotransport.ci\n\nDernière mise à jour : 9 septembre 2025`}
                </Text>
              </ScrollView>
              <View style={[styles.modalActions, { 
                backgroundColor: theme.colors.white, 
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.secondary[200],
                marginTop: 0
              }]}>
                <TouchableOpacity
                  onPress={() => setLegalOpen({ open: false })}
                  style={[styles.modalButton, {
                    backgroundColor: theme.colors.primary[600],
                    paddingVertical: theme.spacing.md,
                    width: '100%',
                    alignItems: 'center',
                    marginLeft: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    ...theme.shadows.sm
                  }]}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalButtonText, { 
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.lg
                  }]}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* App Version */}
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
    borderWidth: 3,
    borderColor: theme.colors.white,
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
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    marginBottom: 2,
  },
  memberSince: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
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
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  preferenceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[800],
  },
  languageOption: {
    paddingVertical: theme.spacing.sm,
  },
  languageText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[700],
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
