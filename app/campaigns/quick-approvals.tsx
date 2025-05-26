import { AppHeader } from '@/components/ui/AppHeader';
import { ApprovalCard, ApprovalItem } from '@/components/ui/ApprovalCard';
import { ApprovalStatsCard } from '@/components/ui/ApprovalStatsCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { CaretRight, CheckCircle, Clock, Download, SquaresFour, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Mock data for approvals
const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: '1',
    name: 'James Cooper',
    productName: 'Nike Dri-FIT Collection',
    productCode: 'NK8473',
    price: '₹2,499.00',
    marketplace: 'Amazon',
    approvedBy: 'James',
    approvedTime: '35m ago',
    status: 'approved',
    screenshots: [
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100',
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    productName: 'Nike Air Max 270',
    productCode: 'NK5621',
    price: '₹3,999.00',
    marketplace: 'Flipkart',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Michael Brown',
    productName: 'Nike Pro Training Shorts',
    productCode: 'NK3219',
    price: '₹1,299.00',
    marketplace: 'Amazon',
    approvedBy: 'Alex',
    approvedTime: '2h ago',
    status: 'approved',
    screenshots: ['https://via.placeholder.com/100', 'https://via.placeholder.com/100'],
  },
];

type FilterTabType = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

const FILTER_TABS: FilterTabType[] = [
  {
    id: 'all',
    label: 'All',
    icon: <SquaresFour size={16} weight="bold" />,
  },
  {
    id: 'pending',
    label: 'Pending',
    icon: <Clock size={16} weight="bold" />,
  },
  {
    id: 'approved',
    label: 'Approved',
    icon: <CheckCircle size={16} weight="bold" />,
  },
  {
    id: 'rejected',
    label: 'Rejected',
    icon: <X size={16} weight="bold" />,
  },
];

export default function QuickApprovalsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);

  // Load data
  useEffect(() => {
    const timer = setTimeout(() => {
      setApprovals(MOCK_APPROVALS);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setApprovals(MOCK_APPROVALS);
      setRefreshing(false);
    }, 1500);
  }, []);

  // Filter approvals based on active tab
  const filteredApprovals = approvals.filter(approval => {
    if (activeTab === 'all') return true;
    return approval.status === activeTab;
  });

  // Stats calculations
  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const totalCount = approvals.length;
  const successRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Handle approval card press
  const handleApprovalPress = (item: ApprovalItem) => {
    // Navigate to approval details
    router.push(`/approvals/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Quick Approvals" showBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue[500]}
            colors={[colors.blue[500]]}
          />
        }>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <ApprovalStatsCard
            title="Pending Reviews"
            value={pendingCount}
            subtitle="Awaiting Approval"
            color="orange"
            style={styles.statsCard}
          />
          {loading ? (
            <View style={[styles.statsCard, styles.loadingStatsCard]}>
              <ActivityIndicator color={colors.blue[500]} />
            </View>
          ) : (
            <ApprovalStatsCard
              title={approvedCount > 0 ? 'Success Rate' : 'Approved Today'}
              value={approvedCount > 0 ? `${successRate}%` : approvedCount}
              subtitle={approvedCount > 0 ? 'Overall' : 'Successfully Done'}
              color="green"
              style={styles.statsCard}
            />
          )}
        </View>

        {/* Total Approvals */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Approvals</Text>
          <Text style={styles.totalCount}>{totalCount} Reviews</Text>
        </View>

        {/* Filter Tabs */}
        <FilterTabs tabs={FILTER_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            // Loading skeleton
            <View style={styles.loadingContainer}>
              {[1, 2].map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                  <View style={styles.skeletonHeader}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonText} />
                  </View>
                  <View style={styles.skeletonBody}>
                    <View style={styles.skeletonLine} />
                    <View style={[styles.skeletonLine, { width: '70%' }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : filteredApprovals.length === 0 ? (
            // Empty state
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Clock size={24} color={colors.gray[400]} weight="bold" />
                <Download size={24} color={colors.gray[400]} weight="bold" />
                <CheckCircle size={24} color={colors.gray[400]} weight="bold" />
              </View>
              <EmptyState
                title="No Approvals Yet"
                message="You currently have no reviews to approve. New approval requests will appear here as soon as they're available."
                actionLabel="Refresh"
                onAction={onRefresh}
              />
            </View>
          ) : (
            // Approval cards
            <View style={styles.approvalsContainer}>
              {/* Download Report Button */}
              {filteredApprovals.length > 0 && activeTab === 'approved' && (
                <TouchableOpacity style={styles.downloadButton}>
                  <View style={styles.downloadIconContainer}>
                    <Download size={20} color={colors.green[500]} weight="bold" />
                  </View>
                  <View style={styles.downloadTextContainer}>
                    <Text style={styles.downloadTitle}>Download Report</Text>
                    <Text style={styles.downloadSubtitle}>Approved Reviews</Text>
                  </View>
                  <Text style={styles.downloadFormat}>CSV</Text>
                  <CaretRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              )}

              {/* Approval Cards */}
              {filteredApprovals.map(approval => (
                <ApprovalCard key={approval.id} item={approval} onPress={handleApprovalPress} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.gray[50],
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statsCard: {
    flex: 1,
  },
  loadingStatsCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  totalText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  totalCount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
  },
  skeletonText: {
    width: 120,
    height: 16,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[200],
  },
  approvalsContainer: {
    // padding: spacing.md,
    // gap: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyIconContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  refreshButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  refreshButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[900],
    fontWeight: typography.weights.medium,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.md,
  },
  downloadIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  downloadTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  downloadSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
  },
  downloadFormat: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  skeletonBody: {
    gap: spacing.sm,
  },
  skeletonLine: {
    width: '100%',
    height: 16,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[200],
  },
});
