import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_auth_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH ====================
  async login(email: string, password: string) {
    const response = await this.axiosInstance.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.axiosInstance.get('/api/auth/me');
    return response.data;
  }

  // ==================== DASHBOARD ====================
  async getDashboard() {
    const response = await this.axiosInstance.get('/api/admin/dashboard');
    return response.data;
  }

  // ==================== USERS MANAGEMENT ====================
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const response = await this.axiosInstance.get('/api/admin/users', { params });
    return response.data;
  }

  async getUserById(userId: string) {
    const response = await this.axiosInstance.get(`/api/admin/users/${userId}`);
    return response.data;
  }

  async suspendUser(userId: string, reason?: string) {
    const response = await this.axiosInstance.put(
      `/api/admin/users/${userId}/suspend`,
      { reason }
    );
    return response.data;
  }

  async unsuspendUser(userId: string) {
    const response = await this.axiosInstance.put(
      `/api/admin/users/${userId}/unsuspend`
    );
    return response.data;
  }

  // ==================== TICKETS MANAGEMENT ====================
  async getAllTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) {
    const response = await this.axiosInstance.get('/api/admin/tickets', { params });
    return response.data;
  }

  async deleteTicket(ticketId: string, reason?: string) {
    const response = await this.axiosInstance.delete(`/api/admin/tickets/${ticketId}`, {
      data: { reason },
    });
    return response.data;
  }

  async expireOldTickets() {
    const response = await this.axiosInstance.post('/api/admin/tickets/expire-old');
    return response.data;
  }

  async getTicketStats() {
    const response = await this.axiosInstance.get('/api/admin/tickets/stats');
    return response.data;
  }

  // ==================== PAYMENTS MANAGEMENT ====================
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.axiosInstance.get('/api/admin/payments', { params });
    return response.data;
  }

  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const response = await this.axiosInstance.get('/api/admin/reports/revenue', {
      params,
    });
    return response.data;
  }

  // ==================== SOTRAL LINES ====================
  async createLine(data: {
    name: string;
    number: string;
    color?: string;
    type?: string;
  }) {
    const response = await this.axiosInstance.post('/api/admin/sotral/lines', data);
    return response.data;
  }

  async updateLine(
    lineId: string,
    data: {
      name?: string;
      number?: string;
      color?: string;
      type?: string;
    }
  ) {
    const response = await this.axiosInstance.put(
      `/api/admin/sotral/lines/${lineId}`,
      data
    );
    return response.data;
  }

  async deleteLine(lineId: string) {
    const response = await this.axiosInstance.delete(`/api/admin/sotral/lines/${lineId}`);
    return response.data;
  }

  // ==================== SOTRAL STOPS ====================
  async createStop(data: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) {
    const response = await this.axiosInstance.post('/api/admin/sotral/stops', data);
    return response.data;
  }

  async updateStop(
    stopId: string,
    data: {
      name?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    }
  ) {
    const response = await this.axiosInstance.put(
      `/api/admin/sotral/stops/${stopId}`,
      data
    );
    return response.data;
  }

  async deleteStop(stopId: string) {
    const response = await this.axiosInstance.delete(`/api/admin/sotral/stops/${stopId}`);
    return response.data;
  }

  // ==================== SOTRAL LINE-STOPS ASSOCIATION ====================
  async addStopToLine(lineId: string, stopId: string, order?: number) {
    const response = await this.axiosInstance.post(
      `/api/admin/sotral/lines/${lineId}/stops`,
      { stopId, order }
    );
    return response.data;
  }

  async removeStopFromLine(lineId: string, stopId: string) {
    const response = await this.axiosInstance.delete(
      `/api/admin/sotral/lines/${lineId}/stops/${stopId}`
    );
    return response.data;
  }

  async reorderLineStops(lineId: string, stopIds: string[]) {
    const response = await this.axiosInstance.put(
      `/api/admin/sotral/lines/${lineId}/stops/reorder`,
      { stopIds }
    );
    return response.data;
  }

  // ==================== SOTRAL SCHEDULES ====================
  async createSchedule(data: {
    lineId: string;
    departureTime: string;
    arrivalTime: string;
    days?: string[];
  }) {
    const response = await this.axiosInstance.post('/api/admin/sotral/schedules', data);
    return response.data;
  }

  // ==================== SOTRAL VEHICLES ====================
  async createVehicle(data: {
    lineId: string;
    vehicleNumber: string;
    capacity?: number;
  }) {
    const response = await this.axiosInstance.post('/api/admin/sotral/vehicles', data);
    return response.data;
  }

  // ==================== SOTRAL IMPORT ====================
  async importSotralData(data: any) {
    const response = await this.axiosInstance.post('/api/admin/sotral/import', data);
    return response.data;
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck() {
    const response = await this.axiosInstance.get('/api/health');
    return response.data;
  }
}

export default new ApiClient();
