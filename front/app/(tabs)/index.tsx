import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import HelpFAB from "../../src/components/HelpFAB";
import React, { useState, useEffect } from "react";
import { theme } from "../../src/styles/theme";
import { useAuth } from "../../src/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import {
  RouteService,
  type PopularRoute,
} from "../../src/services/routeService";

export default function HomeTab() {
  const { user, refreshAuth } = useAuth();
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorPopularRoutes, setErrorPopularRoutes] = useState<string | null>(
    null,
  );

  // Charger les trajets populaires depuis l'API
  const loadPopularRoutes = async () => {
    try {
      setErrorPopularRoutes(null);
      setLoading(true);
      const routes = await RouteService.getPopularRoutes();
      console.log("Trajets populaires chargés:", routes);
      setPopularRoutes(routes);
    } catch (error) {
      console.error("Erreur lors du chargement des trajets populaires:", error);
      const msg =
        error && (error as any).message
          ? (error as any).message
          : String(error);
      setErrorPopularRoutes(msg);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir le profil utilisateur au montage
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        console.log("🔄 Rafraîchissement du profil utilisateur...");
        await refreshAuth();
      } catch (error) {
        console.warn("⚠️ Erreur lors du rafraîchissement du profil:", error);
      }
    };

    loadPopularRoutes();
    refreshProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("🔄 Rafraîchissement de la page d'accueil...");
      await Promise.all([loadPopularRoutes(), refreshAuth()]);
    } catch (error) {
      console.warn("⚠️ Erreur lors du rafraîchissement:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Acheter un billet",
      subtitle: "Ticket bus, metro",
      icon: "ticket" as const,
      color: theme.colors.primary[600],
      bgColor: theme.colors.primary[50],
    },
    {
      id: 3,
      title: "Mes trajets",
      subtitle: "Historique",
      icon: "time" as const,
      color: theme.colors.warning[600],
      bgColor: theme.colors.warning[50],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header avec gradient */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Bonjour</Text>
              <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="bus" size={24} color={theme.colors.white} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Section solde supprimée */}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => {
                  if (action.id === 1) {
                    // Navigue vers l'onglet Recherche et demande focus sur la barre
                    router.push({
                      pathname: "/(tabs)/search",
                      params: { focus: "true", focusTs: String(Date.now()) },
                    });
                  } else if (action.id === 3) {
                    // Navigue vers la page Historique dédiée
                    router.push("/(tabs)/history");
                  }
                }}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.bgColor },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>
                  {action.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trajets populaires</Text>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/search",
                  params: { scrollTo: "lignes-disponibles" },
                });
              }}
            >
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des trajets...</Text>
            </View>
          ) : (
            popularRoutes.slice(0, 3).map((route) => (
              <TouchableOpacity key={route.id} style={styles.routeCard}>
                <View style={styles.routeInfo}>
                  <View style={styles.routeHeader}>
                    <View style={styles.routePoints}>
                      <Text
                        style={styles.routeFrom}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {route.from}
                      </Text>
                      <View style={styles.routeArrow}>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={theme.colors.secondary[400]}
                        />
                      </View>
                      <Text
                        style={styles.routeTo}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {route.to}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <View style={styles.routeTag}>
                      <Text style={styles.routeTagText}>{route.type}</Text>
                    </View>
                    <Text style={styles.routeDuration}>{route.duration}</Text>
                    {/* <Text style={styles.routePrice}>{route.price}</Text> */}
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.secondary[300]}
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Supprimé : Modal Trajets populaires - Design moderne */}
        {/* <Modal
          visible={isVoirToutOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setVoirToutOpen(false)}
        >
          ... (tout le contenu du modal supprimé)
        </Modal> */}

        {/* Section activité récente supprimée */}

        <View style={styles.bottomSpacing} />
      </ScrollView>
      {/* Help FAB rendu en dehors du ScrollView pour rester fixe */}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  greeting: {},
  greetingText: {
    fontSize: theme.typography.fontSize.base,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: theme.typography.fontWeight.normal,
  },
  userName: {
    fontSize: theme.typography.fontSize["2xl"],
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  walletTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  walletAmount: {
    fontSize: theme.typography.fontSize["3xl"],
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  addMoneyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignSelf: "flex-start",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  quickActionTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  quickActionSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[500],
    textAlign: "center",
    marginTop: 2,
    flexShrink: 1,
    minWidth: 0,
  },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  routePoints: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  routeFrom: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    flexShrink: 1,
    maxWidth: "60%",
  },
  routeArrow: {
    marginHorizontal: theme.spacing.sm,
  },
  routeTo: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[900],
    fontWeight: theme.typography.fontWeight.semibold,
    flexShrink: 1,
    maxWidth: "60%",
  },
  routePrice: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.bold,
  },
  routeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
  loadingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.secondary[500],
    fontStyle: "italic",
  },
});
