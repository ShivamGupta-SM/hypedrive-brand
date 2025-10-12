import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, typography } from '@/constants/Design';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';
import { ErrorBoundary, DataErrorFallback, NetworkErrorFallback, ErrorFallback } from '@/components/ui/ErrorBoundary';
import { SkeletonDashboard, SkeletonStats, SkeletonCard, SkeletonList } from '@/components/ui/SkeletonLoader';
import { useDashboardStats, useRecentActivity, useActiveCampaigns, useNotifications, useRefreshHomeData } from '@/lib/hooks/useHomeData';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  
  // Data fetching hooks
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useRecentActivity();

  const {
    data: campaigns,
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useActiveCampaigns();

  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useNotifications();

  // Refresh functionality
  const { mutate: refreshData, isPending: isRefreshing } = useRefreshHomeData();

  const handleRefresh = () => {
    refreshData();
  };

  // Loading states
  const isInitialLoading = statsLoading && activityLoading && campaignsLoading && notificationsLoading;
  const hasAnyError = statsError || activityError || campaignsError || notificationsError;

  // Network error detection
  const isNetworkError = (error: any) => {
    return error?.message?.includes('network') || 
           error?.message?.includes('fetch') || 
           error?.code === 'NETWORK_ERROR';
  };

  const hasNetworkError = [statsError, activityError, campaignsError, notificationsError]
    .some(error => error && isNetworkError(error));

  // Show full screen loading on initial load
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SkeletonDashboard />
      </SafeAreaView>
    );
  }

  // Show network error screen
  if (hasNetworkError) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkErrorFallback 
          onRetry={() => {
            refetchStats();
            refetchActivity();
            refetchCampaigns();
            refetchNotifications();
          }} 
        />
      </SafeAreaView>
    );
  }

  // Show general error screen if all data failed to load
  if (hasAnyError && !stats && !recentActivity && !campaigns && !notifications) {
    return (
      <SafeAreaView style={styles.container}>
        <DataErrorFallback 
          onRetry={() => {
            refetchStats();
            refetchActivity();
            refetchCampaigns();
            refetchNotifications();
          }} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>{user?.user_metadata?.name || 'User'}</Text>
          </View>
          <View style={styles.notificationBadge}>
             <Text style={styles.badgeText}>
               {notifications?.filter(n => n.status === 'unread').length || 0}
             </Text>
           </View>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          {statsLoading ? (
            <SkeletonStats />
          ) : statsError ? (
            <ErrorFallback
              title="Failed to load stats"
              message="Unable to fetch dashboard statistics"
              onRetry={refetchStats}
              showRetry={true}
            />
          ) : stats ? (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalCampaigns}</Text>
                <Text style={styles.statLabel}>Total Campaigns</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.activeCampaigns}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalRevenue}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.pendingOrders}</Text>
                <Text style={styles.statLabel}>Pending Orders</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activityLoading ? (
            <SkeletonList items={3} />
          ) : activityError ? (
            <ErrorFallback
              title="Failed to load activity"
              message="Unable to fetch recent activity"
              onRetry={refetchActivity}
              showRetry={true}
            />
          ) : recentActivity && recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity?.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={
                        activity.type === 'campaign_created' ? 'megaphone' :
                        activity.type === 'order_received' ? 'bag' :
                        activity.type === 'payment_completed' ? 'card' : 'document'
                      }
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>

        {/* Active Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          {campaignsLoading ? (
            <View>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : campaignsError ? (
            <ErrorFallback
              title="Failed to load campaigns"
              message="Unable to fetch active campaigns"
              onRetry={refetchCampaigns}
              showRetry={true}
            />
          ) : campaigns && campaigns.length > 0 ? (
            <View style={styles.campaignsList}>
              {campaigns.map((campaign) => (
                <View key={campaign.id} style={styles.campaignCard}>
                  <Text style={styles.campaignTitle}>{campaign.title}</Text>
                  <Text style={styles.campaignDescription}>{campaign.description}</Text>
                  <View style={styles.campaignFooter}>
                    <Text style={styles.campaignBudget}>
                      Rebate: {campaign.rebate_percentage}%
                    </Text>
                    <Text style={styles.campaignStatus}>{campaign.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active campaigns</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: 2,
  },
  notificationBadge: {
    backgroundColor: colors.red[500],
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  activityList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  activityDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  campaignsList: {
    gap: spacing.md,
  },
  campaignCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  campaignDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  campaignBudget: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.green[600],
  },
  campaignStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.blue[600],
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.text.muted,
  },
});
