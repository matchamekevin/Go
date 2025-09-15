import { apiClient } from './apiClient';
import type { ApiResponse, User } from '../types/api';

interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  email?: string;
}

export const UserService = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<ApiResponse<any>>('/users/profile');
    if (!res.success) throw new Error(res.error || 'Erreur récupération profil');
    const data = res.data;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      is_verified: data.isVerified,
      created_at: '',
      updated_at: ''
    } as User;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.put<ApiResponse<any>>('/users/profile', payload);
    if (!res.success) throw new Error(res.error || 'Erreur mise à jour profil');
    const data = res.data;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      is_verified: data.isVerified,
      created_at: '',
      updated_at: ''
    } as User;
  }
};
