import apiClient from './apiClient';

export const ReportService = {
  async getReports(params: { period: string; type: string }) {
    // apiClient already returns response.data (the API envelope)
    const response = await apiClient.get<any>('/admin/reports/period', { params });
    return response; // { success, data }
  },
};
