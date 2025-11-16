import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import CampaignAnalyticsTab from './CampaignAnalyticsTab';
// import CampaignDetailsTabs from './CampaignDetailsTabs';
// import CampaignEnrollmentsTab from './CampaignEnrollmentsTab';
// import CampaignOverViewTab from './CampaignOverviewTab';

// Tab type
type TabType = {
  id: string;
  label: string;
};

const CampaignDetails = () => {
  const { campaignId } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Define tabs
  const tabs: TabType[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'enrollments', label: 'Enrollments' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'influencers', label: 'Influencers' },
  ];

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Handle tab press
  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    // Scroll to the tab if needed
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1 && scrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      const tabWidth = 100; // Approximate width of each tab
      const scrollX = Math.max(0, tabWidth * tabIndex - screenWidth / 2 + tabWidth / 2);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };

  // Render tab content based on active tab
  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case 'overview':
  //       return <CampaignOverViewTab campaignId={campaignId as string} />;
  //     case 'enrollments':
  //       return <CampaignEnrollmentsTab campaignId={campaignId as string} />;
  //     case 'settings':
  //       return <CampaignAnalyticsTab campaignId={campaignId as string} />;
  //     default:
  //       return <CampaignOverViewTab campaignId={campaignId as string} />;
  //   }
  // };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <AppHeader title="Campaign Details" showBackButton titleAlign="left" />

      {/* Campaign Details Tabs */}
      {/* <CampaignDetailsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        scrollViewRef={scrollViewRef}
      /> */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tab Content */}
        {/* {renderTabContent()} */}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Tab Item Component
type TabItemProps = {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
};

const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.tabItem, isActive && styles.activeTabItem]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

export default CampaignDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },

  campaignCard: {
    backgroundColor: colors.orange[500],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  campaignImageContainer: {
    width: 72,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.orange[300],
  },
  campaignDotStatus: {
    height: 14,
    width: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[500],
    position: 'absolute',
    top: -4,
    right: -4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  campaignImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  campaignName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  campaignSku: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.medium,
    opacity: 0.8,
  },
  campaignBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xm,
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pauseButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.orange[600],
    marginLeft: spacing.xs,
  },
  clockIcon: {
    height: 42,
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.orange[50]}40`,
    borderRadius: borderRadius.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.gray[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  utilizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilizedText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    fontWeight: typography.weights.medium,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    marginRight: 4,
  },
  pendingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.orange[500],
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  progressPercentageContainer: {
    backgroundColor: colors.blue[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  progressPercentage: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.blue[500],
  },
  progressBarContainer: {
    height: 9,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.blue[500],
    borderRadius: 3,
  },
  enrollmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrollmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  enrollmentIcon: {
    width: 16,
    height: 16,
    marginRight: spacing.xs,
  },
  enrollmentText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  enrollmentDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  timelineContainer: {
    marginTop: spacing.sm,
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  timelineLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  timelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  timelineDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  timelineBarContainer: {
    position: 'relative',
    height: 4,
    marginTop: spacing.xs,
  },
  timelineBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  timelineBarProgress: {
    position: 'absolute',
    left: 0,
    width: '40%',
    height: 4,
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.full,
  },
  timelineMarker: {
    position: 'absolute',
    left: '40%',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue[500],
    borderWidth: 2,
    borderColor: colors.white,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
  },
  requirementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  requirementIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  requirementContent: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: 2,
  },
  requirementDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },

  // Tab styles
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tabsScrollContent: {
    // paddingHorizontal: spacing.md,
  },
  tabItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    // Active tab styling
  },
  tabLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  activeTabLabel: {
    color: colors.orange[500],
    fontWeight: typography.weights.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 3,
    backgroundColor: colors.orange[500],
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});
