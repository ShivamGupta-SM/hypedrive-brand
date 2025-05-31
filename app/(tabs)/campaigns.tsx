import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { CampaignFilterTabs } from '@/components/campaigns/CampaignFilterTabs';
import { GradientButton } from '@/components/GradientButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useRouter } from 'expo-router';
import { MagnifyingGlass, Plus } from 'phosphor-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

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
    name: 'Nike Air Max 2025 - A very long name',
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

  return (
    <View style={styles.container}>
      <AppHeader
        title="Campaigns"
        hideTitle
        leftContent={
          <View>
            <Text style={styles.headerTitle}>Campaigns</Text>
            <Text style={styles.headerSubtitle}>Manage your brand campaigns</Text>
          </View>
        }
        rightContent={
          <GradientButton
            title="Create"
            onPress={() => router.push('/campaigns/create/new')}
            icon={<Plus size={16} color={colors.white} weight="bold" />}
            iconPosition="left"
            style={styles.createButton}
            gradientColors={[colors.blue[500], colors.blue[700]]}
            size="sm"
          />
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Pressable style={styles.searchBar} onPress={() => router.push('/campaigns/create/new')}>
          <MagnifyingGlass size={20} color={colors.text.muted} weight="bold" />
          <Text style={styles.searchPlaceholder}>Search campaigns</Text>
        </Pressable>
      </View>

      {/* Category Tabs - Horizontally Scrollable */}
      <CampaignFilterTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Campaign List */}
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        //   useNativeDriver: true,
        // })}
        // scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {MOCK_CAMPAIGNS.map(campaign => (
          <CampaignCard key={'campaign' + campaign.id} campaign={campaign} />
        ))}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
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
});
