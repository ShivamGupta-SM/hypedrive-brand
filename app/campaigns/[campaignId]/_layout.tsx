import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { PortalProvider } from '@gorhom/portal';
import { router, Slot, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tab type
type TabType = {
  id: string;
  label: string;
  route: string;
};

// Tab Item Component
const TabItem = ({
  tab,
  isActive,
  onPress,
}: {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
}) => {
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

// Campaign Details Tabs Component
const CampaignDetailsTabs = ({
  tabs,
  activeTab,
  onTabPress,
  scrollViewRef,
}: {
  tabs: TabType[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
}) => {
  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}>
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => onTabPress(tab.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default function CampaignDetailsLayout() {
  const { campaignId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  // Define tabs
  const tabs: TabType[] = [
    { id: 'overview', label: 'Overview', route: 'index' },
    { id: 'enrollments', label: 'Enrollments', route: 'enrollments' },
    { id: 'analytics', label: 'Analytics', route: 'analytics' },
  ];

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Handle tab press
  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);

    // Find the tab and navigate to its route
    const tab = tabs.find(t => t.id === tabId);

    if (tab) {
      console.log(tab.route);
      if (tab.route === 'index') {
        router.push(`/campaigns/${campaignId}`);
      } else {
        router.push(`/campaigns/${campaignId}/${tab.route}`);
      }
    }

    // Scroll to the tab if needed
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1 && scrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      const tabWidth = 100; // Approximate width of each tab
      const scrollX = Math.max(0, tabWidth * tabIndex - screenWidth / 2 + tabWidth / 2);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };

  return (
    <PortalProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['right', 'left']}>
          <AppHeader 
            title="Campaign Details" 
            showBackButton 
            titleAlign="left" 
            onBackPress={() => router.back()} 
          />

          {/* Campaign Details Tabs */}
          <CampaignDetailsTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={handleTabPress}
            scrollViewRef={scrollViewRef}
          />

          <View style={styles.contentContainer}>
            <Slot />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </PortalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tabsScrollContent: {
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    position: 'relative',
  },
  activeTabItem: {
    borderBottomColor: colors.orange[500],
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
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange[500],
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
});
