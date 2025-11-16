import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
};

export function ProgressBar({ currentStep, totalSteps, stepLabel }: ProgressBarProps) {
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Animated style for progress fill
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progressPercentage}%`, { duration: 500 }),
    };
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
        <Text style={styles.stepLabel}>{stepLabel || `Step ${currentStep}`}</Text>
      </View>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  stepLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange[500],
    borderRadius: borderRadius.full,
  },
});