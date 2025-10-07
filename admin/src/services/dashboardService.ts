import apiClient from './apiClient';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    newToday: number;
  };
  tickets: {
    total: number;
    active: number;
    used: number;
    expired: number;
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalRevenue: number;
    todayRevenue: number;
  };
  sotral: {
    totalLines: number;
    totalStops: number;
    activeVehicles: number;
  };
}

export interface RevenueData {
  date: string;
  revenue: number;
  count: number;
}

class DashboardService {
  /**
   * Récupérer toutes les statistiques du dashboard
   */
  async getDashboard(): Promise<DashboardStats> {
    try {
      const response = await apiClient.getDashboard();
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération dashboard:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de chargement du dashboard'
      );
    }
  }

  /**
   * Récupérer le rapport de revenus
   */
  // async getRevenueReport(
  //   startDate?: string,
  //   endDate?: string,
  //   groupBy: 'day' | 'week' | 'month' = 'day'
  // ): Promise<RevenueData[]> {
  //   try {
  //     const response = await apiClient.getRevenueReport({
  //       startDate,
  //       endDate,
  //       groupBy,
  //     });
  //     return response.data || response;
  //   } catch (error: any) {
  //     console.error('Erreur récupération revenus:', error);
  //     throw new Error(
  //       error.response?.data?.message || 'Erreur de chargement des revenus'
  //     );
  //   }
  // }

  /**
   * Formater les revenus
   */
  formatRevenue(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  }

  /**
   * Calculer le pourcentage de variation
   */
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Formater le pourcentage
   */
  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }
}

export default new DashboardService();
