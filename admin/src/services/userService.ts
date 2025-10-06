import apiClient from './apiClient.new';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  suspended: boolean;
  suspensionReason?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserService {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string
  ): Promise<UsersResponse> {
    try {
      const response = await apiClient.getAllUsers({
        page,
        limit,
        search,
        status,
      });
      return response;
    } catch (error: any) {
      console.error('Erreur récupération utilisateurs:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de chargement des utilisateurs'
      );
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.getUserById(userId);
      return response.user || response;
    } catch (error: any) {
      console.error('Erreur récupération utilisateur:', error);
      throw new Error(
        error.response?.data?.message || 'Utilisateur introuvable'
      );
    }
  }

  /**
   * Suspendre un utilisateur
   */
  async suspendUser(userId: string, reason?: string): Promise<void> {
    try {
      await apiClient.suspendUser(userId, reason);
    } catch (error: any) {
      console.error('Erreur suspension utilisateur:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de suspension'
      );
    }
  }

  /**
   * Réactiver un utilisateur
   */
  async unsuspendUser(userId: string): Promise<void> {
    try {
      await apiClient.unsuspendUser(userId);
    } catch (error: any) {
      console.error('Erreur réactivation utilisateur:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de réactivation'
      );
    }
  }

  /**
   * Formater le nom complet
   */
  getFullName(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email;
  }

  /**
   * Formater le statut
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      pending: 'En attente',
    };
    return labels[status] || status;
  }

  /**
   * Formater le rôle
   */
  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      user: 'Utilisateur',
      admin: 'Administrateur',
      super_admin: 'Super Admin',
      controller: 'Contrôleur',
    };
    return labels[role] || role;
  }

  /**
   * Formater la date
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default new UserService();
