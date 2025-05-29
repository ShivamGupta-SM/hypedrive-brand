import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Tab type
type TabType = {
  id: string;
  label: string;
};

// Tab item component
const TabItem = ({
  tab,
  isActive,
  onPress,
}: {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tabItem, isActive && styles.activeTabItem]}
    onPress={onPress}
    activeOpacity={0.7}>
    <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
    {isActive && <View style={styles.activeIndicator} />}
  </TouchableOpacity>
);

type CampaignDetailsTabsProps = {
  tabs: TabType[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
};

const CampaignDetailsTabs = ({
  tabs,
  activeTab,
  onTabPress,
  scrollViewRef,
}: CampaignDetailsTabsProps) => {
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

export default CampaignDetailsTabs;

const styles = StyleSheet.create({
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
