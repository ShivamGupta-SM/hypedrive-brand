import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useBrandSwitcher } from '@/hooks/useBrandSwitcher';
import { router } from 'expo-router';
import {
  Bell,
  CaretDown,
  MagnifyingGlass,
  Star,
  TrendUp
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Types
type TimeFilter = '7 days' | '30 days' | '3 months' | '1 year';
type PerformanceData = {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
};

type Review = {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  timeAgo: string;
  productType: string;
};

// Mock data for the analytics screen
const MOCK_DATA = {
  brand: {
    name: 'Nike Brand',
    logo: require('@/assets/products/macbook.png'),
  },
  stats: [
    {
      id: 'avg-rating',
      title: 'Avg Rating',
      value: '4.8',
      icon: <Star size={18} color={colors.orange[500]} weight="fill" />,
      bgColor: colors.orange[100],
    },
    {
      id: 'success-rate',
      title: 'Success Rate',
      value: '78%',
      icon: <TrendUp size={18} color={colors.green[500]} weight="fill" />,
      bgColor: colors.green[100],
    },
  ],
  performance: {
    '7 days': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43, 50],
          color: (opacity = 1) => colors.orange[500],
          strokeWidth: 3,
        },
        {
          data: [10, 25, 15, 40, 50, 20, 25],
          color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    '30 days': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      datasets: [
        {
          data: [40, 65, 53, 75, 90],
          color: (opacity = 1) => colors.orange[500],
          strokeWidth: 3,
        },
        {
          data: [20, 35, 25, 45, 55],
          color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    '3 months': {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          data: [50, 70, 90],
          color: (opacity = 1) => colors.orange[500],
          strokeWidth: 3,
        },
        {
          data: [30, 40, 60],
          color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    '1 year': {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          data: [60, 75, 85, 95],
          color: (opacity = 1) => colors.orange[500],
          strokeWidth: 3,
        },
        {
          data: [35, 45, 55, 70],
          color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
  },
  recentReviews: [
    {
      id: '1',
      productName: 'Nike Air Max 2025',
      rating: 5.0,
      comment: 'Great comfort and style! These shoes are perfect for both casual wear and workouts.',
      timeAgo: '2h ago',
      productType: 'shoes',
    },
    {
      id: '2',
      productName: 'Nike Dri-FIT Collection',
      rating: 4.0,
      comment: 'The moisture-wicking fabric works great during workouts. Highly recommended!',
      timeAgo: '5h ago',
      productType: 'apparel',
    },
    {
      id: '3',
      productName: 'Nike Pro Shorts',
      rating: 4.5,
      comment: 'Perfect fit and very comfortable for intense training sessions.',
      timeAgo: '1d ago',
      productType: 'apparel',
    },
  ],
};

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(MOCK_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30 days');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setData({ ...MOCK_DATA });
      setRefreshing(false);
      setLoading(false);
    }, 1500);
  }, []);

  const notificationCount = 2;
  const { BrandSwitcherComponent, openBrandSwitcher } = useBrandSwitcher();
  const screenWidth = Dimensions.get('window').width;

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: (opacity = 1) => colors.gray[500],
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.orange[500],
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.gray[200],
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
    },
  };

  // Get performance data based on selected time filter
  const getPerformanceData = (): PerformanceData => {
    return data.performance[timeFilter];
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Analytics"
        showBackButton
        // leftContent={<BrandHeader onPress={openBrandSwitcher} />}
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <MagnifyingGlass size={22} color={colors.text.primary} weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.iconButton}>
              <Bell size={22} color={colors.text.primary} weight="bold" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.orange[500]}
            colors={[colors.orange[500]]}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        {/* Stats Cards */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsContainer}>
          {data.stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                {stat.icon}
              </View>
              <Text style={styles.statTitle}>{stat.title}</Text>
              {loading ? (
                <View style={styles.statValueSkeleton} />
              ) : (
                <Text style={styles.statValue}>{stat.value}</Text>
              )}
            </View>
          ))}
        </Animated.View>

        {/* Performance Chart Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // Cycle through time filters
                const filters: TimeFilter[] = ['7 days', '30 days', '3 months', '1 year'];
                const currentIndex = filters.indexOf(timeFilter);
                const nextIndex = (currentIndex + 1) % filters.length;
                setTimeFilter(filters[nextIndex]);
              }}>
              <Text style={styles.filterText}>{timeFilter}</Text>
              <CaretDown size={16} color={colors.gray[600]} weight="bold" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.chartSkeleton}>
              <ActivityIndicator size="large" color={colors.orange[500]} />
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                data={getPerformanceData()}
                width={screenWidth - 2 * spacing.md - 2 * spacing.sm - 20}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withVerticalLines={true}
                withHorizontalLines={true}
                withDots={true}
                withShadow={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={true}
                segments={5}
              />
            </View>
          )}
        </Animated.View>

        {/* Recent Reviews Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity 
            // onPress={() => router.push('/reviews')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            // Skeleton for reviews
            <View style={styles.reviewsContainer}>
              {[1, 2].map((item) => (
                <View key={`skeleton-${item}`} style={styles.reviewCardSkeleton}>
                  <View style={styles.reviewHeaderSkeleton}>
                    <View style={styles.productIconSkeleton} />
                    <View style={styles.reviewInfoSkeleton} />
                  </View>
                  <View style={styles.reviewContentSkeleton} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.reviewsContainer}>
              {data.recentReviews.map((review) => (
                <Pressable
                  key={review.id}
                  style={styles.reviewCard}
                  // onPress={() => router.push(`/product-review/${review.id}`)}
                  >
                  <View style={styles.reviewHeader}>
                    <View style={styles.productIconContainer}>
                      {review.productType === 'shoes' ? (
                        <Text style={styles.productIcon}>👟</Text>
                      ) : (
                        <Text style={styles.productIcon}>👕</Text>
                      )}
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.productName}>{review.productName}</Text>
                      <View style={styles.ratingContainer}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`star-${index}`}
                            size={14}
                            weight="fill"
                            color={
                              index < Math.floor(review.rating)
                                ? colors.green[500]
                                : colors.gray[300]
                            }
                          />
                        ))}
                        <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
                      </View>
                    </View>
                    <Text style={styles.timeAgo}>{review.timeAgo}</Text>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={2}>
                    {review.comment}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Add bottom padding to ensure content is visible above tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {BrandSwitcherComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.orange[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.xm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statTitle: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    marginBottom: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  statValueSkeleton: {
    height: 30,
    width: 60,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
  chartSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  filterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[800],
    marginRight: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
    justifyContent: 'center'
  },
  chart: {
    borderRadius: borderRadius.lg,
    paddingRight: spacing.sm,
  },
  chartSkeleton: {
    height: 220,
    width: '100%',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.orange[500],
  },
  reviewsContainer: {
    marginTop: spacing.xs,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  productIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  productIcon: {
    fontSize: 20,
  },
  reviewInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  timeAgo: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    marginLeft: spacing.sm,
  },
  reviewComment: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
    lineHeight: 20,
  },
  reviewCardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  reviewHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productIconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    marginRight: spacing.sm,
  },
  reviewInfoSkeleton: {
    flex: 1,
    height: 40,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
  reviewContentSkeleton: {
    height: 40,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
});
