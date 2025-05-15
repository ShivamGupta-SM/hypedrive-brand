import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  backgroundColor = colors.blue[50],
  borderColor = colors.blue[100],
  style,
}) => {
  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]}>
      <View style={styles.cardIconTitleContainer}>
        <View style={[styles.iconContainer, { backgroundColor: borderColor }]}>{icon}</View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    paddingVertical: spacing.lg * 1.25,
    borderWidth: 1,
  },
  cardIconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  cardDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
});
