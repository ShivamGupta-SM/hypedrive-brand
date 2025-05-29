import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type ApprovalStatsCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'orange' | 'green';
  style?: ViewStyle;
};

export const ApprovalStatsCard = ({
  title,
  value,
  subtitle,
  color,
  style,
}: ApprovalStatsCardProps) => {
  const colorGradient = {
    orange: [colors.orange[500], colors.orange[600]],
    green: [colors.green[500], colors.green[600]],
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colorGradient[color]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  value: {
    color: colors.white,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    opacity: 0.9,
  },
});
