import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Check, Clock, SlidersHorizontal } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type EnrollmentStatus = 'Approved' | 'Pending';

type Enrollment = {
  id: string;
  productName: string;
  productId: string;
  price: string;
  platform: string;
  date: string;
  timeAgo: string;
  status: EnrollmentStatus;
  enrolledBy: {
    name: string;
    avatar?: string;
  };
};

type CampaignEnrollmentsTabProps = {
  campaignId: string;
};

type FilterOptions = {
  status: 'all' | 'pending' | 'approved';
  platform?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
};

type StatCardProps = {
  label: string;
  value: number;
  valueStyle?: object;
};

// StatCard Component
const StatCard = ({ label, value, valueStyle }: StatCardProps) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, valueStyle]}>{value}</Text>
  </View>
);

// EnrollmentItem Component
const EnrollmentItem = ({ item }: { item: Enrollment }) => (
  <View style={styles.enrollmentItem}>
    <View style={styles.productContainer}>
      <View style={styles.productInfoWithStatusPrice}>
        <Image source={require('@/assets/products/iphone.jpg')} style={styles.productImage} />
        <View style={styles.productImageAndInfoContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
              {item.productName}
            </Text>
            <Text style={styles.productId}>#{item.productId}</Text>

            <View style={styles.platformContainer}>
              <View style={styles.platformTextContainer}>
                <Text style={styles.platformText}>{item.platform}</Text>
                <Text style={styles.dateText}>• {item.date}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.badgeAndAmount}>
          <View
            style={[
              styles.statusBadge,
              item.status === 'Approved' ? styles.approvedBadge : styles.pendingBadge,
            ]}>
            <Text
              style={[
                styles.statusText,
                item.status === 'Approved' ? styles.approvedText : styles.pendingText,
              ]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} weight="bold" color={colors.text.muted} />
            <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
          </View>
        </View>
      </View>
    </View>
    <View style={styles.divider} />

    <View style={styles.enrolledByContainer}>
      <View style={styles.userContainer}>
        {item.enrolledBy.avatar ? (
          <Image source={{ uri: item.enrolledBy.avatar }} style={styles.userAvatar} />
        ) : (
          <View style={styles.userAvatarPlaceholder}>
            <Text style={styles.userInitial}>{item.enrolledBy.name.charAt(0)}</Text>
          </View>
        )}
        <View>
          <Text style={styles.enrolledByLabel}>Enrolled by</Text>
          <Text style={styles.userName}>{item.enrolledBy.name}</Text>
        </View>
      </View>
    </View>
  </View>
);

// FilterBottomSheet Component
const FilterBottomSheet = ({
  bottomSheetRef,
  filterOptions,
  onApplyFilters,
}: {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  filterOptions: FilterOptions;
  onApplyFilters: (options: FilterOptions) => void;
}) => {
  const [localFilterOptions, setLocalFilterOptions] = useState<FilterOptions>(filterOptions);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleStatusChange = (status: 'all' | 'pending' | 'approved') => {
    setLocalFilterOptions(prev => ({ ...prev, status }));
  };

  const handleApply = () => {
    onApplyFilters(localFilterOptions);
    bottomSheetRef.current?.close();
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log('Sheet index:', index);
      if (index === -1) {
        // Reset to original filter options if closed without applying
        setLocalFilterOptions(filterOptions);
      }
    },
    [filterOptions],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.bottomSheetIndicator}
      backgroundStyle={styles.bottomSheetBackground}>
      <BottomSheetView style={styles.bottomSheetContainer}>
        <Text style={styles.bottomSheetTitle}>Filter Enrollments</Text>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <View style={styles.filterOptionsRow}>
            {['all', 'pending', 'approved'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  localFilterOptions.status === status && styles.filterOptionActive,
                ]}
                onPress={() => handleStatusChange(status as 'all' | 'pending' | 'approved')}>
                <View style={styles.filterOptionContent}>
                  {localFilterOptions.status === status && (
                    <Check
                      size={16}
                      weight="bold"
                      color={colors.primary[500]}
                      style={styles.filterCheckIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.filterOptionText,
                      localFilterOptions.status === status && styles.filterOptionTextActive,
                    ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Platform</Text>
          <View style={styles.filterOptionsRow}>
            {['All Platforms', 'Amazon', 'Flipkart'].map(platform => (
              <TouchableOpacity key={platform} style={styles.filterOption}>
                <Text style={styles.filterOptionText}>{platform}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSheetActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => bottomSheetRef.current?.close()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const CampaignEnrollmentsTab = ({ campaignId }: CampaignEnrollmentsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ status: 'all' });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const filterBottomSheetRef = useRef<BottomSheet>(null);

  // Initialize with loading state
  useEffect(() => {
    // Simulate initial data loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for enrollments
  const enrollments: Enrollment[] = [
    {
      id: '1',
      productName: 'Apple AirPods Pro',
      productId: '112-7447943-3785296',
      price: '₹12,499',
      platform: 'Amazon',
      date: 'Jan 19, 2025',
      timeAgo: '2h ago',
      status: 'Approved',
      enrolledBy: {
        name: 'Sarah Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
    },
    {
      id: '2',
      productName: 'Apple AirPods Pro - 2025 Model with 2GB RAM and 64GB Storage',
      productId: '45892',
      price: '₹8,999',
      platform: 'Flipkart',
      date: 'Jan 18, 2025',
      timeAgo: '5h ago',
      status: 'Pending',
      enrolledBy: {
        name: 'Alex Chen',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
    },
    {
      id: '3',
      productName: 'Apple AirPods Pro',
      productId: '12934',
      price: '₹11,499',
      platform: 'Amazon',
      date: 'Jan 15, 2025',
      timeAgo: '2d ago',
      status: 'Approved',
      enrolledBy: {
        name: 'Michael Evans',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      },
    },
    {
      id: '4',
      productName: 'Apple AirPods Pro',
      productId: '86231',
      price: '₹9,299',
      platform: 'Flipkart',
      date: 'Jan 10, 2025',
      timeAgo: '1w ago',
      status: 'Pending',
      enrolledBy: {
        name: 'David Lee',
        avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
      },
    },
    {
      id: '5',
      productName: 'Apple AirPods Pro',
      productId: '77923',
      price: '₹12,799',
      platform: 'Amazon',
      date: 'Jan 8, 2025',
      timeAgo: '2w ago',
      status: 'Approved',
      enrolledBy: {
        name: 'Jessica Miller',
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
      },
    },
  ];

  // Filter enrollments based on filter options and search query
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      const matchesFilter =
        filterOptions.status === 'all' ||
        (filterOptions.status === 'pending' && enrollment.status === 'Pending') ||
        (filterOptions.status === 'approved' && enrollment.status === 'Approved');

      const matchesSearch =
        searchQuery === '' || // Return all results if search is empty
        enrollment.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.enrolledBy.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [enrollments, filterOptions, searchQuery]);

  // Calculate stats
  const totalEnrollments = useMemo(() => enrollments.length, [enrollments]);
  const pendingEnrollments = useMemo(
    () => enrollments.filter(e => e.status === 'Pending').length,
    [enrollments],
  );
  const approvedEnrollments = useMemo(
    () => enrollments.filter(e => e.status === 'Approved').length,
    [enrollments],
  );

  // Handle filter button press
  const handleFilterPress = useCallback(() => {
    filterBottomSheetRef.current?.expand();
  }, []);

  // Handle filter application
  const handleApplyFilters = useCallback((options: FilterOptions) => {
    setFilterOptions(options);
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // In a real app, you would fetch new data here
      // For now, we'll just simulate the refresh
      setRefreshing(false);
    }, 1500);
  }, []);

  // Close bottom sheet when component unmounts
  useEffect(() => {
    return () => {
      filterBottomSheetRef.current?.close();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard label="Total" value={totalEnrollments} />
        <StatCard label="Pending" value={pendingEnrollments} valueStyle={styles.pendingValue} />
        <StatCard label="Approved" value={approvedEnrollments} valueStyle={styles.approvedValue} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={24} color={colors.text.muted} style={styles.searchIcon} />
          <Input
            style={styles.searchInput}
            placeholder="Search by name or order ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.inputContainer}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <SlidersHorizontal size={24} weight="regular" color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Enrollments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={filteredEnrollments}
            renderItem={({ item }) => <EnrollmentItem item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.enrollmentsList}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={200}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No enrollments found</Text>
              </View>
            }
          />
        </View>
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        bottomSheetRef={filterBottomSheetRef}
        filterOptions={filterOptions}
        onApplyFilters={handleApplyFilters}
      />
    </GestureHandlerRootView>
  );
};

export default CampaignEnrollmentsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    position: 'relative',
  },
  listContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  pendingValue: {
    color: colors.orange[500],
  },
  approvedValue: {
    color: colors.green[500],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    paddingHorizontal: spacing.xm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  enrollmentsList: {
    paddingBottom: spacing.xl,
  },
  enrollmentItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  productContainer: {
    padding: spacing.md,
  },
  productInfoWithStatusPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xm,
    position: 'relative',
  },
  productImageAndInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    flexDirection: 'row',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    maxWidth: '60%',
  },
  productId: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  platformContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  platformText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  statusBadge: {
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  approvedBadge: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[100],
  },
  pendingBadge: {
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[100],
  },
  statusText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
  },
  approvedText: {
    color: colors.green[500],
  },
  pendingText: {
    color: colors.orange[500],
  },
  enrolledByContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    paddingVertical: spacing.xm,
    backgroundColor: colors.gray[50],
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  enrolledByLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  userAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  userInitial: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: typography.sizes.sm,
    color: colors.black,
    fontWeight: typography.weights.semibold,
  },
  badgeAndAmount: {
    position: 'absolute',
    right: 0,
    top: 0,
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  timeContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.green[600],
    textAlign: 'center',
  },
  timeAgoText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
  },
  bottomSheetIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.full,
  },
  bottomSheetTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    minWidth: 100,
  },
  filterOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCheckIcon: {
    marginRight: spacing.xs,
  },
  filterOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  filterOptionTextActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  applyButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
