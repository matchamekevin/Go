import apiClient from './apiClient';

export const ReportService = {
  async getReports(params: { period: string; type: string }) {
    const response = await apiClient.get<any>('/admin/reports/period', { params });
    return response.data;
  },
};
