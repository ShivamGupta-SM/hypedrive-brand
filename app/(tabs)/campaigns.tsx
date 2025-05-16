import { GradientButton } from '@/components/GradientButton';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Clock, MagnifyingGlass, Plus, Star, UsersThree } from 'phosphor-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Types for our data
type Campaign = {
  id: string;
  name: string;
  daysAgo: string;
  status: 'Active' | 'Draft' | 'Complete';
  enrolled: {
    current: number;
    total: number;
  };
  reviews: number;
  value: string;
  progress: number;
  image?: any;
};

// Mock data for campaigns
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Nike Air Max 2025',
    daysAgo: '2 days ago',
    status: 'Active',
    enrolled: {
      current: 45,
      total: 100,
    },
    reviews: 28,
    value: '₹2,500',
    progress: 45,
    image: require('@/assets/logo/others/amazon-logo2.png'),
  },
  {
    id: '2',
    name: 'Adidas Ultra Boost',
    daysAgo: '5 days ago',
    status: 'Draft',
    enrolled: {
      current: 0,
      total: 50,
    },
    reviews: 0,
    value: '₹3,200',
    progress: 0,
    image: require('@/assets/logo/others/amazon-logo2.png'),
  },
  {
    id: '3',
    name: 'Puma RS-X',
    daysAgo: '1 week ago',
    status: 'Complete',
    enrolled: {
      current: 75,
      total: 75,
    },
    reviews: 72,
    value: '₹4,800',
    progress: 100,
    image: require('@/assets/logo/others/amazon-logo2.png'),
  },
];

export default function CampaignsScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const router = useRouter();

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Scroll to top function for category tabs
  const scrollToTop = () => {
    (scrollViewRef.current as any)?.scrollTo({ y: 0, animated: true });
  };

  // Animation for the header shadow and opacity
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 10],
    outputRange: [0, 0.2],
    extrapolate: 'clamp',
  });

  // Animation for the tabs container
  const tabsTranslateY = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0, 0],
    extrapolate: 'clamp',
  });

  // Get status color based on campaign status
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return colors.green[500];
      case 'Draft':
        return colors.gray[500];
      case 'Complete':
        return colors.blue[500];
      default:
        return colors.gray[500];
    }
  };

  // Get status background color based on campaign status
  const getStatusBgColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return colors.green[100];
      case 'Draft':
        return colors.gray[200];
      case 'Complete':
        return colors.blue[100];
      default:
        return colors.gray[200];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed Header */}
      <View style={[styles.header]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Campaigns</Text>
            <Text style={styles.headerSubtitle}>Manage your brand campaigns</Text>
          </View>
          <GradientButton
            title="Create"
            onPress={() => router.push('/campaigns/new')}
            icon={<Plus size={16} color={colors.white} weight="bold" />}
            iconPosition="left"
            style={styles.createButton}
            gradientColors={[colors.blue[500], colors.blue[700]]}
            size="sm"
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Pressable style={styles.searchBar} onPress={() => router.push('/campaigns/new')}>
          <MagnifyingGlass size={20} color={colors.text.muted} weight="bold" />
          <Text style={styles.searchPlaceholder}>Search campaigns</Text>
        </Pressable>
      </View>

      {/* Category Tabs - Sticky */}
      <Animated.View
        style={[
          styles.tabsContainer,
          {
            transform: [{ translateY: tabsTranslateY }],
          },
        ]}>
        <View style={styles.tabsWrapper}>
          <Pressable
            style={[styles.tab, activeCategory === 'all' && styles.activeTab]}
            onPress={() => setActiveCategory('all')}>
            <Text style={[styles.tabText, activeCategory === 'all' && styles.activeTabText]}>
              All (24)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeCategory === 'active' && styles.activeTab]}
            onPress={() => setActiveCategory('active')}>
            <Text style={[styles.tabText, activeCategory === 'active' && styles.activeTabText]}>
              Active (18)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeCategory === 'draft' && styles.activeTab]}
            onPress={() => setActiveCategory('draft')}>
            <Text style={[styles.tabText, activeCategory === 'draft' && styles.activeTabText]}>
              Draft (3)
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Campaign List */}
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue[500]}
            colors={[colors.blue[500]]}
          />
        }>
        {MOCK_CAMPAIGNS.map(campaign => (
          <Pressable
            key={campaign.id}
            style={styles.campaignCard}
            onPress={() => router.push(`/campaigns/${campaign.id}`)}>
            {/* Campaign Header */}
            <View style={styles.campaignHeader}>
              <View style={styles.campaignImageContainer}>
                <Image source={campaign.image} style={styles.campaignImage} />
                {/* Status Dot */}
                <View
                  style={[styles.statusDot, { backgroundColor: getStatusColor(campaign.status) }]}
                />
              </View>
              <View style={styles.campaignInfo}>
                <View style={styles.campaignTitleRow}>
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock size={14} color={colors.text.secondary} />
                  <Text style={styles.timeText}>{campaign.daysAgo}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusBgColor(campaign.status),
                        borderColor: `${getStatusColor(campaign.status)}20`,
                      },
                    ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                      {campaign.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* progress bar */}
              <View style={styles.progressContainer}>
                <Text
                  style={[
                    styles.progressText,
                    {
                      color: colors.blue[700],
                    },
                  ]}>
                  {campaign.progress}%
                </Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${campaign.progress}%`,
                        backgroundColor: colors.blue[700],
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Campaign Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statLabelHeader}>
                  <Text style={styles.statLabel}>Enrolled</Text>
                  <UsersThree size={14} color={colors.text.secondary} weight="fill" />
                </View>
                <Text style={styles.statValue}>
                  {campaign.enrolled.current}/{campaign.enrolled.total}
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statLabelHeader}>
                  <Text style={styles.statLabel}>Reviews</Text>
                  <Star size={14} color={colors.text.secondary} weight="fill" />
                </View>
                <Text style={styles.statValue}>{campaign.reviews}</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statLabelHeader}>
                  <Text style={styles.statLabel}>Value</Text>
                  <Text style={styles.currencyIcon}>₹</Text>
                </View>
                <Text style={styles.statValue}>{campaign.value}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.mg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  createButton: {},
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  searchBar: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchPlaceholder: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,

    fontWeight: typography.weights.semibold,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    zIndex: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  activeTab: {
    backgroundColor: colors.blue[500],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  activeTabText: {
    color: colors.white,
  },
  scrollContent: {
    // backgroundColor: colors.gray[50],
    padding: spacing.md,
    paddingTop: spacing.md,
  },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    padding: spacing.xm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  campaignImageContainer: {
    position: 'relative',
    marginRight: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  campaignImage: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    tintColor: colors.gray[300],
    borderColor: colors.gray[100],
  },
  statusDot: {
    position: 'absolute',
    top: 0.5,
    right: 0.5,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: typography.sizes.xxs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.full,
  },
  statusBadgeIcon: {},
  statusText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
  },
  progressContainer: {
    alignSelf: 'center',
  },
  progressBarBackground: {
    height: 4,
    width: 50,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginTop: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    letterSpacing: -0.5,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: colors.gray[100],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statLabelHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  currencyIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
});
