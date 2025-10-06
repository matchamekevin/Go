import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import apiClient from '../services/api.client';
import { UserService } from '../services/userService';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { phone: string; password: string }) => Promise<void>;
  loginWithEmail: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; name: string; password: string; phone?: string }) => Promise<void>;
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

const USER_STORAGE_KEY = 'user_session';

export function AuthProvider({ children }: AuthProviderProps) {
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
      console.log('💾 Session utilisateur sauvegardée:', userData.email);
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
    }
  };

  const clearUserSession = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      // remove token from api client storage and in-memory header
      try {
        await apiClient.removeToken();
      } catch (e) {
        console.warn('[AuthContext] apiClient.removeToken error:', e);
      }
      try {
        // clear in-memory header
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        apiClient.clearAuthHeader && apiClient.clearAuthHeader();
      } catch (e) {
        console.warn('[AuthContext] clearAuthHeader error:', e);
      }
      setUser(null);
      setIsAuthenticated(false);
      // Log stack to help identify who/what triggered the session clear
      const stack = new Error().stack;
      console.log('🗑️ Session utilisateur supprimée', { stack });
    } catch (error) {
      console.error('❌ Erreur suppression session:', error);
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
          console.log('🔐 Session restaurée pour:', userData.email);
          // Rafraîchir le profil depuis l'API en tâche de fond
          UserService.getProfile()
            .then(fresh => {
              setUser(fresh);
              setIsAuthenticated(true);
              // Mettre à jour le stockage local
              AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fresh));
              console.log('🔄 Profil utilisateur rafraîchi depuis l’API:', fresh.email);
            })
            .catch(e => {
              console.warn('⚠️ Impossible de rafraîchir le profil:', e);
            });
        } catch (parseError) {
          console.error('❌ Erreur parsing user data:', parseError);
          await clearUserSession();
          await apiClient.removeToken();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Erreur vérification authentification:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion avec téléphone (méthode principale)
  const login = async (credentials: { phone: string; password: string }) => {
    try {
      setIsLoading(true);
      const authData = await authService.loginWithPhone(credentials.phone, credentials.password);
      
      if (!authData.success) {
        throw new Error(authData.message || 'Erreur de connexion');
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
      // Erreurs connues qui ne doivent PAS nettoyer la session (erreurs de login normales)
      const benignErrors = [
        'USER_NOT_FOUND',
        'INVALID_CREDENTIALS',
        'ACCOUNT_NOT_VERIFIED',
        'ACCOUNT_UNVERIFIED',
        'Compte non vérifié',
        'utilisateur introuvable'
      ];
      const msg = error?.message || '';
      const match = benignErrors.some(e => msg.includes(e));
      if (!match) {
        console.warn('⚠️ Erreur inattendue lors de la connexion (session non effacée) :', msg);
      } else {
        console.log('ℹ️ Erreur de connexion non fatale, session conservée:', msg);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion avec email (méthode alternative)
  const loginWithEmail = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const authData = await authService.login(credentials);
      
      if (!authData.success) {
        throw new Error(authData.message || 'Erreur de connexion');
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
        'USER_NOT_FOUND',
        'INVALID_CREDENTIALS',
        'ACCOUNT_NOT_VERIFIED',
        'ACCOUNT_UNVERIFIED',
        'Compte non vérifié',
        'utilisateur introuvable'
      ];
      const msg = error?.message || '';
      const match = benignErrors.some(e => msg.includes(e));
      if (!match) {
        console.warn('⚠️ Erreur inattendue lors de la connexion (session non effacée) :', msg);
      } else {
        console.log('ℹ️ Erreur de connexion non fatale, session conservée:', msg);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; name: string; password: string; phone?: string }) => {
    try {
      setIsLoading(true);
      // Pour l'inscription, on ne connecte pas automatiquement (vérification OTP nécessaire)
      await authService.register({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        phone: userData.phone || ''
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
        throw new Error(result.message || 'Erreur de vérification');
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
        throw new Error(result.message || 'Erreur renvoi OTP');
      }
    } catch (error) {
      throw error;
    }
  };

  // Fonction temporaire pour récupérer l'OTP directement (solution de secours)
  const getOTPFromAPI = async (email: string) => {
    try {
      const response = await fetch(`https://go-j2rr.onrender.com/_test/latest-email-otp?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.success && data.data) {
        return data.data.otp;
      }
      throw new Error('OTP non trouvé');
    } catch (error) {
      throw new Error('Impossible de récupérer l\'OTP');
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      // Préparer payload API (limiter aux champs modifiables)
      const payload: any = {};
  if (userData.name !== undefined) payload.name = userData.name.trim();
  if (userData.phone !== undefined) payload.phone = userData.phone;
  if (userData.email !== undefined) payload.email = userData.email;

      let serverUser: User | null = null;
      try {
        serverUser = await UserService.updateProfile(payload);
      } catch (e) {
        console.error('Erreur mise à jour serveur, utilisation locale:', e);
      }

      const merged = { ...user, ...payload, ...(serverUser || {}) } as User;
      await saveUserSession(merged);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      await clearUserSession();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
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
    updateUserProfile,
  };

  // Si le children n'est pas un élément React, on le met dans un fragment
  const safeChildren: React.ReactNode = typeof children === 'string' || typeof children === 'number'
    ? <React.Fragment>{children}</React.Fragment>
    : children;
  return (
    <AuthContext.Provider value={contextValue}>
      {safeChildren}
    </AuthContext.Provider>
  ) as React.ReactElement;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
