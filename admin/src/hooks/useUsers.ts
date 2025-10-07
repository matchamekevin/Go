import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/userService';
import { User } from '../types/api';
import { toast } from 'react-hot-toast';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: any) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

// Hooks pour les utilisateurs
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAllUsers(
      params?.page,
      params?.limit,
      params?.search,
      params?.role
    ),
    keepPreviousData: true,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(String(id)),
    enabled: !!id,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.getAllUsers(),
  });
};

// Mutations pour les utilisateurs
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  // Méthode updateUser non disponible dans le service, à implémenter si besoin
  return null;
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  // Méthode toggleUserStatus non disponible dans le service, à implémenter si besoin
  return null;
};
