import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Clock, SlidersHorizontal } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const CampaignEnrollmentsTab = ({ campaignId }: CampaignEnrollmentsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved'>('all');

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
      productName: 'Apple AirPods Pro',
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

  // Filter enrollments based on active filter and search query
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'pending' && enrollment.status === 'Pending') ||
      (activeFilter === 'approved' && enrollment.status === 'Approved');

    const matchesSearch =
      enrollment.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.enrolledBy.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Calculate stats
  const totalEnrollments = enrollments.length;
  const pendingEnrollments = enrollments.filter(e => e.status === 'Pending').length;
  const approvedEnrollments = enrollments.filter(e => e.status === 'Approved').length;

  // Render enrollment item
  const renderEnrollmentItem = ({ item }: { item: Enrollment }) => (
    <View style={styles.enrollmentItem}>
      <View style={styles.productContainer}>
        <Image source={require('@/assets/products/iphone.jpg')} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <View style={styles.productMeta}>
            <Text style={styles.productId}>#{item.productId}</Text>
            <View style={styles.platformContainer}>
              <Text style={styles.platformText}>{item.platform}</Text>
              <Text style={styles.dateText}>• {item.date}</Text>
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
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Clock size={14} weight="bold" color={colors.text.muted} />
        <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{totalEnrollments}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, styles.pendingValue]}>{pendingEnrollments}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Approved</Text>
          <Text style={[styles.statValue, styles.approvedValue]}>{approvedEnrollments}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          style={styles.searchInput}
          placeholder="Search by name or order ID"
          value={searchQuery}
          leftIcon={<Ionicons name="search" size={24} color={colors.text.muted} />}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          {/* <Image source={require('@/assets/icons/filter.png')} style={styles.filterIcon} /> */}
          <SlidersHorizontal size={24} weight="regular" color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Enrollments List */}
      <FlashList
        data={filteredEnrollments}
        renderItem={renderEnrollmentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.enrollmentsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CampaignEnrollmentsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
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
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.md,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    marginVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productMeta: {
    flexDirection: 'column',
  },
  productId: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1.2,
    borderRadius: borderRadius.full,
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
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
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
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  userAvatarPlaceholder: {
    width: 24,
    height: 24,
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
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
  },
  badgeAndAmount: {
    gap: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  timeAgoText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});
