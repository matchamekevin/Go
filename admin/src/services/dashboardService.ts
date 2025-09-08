import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface DashboardStats {
  users: {
    total_users: number;
    verified_users: number;
    new_users_month: number;
  };
  tickets: {
    total_tickets: number;
    used_tickets: number;
    tickets_month: number;
  };
  routes: {
    total_routes: number;
    active_routes: number;
  };
  revenue: {
    total_revenue: number;
    revenue_month: number;
  };
}

export interface ChartData {
  date: string;
  value: number;
}

export class DashboardService {
  static async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
  }

  static async getChartData(type: 'users' | 'tickets' | 'revenue', period: '7d' | '30d' | '90d' | '1y'): Promise<ApiResponse<ChartData[]>> {
    // Simule des données de graphique - peut être implémenté côté backend plus tard
    const mockData: ChartData[] = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const baseValue = type === 'revenue' ? 1000 : type === 'tickets' ? 50 : 20;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * baseValue) + baseValue / 2
      });
    }
    
    return Promise.resolve({ success: true, data: mockData });
  }

  static async getRecentActivity(): Promise<ApiResponse<Array<{
    id: number;
    user: string;
    action: string;
    time: string;
    amount?: string;
  }>>> {
    // Simule l'activité récente - peut être implémenté plus tard côté backend
    return Promise.resolve({
      success: true,
      data: [
        {
          id: 1,
          user: 'Kevin Matcha',
          action: 'Achat de ticket',
          time: 'Il y a 2 minutes',
          amount: '€2.50',
        },
        {
          id: 2,
          user: 'Marie Dubois',
          action: 'Inscription',
          time: 'Il y a 5 minutes',
        },
        {
          id: 3,
          user: 'Jean Martin',
          action: 'Utilisation ticket',
          time: 'Il y a 10 minutes',
        },
        {
          id: 4,
          user: 'Sophie Laurent',
          action: 'Achat de ticket',
          time: 'Il y a 15 minutes',
          amount: '€3.00',
        },
      ]
    });
  }

  static async getSystemHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'down';
    services: {
      database: { status: 'up' | 'down'; responseTime?: number };
      api: { status: 'up' | 'down'; responseTime?: number };
      external_services: { status: 'up' | 'down'; responseTime?: number };
    };
    uptime: number;
    version: string;
  }>> {
    return apiClient.get<ApiResponse<any>>('/health');
  }
}
