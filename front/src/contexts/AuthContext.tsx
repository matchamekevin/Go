import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/authService";
import apiClient from "../services/api.client";
import * as UserService from "../services/UserService";
import type { User } from "../types/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { phone: string; password: string }) => Promise<void>;
  loginWithEmail: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
  register: (userData: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  getOTPFromAPI: (email: string) => Promise<string>; // Fonction temporaire
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = "user_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const saveUserSession = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      console.log("💾 Session utilisateur sauvegardée:", userData.email);
    } catch (error) {
      console.error("❌ Erreur sauvegarde session:", error);
    }
  };

  const clearUserSession = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      // remove token from api client storage and in-memory header
      try {
        await apiClient.removeToken();
      } catch (e) {
        console.warn("[AuthContext] apiClient.removeToken error:", e);
      }
      try {
        // clear in-memory header
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        apiClient.clearAuthHeader && apiClient.clearAuthHeader();
      } catch (e) {
        console.warn("[AuthContext] clearAuthHeader error:", e);
      }
      setUser(null);
      setIsAuthenticated(false);
      // Log stack to help identify who/what triggered the session clear
      const stack = new Error().stack;
      console.log("🗑️ Session utilisateur supprimée", { stack });
    } catch (error) {
      console.error("❌ Erreur suppression session:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await apiClient.getToken();
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log("🔐 Session restaurée pour:", userData.email);
          // Rafraîchir le profil depuis l'API en tâche de fond
          UserService.getProfile()
            .then((fresh: User) => {
              setUser(fresh);
              setIsAuthenticated(true);
              AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fresh));
              console.log(
                "🔄 Profil utilisateur rafraîchi depuis l’API:",
                fresh.email,
              );
            })
            .catch((e: unknown) => {
              console.warn("⚠️ Impossible de rafraîchir le profil:", e);
            });
        } catch (parseError) {
          console.error("❌ Erreur parsing user data:", parseError);
          await clearUserSession();
          await apiClient.removeToken();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("❌ Erreur vérification authentification:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer le profil utilisateur depuis l'API
  const fetchUserProfile = async () => {
    try {
      const profile = await UserService.getProfile(); // Récupère les vraies infos depuis l'API
      console.log("🔄 Profil récupéré depuis l'API:", profile);

      if (profile && typeof profile === "object") {
        setUser(profile);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        console.log("💾 Profil utilisateur sauvegardé");
      } else {
        console.warn("⚠️ Profil utilisateur invalide ou vide");
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("❌ Erreur récupération profil:", error);
      // Ne pas déconnecter l'utilisateur en cas d'erreur de réseau temporaire
      // Garder les données en cache si disponibles
    }
  };

  // Fonction de connexion avec gestion d'erreurs détaillée
  const login = async (credentials: { phone: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await fetch("https://go-j2rr.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // Récupérer les données de la réponse même en cas d'erreur
      const data = await response.json();
      console.log("DEBUG - Réponse API complète:", data);

      if (!response.ok) {
        // Gestion spécifique des erreurs selon le code de statut et le message
        const errorMessage =
          data?.message || data?.error || "Erreur de connexion";

        console.log("DEBUG - Code de statut:", response.status);
        console.log("DEBUG - Message d'erreur brut:", errorMessage);

        switch (response.status) {
          case 400:
          case 401:
            const lowerMsg = errorMessage.toLowerCase();

            // Messages spécifiques du backend d'abord (être plus permissif)
            if (
              lowerMsg.includes("mot de passe invalide") ||
              lowerMsg.includes("invalid password") ||
              lowerMsg.includes("mot de passe incorrect") ||
              (lowerMsg.includes("password") &&
                (lowerMsg.includes("invalide") ||
                  lowerMsg.includes("incorrect")))
            ) {
              console.log("DEBUG - Détecté: Erreur de mot de passe");
              throw new Error("Mot de passe incorrect");
            }
            if (
              lowerMsg.includes("utilisateur introuvable") ||
              lowerMsg.includes("user not found") ||
              lowerMsg.includes("compte introuvable") ||
              lowerMsg.includes("account not found")
            ) {
              console.log("DEBUG - Détecté: Utilisateur/compte introuvable");
              throw new Error("Compte introuvable avec ce numéro de téléphone");
            }
            if (
              lowerMsg.includes("compte non vérifié") ||
              lowerMsg.includes("account not verified") ||
              lowerMsg.includes("not verified")
            ) {
              console.log("DEBUG - Détecté: Compte non vérifié");
              throw new Error("Compte non vérifié");
            }
            if (
              lowerMsg.includes("compte suspendu") ||
              lowerMsg.includes("account suspended")
            ) {
              console.log("DEBUG - Détecté: Compte suspendu");
              throw new Error("Compte suspendu");
            }
            // Fallback générique
            console.log(
              "DEBUG - Aucun pattern détecté, utilisation du fallback",
            );
            throw new Error("Identifiants invalides");
          case 403:
            if (
              errorMessage.toLowerCase().includes("vérifié") ||
              errorMessage.toLowerCase().includes("verified") ||
              errorMessage.toLowerCase().includes("activation")
            ) {
              throw new Error("Compte non vérifié");
            }
            throw new Error("Accès refusé");
          case 404:
            throw new Error("Compte introuvable");
          case 429:
            throw new Error("Trop de tentatives. Veuillez réessayer plus tard");
          case 500:
            throw new Error("Erreur serveur. Veuillez réessayer");
          default:
            throw new Error(errorMessage);
        }
      }

      // Récupérer le token dans data.token
      const token = data?.data?.token;
      if (!token) {
        throw new Error("Token manquant dans la réponse de l'API");
      }

      // Utiliser apiClient pour stocker le token de façon cohérente
      await apiClient.setToken(token);
      await fetchUserProfile();
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Erreur login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion avec email (méthode alternative)
  const loginWithEmail = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const authData = await authService.login(credentials);

      if (!authData.success) {
        // Gestion d'erreurs plus spécifique pour loginWithEmail
        const errorMessage = authData.message || "Erreur de connexion";

        // Analyser le message d'erreur pour donner des détails plus précis
        if (
          errorMessage.toLowerCase().includes("mot de passe invalide") ||
          errorMessage.toLowerCase().includes("invalid password") ||
          errorMessage.toLowerCase().includes("mot de passe incorrect")
        ) {
          throw new Error("Mot de passe incorrect");
        }
        if (
          errorMessage.toLowerCase().includes("utilisateur introuvable") ||
          errorMessage.toLowerCase().includes("user not found")
        ) {
          throw new Error("Compte introuvable avec cet email");
        }
        if (
          errorMessage.toLowerCase().includes("compte non vérifié") ||
          errorMessage.toLowerCase().includes("account not verified")
        ) {
          throw new Error("Compte non vérifié");
        }
        if (
          errorMessage.toLowerCase().includes("compte suspendu") ||
          errorMessage.toLowerCase().includes("account suspended")
        ) {
          throw new Error("Compte suspendu");
        }

        throw new Error(errorMessage);
      }

      if (authData.user) {
        try {
          const fresh = await UserService.getProfile();
          await saveUserSession({ ...authData.user, ...fresh } as any);
        } catch (e) {
          await saveUserSession(authData.user as any);
        }
      }
    } catch (error: any) {
      const benignErrors = [
        "USER_NOT_FOUND",
        "INVALID_CREDENTIALS",
        "ACCOUNT_NOT_VERIFIED",
        "ACCOUNT_UNVERIFIED",
        "Compte non vérifié",
        "utilisateur introuvable",
        "Mot de passe incorrect",
        "Compte introuvable",
      ];
      const msg = error?.message || "";
      const match = benignErrors.some((e) => msg.includes(e));
      if (!match) {
        console.warn(
          "⚠️ Erreur inattendue lors de la connexion (session non effacée) :",
          msg,
        );
      } else {
        console.log(
          "ℹ️ Erreur de connexion non fatale, session conservée:",
          msg,
        );
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }) => {
    try {
      setIsLoading(true);
      // Pour l'inscription, on ne connecte pas automatiquement (vérification OTP nécessaire)
      await authService.register({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        phone: userData.phone || "",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      const result = await authService.verifyEmail(email, otp);
      if (!result.success) {
        throw new Error(result.message || "Erreur de vérification");
      }
      // Après vérification OTP, on peut connecter automatiquement
      // Pour l'instant, on demande à l'utilisateur de se connecter manuellement
    } catch (error) {
      // NE PAS déconnecter ni clear la session sur erreur OTP
      // Juste relancer l'erreur pour affichage dans le composant
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const result = await authService.resendOTP(email);
      if (!result.success) {
        throw new Error(result.message || "Erreur renvoi OTP");
      }
    } catch (error) {
      throw error;
    }
  };

  // Fonction temporaire pour récupérer l'OTP directement (solution de secours)
  const getOTPFromAPI = async (email: string) => {
    try {
      const response = await fetch(
        `https://go-j2rr.onrender.com/_test/latest-email-otp?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();
      if (data.success && data.data) {
        return data.data.otp;
      }
      throw new Error("OTP non trouvé");
    } catch (error) {
      throw new Error("Impossible de récupérer l'OTP");
    }
  };

  // Fonction pour mettre à jour le profil (nouvelle implémentation pour enregistrer les actions)
  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedProfile = await UserService.updateProfile(userData); // Envoie les changements à l'API

      // Vérifier que updatedProfile n'est pas undefined avant de l'utiliser
      if (updatedProfile) {
        setUser(updatedProfile); // Met à jour localement avec la réponse de l'API
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(updatedProfile),
        );
      } else {
        console.warn(
          "updateProfile a retourné undefined, conservation du profil actuel",
        );
      }
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      throw error; // Pour que profile.tsx gère l'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      await clearUserSession();
    } catch (error) {
      console.error("❌ Erreur déconnexion:", error);
      // Forcer la déconnexion locale même en cas d'erreur
      await clearUserSession();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithEmail,
    register,
    logout,
    refreshAuth,
    verifyOTP,
    resendOTP,
    getOTPFromAPI,
    updateUserProfile, // Ajouté
  };

  // Si le children n'est pas un élément React, on le met dans un fragment
  const safeChildren: React.ReactNode =
    typeof children === "string" || typeof children === "number" ? (
      <React.Fragment>{children}</React.Fragment>
    ) : (
      children
    );
  return (
    <AuthContext.Provider value={contextValue}>
      {safeChildren}
    </AuthContext.Provider>
  ) as React.ReactElement;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
