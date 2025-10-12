import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing } from '@/constants/Design';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonText({ lines = 1, spacing: lineSpacing = 8 }: { lines?: number; spacing?: number }) {
  return (
    <View style={{ gap: lineSpacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBox
          key={index}
          height={16}
          width={index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonAvatar size={48} />
        <View style={styles.cardHeaderText}>
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={styles.cardContent}>
        <SkeletonText lines={3} />
        <SkeletonBox width="100%" height={120} style={{ marginTop: spacing.md }} />
      </View>
    </View>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonAvatar size={32} />
          <View style={styles.listItemContent}>
            <SkeletonBox width="70%" height={14} />
            <SkeletonBox width="50%" height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View style={styles.statsContainer}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.statItem}>
          <SkeletonBox width="100%" height={32} />
          <SkeletonBox width="60%" height={12} style={{ marginTop: spacing.xs }} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonCampaign() {
  return (
    <View style={styles.campaignCard}>
      <SkeletonBox width="100%" height={160} borderRadius={8} />
      <View style={styles.campaignContent}>
        <SkeletonBox width="80%" height={18} />
        <SkeletonText lines={2} spacing={4} />
        <View style={styles.campaignFooter}>
          <SkeletonBox width="30%" height={14} />
          <SkeletonBox width="25%" height={14} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View style={styles.dashboard}>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <SkeletonBox width="50%" height={24} />
        <SkeletonAvatar size={36} />
      </View>
      
      {/* Stats */}
      <SkeletonStats />
      
      {/* Recent Activity */}
      <View style={styles.section}>
        <SkeletonBox width="40%" height={20} />
        <SkeletonList items={3} />
      </View>
      
      {/* Campaigns */}
      <View style={styles.section}>
        <SkeletonBox width="35%" height={20} />
        <View style={styles.campaignGrid}>
          <SkeletonCampaign />
          <SkeletonCampaign />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[200],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardContent: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  dashboard: {
    padding: spacing.md,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  campaignGrid: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});