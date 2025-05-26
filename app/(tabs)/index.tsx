import { BrandHeader } from '@/components/brand/BrandHeader';
import GradientCard from '@/components/GradientCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useBrandSwitcher } from '@/hooks/useBrandSwitcher';
import { router } from 'expo-router';
import {
  Bell,
  CaretRight,
  ChartLineUp,
  CheckCircle,
  Clock,
  FileText,
  Gear,
  LineSegments,
  MagnifyingGlass,
  Star,
  Users,
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageURISource,
  Pressable,
  Animated as RNAnimated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Types for our data
type Campaign = {
  id: string;
  name: string;
  startDate: string;
  enrollments: {
    current: number;
    total: number;
  };
  reviews: number;
  success: number;
  isActive: boolean;
  logo?: any;
};

type QuickAction = {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  iconImage?: ImageURISource;
  color: string;
  backgroundColor: string;
};

type Stat = {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

// Mock data for the home screen
const MOCK_DATA = {
  brand: {
    name: 'Nike Brand',
    logo: require('@/assets/logo/logomark.png'), // Replace with actual logo path
    color: colors.blue[600], // This would come from the server
  },
  user: {
    firstName: 'Alex',
    pendingTasks: 5,
  },
  stats: [
    {
      id: 'reviews',
      title: 'Reviews',
      value: 84,
      icon: <Star size={22} weight="fill" />,
      color: colors.blue[500],
      bgColor: colors.blue[50],
    },
    {
      id: 'campaigns',
      title: 'Campaigns',
      value: 24,
      icon: <ChartLineUp size={22} weight="fill" />,
      color: colors.green[500],
      bgColor: colors.green[50],
    },
    {
      id: 'influencers',
      title: 'Influencers',
      value: 156,
      icon: <Users size={22} weight="fill" />,
      color: colors.purple[500],
      bgColor: colors.purple[50],
    },
    {
      id: 'engagement',
      title: 'Engagement',
      value: '78%',
      icon: <ChartLineUp size={22} weight="fill" />,
      color: colors.rose[500],
      bgColor: colors.rose[50],
    },
  ],
  quickActions: [
    {
      id: 'approvals',
      name: 'Approvals',
      count: 12,
      icon: <CheckCircle weight="bold" />,
      iconImage: require('@/assets/icons/3dicons-star-iso-gradient.png'),
      color: colors.orange[500],
      backgroundColor: colors.orange[50],
    },
    {
      id: 'invoices',
      name: 'Invoices',
      count: 8,
      icon: <FileText weight="bold" />,
      iconImage: require('@/assets/icons/file-update_18753931.png'),
      color: colors.blue[500],
      backgroundColor: colors.blue[50],
    },
    {
      id: 'analytics',
      name: 'Analytics',
      count: 4,
      icon: <LineSegments weight="bold" />,
      iconImage: require('@/assets/icons/3dicons-computer-iso-gradient.png'),
      color: colors.green[500],
      backgroundColor: colors.green[50],
    },
    {
      id: 'team',
      name: 'Team',
      count: 3,
      icon: <Users weight="bold" />,
      iconImage: require('@/assets/icons/3dicons-girl-iso-color.png'),
      color: colors.purple[500],
      backgroundColor: colors.purple[50],
    },
  ],
  activeCampaigns: [
    {
      id: '1',
      name: 'Nike Air Max 2025',
      startDate: 'June 15, 2025',
      enrollments: {
        current: 45,
        total: 100,
      },
      reviews: 28,
      success: 62,
      isActive: true,
      logo: require('@/assets/logo/others/amazon-logo2.png'),
    },
    {
      id: '2',
      name: 'Nike Dri-FIT',
      startDate: 'June 10, 2025',
      enrollments: {
        current: 82,
        total: 150,
      },
      reviews: 67,
      success: 82,
      isActive: true,
      logo: require('@/assets/logo/others/amazon-logo2.png'),
    },
  ],
};

export default function BrandHomeScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(MOCK_DATA);
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Show skeleton while refreshing
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Update data if needed
      setData({ ...MOCK_DATA });
      setRefreshing(false);
      setLoading(false);
    }, 2000);
  }, []);

  const notificationCount = 13;
  const { BrandSwitcherComponent, openBrandSwitcher } = useBrandSwitcher();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Home"
        hideTitle
        leftContent={<BrandHeader onPress={openBrandSwitcher} />}
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <MagnifyingGlass size={22} color={colors.text.primary} weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.iconButton}>
              <Bell size={22} color={colors.text.primary} weight="bold" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        }
      />

      <RNAnimated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.white }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.orange[500]}
            colors={[colors.orange[500]]}
          />
        }
        onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.content}>
          {/* Greeting Card with Gradient */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.greetingCardContainer}>
            <GradientCard baseColor={data.brand.color} style={styles.greetingCard}>
              <Text style={styles.greetingText}>Good morning, {data.user.firstName}</Text>
              <Text style={styles.tasksText}>
                You have {data.user.pendingTasks} tasks pending today
              </Text>
              <TouchableOpacity style={styles.settingsButton}>
                <Gear size={24} color={colors.white} weight="bold" />
              </TouchableOpacity>
            </GradientCard>
          </Animated.View>

          {/* Stats Overview - Horizontally Scrollable */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.statCardContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statCardsScroll}>
              {data.stats.map(stat => (
                <StatCardWithSkeleton key={stat.id} stat={stat} isLoading={loading} />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsOuterContainer}>
              <View style={styles.quickActionsContainer}>
                {data.quickActions.map(action => (
                  <ActionCardWithSkeleton key={action.id} action={action} isLoading={loading} />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Active Campaigns */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.campaignsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Campaigns</Text>
              <TouchableOpacity>
                <View style={styles.viewAll}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <CaretRight weight="bold" size={14} color={colors.orange[500]} />
                </View>
              </TouchableOpacity>
            </View>

            {data.activeCampaigns.map(campaign => (
              <Pressable key={campaign.id} style={styles.campaignCard}>
                <View style={styles.campaignHeader}>
                  <View style={styles.campaignLogoContainer}>
                    <Image source={campaign.logo} style={styles.campaignLogo} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <View style={styles.campaignDateContainer}>
                      <Clock size={12} weight="bold" color={colors.text.muted} />
                      <Text style={styles.campaignDateText}>Started: {campaign.startDate}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>

                <View style={styles.campaignStats}>
                  <View style={styles.campaignStat}>
                    <Text style={styles.statTitle}>Enrollments</Text>
                    <Text style={styles.statNumber}>
                      {campaign.enrollments.current}/{campaign.enrollments.total}
                    </Text>
                  </View>
                  <View style={styles.campaignStat}>
                    <Text style={styles.statTitle}>Reviews</Text>
                    <Text style={styles.statNumber}>{campaign.reviews}</Text>
                  </View>
                  <View style={styles.campaignStat}>
                    <Text style={styles.statTitle}>Success</Text>
                    <Text style={[styles.statNumber, { color: colors.green[500] }]}>
                      {campaign.success}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </Animated.View>

          {/* Add spacing at bottom for the floating action button */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </RNAnimated.ScrollView>

      {/* Brand Switcher Bottom Sheet */}
      {BrandSwitcherComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  fixedHeader: {
    // position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    zIndex: 10,
    paddingHorizontal: spacing.mg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  fixedHeaderSkeleton: {
    // position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    zIndex: 10,
    paddingHorizontal: spacing.mg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orange[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.orange[500],
  },
  welcomeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skeletonIconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.rose[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    minHeight: 18,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  greetingCardContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  greetingCard: {
    padding: spacing.md,
    position: 'relative',
  },
  greetingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  tasksText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.white,
    opacity: 0.9,
  },
  settingsButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.md,
  },
  skeletonTitle: {
    height: 24,
    width: 120,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.md,
  },
  statCardContainer: {
    // marginBottom: spacing.md,
  },
  statCardsScroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xm,
    paddingVertical: spacing.mg,
    gap: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
    width: 160,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    // overflow: 'hidden',
  },
  statCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.mg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    width: 160,
    overflow: 'hidden',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  quickActionsOuterContainer: {},
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  actionCard: {
    alignItems: 'center',
    width: '23%', // Exactly 4 columns with equal width
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: colors.orange[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionsContainerSkeleton: {
    paddingHorizontal: spacing.md,
  },
  quickActionsGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCardSkeleton: {
    alignItems: 'center',
    width: '23%',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
  },
  actionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.rose[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  actionText: {
    fontSize: typography.sizes.xxs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  campaignsSection: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    color: colors.orange[500],
    fontWeight: typography.weights.semibold,
  },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  campaignCardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  campaignLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  campaignLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    tintColor: colors.orange[300],
  },
  campaignName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: 2,
  },
  campaignDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  campaignDateText: {
    fontSize: typography.sizes.xxs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  statusBadge: {
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.green[100],
    marginLeft: 'auto',
  },
  statusBadgeSkeleton: {
    width: 60,
    height: 24,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.green[600],
    fontWeight: typography.weights.semibold,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  campaignStat: {
    alignItems: 'flex-start',
    flex: 1,
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 4,
  },
});

// Example of using View components directly for a stat card
const StatCardWithSkeleton = ({ stat, isLoading }: { stat: Stat; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <View style={styles.statCard}>
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor: colors.gray[200],
              width: 40,
              height: 40,
            },
          ]}
        />
        <View style={{ gap: 4 }}>
          <View
            style={{
              width: 60,
              height: 24,
              backgroundColor: colors.gray[200],
              borderRadius: borderRadius.sm,
            }}
          />
          <View
            style={{
              width: 40,
              height: 16,
              backgroundColor: colors.gray[200],
              borderRadius: borderRadius.sm,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
        {React.cloneElement(stat.icon as React.ReactElement<any, string>, {
          color: stat.color,
        })}
      </View>
      <View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">
          {stat.title}
        </Text>
      </View>
    </View>
  );
};

// Example of using View components directly for action cards
const ActionCardWithSkeleton = ({
  action,
  isLoading,
}: {
  action: QuickAction;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <View style={styles.actionCard}>
        <View
          style={[
            styles.actionIconContainer,
            {
              backgroundColor: colors.gray[200],
              width: 42,
              height: 42,
            },
          ]}
        />
        <View
          style={{
            width: 60,
            height: 16,
            backgroundColor: colors.gray[200],
            borderRadius: borderRadius.sm,
            marginTop: spacing.sm,
          }}
        />
      </View>
    );
  }

  return (
    <Pressable onPress={() => router.push('/campaigns/quick-approvals')} style={styles.actionCard}>
      <View style={[styles.actionIconContainer, { backgroundColor: action.backgroundColor }]}>
        {React.cloneElement(action.icon as React.ReactElement<any, string>, {
          size: 20,
          color: action.color,
        })}
        {/* <Image source={action.iconImage} style={{ height: 44, width: 44, objectFit: 'contain' }} /> */}
        {action.count > 0 && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{action.count > 9 ? '9+' : action.count}</Text>
          </View>
        )}
      </View>
      <Text style={styles.actionText}>{action.name}</Text>
    </Pressable>
  );
};
