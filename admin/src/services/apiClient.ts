import axios, { AxiosInstance, AxiosError } from 'axios';

// Define LoginCredentials type
export interface LoginCredentials {
  email: string;
  password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://go-j2rr.onrender.com';

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
    const response = await this.axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.axiosInstance.get('/auth/me');
    return response.data;
  }

  // ==================== DASHBOARD ====================
  async getDashboard() {
    const response = await this.axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  }

  // ==================== USERS MANAGEMENT ====================
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const response = await this.axiosInstance.get('/admin/users', { params });
    return response.data;
  }

  async getUserById(userId: string) {
    const response = await this.axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  }

  async suspendUser(userId: string, reason?: string) {
    const response = await this.axiosInstance.put(
      `/admin/users/${userId}/suspend`,
      { reason }
    );
    return response.data;
  }

  async unsuspendUser(userId: string) {
    const response = await this.axiosInstance.put(
      `/admin/users/${userId}/unsuspend`
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
    const response = await this.axiosInstance.get('/admin/tickets', { params });
    return response.data;
  }

  async deleteTicket(ticketId: string, reason?: string) {
    const response = await this.axiosInstance.delete(`/admin/tickets/${ticketId}`, {
      data: { reason },
    });
    return response.data;
  }

  async expireOldTickets() {
    const response = await this.axiosInstance.post('/admin/tickets/expire-old');
    return response.data;
  }

  async getTicketStats() {
    const response = await this.axiosInstance.get('/admin/tickets/stats');
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
    const response = await this.axiosInstance.get('/admin/payments', { params });
    return response.data;
  }

  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const response = await this.axiosInstance.get('/admin/reports', {
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
    const response = await this.axiosInstance.post('/admin/sotral/lines', data);
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
      `/admin/sotral/lines/${lineId}`,
      data
    );
    return response.data;
  }

  async deleteLine(lineId: string) {
    const response = await this.axiosInstance.delete(`/admin/sotral/lines/${lineId}`);
    return response.data;
  }

  // ==================== SOTRAL STOPS ====================
  async createStop(data: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) {
    const response = await this.axiosInstance.post('/admin/sotral/stops', data);
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
      `/admin/sotral/stops/${stopId}`,
      data
    );
    return response.data;
  }

  async deleteStop(stopId: string) {
    const response = await this.axiosInstance.delete(`/admin/sotral/stops/${stopId}`);
    return response.data;
  }

  // ==================== SOTRAL LINE-STOPS ASSOCIATION ====================
  async addStopToLine(lineId: string, stopId: string, order?: number) {
    const response = await this.axiosInstance.post(
      `/admin/sotral/lines/${lineId}/stops`,
      { stopId, order }
    );
    return response.data;
  }

  async removeStopFromLine(lineId: string, stopId: string) {
    const response = await this.axiosInstance.delete(
      `/admin/sotral/lines/${lineId}/stops/${stopId}`
    );
    return response.data;
  }

  async reorderLineStops(lineId: string, stopIds: string[]) {
    const response = await this.axiosInstance.put(
      `/admin/sotral/lines/${lineId}/stops/reorder`,
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
    const response = await this.axiosInstance.post('/admin/sotral/schedules', data);
    return response.data;
  }

  // ==================== SOTRAL VEHICLES ====================
  async createVehicle(data: {
    lineId: string;
    vehicleNumber: string;
    capacity?: number;
  }) {
    const response = await this.axiosInstance.post('/admin/sotral/vehicles', data);
    return response.data;
  }

  // ==================== SOTRAL IMPORT ====================
  async importSotralData(data: any) {
    const response = await this.axiosInstance.post('/admin/sotral/import', data);
    return response.data;
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck() {
    const response = await this.axiosInstance.get('/health');
    return response.data;
  }

  // ==================== GENERIC METHODS ====================
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }
}

export default new ApiClient();
