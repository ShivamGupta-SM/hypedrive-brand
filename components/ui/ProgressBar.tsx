import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
  showText?: boolean;
  barColor?: string;
  backgroundColor?: string;
  title?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  style,
  showText = true,
  barColor = colors.blue[500],
  backgroundColor = colors.blue[100],
  title = "Setup Your Brand",
}) => {
  // Calculate progress percentage
  const progress = currentStep / totalSteps;
  
  // Animated style for the progress fill
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress * 100}%`, { duration: 500 }),
    };
  });

  return (
    <View style={[styles.container, style]}>
      {showText && (
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{title}</Text>
          <Text style={[styles.progressCounter, { color: barColor }]}>
            {currentStep} of {totalSteps}
          </Text>
        </View>
      )}
      <View style={[styles.progressBarBackground, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { backgroundColor: barColor },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  progressCounter: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});