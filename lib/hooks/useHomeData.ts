import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

// Types for home screen data
export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'campaign_created' | 'order_received' | 'payment_completed' | 'invoice_generated';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'expired' | 'cancelled';
  rebate_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string | null;
  updated_at: string | null;
}

// Query keys
export const homeQueryKeys = {
  all: ['home'] as const,
  stats: () => [...homeQueryKeys.all, 'stats'] as const,
  recentActivity: () => [...homeQueryKeys.all, 'recent-activity'] as const,
  activeCampaigns: () => [...homeQueryKeys.all, 'active-campaigns'] as const,
  notifications: () => [...homeQueryKeys.all, 'notifications'] as const,
};

// Dashboard stats hook
export function useDashboardStats() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: homeQueryKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('User not authenticated');

      // Simulate API call - replace with actual Supabase queries
      const [campaignsResult, ordersResult, revenueResult] = await Promise.all([
        supabase
          .from('campaigns')
          .select('id, status')
          .eq('brand_id', user.id),
        supabase
          .from('enrollments')
          .select('id, status')
          .eq('brand_id', user.id),
        supabase
          .from('invoices')
          .select('total_amount, created_at')
          .eq('brand_id', user.id)
          .eq('status', 'paid'),
      ]);

      if (campaignsResult.error) throw campaignsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (revenueResult.error) throw revenueResult.error;

      const campaigns = campaignsResult.data || [];
      const orders = ordersResult.data || [];
      const invoices = revenueResult.data || [];

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      return {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        monthlyRevenue: invoices
          .filter(inv => {
            if (!inv.created_at) return false;
            const invDate = new Date(inv.created_at);
            return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
          })
          .reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Recent activity hook
export function useRecentActivity() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: homeQueryKeys.recentActivity(),
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!user) throw new Error('User not authenticated');

      // Simulate fetching recent activities
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform notifications to recent activity format
      return (data || []).map(notification => ({
        id: notification.id,
        type: (notification.type as 'campaign_created' | 'order_received' | 'payment_completed' | 'invoice_generated') || 'campaign_created',
        title: notification.title || 'Activity',
        description: notification.message || '',
        timestamp: notification.created_at || new Date().toISOString(),
        metadata: (notification as any).metadata,
      }));
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Active campaigns hook
export function useActiveCampaigns() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: homeQueryKeys.activeCampaigns(),
    queryFn: async (): Promise<Campaign[]> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          description,
          status,
          rebate_percentage,
          start_date,
          end_date,
          created_at,
          updated_at
        `)
        .eq('brand_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data || [];
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

// Notifications hook
export function useNotifications() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: homeQueryKeys.notifications(),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data || [];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

// Mark notification as read mutation
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: homeQueryKeys.notifications() });
    },
  });
}

// Refresh all home data
export function useRefreshHomeData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all home-related queries
      await queryClient.invalidateQueries({ queryKey: homeQueryKeys.all });
    },
  });
}