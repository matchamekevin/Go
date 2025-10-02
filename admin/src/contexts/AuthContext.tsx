import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { LoginRequest, User } from '../types/api';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const storedToken = AuthService.getStoredToken();
      const storedUser = AuthService.getStoredUser();

      if (storedToken && storedUser) {
        // Validation basique des données utilisateur
        const isValidUser = storedUser.id && storedUser.email && storedUser.name;

        if (isValidUser) {
          setToken(storedToken);
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            role: storedUser.role || 'user',
            phone: storedUser.phone || '',
            is_verified: storedUser.is_verified ?? true,
            created_at: storedUser.created_at || '',
            updated_at: storedUser.updated_at || '',
          });
        } else {
          // Données invalides, nettoyer le stockage
          AuthService.clearStoredData();
          toast.error('Données utilisateur invalides, veuillez vous reconnecter.');
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors de la vérification de l\'authentification:', error);

      // En cas d'erreur de token expiré, nettoyer et afficher un message
      if (error.message.includes('Token') || error.message.includes('auth')) {
        AuthService.clearStoredData();
        setToken(null);
        setUser(null);
        toast.error('Session expirée, veuillez vous reconnecter.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        // Stocker les données d'authentification
        AuthService.setAuthData(newToken, newUser);
        // Mettre à jour l'état
        setToken(newToken);
        setUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          phone: '',
          is_verified: true,
          created_at: '',
          updated_at: '',
        });
        toast.success(`Bienvenue, ${newUser.name}!`);
      } else {
        throw new Error('Réponse d\'authentification invalide');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setToken(null);
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on nettoie localement
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // En développement, retourner un contexte par défaut pour éviter les erreurs HMR
    if (import.meta.env.DEV) {
      console.warn('useAuth utilisé en dehors d\'un AuthProvider - contexte par défaut utilisé');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        login: async () => {},
        logout: async () => {},
        checkAuth: async () => {},
      };
    }
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
