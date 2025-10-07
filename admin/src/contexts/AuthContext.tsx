import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginRequest, User } from '../types/api';
import { toast } from 'react-hot-toast';
import AuthService from '../services/authService';
// import { authService } from '@/services';

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
      const storedToken = AuthService.getToken();
      const storedUser = AuthService.getCachedAdmin();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser({
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.firstName || storedUser.email,
          role: storedUser.role || 'admin',
          phone: '',
          is_verified: true,
          created_at: storedUser.createdAt || '',
          updated_at: '',
        });
      } else {
        AuthService.logout();
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      AuthService.logout();
      setToken(null);
      setUser(null);
      toast.error('Session expirée, veuillez vous reconnecter.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials.email, credentials.password);
      // Stockage déjà fait dans le service
      setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.firstName || response.user.email,
        role: response.user.role || 'admin',
        phone: '',
        is_verified: true,
        created_at: response.user.createdAt || '',
        updated_at: '',
      });
      toast.success(`Bienvenue, ${response.user.firstName || response.user.email}!`);
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
      AuthService.logout();
      setToken(null);
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
