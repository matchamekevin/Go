import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketService } from '../services/ticketService';
import { TicketProduct, Route } from '../types/api';
import { toast } from 'react-hot-toast';

// Query keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params?: any) => [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (code: string) => [...ticketKeys.details(), code] as const,
  userTickets: (userId: number) => [...ticketKeys.all, 'user', userId] as const,
  stats: () => [...ticketKeys.all, 'stats'] as const,
  products: () => [...ticketKeys.all, 'products'] as const,
  routes: () => [...ticketKeys.all, 'routes'] as const,
  routesByCategory: (category: string) => [...ticketKeys.routes(), category] as const,
};

// Hooks pour les tickets
export const useTickets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  user_id?: number;
  product_code?: string;
}) => {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => TicketService.getTickets(params),
    keepPreviousData: true,
  });
};

export const useTicket = (code: string) => {
  return useQuery({
    queryKey: ticketKeys.detail(code),
    queryFn: () => TicketService.getTicketByCode(code),
    enabled: !!code,
  });
};

export const useUserTickets = (userId: number) => {
  return useQuery({
    queryKey: ticketKeys.userTickets(userId),
    queryFn: () => TicketService.getUserTickets(userId),
    enabled: !!userId,
  });
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: () => TicketService.getTicketStats(),
  });
};

// Hooks pour les produits
export const useTicketProducts = () => {
  return useQuery({
    queryKey: ticketKeys.products(),
    queryFn: () => TicketService.getProducts(),
  });
};

// Hooks pour les routes
export const useRoutes = () => {
  return useQuery({
    queryKey: ticketKeys.routes(),
    queryFn: () => TicketService.getRoutes(),
  });
};

export const useRoutesByCategory = (category: string) => {
  return useQuery({
    queryKey: ticketKeys.routesByCategory(category),
    queryFn: () => TicketService.getRoutesByCategory(category),
    enabled: !!category,
  });
};

// Mutations
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      TicketService.updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      toast.success('Statut du ticket mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TicketProduct, 'id' | 'created_at' | 'updated_at'>) =>
      TicketService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.products() });
      toast.success('Produit créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TicketProduct> }) =>
      TicketService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.products() });
      toast.success('Produit mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TicketService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.products() });
      toast.success('Produit supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Route, 'id' | 'created_at' | 'updated_at'>) =>
      TicketService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.routes() });
      toast.success('Route créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Route> }) =>
      TicketService.updateRoute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.routes() });
      toast.success('Route mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TicketService.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.routes() });
      toast.success('Route supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
};
