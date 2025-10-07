import apiClient from './apiClient';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

class AuthService {
  /**
   * Connexion administrateur
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.login(email, password);
      console.log('Login response:', response);
      // L'API retourne { success, data: { token, user } }
      const { token, user } = response.data;
      // Vérifier que l'utilisateur a le rôle admin
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        throw new Error('Accès refusé : droits administrateur requis');
      }

      // Sauvegarder le token et les infos user
      localStorage.setItem('admin_auth_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));

      return { token, user };
    } catch (error: any) {
      console.error('Erreur de connexion admin:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Erreur de connexion'
      );
    }
  }

  /**
   * Récupérer l'utilisateur courant
   */
  async getCurrentAdmin(): Promise<AdminUser> {
    try {
      const response = await apiClient.getCurrentUser();

      // Vérifier le rôle
      if (response.user.role !== 'admin' && response.user.role !== 'super_admin') {
        throw new Error('Accès refusé');
      }

      // Mettre à jour le localStorage
      localStorage.setItem('admin_user', JSON.stringify(response.user));

      return response.user;
    } catch (error: any) {
      console.error('Erreur récupération admin:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de récupération du profil'
      );
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_user');
  }

  /**
   * Vérifier si connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_auth_token');
    return !!token;
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    return localStorage.getItem('admin_auth_token');
  }

  /**
   * Récupérer l'admin depuis le localStorage
   */
  getCachedAdmin(): AdminUser | null {
    const adminStr = localStorage.getItem('admin_user');
    if (!adminStr) return null;

    try {
      return JSON.parse(adminStr);
    } catch {
      return null;
    }
  }
}

export default new AuthService();
