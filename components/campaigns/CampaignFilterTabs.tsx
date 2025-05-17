import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { CheckCircle, Clock, SquaresFour } from 'phosphor-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface CampaignFilterTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CampaignFilterTabs({ activeCategory, setActiveCategory }: CampaignFilterTabsProps) {
  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}>
        <Pressable
          style={[styles.tab, activeCategory === 'all' && styles.activeTab]}
          onPress={() => setActiveCategory('all')}>
          <SquaresFour
            size={18}
            weight="fill"
            color={activeCategory === 'all' ? colors.white : colors.text.secondary}
          />
          <Text style={[styles.tabText, activeCategory === 'all' && styles.activeTabText]}>
            All (24)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeCategory === 'active' && styles.activeTab]}
          onPress={() => setActiveCategory('active')}>
          <CheckCircle
            size={18}
            weight="fill"
            color={activeCategory === 'active' ? colors.white : colors.green[500]}
          />
          <Text style={[styles.tabText, activeCategory === 'active' && styles.activeTabText]}>
            Active (18)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeCategory === 'draft' && styles.activeTab]}
          onPress={() => setActiveCategory('draft')}>
          <Clock
            size={18}
            weight="fill"
            color={activeCategory === 'draft' ? colors.white : colors.orange[500]}
          />
          <Text style={[styles.tabText, activeCategory === 'draft' && styles.activeTabText]}>
            Draft (3)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeCategory === 'completed' && styles.activeTab]}
          onPress={() => setActiveCategory('completed')}>
          <CheckCircle
            size={18}
            weight="fill"
            color={activeCategory === 'completed' ? colors.white : colors.blue[500]}
          />
          <Text style={[styles.tabText, activeCategory === 'completed' && styles.activeTabText]}>
            Completed (3)
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  tabsScrollContent: {
    paddingHorizontal: spacing.mg,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md, // Less rounded tabs
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.blue[500],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.white,
  },
});

// Previous code
{
  /* <Animated.View
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
</Animated.View> */
}
