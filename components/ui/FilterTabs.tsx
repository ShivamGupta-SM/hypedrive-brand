import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

type FilterTab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type FilterTabsProps = {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export const FilterTabs = ({ tabs, activeTab, onTabChange }: FilterTabsProps) => {
  const handleTabPress = async (tabId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tabId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.7}
        >
          {tab.icon && (
            <View style={styles.iconContainer}>{tab.icon}</View>
          )}
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  activeTab: {
    backgroundColor: colors.green[500],
    borderColor: colors.green[500],
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  activeTabText: {
    color: colors.white,
  },
});