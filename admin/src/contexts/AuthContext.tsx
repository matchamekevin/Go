import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { LoginRequest, User } from '../types/api';
import { toast } from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import { AxiosError } from 'axios';

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
  // DEBUG: Affiche le contenu du localStorage à chaque refresh
  console.log('DEBUG localStorage admin_token:', localStorage.getItem('admin_token'));
  console.log('DEBUG localStorage admin_user:', localStorage.getItem('admin_user'));
    try {
      const storedToken = AuthService.getStoredToken();
      const storedUser = AuthService.getStoredUser();
      
      if (storedToken && storedUser) {
        // Valider de manière tolérante : l'id peut être un string (ex: 'admin') ou un number
        const idValid = typeof storedUser.id === 'number' || typeof storedUser.id === 'string';
        const emailValid = typeof storedUser.email === 'string';
        const nameValid = typeof storedUser.name === 'string';

        if (idValid && emailValid && nameValid) {
          setToken(storedToken);
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            role: typeof storedUser.role === 'string' ? storedUser.role : 'user',
            phone: storedUser.phone ?? '',
            is_verified: storedUser.is_verified ?? true,
            created_at: storedUser.created_at ?? '',
            updated_at: storedUser.updated_at ?? '',
          });
          // Vérification backend désactivée pour debug : la session reste active tant que le token et le user sont présents
        } else {
          // Si les données sont invalides, ne déconnecte pas, affiche juste un toast
          toast.error('Données utilisateur invalides, veuillez vous reconnecter.');
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      // Ne pas déconnecter automatiquement, juste afficher un toast si le token est expiré
      if (
        (error instanceof AxiosError && error.response?.status === 401) ||
        error.message === 'Données utilisateur invalides' ||
        error.message === 'Token invalide'
      ) {
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
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
