import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/Design';

type ProgressBarProps = {
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  title?: string;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
};

export const ProgressBar = ({
  progress,
  currentStep,
  totalSteps,
  title,
  height = 8,
  backgroundColor = colors.gray[200],
  progressColor = colors.primary,
}: ProgressBarProps) => {
  let progressPercentage = progress ?? 0;

  if (currentStep && totalSteps) {
    progressPercentage = (currentStep / totalSteps) * 100;
  }

  progressPercentage = Math.min(Math.max(progressPercentage, 0), 100);

  return (
    <View>
      {(title || (currentStep && totalSteps)) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {currentStep && totalSteps && (
            <Text style={styles.stepCounter}>
              Step {currentStep} of {totalSteps}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.container, { height, backgroundColor }]}>
        <View
          style={[
            styles.progress,
            {
              width: `${progressPercentage}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  stepCounter: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  container: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
