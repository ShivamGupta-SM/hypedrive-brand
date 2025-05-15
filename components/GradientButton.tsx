import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  ColorValue,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
  loadingIndicatorColor?: ColorValue;
  loadingIndicatorSize?: number | 'small' | 'large';
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  gradientColors = [colors.primary, colors.secondary] as readonly [ColorValue, ColorValue],
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 1 },
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  loadingText,
  loadingIndicatorColor = colors.white,
  loadingIndicatorSize = 'small',
}) => {
  // Define the disabled colors with the correct type
  const disabledColors: readonly [ColorValue, ColorValue] = [colors.gray[300], colors.gray[400]];

  // Get the primary color for the shadow (first color in the gradient)
  const shadowColor = disabled ? colors.gray[300] : gradientColors[0];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonContainer,
        {
          shadowColor: shadowColor as string,
          elevation: 5,
        },
        style,
      ]}>
      <LinearGradient
        colors={disabled ? disabledColors : gradientColors}
        start={startPoint}
        end={endPoint}
        style={styles.gradient}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={loadingIndicatorColor} size={loadingIndicatorSize} />
            {loadingText && (
              <Text style={[styles.buttonText, textStyle, { marginLeft: spacing.sm }]}>
                {loadingText}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconContainerLeft}>{icon}</View>
            )}
            <Text style={[styles.buttonText, textStyle, disabled && styles.disabledText]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={styles.iconContainerRight}>{icon}</View>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    height: 60,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  disabledText: {
    color: colors.gray[100],
  },
  iconContainerLeft: {
    marginRight: spacing.sm,
  },
  iconContainerRight: {
    marginLeft: spacing.sm,
  },
});
